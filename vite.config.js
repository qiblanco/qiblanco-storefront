import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
import {routenLastmod} from './scripts/routen-lastmod.mjs';

// Seiten-Handle -> letzter inhaltlicher Commit der Code-Route, für das
// <lastmod> der pages-Sitemap (~/lib/routen-lastmod). Ohne volle git-Historie
// null -> leere Tabelle, die Sitemap bleibt, wie Shopify sie liefert.
// Der Oxygen-Workflow checkt flach aus; `vertiefen` holt die Historie nach.
const ROUTEN_LASTMOD_ROH = routenLastmod(
  fileURLToPath(new URL('.', import.meta.url)),
  {vertiefen: true},
);
const ROUTEN_LASTMOD = ROUTEN_LASTMOD_ROH ?? {};
console.info(
  ROUTEN_LASTMOD_ROH === null
    ? '[routen-lastmod] KEINE TABELLE: keine volle git-Historie, Vertiefen gescheitert'
    : `[routen-lastmod] ${Object.keys(ROUTEN_LASTMOD).length} Routen mit Datum`,
);

export default defineConfig({
  define: {
    __QB_ROUTEN_LASTMOD__: JSON.stringify(ROUTEN_LASTMOD),
  },
  plugins: [hydrogen(), oxygen(), reactRouter(), tsconfigPaths(), tailwindcss()],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [],
    },
  },
});
