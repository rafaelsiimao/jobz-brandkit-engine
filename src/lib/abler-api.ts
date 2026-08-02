import { ExtractedJobData, ContractType } from './types';

const ABLER_BASE_URL = process.env.ABLER_API_URL || 'https://hulk-smash.abler.com.br';
const DEFAULT_ABLER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55X2lkIjo1ODIsInRpbWVzdGFtcCI6MTc4NTU0MzMyNiwiY29tcGFueV91c2VyX2lkIjoxNDQyfQ.yPAeDlvUJ-20I-4Y1S3ehx5hdvMlVGVQsdg6Iq_SBro';

export interface AblerVacancyItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  statusKey: string;
  contractingRegime: string;
  workType: string;
  location: string;
  salary: string;
  benefits?: string[];
  createdAt: string;
  publishedAt: string;
}

function getAblerHeaders() {
  const token = process.env.ABLER_API_TOKEN || DEFAULT_ABLER_TOKEN;
  return {
    'Content-Type': 'application/json',
    'X-API-INT-TOKEN': token,
  };
}

export function cleanBenefits(raw: string): string[] {
  if (!raw) return [];
  const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Ignorar anotações internas do recrutador, e-mails, telefones, faixas salariais e nomes de contato
  const isInternalNote = /@|\+?\d{8,}|alinhamento|confirmar|cliente|validar|hunting|faturar|faixa\s*salarial|s[óo]cio|contador|representante|contato/i.test(text);
  if (isInternalNote || text.length < 3) return [];
  
  return [text];
}

export async function fetchCompanyVacancies(): Promise<AblerVacancyItem[]> {
  try {
    const res = await fetch(`${ABLER_BASE_URL}/api/company/v1/vacancies?per_page=50`, {
      headers: getAblerHeaders(),
      next: { revalidate: 15 }
    });

    if (!res.ok) {
      throw new Error(`Erro HTTP Abler: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    return data.map((item: any) => {
      const attrs = item?.attributes || {};
      const cities = Array.isArray(attrs.search_cities_term) ? attrs.search_cities_term : [];
      const firstCity = cities[0] || {};
      const cityName = firstCity.full_name || firstCity.name || 'Espírito Santo';

      const workTypes = Array.isArray(attrs.work_type_formatted) && attrs.work_type_formatted.length > 0
        ? attrs.work_type_formatted.join(' / ')
        : 'Presencial';

      let salaryStr = 'Compatível com o mercado';
      if (attrs.salary_value) {
        salaryStr = `R$ ${Number(attrs.salary_value).toLocaleString('pt-BR')}`;
      } else if (attrs.salary) {
        salaryStr = `R$ ${Number(attrs.salary).toLocaleString('pt-BR')}`;
      }

      const rawB = attrs.benefits_without_tags || attrs.benefits || attrs.job_benefits || '';
      const bList = cleanBenefits(rawB);

      return {
        id: String(item?.id || Math.random()),
        title: attrs.title || 'Vaga Sem Título',
        slug: attrs.slug || '',
        status: attrs.status || 'Ativa',
        statusKey: attrs.status_key || 'published',
        contractingRegime: attrs.contracting_regime || 'CLT',
        workType: workTypes,
        location: cityName,
        salary: salaryStr,
        benefits: bList,
        createdAt: attrs.created_at || '',
        publishedAt: attrs.published_at || '',
      };
    });
  } catch (err: any) {
    console.error('Falha ao buscar vagas na Abler API V2:', err?.message);
    return [];
  }
}

export async function fetchVacancyDetailsFromAbler(vacancyId: string): Promise<ExtractedJobData> {
  const res = await fetch(`${ABLER_BASE_URL}/api/company/v1/vacancies/${vacancyId}`, {
    headers: getAblerHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Vaga #${vacancyId} não encontrada na Abler (Status ${res.status})`);
  }

  const json = await res.json();
  const attrs = json?.data?.attributes || {};

  const title = attrs.title || 'Vaga Sem Título';
  
  // Modality mapping
  let modality = 'Presencial';
  const workTypeFormatted = Array.isArray(attrs.work_type_formatted) ? attrs.work_type_formatted.join(' ') : '';
  if (/h[ií]brid/i.test(workTypeFormatted) || /h[ií]brid/i.test(attrs.work_type || '')) {
    modality = 'Híbrido';
  } else if (/remot|home\s*office/i.test(workTypeFormatted) || /remot/i.test(attrs.work_type || '')) {
    modality = 'Remoto';
  }

  // Location mapping
  const cities = Array.isArray(attrs.search_cities_term) ? attrs.search_cities_term : [];
  const firstCity = cities[0] || {};
  let location = firstCity.full_name || firstCity.name || 'Vitória / ES';
  if (modality === 'Remoto' && !location.includes('Remoto')) {
    location = `${location} (Remoto)`;
  }

  // Salary mapping
  let salary = 'Compatível com o mercado';
  if (attrs.salary_value) {
    salary = `R$ ${Number(attrs.salary_value).toLocaleString('pt-BR')}`;
  } else if (attrs.salary) {
    salary = `R$ ${Number(attrs.salary).toLocaleString('pt-BR')}`;
  }

  // Contract Type mapping
  let contractType: ContractType = 'CLT';
  const regime = (attrs.contracting_regime_value || attrs.contracting_regime || '').toUpperCase();
  if (regime.includes('ESTAGIO') || regime.includes('ESTÁGIO') || /est[áa]gio/i.test(title)) {
    contractType = 'ESTAGIO';
  } else if (regime.includes('PJ') || regime.includes('PRESTADOR') || /pj\b/i.test(title)) {
    contractType = 'PJ';
  }

  // Schedule mapping with clean formatting (fixes joined text like "SextaHorario: 08h")
  let rawSchedule = attrs.working_journey_without_tags || attrs.working_journey || '';
  rawSchedule = rawSchedule.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Format schedule text nicely
  let schedule = rawSchedule
    .replace(/Segunda\s*a\s*SextaHorario/i, 'Segunda a Sexta • Horário')
    .replace(/([a-zA-Z0-9])Horario/gi, '$1 • Horário')
    .replace(/Sexta(\d)/gi, 'Sexta • $1')
    .replace(/\s+/g, ' ').trim();

  if (!schedule || schedule.length < 3) {
    schedule = contractType === 'ESTAGIO' ? '6h diárias (30h semanais)' : 'Segunda a Sexta • Horário comercial (40h/semana)';
  }

  // Requirements parsing
  const reqsText = attrs.mandatory_requirements_without_tags || attrs.mandatory_requirements || '';
  const requirements = reqsText
    ? reqsText.split('\n').map((s: string) => s.replace(/<[^>]+>/g, '').trim()).filter((s: string) => s.length > 3)
    : ['Experiência técnica na área', 'Boa comunicação interpessoal'];

  // Benefits parsing with cleanBenefits filter (exclui anotações internas do cliente)
  const rawBenefits = attrs.benefits_without_tags || attrs.benefits || attrs.job_benefits || '';
  const benefits = cleanBenefits(rawBenefits);

  const rawDescription = attrs.role_description_without_tags || attrs.description || title;

  return {
    title,
    location,
    modality,
    salary,
    benefits,
    schedule,
    requirements: Array.isArray(requirements) && requirements.length > 0 ? requirements : ['Formação ou experiência relevante'],
    activities: ['Executar atribuições e entregas do cargo com excelência'],
    contractType,
    seniorityLevel: attrs.seniority_level_formatted || 'Pleno',
    rawDescription,
  };
}
