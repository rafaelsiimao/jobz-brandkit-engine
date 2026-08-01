import { describe, it, expect } from 'vitest';
import { generateFeedHtml, generateStoryHtml, generateLinkedinHtml, generateWhatsappHtml } from '../src/lib/renderer-engine';
import { CopyData } from '../src/lib/types';

describe('Official Jobz Carreira Card Template (v2.0)', () => {
  const mockCopy: CopyData = {
    headline: 'Desenvolvedor Full Stack Senior',
    subheadline: 'Vitória - ES | Híbrido',
    highlights: ['Híbrido | Vitória / ES', 'Jornada: 40h semanais', 'Salário: R$ 10.000', 'Benefícios: VR + VA + Plano de Saúde'],
    ctaText: 'Inscreva-se Já',
    socialCaption: 'Legenda mock para redes sociais'
  };

  it('should generate valid feed HTML containing official Jobz logo SVG, blue corner element and CTA string', () => {
    const html = generateFeedHtml(mockCopy);
    expect(html).toContain('#F2F5F8');
    expect(html).toContain('#111317');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('jobz-carreira-logo-preto.svg');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1080px');
    expect(html).toContain('1350px');
  });

  it('should generate valid whatsapp HTML containing official Jobz logo SVG and CTA string', () => {
    const html = generateWhatsappHtml(mockCopy);
    expect(html).toContain('jobz-carreira-logo-preto.svg');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1080px');
  });

  it('should generate valid story HTML containing official Jobz logo SVG and CTA string', () => {
    const html = generateStoryHtml(mockCopy);
    expect(html).toContain('jobz-carreira-logo-preto.svg');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1920px');
  });

  it('should generate valid linkedin HTML containing official Jobz logo SVG and CTA string', () => {
    const html = generateLinkedinHtml(mockCopy);
    expect(html).toContain('jobz-carreira-logo-preto.svg');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1200px');
    expect(html).toContain('627px');
  });
});
