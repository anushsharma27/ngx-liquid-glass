import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const packageRoot = new URL('../dist/ngx-liquid-glass/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));

const requiredFiles = [
  'LICENSE',
  'README.md',
  'index.d.ts',
  'fesm2022/ngx-liquid-glass.mjs',
  'schematics/collection.json',
  'schematics/ng-add/index.js',
  'schematics/ng-add/schema.json',
];

await Promise.all(requiredFiles.map((file) => access(new URL(file, packageRoot))));

const expectedPeers = '^20.0.0 || ^21.0.0 || ^22.0.0';
for (const dependency of ['@angular/common', '@angular/core']) {
  if (manifest.peerDependencies?.[dependency] !== expectedPeers) {
    throw new Error(`Unexpected ${dependency} peer range: ${manifest.peerDependencies?.[dependency]}`);
  }
}

if (manifest.sideEffects !== false) {
  throw new Error('The distributable must remain tree-shakeable with sideEffects: false.');
}

if (!manifest.exports?.['.']?.types || !manifest.exports?.['.']?.default) {
  throw new Error('The primary package export must provide both types and JavaScript.');
}

const publishedFiles = await listFiles(packageRoot.pathname);
const forbiddenFiles = publishedFiles.filter((file) => /(?:\.spec\.|\/src\/)/.test(file));
if (forbiddenFiles.length > 0) {
  throw new Error(`Development files leaked into the package: ${forbiddenFiles.join(', ')}`);
}

console.log(`Validated ngx-liquid-glass ${manifest.version} (${publishedFiles.length} files).`);

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(join(directory, entry.name), relativePath));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}
