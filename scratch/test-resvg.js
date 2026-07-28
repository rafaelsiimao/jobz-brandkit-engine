const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');
const fontBuffer = fs.readFileSync(fontPath);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <rect width="100%" height="100%" fill="#F2F5F8"/>
  <text x="60" y="180" font-family="Plus Jakarta Sans" font-size="56" font-weight="bold" fill="#111317">Vaga: Desenvolvedor React</text>
  <text x="60" y="250" font-family="Plus Jakarta Sans" font-size="30" font-weight="bold" fill="#1E81FE">Vitória / ES - Remoto</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1080 },
  font: {
    fontBuffers: [fontBuffer],
    defaultFontFamily: 'Plus Jakarta Sans',
  }
});

const png = resvg.render().asPng();
console.log('PNG gerado com sucesso! Tamanho:', png.length, 'bytes');
fs.writeFileSync(path.join(process.cwd(), 'scratch', 'test-output.png'), png);
