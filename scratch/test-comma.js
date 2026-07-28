const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');
const fontBuffer = fs.readFileSync(fontPath);

// SVG with comma in font-family vs SVG without comma
const svgWithComma = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
  <rect width="100%" height="100%" fill="#111317"/>
  <text x="50" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="40" fill="#FFFFFF">TEXTO COM COMMA</text>
</svg>`;

const svgWithoutComma = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
  <rect width="100%" height="100%" fill="#111317"/>
  <text x="50" y="100" font-family="Plus Jakarta Sans" font-size="40" fill="#FFFFFF">TEXTO SEM COMMA</text>
</svg>`;

const resvg1 = new Resvg(svgWithComma, { font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Plus Jakarta Sans', loadSystemFonts: false } });
const png1 = resvg1.render().asPng();

const resvg2 = new Resvg(svgWithoutComma, { font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Plus Jakarta Sans', loadSystemFonts: false } });
const png2 = resvg2.render().asPng();

console.log('PNG com comma tamanho:', png1.length, 'bytes');
console.log('PNG sem comma tamanho:', png2.length, 'bytes');
fs.writeFileSync(path.join(__dirname, 'with-comma.png'), png1);
fs.writeFileSync(path.join(__dirname, 'without-comma.png'), png2);
