import { describe, it, expect } from 'vitest';
import { generateEmailHtml } from '../src/lib/distribution';

describe('Email Template Generator', () => {
  it('should render HTML email with Jobz brandkit data', () => {
    const mockCopy = {
      headline: 'Vaga Teste',
      subheadline: 'Local Teste',
      highlights: ['Bullet 1'],
      ctaText: 'CTA Teste',
      socialCaption: 'Legenda social'
    };
    const mockSourcing = {
      idealCandidate: 'Perfil ideal teste',
      recommendedUniversities: ['UFES'],
      linkedinHashtags: ['#Jobz'],
      coldOutreachTemplates: { linkedinInmail: 'Inmail', whatsappDirect: 'Whats' },
      screeningQuestions: ['Pergunta 1']
    };
    const mockUrls = {
      feed: 'http://img/feed.png',
      whatsapp: 'http://img/whatsapp.png',
      story: 'http://img/story.png',
      linkedin: 'http://img/linkedin.png'
    };

    const html = generateEmailHtml(mockCopy, mockSourcing, mockUrls);

    expect(html).toContain('Kit de Divulgação');
    expect(html).toContain('http://img/feed.png');
    expect(html).toContain('http://img/whatsapp.png');
    expect(html).toContain('http://img/story.png');
    expect(html).toContain('http://img/linkedin.png');
    expect(html).toContain('Perfil ideal teste');
    expect(html).toContain('Vaga Teste');
  });
});
