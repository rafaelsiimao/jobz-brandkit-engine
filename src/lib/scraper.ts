import { ExtractedJobData, ContractType, SeniorityLevel } from './types';

// ─── Unicode & HTML Sanitizer ──────────────────────────────────────────────
export function decodeUnicodeEscapes(str: string): string {
  if (!str) return '';
  let decoded = str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  decoded = decoded.replace(/\\n/g, ' ').replace(/\\t/g, ' ').replace(/\\r/g, ' ');
  return decoded;
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  let str = decodeUnicodeEscapes(text);

  // Cut off at raw JS payload metadata keys if present in Next.js payload dumps
  const jsPayloadCutoffs = [
    ',allDescriptions:',
    'allDescriptions:',
    ',educationalLevel:',
    'educationalLevel:',
    'educationalLevelStatus:',
    'locationToMatch:',
    'hideCompany:',
    'publishedAt:',
    'levelOfInterests:',
    ',slug:',
    'statusKey:',
    'vacancyBenefits:',
    'exclusivePcd:'
  ];

  for (const cutoff of jsPayloadCutoffs) {
    const idx = str.indexOf(cutoff);
    if (idx !== -1) {
      str = str.slice(0, idx);
    }
  }

  // Strip HTML tags
  str = str.replace(/<[^>]+>/g, ' ');
  // Strip HTML entities
  str = str.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  // Strip leftover quotes/slashes from JSON stringification
  str = str.replace(/^["']+|["']+$/g, '');
  // Collapse whitespace
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

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

        const title = sanitizeText(jobPosting.title || jobPosting.name || '');
        const description = sanitizeText(jobPosting.description || '');

        // Location
        let location = '';
        if (jobPosting.jobLocation) {
          const loc = Array.isArray(jobPosting.jobLocation) ? jobPosting.jobLocation[0] : jobPosting.jobLocation;
          if (loc?.address) {
            const addr = loc.address;
            const city = sanitizeText(addr.addressLocality || '');
            const state = sanitizeText(addr.addressRegion || '');
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

        return {
          title: title || undefined,
          location: location || undefined,
          salary: salary || undefined,
          rawDescription: description,
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
      const title = sanitizeText(job.title || job.name || job.titulo || '');
      const location = sanitizeText(job.location || job.city || job.cidade || '');
      const state = sanitizeText(job.state || job.estado || job.uf || '');
      const salary = sanitizeText(String(job.salary || job.salario || job.remuneration || ''));
      const description = sanitizeText(String(job.description || job.descricao || job.full_description || ''));

      return {
        title: title || undefined,
        location: location && state ? `${location} / ${state}` : location || undefined,
        salary: salary || undefined,
        rawDescription: description,
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
  if (ogTitle) result.title = sanitizeText(ogTitle[1]);

  const ogDesc = html.match(/<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["']/i);
  if (ogDesc) result.description = sanitizeText(ogDesc[1]);

  return result;
}

// ─── Camada 4: Parser HTML Semântico (Regex Fallback) ───────────────────────
function parseHtmlSemantic(html: string): Partial<ExtractedJobData> {
  const decodedHtml = decodeUnicodeEscapes(html);

  // Title extraction
  const titleMatch = decodedHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || decodedHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? sanitizeText(titleMatch[1]) : 'Vaga de Emprego';
  const title = rawTitle.split('|')[0].split('-')[0].trim() || 'Vaga de Emprego';

  // Location extraction
  let location = '';
  const locationPatterns = [
    { pattern: /Vit[óo]ria/i, value: 'Vitória / ES' },
    { pattern: /Vila\s*Velha/i, value: 'Vila Velha / ES' },
    { pattern: /Serra\b/i, value: 'Serra / ES' },
    { pattern: /Cariacica/i, value: 'Cariacica / ES' },
    { pattern: /Guarapari/i, value: 'Guarapari / ES' },
    { pattern: /Cachoeiro/i, value: 'Cachoeiro de Itapemirim / ES' },
    { pattern: /Linhares/i, value: 'Linhares / ES' },
    { pattern: /S[ãa]o\s*Paulo/i, value: 'São Paulo / SP' },
    { pattern: /Campinas/i, value: 'Campinas / SP' },
    { pattern: /Rio\s*de\s*Janeiro/i, value: 'Rio de Janeiro / RJ' },
    { pattern: /Belo\s*Horizonte/i, value: 'Belo Horizonte / MG' },
    { pattern: /Curitiba/i, value: 'Curitiba / PR' },
    { pattern: /Florian[óo]polis/i, value: 'Florianópolis / SC' },
    { pattern: /Salvador/i, value: 'Salvador / BA' },
    { pattern: /Bras[íi]lia/i, value: 'Brasília / DF' },
  ];

  for (const lp of locationPatterns) {
    if (lp.pattern.test(decodedHtml)) { location = lp.value; break; }
  }

  if (!location) {
    const stateMatch = decodedHtml.match(/(?:UF|Estado|State)[:\s]*([A-Z]{2})/i);
    if (stateMatch) location = stateMatch[1];
  }

  if (!location && (decodedHtml.includes('Remoto') || decodedHtml.includes('Home Office') || /remoto/i.test(decodedHtml))) {
    location = 'Remoto / Brasil';
  }
  if (!location) location = 'A definir';

  // Modality
  let modality = 'Presencial';
  if (/h[ií]brido/i.test(decodedHtml)) modality = 'Híbrido';
  else if (/remoto|home\s*office|teletrabalho/i.test(decodedHtml)) modality = 'Remoto';

  // Salary
  let salary = 'Compatível com o mercado';
  const salaryMatch = decodedHtml.match(/(R\$\s*[\d\.]+(?:,\d{2})?(?:\s*(?:a|até|-)\s*R\$\s*[\d\.]+(?:,\d{2})?)?)/i);
  if (salaryMatch) {
    salary = salaryMatch[1].trim();
  } else if (/bolsa\s*(?:aux[íi]lio|est[áa]gio)/i.test(decodedHtml)) {
    salary = 'Bolsa Auxílio';
  } else if (/a\s*combinar/i.test(decodedHtml)) {
    salary = 'A combinar';
  }

  // Schedule
  let schedule = 'Horário comercial';
  if (/6\s*horas|30\s*h|6h/i.test(decodedHtml)) schedule = '6h diárias (30h semanais)';
  else if (/8\s*horas|44\s*h|8h/i.test(decodedHtml)) schedule = '8h diárias (44h semanais)';
  else if (/40\s*h/i.test(decodedHtml)) schedule = '40h semanais';

  // Requirements extraction
  const requirements: string[] = [];
  const reqPattern = new RegExp('(?:Requisitos|Exig[êe]ncias|Perfil|Qualifica[çc][õo]es|Compet[êe]ncias|Pr[ée]-requisitos)([\\s\\S]*?)(?:Benef[íi]cios|Atividades|Responsabilidades|Sobre|Remunera[çc][ãa]o|Local|Informa[çc][õo]es|<\\/div>|<\\/section>|$)', 'i');
  const reqSections = decodedHtml.match(reqPattern);
  if (reqSections) {
    const liPattern = new RegExp('<li[^>]*>([\\s\\S]*?)<\\/li>', 'gi');
    const listItems = reqSections[1].match(liPattern);
    if (listItems) {
      listItems.forEach((item) => {
        const text = sanitizeText(item);
        if (text && text.length > 3 && text.length < 120) requirements.push(text);
      });
    }
    if (requirements.length === 0) {
      const cleanSection = sanitizeText(reqSections[1]);
      const sentences = cleanSection.split(/(?:\. |; |\n)/).map(s => sanitizeText(s)).filter(s => s.length > 5 && s.length < 120);
      sentences.slice(0, 5).forEach(s => requirements.push(s));
    }
  }
  if (requirements.length === 0) {
    requirements.push('Experiência ou formação na área de atuação');
    requirements.push('Boa comunicação interpessoal e organização');
  }

  // Benefits extraction
  const benefits: string[] = [];
  const benefitPattern = new RegExp('(?:Benef[íi]cios|Oferecemos|O\\s*que\\s*oferecemos)([\\s\\S]*?)(?:Requisitos|Atividades|Sobre|Local|Contato|<\\/div>|<\\/section>|$)', 'i');
  const benefitSections = decodedHtml.match(benefitPattern);
  if (benefitSections) {
    const liPattern2 = new RegExp('<li[^>]*>([\\s\\S]*?)<\\/li>', 'gi');
    const listItems = benefitSections[1].match(liPattern2);
    if (listItems) {
      listItems.forEach((item) => {
        const text = sanitizeText(item);
        if (text && text.length > 2 && text.length < 120) benefits.push(text);
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
  const actSections = decodedHtml.match(actPattern);
  if (actSections) {
    const liPattern3 = new RegExp('<li[^>]*>([\\s\\S]*?)<\\/li>', 'gi');
    const listItems = actSections[1].match(liPattern3);
    if (listItems) {
      listItems.forEach((item) => {
        const text = sanitizeText(item);
        if (text && text.length > 3 && text.length < 120) activities.push(text);
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
    requirements: requirements.map(r => sanitizeText(r)),
    activities: activities.map(a => sanitizeText(a)),
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
  const title = sanitizeText(jsonLdData?.title || nextData?.title || metaTags?.title || semanticData.title || 'Vaga de Emprego');
  const rawDescription = sanitizeText(jsonLdData?.rawDescription || nextData?.rawDescription || metaTags?.description || sanitizeText(html).slice(0, 2000));

  const merged: ExtractedJobData = {
    title,
    location: sanitizeText(jsonLdData?.location || nextData?.location || semanticData.location || 'A definir'),
    modality: sanitizeText(semanticData.modality || 'Presencial'),
    salary: sanitizeText(jsonLdData?.salary || nextData?.salary || semanticData.salary || 'Compatível com o mercado'),
    benefits: (semanticData.benefits || ['Vale Transporte / Alimentação']).map(b => sanitizeText(b)),
    schedule: sanitizeText(semanticData.schedule || 'Horário comercial'),
    requirements: (semanticData.requirements || ['Experiência na área']).map(r => sanitizeText(r)).filter(r => r.length > 2 && r.length < 150),
    activities: (semanticData.activities || ['Executar atividades do cargo']).map(a => sanitizeText(a)).filter(a => a.length > 2 && a.length < 150),
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
