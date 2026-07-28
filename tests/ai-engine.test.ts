import { describe, it, expect } from 'vitest';
import { sourcingProfileSchema, copyDataSchema, generateBrandKitAI } from '../src/lib/ai-engine';
import { ExtractedJobData } from '../src/lib/types';

describe('AI Engine Schemas & Generation', () => {
  it('should validate valid copy data object', () => {
    const mockCopy = {
      headline: 'Desenvolvedor Next.js na Jobz',
      subheadline: 'Venha transformar o recrutamento no Brasil',
      highlights: ['Remoto', 'R$ 10k', 'Plano de Saúde', 'Bônus'],
      ctaText: 'Envie seu currículo agora!',
      socialCaption: 'Estamos contratando! Inscreva-se pelo link da bio. #jobz #vagas'
    };
    const parsed = copyDataSchema.safeParse(mockCopy);
    expect(parsed.success).toBe(true);
  });

  it('should validate valid sourcing profile object', () => {
    const mockSourcing = {
      idealCandidate: 'Profissional focado em Desenvolvimento Frontend',
      recommendedUniversities: ['UFES', 'UVV'],
      linkedinHashtags: ['#Jobz', '#Vagas'],
      coldOutreachTemplates: {
        linkedinInmail: 'Olá! Vi seu perfil...',
        whatsappDirect: 'Olá! Sou da Jobz...'
      },
      screeningQuestions: ['Qual sua experiência com React?']
    };
    const parsed = sourcingProfileSchema.safeParse(mockSourcing);
    expect(parsed.success).toBe(true);
  });

  it('should generate brand kit AI response adhering to schemas', async () => {
    const mockExtractedData: ExtractedJobData = {
      title: 'Desenvolvedor Full Stack Senior',
      location: 'Vitória - ES',
      modality: 'Híbrido',
      salary: 'R$ 8.000 - R$ 10.000',
      benefits: ['Vale Refeição', 'Plano de Saúde'],
      schedule: '40h semanais',
      requirements: ['Node.js', 'React'],
      activities: ['Desenvolver APIs', 'Criar UIs']
    };

    const { sourcing, copy } = await generateBrandKitAI(mockExtractedData);

    const copyParsed = copyDataSchema.safeParse(copy);
    expect(copyParsed.success).toBe(true);

    const sourcingParsed = sourcingProfileSchema.safeParse(sourcing);
    expect(sourcingParsed.success).toBe(true);

    expect(copy.headline).toContain('Desenvolvedor Full Stack Senior');
    expect(sourcing.idealCandidate).toContain('Desenvolvedor Full Stack Senior');
  });
});
