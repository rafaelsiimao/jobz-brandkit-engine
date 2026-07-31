import { describe, it, expect } from 'vitest';
import { sourcingProfileSchema, copyDataSchema, generateBrandKitAI } from '../src/lib/ai-engine';
import { ExtractedJobData } from '../src/lib/types';

describe('AI Engine Schemas & Generation (v2.0)', () => {
  it('should validate valid copy data object', () => {
    const mockCopy = {
      headline: 'Desenvolvedor Next.js na Jobz',
      subheadline: 'Venha transformar o recrutamento no Brasil',
      highlights: ['Remoto | Brasil', 'Jornada: 40h/semana', 'Salário: R$ 10k', 'Benefícios: Plano de Saúde'],
      ctaText: 'Envie seu currículo agora!',
      socialCaption: 'Estamos contratando! Inscreva-se pelo link da bio. #jobz #vagas'
    };
    const parsed = copyDataSchema.safeParse(mockCopy);
    expect(parsed.success).toBe(true);
  });

  it('should validate valid sourcing profile object with new fields', () => {
    const mockSourcing = {
      idealCandidate: 'Profissional focado em Desenvolvimento Frontend',
      hardSkills: ['React', 'TypeScript', 'Node.js'],
      softSkills: ['Comunicação', 'Proatividade', 'Organização'],
      companyExpectations: 'Busca profissional autônomo e orientado a resultados.',
      sourcingChannels: {
        universities: ['UFES', 'UVV'],
        facebookGroups: ['Vagas de TI Vitória ES'],
        whatsappTelegramCommunities: ['Grupo Devs ES'],
        linkedinSearchQueries: ['"react" AND "vitória"'],
        specializedPlatforms: ['GitHub', 'LinkedIn'],
      },
      coldOutreachTemplates: {
        linkedinInmail: 'Olá! Vi seu perfil...',
        whatsappDirect: 'Olá! Sou da Jobz...'
      },
      screeningQuestions: ['Qual sua experiência com React?'],
      recommendedUniversities: ['UFES', 'UVV'],
      linkedinHashtags: ['#Jobz', '#Vagas'],
    };
    const parsed = sourcingProfileSchema.safeParse(mockSourcing);
    expect(parsed.success).toBe(true);
  });

  it('should generate brand kit AI response adhering strictly to extracted job data', async () => {
    const mockExtractedData: ExtractedJobData = {
      title: 'Estágio em Odontologia',
      location: 'Vila Velha / ES',
      modality: 'Presencial',
      salary: 'R$ 1.000 + R$ 200 VT',
      benefits: ['Vale Transporte'],
      schedule: '08h às 12h (Seg a Sex)',
      requirements: ['Cursando Odontologia'],
      activities: ['Desenvolver prática clínica'],
      contractType: 'ESTAGIO',
      seniorityLevel: 'Estágio',
      rawDescription: 'Buscamos estagiário presencial de odontologia em Vila Velha.',
    };

    const { sourcing, copy } = await generateBrandKitAI(mockExtractedData);

    const copyParsed = copyDataSchema.safeParse(copy);
    expect(copyParsed.success).toBe(true);

    const sourcingParsed = sourcingProfileSchema.safeParse(sourcing);
    expect(sourcingParsed.success).toBe(true);

    expect(copy.headline).toContain('Estágio em Odontologia');
    expect(copy.highlights[0]).toContain('Presencial');
    expect(copy.highlights[1]).toContain('Jornada de Estágio');
    expect(copy.highlights[2]).toContain('Bolsa');
  });
});
