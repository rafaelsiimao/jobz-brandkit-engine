import { chromium } from 'playwright';
import { ExtractedJobData } from './types';

export function parseAblerHtml(html: string): ExtractedJobData {
  // Title extraction
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'Vaga de Emprego';
  const title = rawTitle.split('|')[0].split('-')[0].trim() || 'Vaga de Emprego';

  // Location extraction
  let location = 'Vitória / ES';
  if (html.includes('Vila Velha')) location = 'Vila Velha / ES';
  else if (html.includes('Serra')) location = 'Serra / ES';
  else if (html.includes('Cariacica')) location = 'Cariacica / ES';
  else if (html.includes('Remoto') || html.includes('Home Office')) location = 'Remoto / Brasil';

  // Modality extraction
  let modality = 'Presencial';
  if (html.includes('Híbrido') || html.includes('hibrido')) modality = 'Híbrido';
  else if (html.includes('Remoto') || html.includes('Home Office')) modality = 'Remoto';

  // Salary / Bolsa extraction
  let salary = 'Compatível com o mercado';
  const salaryMatch = html.match(/(R\$\s*[\d\.\,]+(?:\s*\+\s*R\$\s*[\d\.\,]+)?(?:\s*\([^\)]+\))?)/i);
  if (salaryMatch) {
    salary = salaryMatch[1].trim();
  } else if (html.includes('Bolsa') || html.includes('Estágio')) {
    salary = 'Bolsa Auxílio + VT';
  }

  // Schedule extraction
  let schedule = 'Segunda a Sexta-feira';
  if (html.includes('08:00') || html.includes('08h')) schedule = '08h às 12h (Seg a Sex)';
  else if (html.includes('44h')) schedule = '44h semanais';
  else if (html.includes('40h')) schedule = '40h semanais';

  // Requirements extraction
  const requirements: string[] = [];
  const reqMatch = html.match(/(?:Requisitos|Exigências|Perfil)([\s\S]*?)(?:Benefícios|Atividades|Sobre|$)/i);
  if (reqMatch) {
    const listItems = reqMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (listItems) {
      listItems.slice(0, 3).forEach((item) => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text) requirements.push(text);
      });
    }
  }
  if (requirements.length === 0) {
    requirements.push('Experiência ou formação na área de atuação');
    requirements.push('Boa comunicação interpessoal e organização');
  }

  // Benefits & Activities
  const benefits = ['Vale Transporte / Alimentação', 'Plano de Saúde', 'Desenvolvimento profissional'];
  const activities = ['Executar atividades operacionais do cargo', 'Acompanhar rotinas do setor', 'Colaborar com a equipe'];

  return {
    title,
    location,
    modality,
    salary,
    benefits,
    schedule,
    requirements,
    activities,
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
