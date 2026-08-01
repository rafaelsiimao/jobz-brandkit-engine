import { describe, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

describe('Rasterize Logo', () => {
  it('should rasterize jobz-carreira-logo-preto.svg to PNG Base64', () => {
    const svgPath = path.join(__dirname, '../jobz-carreira-logo-preto.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    const resvg = new Resvg(svgBuffer, {
      fitTo: { mode: 'width', value: 800 },
    });

    const pngBuffer = resvg.render().asPng();
    const base64 = pngBuffer.toString('base64');

    const tsContent = `export const JOBZ_LOGO_PNG_BASE64 = 'data:image/png;base64,${base64}';\n`;
    const targetPath = path.join(__dirname, '../src/lib/logo-png-base64.ts');

    fs.writeFileSync(targetPath, tsContent);
    console.log('SUCCESS! Generated high-res PNG base64 logo in src/lib/logo-png-base64.ts. Length:', base64.length);
  });
});
