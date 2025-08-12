export type CiteMeta = {
  key?: string;                // e.g., pedro2024ultracool
  title: string;
  authors?: { name: string }[];
  year?: string | number;
  journal?: string;
  volume?: string | number;
  pages?: string;
  doi?: string;
  arxiv?: string;
  url?: string;
};

export function toBibTeX(meta: CiteMeta) {
  const key = meta.key || (meta.authors?.[0]?.name?.split(' ').slice(-1)[0] || 'key') +
    (meta.year || new Date().getFullYear()) +
    (meta.title?.split(/\s+/)[0] || 'paper');

  const authors = meta.authors?.length
    ? meta.authors.map(a => a.name.replace(/,/g,'')).join(' and ') : undefined;

  const fields: Record<string, string | undefined> = {
    author: authors,
    title: meta.title,
    year: meta.year?.toString(),
    journal: meta.journal,
    volume: meta.volume?.toString(),
    pages: meta.pages,
    doi: meta.doi,
    eprint: meta.arxiv,
    url: meta.url,
  };

  const body = Object.entries(fields)
    .filter(([,v]) => !!v)
    .map(([k,v]) => `  ${k} = {${v}}`)
    .join(',\n');

  return `@article{${key},\n${body}\n}`;
}
