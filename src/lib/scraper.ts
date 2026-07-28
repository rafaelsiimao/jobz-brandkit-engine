import { ExtractedJobData, ContractType, SeniorityLevel } from './types';

// ─── Camada 1: JSON-LD Schema.org/JobPosting ──────────────────────────────
function parseJsonLd(html: string): Partial<ExtractedJobData> | null {
  try {
    const scriptMatches = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!scriptMatches) return null;

    for (const script of scriptMatches) {
      const jsonContent = script.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      try {
        const parsed = JSON.parse(jsonContent);
        const jobPosting = Array.isArray(parsed)
          ? parsed.find((item: any) => item['@type'] === 'JobPosting')
          : parsed['@type'] === 'JobPosting' ? parsed : null;

        if (!jobPosting) continue;

        const title = jobPosting.title || jobPosting.name || '';
        const description = jobPosting.description || '';

        // Location
        let location = '';
        if (jobPosting.jobLocation) {
          const loc = Array.isArray(jobPosting.jobLocation) ? jobPosting.jobLocation[0] : jobPosting.jobLocation;
          if (loc?.address) {
            const addr = loc.address;
            const city = addr.addressLocality || '';
            const state = addr.addressRegion || '';
            location = city && state ? `${city} / ${state}` : city || state || '';
          }
        }
        if (jobPosting.jobLocationType === 'TELECOMMUTE') {
          location = location ? `${location} (Remoto)` : 'Remoto / Brasil';
        }

        // Salary
        let salary = '';
        if (jobPosting.baseSalary) {
          const base = jobPosting.baseSalary;
          if (base.value) {
            const val = base.value;
            const currency = base.currency || 'BRL';
            const symbol = currency === 'BRL' ? 'R$' : currency;
            if (val.minValue && val.maxValue) {
              salary = `${symbol} ${Number(val.minValue).toLocaleString('pt-BR')} - ${symbol} ${Number(val.maxValue).toLocaleString('pt-BR')}`;
            } else if (val.value) {
              salary = `${symbol} ${Number(val.value).toLocaleString('pt-BR')}`;
            }
          }
        }

        // Employment type
        const employmentType = jobPosting.employmentType || '';

        return {
          title: title.trim(),
          location: location || undefined,
          salary: salary || undefined,
          rawDescription: stripHtml(description),
        };
      } catch {
        continue;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Camada 2: __NEXT_DATA__ React Hydration Props ─────────────────────────
function parseNextData(html: string): Partial<ExtractedJobData> | null {
  try {
    const nextDataMatch = html.match(/<script[^>]*id\s*=\s*["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!nextDataMatch) return null;

    const data = JSON.parse(nextDataMatch[1]);
    const props = data?.props?.pageProps;
    if (!props) return null;

    // Try common keys for job data
    const job = props.job || props.vacancy || props.vaga || props.data || props;

    if (job && (job.title || job.name || job.titulo)) {
      const title = job.title || job.name || job.titulo || '';
      const location = job.location || job.city || job.cidade || '';
      const state = job.state || job.estado || job.uf || '';
      const salary = job.salary || job.salario || job.remuneration || '';
      const description = job.description || job.descricao || job.full_description || '';

      return {
        title: title.trim(),
        location: location && state ? `${location} / ${state}` : location || undefined,
        salary: salary ? String(salary).trim() : undefined,
        rawDescription: stripHtml(String(description)),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Camada 3: Meta Tags OpenGraph ──────────────────────────────────────────
function parseMetaTags(html: string): { title?: string; description?: string } {
  const result: { title?: string; description?: string } = {};

  const ogTitle = html.match(/<meta[^>]*property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:title["']/i);
  if (ogTitle) result.title = ogTitle[1].trim();

  const ogDesc = html.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["']/i);
  if (ogDesc) result.description = ogDesc[1].trim();

  return result;
}

// ─── Camada 4: Parser HTML Semântico (Regex Fallback) ───────────────────────
function parseHtmlSemantic(html: string): Partial<ExtractedJobData> {
  // Title extraction
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'Vaga de Emprego';
  const title = rawTitle.split('|')[0].split('-')[0].trim() || 'Vaga de Emprego';

  // Location extraction (expandido para mais cidades/estados do Brasil)
  let location = '';
  const locationPatterns = [
    // ES
    { pattern: /Vit[óo]ria/i, value: 'Vitória / ES' },
    { pattern: /Vila\s*Velha/i, value: 'Vila Velha / ES' },
    { pattern: /Serra\b/i, value: 'Serra / ES' },
    { pattern: /Cariacica/i, value: 'Cariacica / ES' },
    { pattern: /Guarapari/i, value: 'Guarapari / ES' },
    { pattern: /Cachoeiro/i, value: 'Cachoeiro de Itapemirim / ES' },
    { pattern: /Linhares/i, value: 'Linhares / ES' },
    // SP
    { pattern: /S[ãa]o\s*Paulo/i, value: 'São Paulo / SP' },
    { pattern: /Campinas/i, value: 'Campinas / SP' },
    // RJ
    { pattern: /Rio\s*de\s*Janeiro/i, value: 'Rio de Janeiro / RJ' },
    // MG
    { pattern: /Belo\s*Horizonte/i, value: 'Belo Horizonte / MG' },
    // PR
    { pattern: /Curitiba/i, value: 'Curitiba / PR' },
    // SC
    { pattern: /Florian[óo]polis/i, value: 'Florianópolis / SC' },
    // BA
    { pattern: /Salvador/i, value: 'Salvador / BA' },
    // DF
    { pattern: /Bras[íi]lia/i, value: 'Brasília / DF' },
  ];

  for (const lp of locationPatterns) {
    if (lp.pattern.test(html)) { location = lp.value; break; }
  }

  // Try extracting state from HTML (e.g. "ES", "SP", "RJ")
  if (!location) {
    const stateMatch = html.match(/(?:UF|Estado|State)[:\s]*([A-Z]{2})/i);
    if (stateMatch) location = stateMatch[1];
  }

  if (!location && (html.includes('Remoto') || html.includes('Home Office') || html.includes('remoto'))) {
    location = 'Remoto / Brasil';
  }
  if (!location) location = 'A definir';

  // Modality
  let modality = 'Presencial';
  if (/h[ií]brido/i.test(html)) modality = 'Híbrido';
  else if (/remoto|home\s*office|teletrabalho/i.test(html)) modality = 'Remoto';

  // Salary
  let salary = 'Compatível com o mercado';
  const salaryMatch = html.match(/(R\$\s*[\d\.]+(?:,\d{2})?(?:\s*(?:a|até|-)\s*R\$\s*[\d\.]+(?:,\d{2})?)?)/i);
  if (salaryMatch) {
    salary = salaryMatch[1].trim();
  } else if (/bolsa\s*(?:aux[íi]lio|est[áa]gio)/i.test(html)) {
    salary = 'Bolsa Auxílio';
  } else if (/a\s*combinar/i.test(html)) {
    salary = 'A combinar';
  }

  // Schedule
  let schedule = 'Horário comercial';
  if (/6\s*horas|30\s*h|6h/i.test(html)) schedule = '6h diárias (30h semanais)';
  else if (/8\s*horas|44\s*h|8h/i.test(html)) schedule = '8h diárias (44h semanais)';
  else if (/40\s*h/i.test(html)) schedule = '40h semanais';

  // Requirements extraction (improved)
  const requirements: string[] = [];
  const reqPattern = new RegExp('(?:Requisitos|Exig[êe]ncias|Perfil|Qualifica[çc][õo]es|Compet[êe]ncias|Pr[ée]-requisitos)([\\s\\S]*?)(?:Benef[íi]cios|Atividades|Responsabilidades|Sobre|Remunera[çc][ãa]o|Local|Informa[çc][õo]es|<\\/div>|<\\/section>|$)', 'i');
  const reqSections = html.match(reqPattern);
  if (reqSections) {
    const liPattern = new RegExp('<li[^>]*>([\\s\\S]*?)<\\/li>', 'gi');
    const listItems = reqSections[1].match(liPattern);
    if (listItems) {
      listItems.forEach((item) => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 3) requirements.push(text);
      });
    }
    if (requirements.length === 0) {
      const lines = reqSections[1].replace(/<[^>]+>/g, '\n').split('\n').filter(l => l.trim().length > 5);
      lines.slice(0, 8).forEach(l => requirements.push(l.trim()));
    }
  }
  if (requirements.length === 0) {
    requirements.push('Experiência ou formação na área de atuação');
    requirements.push('Boa comunicação interpessoal e organização');
  }

  // Benefits extraction
  const benefits: string[] = [];
  const benefitPattern = new RegExp('(?:Benef[íi]cios|Oferecemos|O\\s*que\\s*oferecemos)([\\s\\S]*?)(?:Requisitos|Atividades|Sobre|Local|Contato|<\\/div>|<\\/section>|$)', 'i');
  const benefitSections = html.match(benefitPattern);
  if (benefitSections) {
    const liPattern2 = new RegExp('<li[^>]*>([\\s\\S]*?)<\\/li>', 'gi');
    const listItems = benefitSections[1].match(liPattern2);
    if (listItems) {
      listItems.forEach((item) => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 2) benefits.push(text);
      });
    }
  }
  if (benefits.length === 0) {
    benefits.push('Vale Transporte / Alimentação');
    benefits.push('Plano de Saúde');
    benefits.push('Desenvolvimento profissional');
  }

  // Activities extraction
  const activities: string[] = [];
  const actPattern = new RegExp('(?:Atividades|Responsabilidades|Atribui[çc][õo]es|O\\s*que\\s*voc[êe]\\s*vai\\s*fazer)([\\s\\S]*?)(?:Requisitos|Benef[íi]cios|Sobre|Local|<\\/div>|<\\/section>|$)', 'i');
  const actSections = html.match(actPattern);
  if (actSections) {
    const liPattern3 = new RegExp('<li[^>]*>([\\s\\S]*?)<\\/li>', 'gi');
    const listItems = actSections[1].match(liPattern3);
    if (listItems) {
      listItems.forEach((item) => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 3) activities.push(text);
      });
    }
  }
  if (activities.length === 0) {
    activities.push('Executar atividades operacionais do cargo');
    activities.push('Acompanhar rotinas do setor');
    activities.push('Colaborar com a equipe');
  }

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

// ─── Classificação de Contrato e Senioridade ────────────────────────────────
function classifyContract(title: string, description: string): ContractType {
  const text = `${title} ${description}`.toLowerCase();

  if (/est[áa]gio|estagi[áa]ri[ao]|intern|aprendiz|jovem\s*aprendiz|menor\s*aprendiz/i.test(text)) {
    return 'ESTAGIO';
  }
  if (/\bpj\b|pessoa\s*jur[íi]dica|prestador|contrato\s*(?:de\s*)?presta[çc][ãa]o|freelanc|aut[ôo]nomo|cnpj/i.test(text)) {
    return 'PJ';
  }
  return 'CLT';
}

function classifySeniority(title: string, description: string): SeniorityLevel {
  const text = `${title} ${description}`.toLowerCase();

  if (/est[áa]gi[oá]|intern|aprendiz/i.test(text)) return 'Estágio';
  if (/s[êe]nior|sr\.|s[êe]nior|pleno\/s[êe]nior/i.test(text)) return 'Sênior';
  if (/pleno|mid-?level/i.test(text)) return 'Pleno';
  if (/especialista|expert|staff|principal|lead/i.test(text)) return 'Especialista';
  if (/j[úu]nior|jr\.|trainee|junior/i.test(text)) return 'Júnior';
  return 'Pleno';
}

// ─── Utilities ──────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Função Principal de Extração Multi-Camada ──────────────────────────────
export function parseAblerHtml(html: string): ExtractedJobData {
  // Layer 1: JSON-LD
  const jsonLdData = parseJsonLd(html);

  // Layer 2: __NEXT_DATA__
  const nextData = parseNextData(html);

  // Layer 3: Meta Tags
  const metaTags = parseMetaTags(html);

  // Layer 4: HTML Semantic Fallback
  const semanticData = parseHtmlSemantic(html);

  // Merge layers with priority: JSON-LD > __NEXT_DATA__ > Meta Tags > Semantic
  const title = jsonLdData?.title || nextData?.title || metaTags?.title || semanticData.title || 'Vaga de Emprego';
  const rawDescription = jsonLdData?.rawDescription || nextData?.rawDescription || metaTags?.description || stripHtml(html).slice(0, 3000);

  const merged: ExtractedJobData = {
    title,
    location: jsonLdData?.location || nextData?.location || semanticData.location || 'A definir',
    modality: semanticData.modality || 'Presencial',
    salary: jsonLdData?.salary || nextData?.salary || semanticData.salary || 'Compatível com o mercado',
    benefits: semanticData.benefits || ['Vale Transporte / Alimentação', 'Plano de Saúde'],
    schedule: semanticData.schedule || 'Horário comercial',
    requirements: semanticData.requirements || ['Experiência na área'],
    activities: semanticData.activities || ['Executar atividades do cargo'],
    contractType: classifyContract(title, rawDescription),
    seniorityLevel: classifySeniority(title, rawDescription),
    rawDescription,
  };

  return merged;
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
    const { chromium } = await import('playwright');
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
