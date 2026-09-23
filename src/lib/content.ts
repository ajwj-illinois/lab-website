import { getCollection } from 'astro:content';
import { parseBib } from './bibtex';
import bibRaw from '../data/publications.bib?raw';

export const getResearch = async () =>
  (await getCollection('research')).sort((a, b) => a.data.order - b.data.order);

export const getPeople = async () => {
  const all = (await getCollection('people')).sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
  const pi = all.find((p) => /principal investigator/i.test(p.data.role));
  return {
    pi,
    current: all.filter((p) => p !== pi && !p.data.alumni),
    alumni: all.filter((p) => p.data.alumni),
  };
};

export const getNews = async () =>
  (await getCollection('news')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const getPubs = () => parseBib(bibRaw);

/** Homepage selection: papers marked featured first, then the most recent, up to n. */
export const getSelectedPubs = (n = 5) => {
  const pubs = getPubs();
  const featured = pubs.filter((p) => p.featured);
  const rest = pubs.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, n).sort((a, b) => b.year - a.year);
};
