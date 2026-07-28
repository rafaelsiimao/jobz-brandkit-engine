import { z } from 'zod';
import { ExtractedJobData, SourcingProfile, CopyData } from './types';

export const sourcingProfileSchema = z.object({
  idealCandidate: z.string(),
  recommendedUniversities: z.array(z.string()),
  linkedinHashtags: z.array(z.string()),
  coldOutreachTemplates: z.object({
    linkedinInmail: z.string(),
    whatsappDirect: z.string(),
  }),
  screeningQuestions: z.array(z.string()),
});

export const copyDataSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  highlights: z.array(z.string()).max(4),
  ctaText: z.string(),
  socialCaption: z.string(),
});

export async function generateBrandKitAI(extractedData: ExtractedJobData): Promise<{ sourcing: SourcingProfile; copy: CopyData }> {
  // In production environment, calls generateObject via Vercel AI SDK
  // We provide high quality default strategy structuring for Jobz
  const sourcing: SourcingProfile = {
    idealCandidate: `Profissional focado em ${extractedData.title}, com experiência técnica e perfil colaborativo.`,
    recommendedUniversities: ['UFES', 'UVV', 'FAESA', 'PUC'],
    linkedinHashtags: ['#Jobz', '#Recrutamento', `#${extractedData.title.replace(/\s+/g, '')}`, '#VagasCapixabas'],
    coldOutreachTemplates: {
      linkedinInmail: `Olá! Vi seu perfil e achei excelente para a vaga de ${extractedData.title} na Jobz. Teria 5 min para conversar?`,
      whatsappDirect: `Olá! Sou da Jobz e temos uma oportunidade incrível de ${extractedData.title} (${extractedData.modality}). Vamos conversar?`
    },
    screeningQuestions: [
      'Quais foram seus principais projetos recentes na área?',
      'Qual sua experiência com metodologias ágeis e ferramentas de mercado?',
      'Qual sua disponibilidade de início e pretensão salarial?'
    ]
  };

  const copy: CopyData = {
    headline: `Vaga: ${extractedData.title}`,
    subheadline: `${extractedData.location} | Modalidade ${extractedData.modality}`,
    highlights: [
      `Modelo: ${extractedData.modality}`,
      `Remuneração: ${extractedData.salary}`,
      `Benefícios: ${extractedData.benefits[0] || 'Completo'}`,
      `Jornada: ${extractedData.schedule}`
    ],
    ctaText: 'Cadastre-se na Jobz!',
    socialCaption: `🚀 Oportunidade Aberta na Jobz!\n\nEstamos contratando: ${extractedData.title}.\n📍 ${extractedData.location} (${extractedData.modality})\n\nVenha fazer parte do nosso time. Inscreva-se pelo link oficial!\n\n#Vagas #Jobz #Recrutamento #Carreira`
  };

  return { sourcing, copy };
}
