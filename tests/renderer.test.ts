import { describe, it, expect } from 'vitest';
import { generateFeedHtml, generateStoryHtml, generateWhatsappHtml } from '../src/lib/renderer-engine';
import { CopyData } from '../src/lib/types';

describe('Official Jobz Carreira Card Template (v2.0)', () => {
  const mockCopy: CopyData = {
    headline: 'Desenvolvedor Full Stack Senior',
    subheadline: 'Vitória - ES | Híbrido',
    highlights: ['Híbrido | Vitória / ES', 'Jornada: 40h semanais', 'Salário: R$ 10.000', 'Benefícios: VR + VA + Plano de Saúde'],
    ctaText: 'Inscreva-se Já',
    socialCaption: 'Legenda mock para redes sociais'
  };

  it('should generate valid feed HTML containing official Jobz logo PNG base64 and CTA string', () => {
    const html = generateFeedHtml(mockCopy);
    expect(html).toContain('#F1F4F7');
    expect(html).toContain('#111317');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('data:image/png;base64');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1080px');
    expect(html).toContain('1350px');
  });

  it('should generate valid whatsapp HTML containing official Jobz logo PNG base64 and CTA string', () => {
    const html = generateWhatsappHtml(mockCopy);
    expect(html).toContain('data:image/png;base64');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1080px');
  });

  it('should generate valid story HTML containing official Jobz logo PNG base64 and CTA string', () => {
    const html = generateStoryHtml(mockCopy);
    expect(html).toContain('data:image/png;base64');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('1920px');
  });

  it('should generate valid feed HTML using customCtaPrefix replacing full CTA line', () => {
    const customCopy: CopyData = {
      ...mockCopy,
      customCtaPrefix: 'Inscreva-se em:'
    };
    const html = generateFeedHtml(customCopy);
    expect(html).toContain('👉 Inscreva-se em:');
  });
});

