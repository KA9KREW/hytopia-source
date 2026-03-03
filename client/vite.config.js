import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASIS_SOURCE_CANDIDATES = [
  join(__dirname, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'basis'),
  join(__dirname, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'basisuniversal'),
];

/**
 * This plugin copies the basis transcoder required by ktx2 loader.
 * Skips if three.js basis files are not found (e.g. different Three.js version).
 */
const copyBasisFilesPlugin = () => ({
  name: 'copy-basis-files',
  buildStart() {
    const basisDir = join(__dirname, 'public', 'basis');
    const sourceDir = BASIS_SOURCE_CANDIDATES.find(p => existsSync(p));
    if (!sourceDir) {
      console.warn('Basis transcoder not found in Three.js; KTX2 textures may not load.');
      return;
    }
    mkdirSync(basisDir, { recursive: true });
    ['basis_transcoder.js', 'basis_transcoder.wasm'].forEach(file => {
      const src = join(sourceDir, file);
      if (existsSync(src)) {
        copyFileSync(src, join(basisDir, file));
        console.log(`✓ Copied ${file} from Three.js`);
      }
    });
  }
});

export default {
  server: {
    watch: {
      usePolling: true
    }
  },
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA),
  },
  build: {
    sourcemap: true
  },
  worker: {
    format: 'es'
  },
  plugins: [
    copyBasisFilesPlugin(),
  ]
};