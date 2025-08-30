#!/usr/bin/env node
/*
  Ensures pnpm major version is 9.x when Corepack is not used.
  Fails fast during `preinstall` if mismatch is detected.
*/
const { execSync } = require('child_process');

function fail(msg) {
  console.error(`\u274C ${msg}`);
  process.exit(1);
}

let versionRaw = '';
try {
  versionRaw = execSync('pnpm -v', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
} catch {
  fail('pnpm not found. Install with: npm i -g pnpm@9');
}

const major = Number((versionRaw.split('.')[0] || '').replace(/\D/g, ''));
if (!Number.isInteger(major)) {
  fail(`Unexpected pnpm version: ${versionRaw}`);
}

if (major !== 9) {
  fail(`pnpm v9 is required. Detected: ${versionRaw}`);
}

console.log(`\u2705 pnpm ${versionRaw} detected (OK)`);

