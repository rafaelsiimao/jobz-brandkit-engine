import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
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

export const brandKitResponseSchema = z.object({
  sourcing: sourcingProfileSchema,
  copy: copyDataSchema,
});

export async function generateBrandKitAI(extractedData: ExtractedJobData): Promise<{ sourcing: SourcingProfile; copy: CopyData }> {
  // If OPENAI_API_KEY is provided (supports NVIDIA Nim API or OpenAI compatible endpoints)
  if (process.env.OPENAI_API_KEY) {
    try {
      const customOpenAI = createOpenAI({
        baseURL: process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
      });

      const modelName = process.env.OPENAI_MODEL || 'openai/gpt-oss-120b';

      const prompt = `Você é um especialista em Recruitment Marketing e Sourcing Intelligence para a empresa Jobz no Brasil.
Analise os dados desta vaga extraída da Abler e gere o perfil de sourcing e copywriting de alto impacto para divulgação:

Vaga: ${extractedData.title}
Localização: ${extractedData.location}
Modalidade: ${extractedData.modality}
Salário/Bolsa: ${extractedData.salary}
Benefícios: ${extractedData.benefits.join(', ')}
Requisitos: ${extractedData.requirements.join(', ')}
Atividades: ${extractedData.activities.join(', ')}

Gere os textos das artes mantendo headline curta (máx 8 palavras), 4 diferenciais marcantes em tópicos, CTA da Jobz e legenda completa para redes sociais.`;

      const { object } = await generateObject({
        model: customOpenAI(modelName),
        schema: brandKitResponseSchema,
        prompt,
      });

      return object;
    } catch (err: any) {
      console.warn('Falha na chamada da API de IA, usando fallback estruturado da Jobz:', err?.message);
    }
  }

  // Fallback estruturado garantido para a Jobz
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
