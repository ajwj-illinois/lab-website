import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The browser editor may save empty fields as null; treat those as blank.
const opt = z.string().nullish().transform((v) => v || undefined);
const list = z.array(z.string()).nullish().transform((v) => (v ?? []).filter(Boolean));
const flag = z.boolean().nullish().transform((v) => v ?? false);
const num = (d: number) => z.number().nullish().transform((v) => v ?? d);

// Each folder in src/content/ is a "collection". The fields below match the
// forms in the browser editor (.pages.yml). Keep the two in sync.

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    icon: z.enum(['cervix', 'inflammation', 'scaffold', 'coral', 'tendon', 'imaging']).nullish().transform((v) => v ?? 'imaging'),
    tags: list,
    featured: flag,
    image: opt,
    image_caption: opt,
    order: num(10),
  }),
});

const people = defineCollection({
  loader: glob({ base: './src/content/people', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    program: opt,
    photo: opt,
    email: opt,
    website: opt,
    scholar: opt,
    cv: opt,
    highlights: list,
    alumni: flag,
    now: opt,
    years: opt,
    order: num(50),
  }),
});

const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    image: opt,
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    intro: opt,
  }),
});

export const collections = { research, people, news, pages };
