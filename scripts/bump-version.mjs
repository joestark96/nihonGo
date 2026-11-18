import fs from 'fs';
import path from 'path';

const arg = process.argv[2] || 'patch';

// 1. Update package.json
const pkgPath = path.resolve('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version;
const parts = currentVersion.split('.').map(Number);

let nextVersion;
if (/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(arg)) {
  nextVersion = arg;
} else if (arg === 'major') {
  nextVersion = `${parts[0] + 1}.0.0`;
} else if (arg === 'minor') {
  nextVersion = `${parts[0]}.${parts[1] + 1}.0`;
} else {
  // default: patch
  nextVersion = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

pkg.version = nextVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// 2. Update android/app/build.gradle
const gradlePath = path.resolve('android/app/build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');

let nextVersionCode = 1;
gradle = gradle.replace(/versionCode\s+(\d+)/, (_, code) => {
  nextVersionCode = parseInt(code, 10) + 1;
  return `versionCode ${nextVersionCode}`;
});

gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${nextVersion}"`);
fs.writeFileSync(gradlePath, gradle, 'utf8');

console.log(`✅ Versión actualizada: ${currentVersion} ➔ ${nextVersion} (Android versionCode: ${nextVersionCode})`);
