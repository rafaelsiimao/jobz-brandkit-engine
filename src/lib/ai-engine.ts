import { z } from 'zod';
import { ExtractedJobData, SourcingProfile, CopyData, SourcingChannels } from './types';

export const sourcingChannelsSchema = z.object({
  universities: z.array(z.string()),
  facebookGroups: z.array(z.string()),
  whatsappTelegramCommunities: z.array(z.string()),
  linkedinSearchQueries: z.array(z.string()),
  specializedPlatforms: z.array(z.string()),
});

export const sourcingProfileSchema = z.object({
  idealCandidate: z.string(),
  hardSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  companyExpectations: z.string(),
  sourcingChannels: sourcingChannelsSchema,
  coldOutreachTemplates: z.object({
    linkedinInmail: z.string(),
    whatsappDirect: z.string(),
  }),
  screeningQuestions: z.array(z.string()),
  recommendedUniversities: z.array(z.string()),
  linkedinHashtags: z.array(z.string()),
});

export const copyDataSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  highlights: z.array(z.string()).max(4),
  ctaText: z.string(),
  socialCaption: z.string(),
});

function getContractLabel(ct: string): string {
  if (ct === 'ESTAGIO') return 'Estágio';
  if (ct === 'PJ') return 'PJ / Prestador de Serviço';
  return 'CLT (Carteira Assinada)';
}

export async function generateBrandKitAI(extractedData: ExtractedJobData): Promise<{ sourcing: SourcingProfile; copy: CopyData }> {
  const safeData: ExtractedJobData = {
    title: extractedData?.title || 'Vaga de Emprego',
    location: extractedData?.location || 'Brasil',
    modality: extractedData?.modality || 'Presencial',
    salary: extractedData?.salary || 'Compatível com o mercado',
    benefits: Array.isArray(extractedData?.benefits) ? extractedData.benefits : ['Vale Transporte / Alimentação'],
    schedule: extractedData?.schedule || 'Horário comercial',
    requirements: Array.isArray(extractedData?.requirements) ? extractedData.requirements : ['Experiência na área'],
    activities: Array.isArray(extractedData?.activities) ? extractedData.activities : ['Executar atividades da função'],
    contractType: extractedData?.contractType || 'CLT',
    seniorityLevel: extractedData?.seniorityLevel || 'Pleno',
    rawDescription: extractedData?.rawDescription || '',
  };

  const isEstagio = safeData.contractType === 'ESTAGIO';
  const isPJ = safeData.contractType === 'PJ';

  const labelHoursPrefix = isEstagio ? 'Jornada de Estágio: ' : 'Jornada: ';
  const labelFinancialPrefix = isEstagio ? 'Bolsa: ' : isPJ ? 'Remuneração: ' : 'Salário: ';

  const defaultBenefitsText = safeData.benefits.length > 0
    ? safeData.benefits.slice(0, 2).join(' + ')
    : 'Compatível com o mercado';

  const defaultHighlights = [
    `${safeData.modality} | ${safeData.location}`,
    `${labelHoursPrefix}${safeData.schedule}`,
    `${labelFinancialPrefix}${safeData.salary}`,
    `Benefícios: ${defaultBenefitsText}`
  ];

  // If OPENAI_API_KEY is provided
  if (process.env.OPENAI_API_KEY) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const baseURL = process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
      const modelName = process.env.OPENAI_MODEL || 'openai/gpt-oss-120b';

      const prompt = `Você é um especialista em Recruitment Marketing, Sourcing Intelligence e Talent Acquisition para a Jobz, no Brasil.

Analise esta vaga extraída da plataforma Abler ATS e gere um Dossier de Inteligência de Recrutamento COMPLETO:

## Dados da Vaga
- Título: ${safeData.title}
- Tipo de Contrato: ${getContractLabel(safeData.contractType)}
- Nível: ${safeData.seniorityLevel}
- Localização: ${safeData.location}
- Modalidade: ${safeData.modality}
- Salário/Bolsa: ${safeData.salary}
- Horário: ${safeData.schedule}
- Requisitos: ${safeData.requirements.join('; ')}
- Atividades: ${safeData.activities.join('; ')}
- Benefícios: ${safeData.benefits.join('; ')}
- Descrição Completa: ${safeData.rawDescription.slice(0, 1500)}

## Instruções IMPORTANTES (Zero Alucinação)
1. **Modalidade**: Mantenha ESTRITAMENTE a modalidade real ("${safeData.modality}"). NUNCA altere presencial para remoto.
2. **hardSkills**: Liste as 5 a 8 competências TÉCNICAS mais relevantes.
3. **softSkills**: Liste as 4 a 6 competências COMPORTAMENTAIS mais relevantes.
4. **companyExpectations**: Descreva em 2-3 frases o que a empresa espera do candidato.
5. **sourcingChannels**: Forneça canais REAIS e específicos para encontrar candidatos:
   ${isEstagio ? '- **universities**: Liste faculdades relevantes da região (ex: UFES, UVV, FAESA, PUC, Multivix, IFES, etc.).' : '- **universities**: Lista vazia [] pois não se aplica a vagas CLT/PJ.'}
   - **facebookGroups**: Liste 3-5 nomes de grupos reais do Facebook para a área/região.
   - **whatsappTelegramCommunities**: Liste 2-3 tipos de comunidades de WhatsApp/Telegram relevantes.
   - **linkedinSearchQueries**: Forneça 2-3 strings de busca booleana para o LinkedIn Recruiter.
   - **specializedPlatforms**: Liste plataformas específicas (ex: GitHub, Behance, Catho, Indeed, Vagas.com).
6. **screeningQuestions**: Crie 4-5 perguntas eliminatórias de triagem rápida.
7. **coldOutreachTemplates**: Scripts de abordagem realistas para LinkedIn e WhatsApp.

Responda ESTRITAMENTE em formato JSON (sem markdown, sem crases) contendo o seguinte objeto:
{
  "sourcing": {
    "idealCandidate": "descrição completa do perfil ideal em 2-3 frases",
    "hardSkills": ["skill1", "skill2"],
    "softSkills": ["skill1", "skill2"],
    "companyExpectations": "texto descritivo",
    "sourcingChannels": {
      "universities": ["faculdade1"],
      "facebookGroups": ["grupo1"],
      "whatsappTelegramCommunities": ["comunidade1"],
      "linkedinSearchQueries": ["query1"],
      "specializedPlatforms": ["plataforma1"]
    },
    "coldOutreachTemplates": {
      "linkedinInmail": "mensagem completa",
      "whatsappDirect": "mensagem completa"
    },
    "screeningQuestions": ["pergunta 1"],
    "recommendedUniversities": ["UFES"],
    "linkedinHashtags": ["#Jobz", "#Vagas"]
  },
  "copy": {
    "headline": "${safeData.title}",
    "subheadline": "frase atrativa sobre a oportunidade",
    "highlights": [
      "${safeData.modality} | ${safeData.location}",
      "${labelHoursPrefix}${safeData.schedule}",
      "${labelFinancialPrefix}${safeData.salary}",
      "Benefícios: ${defaultBenefitsText}"
    ],
    "ctaText": "Inscreva-se",
    "socialCaption": "legenda completa para redes sociais com emojis e hashtags"
  }
}`;

      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'Você é uma IA de recrutamento que responde EXCLUSIVAMENTE em JSON válido. Nunca use markdown, nunca use crases. Apenas JSON puro.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2500
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        const jsonRes = await res.json();
        const rawContent = jsonRes?.choices?.[0]?.message?.content || '';
        
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && parsed.sourcing && parsed.copy) {
            const sourcing: SourcingProfile = {
              idealCandidate: parsed.sourcing.idealCandidate || '',
              hardSkills: Array.isArray(parsed.sourcing.hardSkills) ? parsed.sourcing.hardSkills : [],
              softSkills: Array.isArray(parsed.sourcing.softSkills) ? parsed.sourcing.softSkills : [],
              companyExpectations: parsed.sourcing.companyExpectations || '',
              sourcingChannels: {
                universities: Array.isArray(parsed.sourcing.sourcingChannels?.universities) ? parsed.sourcing.sourcingChannels.universities : [],
                facebookGroups: Array.isArray(parsed.sourcing.sourcingChannels?.facebookGroups) ? parsed.sourcing.sourcingChannels.facebookGroups : [],
                whatsappTelegramCommunities: Array.isArray(parsed.sourcing.sourcingChannels?.whatsappTelegramCommunities) ? parsed.sourcing.sourcingChannels.whatsappTelegramCommunities : [],
                linkedinSearchQueries: Array.isArray(parsed.sourcing.sourcingChannels?.linkedinSearchQueries) ? parsed.sourcing.sourcingChannels.linkedinSearchQueries : [],
                specializedPlatforms: Array.isArray(parsed.sourcing.sourcingChannels?.specializedPlatforms) ? parsed.sourcing.sourcingChannels.specializedPlatforms : [],
              },
              coldOutreachTemplates: parsed.sourcing.coldOutreachTemplates || {
                linkedinInmail: '',
                whatsappDirect: '',
              },
              screeningQuestions: Array.isArray(parsed.sourcing.screeningQuestions) ? parsed.sourcing.screeningQuestions : [],
              recommendedUniversities: Array.isArray(parsed.sourcing.recommendedUniversities) ? parsed.sourcing.recommendedUniversities : [],
              linkedinHashtags: Array.isArray(parsed.sourcing.linkedinHashtags) ? parsed.sourcing.linkedinHashtags : ['#Jobz', '#Vagas'],
            };

            const copy: CopyData = {
              headline: parsed.copy.headline || safeData.title,
              subheadline: parsed.copy.subheadline || 'Oportunidade de Emprego',
              highlights: defaultHighlights,
              ctaText: 'Inscreva-se',
              socialCaption: parsed.copy.socialCaption || 'Vaga aberta na Jobz! Candidate-se em: jobz.com.br/vagas',
            };

            return { sourcing, copy };
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

  // ─── Fallback Estruturado Inteligente (sem IA) ──────────────────────────
  const cityLoc = (safeData.location.split('/')[0] || 'Vitória').trim();
  const stateLoc = (safeData.location.split('/')[1] || 'ES').trim();
  const titleFirstWord = (safeData.title.split(' ')[0] || 'Profissional').trim();

  const sourcingChannels: SourcingChannels = {
    universities: isEstagio
      ? ['UFES', 'UVV', 'FAESA', 'PUC', 'Multivix', 'IFES', 'UCL']
      : [],
    facebookGroups: [
      `Vagas em ${cityLoc}`,
      `Vagas de ${titleFirstWord} - ES`,
      'Vagas Espírito Santo',
    ],
    whatsappTelegramCommunities: [
      `Grupo de Vagas ${titleFirstWord}`,
      `Oportunidades ${cityLoc}`,
    ],
    linkedinSearchQueries: [
      `"${safeData.title}" AND ("${cityLoc}" OR remoto)`,
      `${safeData.requirements.slice(0, 2).join(' AND ')} AND (${stateLoc})`,
    ],
    specializedPlatforms: detectSpecializedPlatforms(safeData),
  };

  const sourcing: SourcingProfile = {
    idealCandidate: `Profissional de nível ${safeData.seniorityLevel} focado em ${safeData.title}, com perfil proativo e excelente comunicação. ${isEstagio ? 'Estudante cursando graduação na área.' : isPJ ? 'Profissional autônomo com experiência comprovada e CNPJ ativo.' : 'Profissional com experiência sólida e carteira CLT.'}`,
    hardSkills: extractHardSkills(safeData),
    softSkills: ['Comunicação interpessoal', 'Proatividade', 'Organização', 'Trabalho em equipe', 'Resolução de problemas'],
    companyExpectations: `A empresa busca um profissional comprometido com resultados, que demonstre autonomia e capacidade de aprender rapidamente. Espera-se postura colaborativa e orientação para metas.`,
    sourcingChannels,
    coldOutreachTemplates: {
      linkedinInmail: `Olá! Vi seu perfil no LinkedIn e ele se encaixa perfeitamente na vaga de ${safeData.title} na Jobz (${safeData.location}). ${isEstagio ? 'É uma ótima oportunidade de estágio para iniciar sua carreira!' : 'Temos uma proposta muito competitiva.'} Teria 5 minutos para conversar?`,
      whatsappDirect: `Olá! Sou recrutadora da Jobz e temos uma oportunidade incrível para ${safeData.title} (${safeData.location} - ${safeData.modality}). ${isEstagio ? 'Bolsa ' : ''}${safeData.salary}. Gostaria de saber mais detalhes? 😊`
    },
    screeningQuestions: generateScreeningQuestions(safeData),
    recommendedUniversities: isEstagio ? ['UFES', 'UVV', 'FAESA', 'PUC', 'Multivix'] : [],
    linkedinHashtags: ['#Jobz', '#Recrutamento', `#${safeData.title.replace(/[^a-zA-Z0-9]/g, '')}`, '#VagasCapixabas'],
  };

  const copy: CopyData = {
    headline: safeData.title,
    subheadline: isEstagio
      ? `Oportunidade de Estágio em ${safeData.location}`
      : `${getContractLabel(safeData.contractType)} em ${safeData.location}`,
    highlights: defaultHighlights,
    ctaText: 'Inscreva-se',
    socialCaption: `🚀 Oportunidade Aberta na Jobz!\n\nEstamos contratando: ${safeData.title}.\n📍 ${safeData.location} (${safeData.modality})\n⏰ ${safeData.schedule}\n💰 ${safeData.salary}\n📋 ${getContractLabel(safeData.contractType)}\n\nVenha fazer parte do nosso time. Candidate-se em: jobz.com.br/vagas\n\n#Vagas #Jobz #Recrutamento #Capixaba`
  };

  return { sourcing, copy };
}

function detectSpecializedPlatforms(data: ExtractedJobData): string[] {
  const reqsText = Array.isArray(data.requirements) ? data.requirements.join(' ') : '';
  const text = `${data.title || ''} ${reqsText} ${data.rawDescription || ''}`.toLowerCase();
  const platforms: string[] = [];

  if (/desenvolv|programad|software|back.?end|front.?end|full.?stack|devops|ti\b|t\.i\./i.test(text)) {
    platforms.push('GitHub', 'Stack Overflow Jobs', 'LinkedIn');
  }
  if (/design|ui|ux|gráfico|creative|criativo|diagramação/i.test(text)) {
    platforms.push('Behance', 'Dribbble', '99designs');
  }
  if (/market|vendas|comercial|growth|sdr|bdr/i.test(text)) {
    platforms.push('LinkedIn Sales Navigator', 'Vagas.com');
  }
  if (/cont[áa]bil|financeiro|fiscal|tribut/i.test(text)) {
    platforms.push('Catho', 'Indeed', 'CRC-ES');
  }
  if (/jur[íi]dico|advogad|direito/i.test(text)) {
    platforms.push('OAB-ES', 'LinkedIn', 'JusBrasil');
  }
  if (/engenh|civil|mec[âa]nic|el[ée]tric/i.test(text)) {
    platforms.push('CREA-ES', 'LinkedIn', 'Vagas.com');
  }

  if (platforms.length === 0) {
    platforms.push('LinkedIn', 'Catho', 'Indeed', 'Vagas.com');
  }

  return [...new Set(platforms)];
}

function extractHardSkills(data: ExtractedJobData): string[] {
  const skills = new Set<string>();
  const reqs = Array.isArray(data.requirements) ? data.requirements : [];
  const acts = Array.isArray(data.activities) ? data.activities : [];
  const desc = data.rawDescription || '';
  const allText = [...reqs, ...acts, desc].join(' ');

  const knownSkills = [
    'Excel', 'Word', 'PowerPoint', 'Power BI', 'Python', 'Java', 'JavaScript', 'TypeScript',
    'React', 'Next.js', 'Node.js', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'Git', 'Figma', 'Photoshop', 'Illustrator', 'SAP', 'TOTVS',
    'ERP', 'CRM', 'Salesforce', 'HubSpot', 'Google Analytics', 'SEO', 'SEM', 'Scrum',
    'Kanban', 'Agile', 'ITIL', 'AutoCAD', 'Revit', 'MATLAB', 'R', 'Tableau',
    'Pack Office', 'Pacote Office',
  ];

  for (const skill of knownSkills) {
    if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(allText)) {
      skills.add(skill);
    }
  }

  reqs.slice(0, 3).forEach(r => {
    if (r && r.length < 60 && !skills.has(r)) skills.add(r);
  });

  if (skills.size === 0) {
    skills.add('Conhecimentos específicos da área');
    skills.add('Ferramentas de gestão');
  }

  return Array.from(skills).slice(0, 8);
}

function generateScreeningQuestions(data: ExtractedJobData): string[] {
  const questions: string[] = [];
  const firstReq = Array.isArray(data.requirements) && data.requirements[0] ? data.requirements[0] : 'na área';

  if (data.contractType === 'ESTAGIO') {
    questions.push('Em qual período/semestre do curso você está atualmente?');
    questions.push('Qual sua disponibilidade de horários para o estágio?');
    questions.push(`Você tem experiência ou conhecimento em ${firstReq}?`);
    questions.push('Tem interesse em ser efetivado após o período de estágio?');
  } else if (data.contractType === 'PJ') {
    questions.push('Você possui CNPJ ativo e regular?');
    questions.push(`Qual sua experiência comprovada em ${firstReq}?`);
    questions.push('Qual sua disponibilidade de horas mensais para dedicação ao projeto?');
    questions.push('Qual sua pretensão de valor mensal (PJ)?');
    questions.push('Possui portfólio ou cases de sucesso para compartilhar?');
  } else {
    questions.push('Quais são seus principais projetos ou experiências recentes na área?');
    questions.push('Qual sua disponibilidade de horários e data de início?');
    questions.push('Qual sua pretensão salarial (CLT)?');
    questions.push(`Qual seu nível de proficiência em ${firstReq}?`);
    questions.push('Qual modelo de trabalho você prefere (presencial, híbrido, remoto)?');
  }

  return questions;
}
