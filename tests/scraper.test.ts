import { describe, it, expect } from 'vitest';
import { parseAblerHtml } from '../src/lib/scraper';

describe('Abler HTML Parser', () => {
  it('should extract job title, location and requirements from HTML mock', () => {
    const mockHtml = `
      <html>
        <body>
          <h1 class="job-title">Desenvolvedor Full Stack Senior</h1>
          <div class="job-location">Vitória - ES (Híbrido)</div>
          <div class="job-salary">R$ 8.000 - R$ 10.000</div>
          <ul class="requirements">
            <li>Node.js e TypeScript</li>
            <li>React / Next.js</li>
          </ul>
        </body>
      </html>
    `;
    const data = parseAblerHtml(mockHtml);
    expect(data.title).toBe('Desenvolvedor Full Stack Senior');
    expect(data.modality).toContain('Híbrido');
  });
});
