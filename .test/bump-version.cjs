// Bumps the package version by one step using the project's own rule:
//   1.0.0 -> 1.0.1 -> ... -> 1.0.9 -> 1.1.0 -> ... -> 1.9.9 -> 2.0.0
// Usage: node .test/bump-version.cjs [--show]
const fs = require('fs');
const path = require('path');

const manifest = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
const current = String(pkg.version || '0.0.0');
const parts = current.split('.').map((part) => Number.parseInt(part, 10));
while (parts.length < 3) parts.push(0);
if (parts.some((value) => !Number.isFinite(value) || value < 0)) {
  console.error('bad version: ' + current);
  process.exit(1);
}

let [major, minor, patch] = parts;
patch += 1;
if (patch > 9) {
  patch = 0;
  minor += 1;
}
if (minor > 9) {
  minor = 0;
  major += 1;
}

const next = [major, minor, patch].join('.');
if (process.argv.includes('--show')) {
  console.log(current);
  process.exit(0);
}

pkg.version = next;
fs.writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
console.log(current + ' -> ' + next);
