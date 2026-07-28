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
  // If OPENAI_API_KEY is provided (supports NVIDIA Nim API or OpenAI compatible endpoints)
  if (process.env.OPENAI_API_KEY) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const baseURL = process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
      const modelName = process.env.OPENAI_MODEL || 'openai/gpt-oss-120b';

      const prompt = `Você é um especialista em Recruitment Marketing e Sourcing Intelligence para a Jobz no Brasil.
Analise esta vaga da Abler:
- Vaga: ${extractedData.title}
- Localização: ${extractedData.location}
- Modalidade: ${extractedData.modality}
- Salário/Bolsa: ${extractedData.salary}
- Horário: ${extractedData.schedule}
- Requisitos: ${extractedData.requirements.join(', ')}

Responda ESTRITAMENTE em formato JSON (sem markdown de código) contendo o seguinte objeto:
{
  "sourcing": {
    "idealCandidate": "descrição curta do perfil ideal",
    "recommendedUniversities": ["UFES", "UVV", "FAESA", "PUC"],
    "linkedinHashtags": ["#Jobz", "#Vagas", "#Recrutamento"],
    "coldOutreachTemplates": {
      "linkedinInmail": "mensagem para linkedin",
      "whatsappDirect": "mensagem para whatsapp"
    },
    "screeningQuestions": ["pergunta 1", "pergunta 2", "pergunta 3"]
  },
  "copy": {
    "headline": "${extractedData.title}",
    "subheadline": "Excelente oportunidade em ${extractedData.location}",
    "highlights": [
      "${extractedData.location}",
      "${extractedData.modality} | ${extractedData.schedule}",
      "${extractedData.salary}",
      "${extractedData.requirements[0] || 'Cursando área relacionada'}"
    ],
    "ctaText": "Inscreva-se na Jobz",
    "socialCaption": "🚀 Nova vaga aberta na Jobz! Estamos contratando ${extractedData.title}... Inscreva-se!"
  }
}`;

      // Timeout de 3.5 segundos para garantir resposta rápida sem exceder o limite do Vercel Serverless
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'Você é uma IA de recrutamento que responde EXCLUSIVAMENTE em JSON válido.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const jsonRes = await res.json();
        const rawContent = jsonRes?.choices?.[0]?.message?.content || '';
        
        // Match JSON substring
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.sourcing && parsed.copy && Array.isArray(parsed.copy.highlights)) {
            return {
              sourcing: parsed.sourcing,
              copy: parsed.copy
            };
          }
        }
      } else {
        const errText = await res.text();
        console.warn('Resposta com erro da API de IA (usando fallback seguro):', errText.slice(0, 150));
      }
    } catch (err: any) {
      console.warn('Falha na chamada da API de IA, usando fallback estruturado da Jobz:', err?.message);
    }
  }

  // Fallback estruturado garantido com os dados extraídos da vaga
  const sourcing: SourcingProfile = {
    idealCandidate: `Profissional focado em ${extractedData.title}, com perfil proativo e excelente comunicação.`,
    recommendedUniversities: ['UFES', 'UVV', 'FAESA', 'PUC', 'MULTIVIX'],
    linkedinHashtags: ['#Jobz', '#Recrutamento', `#${extractedData.title.replace(/[^a-zA-Z0-9]/g, '')}`, '#VagasCapixabas'],
    coldOutreachTemplates: {
      linkedinInmail: `Olá! Vi seu perfil no LinkedIn e achei excelente para a vaga de ${extractedData.title} na Jobz. Teria 5 minutos para conversar?`,
      whatsappDirect: `Olá! Sou da Jobz e temos uma oportunidade incrível para ${extractedData.title} (${extractedData.location}). Gostaria de saber mais detalhes?`
    },
    screeningQuestions: [
      'Quais são seus principais projetos ou experiências recentes na área?',
      'Qual sua disponibilidade de horários e início imediato?',
      'Qual sua pretensão salarial e modelo de atuação preferido?'
    ]
  };

  const copy: CopyData = {
    headline: extractedData.title,
    subheadline: `Desenvolva sua carreira com a Jobz em ${extractedData.location}`,
    highlights: [
      extractedData.location,
      `${extractedData.modality} (${extractedData.schedule})`,
      extractedData.salary,
      extractedData.requirements[0] || 'Formação ou cursando área relacionada'
    ],
    ctaText: 'Inscreva-se',
    socialCaption: `🚀 Oportunidade Aberta na Jobz!\n\nEstamos contratando: ${extractedData.title}.\n📍 ${extractedData.location} (${extractedData.modality})\n⏰ ${extractedData.schedule}\n💰 ${extractedData.salary}\n\nVenha fazer parte do nosso time. Inscreva-se pelo link oficial na bio!\n\n#Vagas #Jobz #Recrutamento #Capixaba`
  };

  return { sourcing, copy };
}
