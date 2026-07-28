import { describe, it, expect } from 'vitest';
import { generateEmailHtml } from '../src/lib/distribution';
import { SourcingProfile, CopyData, AssetUrls } from '../src/lib/types';

describe('Email Template Generator (v2.0 Dossier)', () => {
  it('should render HTML email with Jobz sourcing intelligence dossier', () => {
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
        universities: ['UFES', 'UVV'],
        facebookGroups: ['Vagas ES'],
        whatsappTelegramCommunities: ['Grupo Devs'],
        linkedinSearchQueries: ['"react" AND "vitória"'],
        specializedPlatforms: ['GitHub'],
      },
      coldOutreachTemplates: { linkedinInmail: 'Inmail', whatsappDirect: 'Whats' },
      screeningQuestions: ['Pergunta 1'],
      recommendedUniversities: ['UFES'],
      linkedinHashtags: ['#Jobz'],
    };
    const mockUrls: AssetUrls = {
      feed: 'http://img/feed.png',
      whatsapp: 'http://img/whatsapp.png',
      story: 'http://img/story.png',
      linkedin: 'http://img/linkedin.png'
    };

    const html = generateEmailHtml(mockCopy, mockSourcing, mockUrls);

    // Core sections exist
    expect(html).toContain('Dossier de Inteligência de Recrutamento');
    expect(html).toContain('Perfil do Candidato Ideal');
    expect(html).toContain('Matriz de Competências');
    expect(html).toContain('Onde Encontrar o Candidato Ideal');
    expect(html).toContain('Playbook de Abordagem');
    expect(html).toContain('Perguntas de Triagem');

    // Data content
    expect(html).toContain('http://img/feed.png');
    expect(html).toContain('http://img/whatsapp.png');
    expect(html).toContain('http://img/story.png');
    expect(html).toContain('http://img/linkedin.png');
    expect(html).toContain('Perfil ideal teste');
    expect(html).toContain('Vaga Teste');
    expect(html).toContain('React');
    expect(html).toContain('Comunicação');
  });
});
