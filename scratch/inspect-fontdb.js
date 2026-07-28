const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');
const fontBuffer = fs.readFileSync(fontPath);

// Let's test different font-family declarations in SVG text:
const families = [
  'Plus Jakarta Sans',
  'PlusJakartaSans',
  'PlusJakartaSans-Bold',
  'Plus Jakarta Sans Bold',
  'serif',
  'monospace',
  ''
];

console.log('Testing font-family matches in Resvg...');

for (const fam of families) {
  const fontAttr = fam ? `font-family="${fam}"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
    <rect width="100%" height="100%" fill="#111317"/>
    <text x="50" y="100" ${fontAttr} font-size="40" font-weight="bold" fill="#FFFFFF">TEXTO DE TESTE (${fam || 'NENHUM'})</text>
  </svg>`;

  try {
    const resvg = new Resvg(svg, {
      font: {
        fontBuffers: [fontBuffer],
        defaultFontFamily: fam || 'Plus Jakarta Sans',
        loadSystemFonts: false
      }
    });
    const png = resvg.render().asPng();
    fs.writeFileSync(path.join(__dirname, `test-fam-${fam.replace(/ /g, '_') || 'none'}.png`), png);
    console.log(`Fam: "${fam}" => PNG size: ${png.length} bytes`);
  } catch (err) {
    console.error(`Fam: "${fam}" => Error: ${err.message}`);
  }
}
