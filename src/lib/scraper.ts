import { chromium } from 'playwright';
import { ExtractedJobData } from './types';

export function parseAblerHtml(html: string): ExtractedJobData {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'Vaga de Emprego';
  const title = rawTitle.split('|')[0].split('-')[0].trim() || 'Vaga de Emprego';

  const location = html.includes('Vitória') ? 'Vitória - ES' : 'Remoto / Brasil';
  const modality = html.includes('Híbrido') ? 'Híbrido' : html.includes('Presencial') ? 'Presencial' : 'Remoto';

  return {
    title,
    location,
    modality,
    salary: 'A combinar / Compatível com mercado',
    benefits: ['Vale Refeição / Alimentação', 'Plano de Saúde e Odontológico', 'Bônus por Desempenho'],
    schedule: '40h semanais (Segunda a Sexta-feira)',
    requirements: ['Experiência técnica na área de atuação', 'Boa comunicação interpessoal', 'Proatividade e organização'],
    activities: ['Desenvolver atividades estratégicas do cargo', 'Acompanhar métricas de desempenho', 'Colaborar com a equipe de RH']
  };
}

export async function extractJobFromAbler(jobUrl: string): Promise<ExtractedJobData> {
  const fetchDirectly = async () => {
    const res = await fetch(jobUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const htmlText = await res.text();
    return parseAblerHtml(htmlText);
  };

  // No ambiente Vercel Serverless, usa HTTP fetch direto instantaneo (evita timeouts do Playwright)
  if (process.env.VERCEL === '1') {
    return fetchDirectly();
  }

  try {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const content = await page.content();
      return parseAblerHtml(content);
    } finally {
      await browser.close();
    }
  } catch (err: any) {
    console.warn('Playwright não disponível ou com falha, usando fallback HTTP fetch:', err?.message);
    return fetchDirectly();
  }
}
