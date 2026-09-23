// @ts-check
import { defineConfig } from 'astro/config';

// The public address of the site. Change this if the web address changes.
export default defineConfig({
  site: 'https://wagonerjohnson.mechse.illinois.edu',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
});
