const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');
const fontBuffer = fs.readFileSync(fontPath);

// SVG with emoji vs SVG without emoji
const svgWithEmoji = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
  <rect width="100%" height="100%" fill="#111317"/>
  <text x="50" y="100" font-family="Plus Jakarta Sans" font-size="40" fill="#FFFFFF">🚀 Nova Vaga: Dev React 📍 Vitória</text>
</svg>`;

const svgWithoutEmoji = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
  <rect width="100%" height="100%" fill="#111317"/>
  <text x="50" y="100" font-family="Plus Jakarta Sans" font-size="40" fill="#FFFFFF">Nova Vaga: Dev React - Vitoria</text>
</svg>`;

const resvg1 = new Resvg(svgWithEmoji, { font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Plus Jakarta Sans', loadSystemFonts: false } });
const png1 = resvg1.render().asPng();

const resvg2 = new Resvg(svgWithoutEmoji, { font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Plus Jakarta Sans', loadSystemFonts: false } });
const png2 = resvg2.render().asPng();

console.log('PNG com Emoji tamanho:', png1.length, 'bytes');
console.log('PNG sem Emoji tamanho:', png2.length, 'bytes');
fs.writeFileSync(path.join(__dirname, 'with-emoji.png'), png1);
fs.writeFileSync(path.join(__dirname, 'without-emoji.png'), png2);
