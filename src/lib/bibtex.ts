// Small BibTeX reader (adapted from the astro-scholar template's approach).
// Turns src/data/publications.bib into a list the pages can display.

export interface Pub {
  key: string;
  type: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  doi?: string;
  url?: string;
  featured: boolean;
}

const clean = (s = '') =>
  s
    .replace(/\\&/g, '&')
    .replace(/\\textendash|--/g, '–')
    .replace(/\\[a-zA-Z]+\s*/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function readValue(body: string, start: number): [string, number] {
  let i = start;
  while (/\s/.test(body[i])) i++;
  const open = body[i];
  if (open === '{') {
    let depth = 0, j = i;
    for (; j < body.length; j++) {
      if (body[j] === '{') depth++;
      else if (body[j] === '}') { depth--; if (depth === 0) break; }
    }
    return [body.slice(i + 1, j), j + 1];
  }
  if (open === '"') {
    const j = body.indexOf('"', i + 1);
    return [body.slice(i + 1, j), j + 1];
  }
  const m = body.slice(i).match(/^[^,\n}]+/);
  return [m ? m[0] : '', i + (m ? m[0].length : 0)];
}

function formatAuthor(a: string) {
  const parts = a.split(',').map((p) => p.trim());
  return clean(parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0]);
}

export function parseBib(src: string): Pub[] {
  const pubs: Pub[] = [];
  const text = src.split('\n').filter((l) => !l.trim().startsWith('%')).join('\n');
  const re = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const type = m[1].toLowerCase();
    if (['comment', 'string', 'preamble'].includes(type)) continue;
    const fields: Record<string, string> = {};
    let i = re.lastIndex;
    while (i < text.length) {
      const fm = text.slice(i).match(/^\s*,?\s*([A-Za-z_-]+)\s*=\s*/);
      if (!fm) break;
      const [val, next] = readValue(text, i + fm[0].length);
      fields[fm[1].toLowerCase()] = val;
      i = next;
    }
    re.lastIndex = i;
    pubs.push({
      key: m[2],
      type,
      title: clean(fields.title) || 'Untitled',
      authors: (fields.author || '').split(/\s+and\s+/i).filter(Boolean).map(formatAuthor),
      venue: clean(fields.journal || fields.booktitle || fields.publisher || fields.school || ''),
      year: parseInt(fields.year) || 0,
      doi: fields.doi ? clean(fields.doi) : undefined,
      url: fields.url ? fields.url.trim() : undefined,
      featured: /^(true|yes|1)$/i.test(clean(fields.featured || '')),
    });
  }
  return pubs.sort((a, b) => b.year - a.year);
}
