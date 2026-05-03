#!/usr/bin/env node
// Runs before `astro build`. Scans every post for image references,
// extracts dominant colors using sharp, sorts bright→light, and writes
// src/data/palettes.json so templates can use them statically.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = resolve(__dirname, '..');
const POSTS    = join(ROOT, 'src/content/posts');
const PUBLIC   = join(ROOT, 'public');
const OUT      = join(ROOT, 'src/data/palettes.json');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('[palettes] sharp not installed — run: npm install --save-dev sharp');
  process.exit(0);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function rgbToSaturation(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

async function sampleFile(imgPath, buckets) {
  const full = join(PUBLIC, imgPath);
  if (!existsSync(full)) return;
  try {
    const raw = await sharp(full)
      .resize(100, 100, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer();

    for (let i = 0; i < raw.length; i += 3) {
      const r = raw[i], g = raw[i + 1], b = raw[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > 235 || brightness < 20) continue;
      const br = Math.round(r / 24) * 24;
      const bg = Math.round(g / 24) * 24;
      const bb = Math.round(b / 24) * 24;
      const key = `${br},${bg},${bb}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
  } catch (e) {
    console.warn(`[palettes] skipped ${imgPath}: ${e.message}`);
  }
}

function pickDistinct(sorted, count = 6) {
  const result = [];
  for (const c of sorted) {
    if (result.length >= count) break;
    const tooClose = result.some(e => {
      const dr = c.r - e.r, dg = c.g - e.g, db = c.b - e.b;
      return Math.sqrt(dr * dr + dg * dg + db * db) < 55;
    });
    if (!tooClose) result.push(c);
  }
  for (const c of sorted) {
    if (result.length >= count) break;
    if (!result.includes(c)) result.push(c);
  }
  // Bright (high saturation) on left → light (low saturation) on right
  result.sort((a, b) => rgbToSaturation(b.r, b.g, b.b) - rgbToSaturation(a.r, a.g, a.b));
  return result.map(({ r, g, b }) => `rgb(${r},${g},${b})`);
}

// ── main ─────────────────────────────────────────────────────────────────────

const palettes = {};
const files = readdirSync(POSTS).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

for (const file of files) {
  const content = readFileSync(join(POSTS, file), 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;

  const slug = basename(file, extname(file));
  const fm   = fmMatch[1];
  const body = content.slice(fmMatch[0].length);

  // Hero image from frontmatter
  const heroMatch = fm.match(/^image:\s*(.+)$/m);
  const hero = heroMatch ? heroMatch[1].trim().replace(/^['"]|['"]$/g, '') : null;

  // Inline images from markdown body
  const bodyImgs = [...body.matchAll(/!\[.*?\]\((\/?images\/[^)]+)\)/g)].map(m =>
    m[1].startsWith('/') ? m[1] : '/' + m[1]
  );

  const images = [...new Set([hero, ...bodyImgs].filter(Boolean))];
  if (images.length === 0) continue;

  const buckets = {};
  for (const img of images) await sampleFile(img, buckets);

  if (Object.keys(buckets).length === 0) continue;

  const sorted = Object.entries(buckets)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => { const [r, g, b] = key.split(',').map(Number); return { r, g, b }; });

  const colors = pickDistinct(sorted);
  if (colors.length > 0) {
    palettes[`/posts/${slug}`] = colors;
    console.log(`[palettes] ${slug}: ${colors.join(' | ')}`);
  }
}

mkdirSync(join(ROOT, 'src/data'), { recursive: true });
writeFileSync(OUT, JSON.stringify(palettes, null, 2));
console.log(`[palettes] wrote ${Object.keys(palettes).length} entries → src/data/palettes.json`);
