import { describe, it, expect } from 'vitest';
import { generateEmailHtml } from '../src/lib/distribution';
import { SourcingProfile, CopyData, AssetUrls } from '../src/lib/types';

describe('Email Template Generator (v2.0 Clean Arts Delivery)', () => {
  it('should render clean HTML email with Jobz Carreira arts delivery and download buttons', () => {
    const mockCopy: CopyData = {
      headline: 'Vaga Teste',
      subheadline: 'Local Teste',
      highlights: ['Bullet 1'],
      ctaText: 'CTA Teste',
      socialCaption: 'Legenda social'
    };
    const mockSourcing: SourcingProfile = {
      idealCandidate: 'Perfil ideal teste',
      hardSkills: ['React', 'Node.js'],
      softSkills: ['Comunicação', 'Proatividade'],
      companyExpectations: 'Espera autonomia e resultados.',
      sourcingChannels: {
        universities: [],
        facebookGroups: [],
        whatsappTelegramCommunities: [],
        linkedinSearchQueries: [],
        specializedPlatforms: [],
      },
      coldOutreachTemplates: { linkedinInmail: '', whatsappDirect: '' },
      screeningQuestions: [],
      recommendedUniversities: [],
      linkedinHashtags: [],
    };
    const mockUrls: AssetUrls = {
      feed: 'http://img/feed.png',
      whatsapp: 'http://img/whatsapp.png',
      story: 'http://img/story.png',
    };

    const html = generateEmailHtml(mockCopy, mockSourcing, mockUrls);

    // Core sections exist
    expect(html).toContain('Kit Oficial de Divulgação de Vaga');
    expect(html).toContain('Suas Artes Estão Prontas');
    expect(html).toContain('Clique nos botões abaixo para baixar');

    // Image URLs & Buttons
    expect(html).toContain('http://img/feed.png');
    expect(html).toContain('http://img/whatsapp.png');
    expect(html).toContain('http://img/story.png');
    expect(html).toContain('Vaga Teste');
  });
});
