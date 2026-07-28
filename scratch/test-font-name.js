const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');
const fontBuffer = fs.readFileSync(fontPath);

console.log('Testing Resvg with fontBuffer size:', fontBuffer.length);

const fontFamiliesToTest = ['Plus Jakarta Sans', 'PlusJakartaSans-Bold', 'PlusJakartaSans', 'sans-serif'];

for (const fam of fontFamiliesToTest) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <rect width="100%" height="100%" fill="#111317"/>
    <text x="50" y="100" font-family="${fam}" font-size="40" font-weight="bold" fill="#FFFFFF">TESTE TEXTO VAGA JOBZ (${fam})</text>
    <text x="50" y="200" font-size="30" fill="#1E81FE">Subtitulo de Teste 123</text>
  </svg>`;

  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 800 },
      font: {
        fontBuffers: [fontBuffer],
        defaultFontFamily: fam,
        loadSystemFonts: false,
      }
    });
    const png = resvg.render().asPng();
    console.log(`[${fam}] PNG Renderizado! Tamanho:`, png.length, 'bytes');
    fs.writeFileSync(path.join(__dirname, `output-${fam.replace(/ /g, '_')}.png`), png);
  } catch (err) {
    console.error(`[${fam}] Erro:`, err.message);
  }
}
