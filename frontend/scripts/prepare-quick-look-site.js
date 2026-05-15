const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'quick-look-site');
const sourceHtml = path.join(root, 'public', 'quick-look', 'statue.html');
const sourceGlb = path.join(root, 'assets', 'models', 'Statue.glb');
const sourceUsdz = path.join(root, 'assets', 'models', 'statue.usdz');
const targetHtml = path.join(outDir, 'quick-look', 'statue.html');
const targetGlb = path.join(outDir, 'assets', 'models', 'Statue.glb');
const targetUsdz = path.join(outDir, 'assets', 'models', 'statue.usdz');

function copyFile(sourcePath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`copied ${path.relative(root, sourcePath)} -> ${path.relative(root, targetPath)}`);
}

if (!fs.existsSync(sourceHtml)) {
  throw new Error(`Missing source HTML: ${sourceHtml}`);
}
if (!fs.existsSync(sourceGlb)) {
  throw new Error(`Missing source GLB: ${sourceGlb}`);
}
if (!fs.existsSync(sourceUsdz)) {
  throw new Error(`Missing source USDZ: ${sourceUsdz}`);
}

copyFile(sourceHtml, targetHtml);
copyFile(sourceGlb, targetGlb);
copyFile(sourceUsdz, targetUsdz);

const readme = `Quick Look site bundle\n\nDeploy the contents of this folder to any static HTTPS host.\n\nExpected public URLs after deploy:\n- /quick-look/statue.html\n- /assets/models/Statue.glb\n- /assets/models/statue.usdz\n\nAfter deployment, set EXPO_PUBLIC_QUICK_LOOK_BASE_URL to the host root, for example:\nhttps://your-site.example\n`;
fs.writeFileSync(path.join(outDir, 'README.txt'), readme, 'utf8');
console.log(`wrote ${path.relative(root, path.join(outDir, 'README.txt'))}`);
