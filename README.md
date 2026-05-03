# Gowsik's Blog

Personal blog built with [Astro 5](https://astro.build), hosted on GitHub Pages at [blog.gowsik.info](https://blog.gowsik.info).

Writing about Rails, Ruby, DevOps, AI and the web.

## Stack

- **[Astro 5](https://astro.build)** — static site generator
- **[sharp](https://sharp.pixelplumbing.com)** — build-time image color extraction
- **Barlow Condensed / Barlow** — typography via Google Fonts
- **GitHub Actions** — automated deploy to GitHub Pages

## Features

- Magazine-style editorial design
- Build-time color palette extraction from post images (bright → light, left to right)
- Automatic RSS feed (`/rss.xml`) and sitemap
- Reading time estimates
- Tag filtering pages
- Pagination (10 posts per page)
- Monokai syntax highlighting for code blocks

## Local development

Requires Node.js (recommend [nvm](https://github.com/nvm-sh/nvm)).

```bash
npm install
npm run dev
```

The dev server runs palette extraction first, then starts Astro at `http://localhost:4321`.

## Adding a post

Create a `.md` file in `src/content/posts/` with this frontmatter:

```yaml
---
title: Your Post Title
description: A short description shown in cards and meta tags.
pubDate: 2025-01-01
tags: [rails, ruby]
---
```

Images go in `public/images/<post-slug>/` and are referenced as `![alt](/images/<post-slug>/file.png)`.

## Build & deploy

```bash
npm run build
```

This runs palette extraction then builds the static site into `dist/`. Pushing to `main` triggers the GitHub Actions workflow which builds and deploys automatically.

## Project structure

```
src/
  content/posts/   # markdown blog posts
  data/            # generated palettes.json (auto-generated, commit the empty file)
  pages/           # index, [page], posts/[slug], tag/[tag], rss.xml
  layouts/         # BaseLayout
  components/      # Header
  styles/          # global.css
  utils/           # tags.ts (tag names, reading time, date formatting)
scripts/
  generate-palettes.mjs   # extracts color palettes at build time
public/
  images/          # post images
  CNAME            # custom domain
```
