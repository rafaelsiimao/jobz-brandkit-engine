const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');
const fontBuf = fs.readFileSync(fontPath);
const base64 = fontBuf.toString('base64');

const fileContent = `export const FONT_PLUS_JAKARTA_SANS_BOLD_BASE64 = "${base64}";\n`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'lib', 'font-data.ts'), fileContent);
console.log('src/lib/font-data.ts criado com sucesso! Tamanho base64:', base64.length);
