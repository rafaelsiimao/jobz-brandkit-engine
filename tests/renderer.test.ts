import { describe, it, expect } from 'vitest';
import { generateFeedHtml, generateStoryHtml, generateLinkedinHtml, generateWhatsappHtml } from '../src/lib/renderer';
import { CopyData } from '../src/lib/types';

describe('HTML Renderer Engine', () => {
  const mockCopy: CopyData = {
    headline: 'Desenvolvedor Senior',
    subheadline: 'Vitória - ES | Híbrido',
    highlights: ['Híbrido', 'R$ 10.000', 'VR + VA', '40h/semana'],
    ctaText: 'Inscreva-se Já',
    socialCaption: 'Legenda mock para redes sociais'
  };

  it('should generate valid feed HTML containing Jobz design tokens and 1080x1350 dimensions', () => {
    const html = generateFeedHtml(mockCopy);
    expect(html).toContain('#F2F5F8');
    expect(html).toContain('#111317');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('1080px');
    expect(html).toContain('1350px');
  });

  it('should generate valid whatsapp HTML containing Jobz design tokens and 1080x1080 dimensions', () => {
    const html = generateWhatsappHtml(mockCopy);
    expect(html).toContain('#F2F5F8');
    expect(html).toContain('#111317');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('1080px');
  });

  it('should generate valid story HTML containing Jobz design tokens and 1080x1920 dimensions', () => {
    const html = generateStoryHtml(mockCopy);
    expect(html).toContain('#F2F5F8');
    expect(html).toContain('#111317');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('1080px');
    expect(html).toContain('1920px');
  });

  it('should generate valid linkedin HTML containing Jobz design tokens and 1200x627 dimensions', () => {
    const html = generateLinkedinHtml(mockCopy);
    expect(html).toContain('#F2F5F8');
    expect(html).toContain('#111317');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('1200px');
    expect(html).toContain('627px');
  });
});
