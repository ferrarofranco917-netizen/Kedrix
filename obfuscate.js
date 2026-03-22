const fs = require('fs');
const path = require('path');
const files = ['app.js','license-system.js','api-client.js','session-manager.js','license-guard.js','tracking-hooks.js'];
for (const file of files) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) continue;
  const source = fs.readFileSync(p, 'utf8');
  const cleaned = source
    .replace(/console\.(log|warn|info|debug)\([^;]*\);?/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(p, cleaned, 'utf8');
}
console.log('Kedrix hardening cleanup completed.');