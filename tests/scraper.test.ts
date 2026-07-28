import { describe, it, expect } from 'vitest';
import { parseAblerHtml } from '../src/lib/scraper';

describe('Abler HTML Parser (Multi-Layer 2.0)', () => {
  it('should extract job title, location and classify contract from basic HTML', () => {
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
    expect(data.contractType).toBe('CLT');
    expect(data.seniorityLevel).toBe('Sênior');
  });

  it('should classify ESTAGIO from title and description', () => {
    const mockHtml = `
      <html>
        <body>
          <h1>Estagiário de Marketing Digital</h1>
          <p>Estágio em marketing digital com bolsa auxílio e VT.</p>
        </body>
      </html>
    `;
    const data = parseAblerHtml(mockHtml);
    expect(data.title).toContain('Estagiário de Marketing Digital');
    expect(data.contractType).toBe('ESTAGIO');
    expect(data.seniorityLevel).toBe('Estágio');
  });

  it('should classify PJ from description', () => {
    const mockHtml = `
      <html>
        <body>
          <h1>Consultor de Vendas</h1>
          <p>Contratação PJ. Pessoa Jurídica com CNPJ ativo. São Paulo capital.</p>
        </body>
      </html>
    `;
    const data = parseAblerHtml(mockHtml);
    expect(data.contractType).toBe('PJ');
    expect(data.location).toContain('São Paulo');
  });

  it('should extract data from JSON-LD Schema.org/JobPosting', () => {
    const mockHtml = `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": "Analista de Dados Pleno",
            "description": "Buscamos um analista de dados para atuar com Power BI e SQL.",
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Vila Velha",
                "addressRegion": "ES"
              }
            },
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "BRL",
              "value": {
                "minValue": 5000,
                "maxValue": 7000
              }
            }
          }
          </script>
        </head>
        <body>
          <h1>Analista de Dados Pleno</h1>
        </body>
      </html>
    `;
    const data = parseAblerHtml(mockHtml);
    expect(data.title).toBe('Analista de Dados Pleno');
    expect(data.location).toContain('Vila Velha');
    expect(data.location).toContain('ES');
    expect(data.salary).toContain('5');
    expect(data.contractType).toBe('CLT');
    expect(data.seniorityLevel).toBe('Pleno');
  });

  it('should fallback gracefully when HTML is minimal', () => {
    const mockHtml = `<html><body><p>Vaga aberta</p></body></html>`;
    const data = parseAblerHtml(mockHtml);
    expect(data.title).toBeTruthy();
    expect(data.contractType).toBe('CLT');
    expect(data.requirements.length).toBeGreaterThan(0);
    expect(data.rawDescription).toBeTruthy();
  });
});
