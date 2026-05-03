export const TAG_NAMES: Record<string, string> = {
  ai: 'AI',
  openai: 'OpenAI API',
  devops: 'DevOps',
  js: 'JS',
  amplify: 'AWS Amplify',
  aws: 'AWS',
  ruby: 'Ruby',
  chatgpt: 'Chat GPT',
  rails: 'Rails',
  jekyll: 'Jekyll',
  web: 'Web',
  rubyweekly: 'Ruby Weekly',
};

export const TAG_COLORS: Record<string, string> = {
  rails:      '#C41E3A',
  ruby:       '#CC342D',
  js:         '#B45309',
  web:        '#1D4ED8',
  ai:         '#6D28D9',
  openai:     '#059669',
  devops:     '#B45309',
  aws:        '#C2410C',
  amplify:    '#0369A1',
  jekyll:     '#BE123C',
  chatgpt:    '#0F766E',
  rubyweekly: '#9F1239',
};

export const TAG_PALETTES: Record<string, string[]> = {
  rails:      ['#C41E3A', '#E55B6B', '#F4A0A9', '#FDE8EA', '#F9F0F1'],
  ruby:       ['#CC342D', '#E0514A', '#EF9090', '#FAD5D5', '#FDF0F0'],
  js:         ['#92400E', '#B45309', '#D97706', '#FDE68A', '#FFFBEB'],
  web:        ['#1E3A8A', '#1D4ED8', '#3B82F6', '#BFDBFE', '#EFF6FF'],
  ai:         ['#4C1D95', '#6D28D9', '#8B5CF6', '#DDD6FE', '#F5F3FF'],
  openai:     ['#064E3B', '#059669', '#34D399', '#A7F3D0', '#ECFDF5'],
  devops:     ['#78350F', '#B45309', '#F59E0B', '#FDE68A', '#FFFBEB'],
  aws:        ['#7C2D12', '#C2410C', '#F97316', '#FED7AA', '#FFF7ED'],
  amplify:    ['#0C4A6E', '#0369A1', '#0EA5E9', '#BAE6FD', '#F0F9FF'],
  jekyll:     ['#881337', '#BE123C', '#FB7185', '#FECDD3', '#FFF1F2'],
  chatgpt:    ['#134E4A', '#0F766E', '#14B8A6', '#99F6E4', '#F0FDFA'],
  rubyweekly: ['#4C0519', '#9F1239', '#E11D48', '#FECDD3', '#FFF1F2'],
};

export function getTagName(slug: string): string {
  return TAG_NAMES[slug] ?? slug;
}

export function getTagColor(tags: string[]): string {
  return TAG_COLORS[tags[0]] ?? '#374151';
}

export function getTagPalette(tags: string[]): string[] {
  return TAG_PALETTES[tags[0]] ?? ['#1F2937', '#374151', '#6B7280', '#D1D5DB', '#F9FAFB'];
}

export function getReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 250);
  return `${minutes} min read`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
