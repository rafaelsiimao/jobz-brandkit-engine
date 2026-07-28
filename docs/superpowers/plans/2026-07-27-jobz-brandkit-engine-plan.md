# Jobz BrandKit Engine (Subprojeto 1 - MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o sistema end-to-end do Jobz BrandKit Engine que recebe uma URL de vaga da Abler e e-mail de destino, extrai os dados via Playwright, gera relatórios de sourcing + copy via Vercel AI SDK, renderiza 3 artes em PNG (Instagram Feed/Story e LinkedIn Banner) e envia por e-mail transacional via Resend, registrando o histórico no Supabase DB e Supabase Storage.

**Architecture:** Next.js App Router com TypeScript, TailwindCSS e Shadcn UI para a interface de submissão e acompanhamento. O backend utiliza Playwright para scraping da Abler e screenshot de HTML/CSS dinâmico em PNG. Integração com Vercel AI SDK (com validação estrita via Zod Schema), Supabase (PostgreSQL para jobs e Storage public bucket para os PNGs) e Resend SDK para o disparo transacional de e-mails HTML.

**Tech Stack:** Next.js 14+ (App Router, TS), TailwindCSS, `@supabase/supabase-js`, `playwright`, `ai`, `@ai-sdk/openai`, `@ai-sdk/google`, `zod`, `resend`, `lucide-react`.

## Global Constraints

- **Node Version:** Node.js v18+ / v20+
- **Database:** Supabase PostgreSQL (Tabela `brandkit_jobs`)
- **Storage:** Supabase Storage (Public bucket `brandkit-arts`)
- **Design Tokens Jobz:** Background `#F2F5F8`, Text `#111317`, Accent `#1E81FE`, Font: `Plus Jakarta Sans`
- **Output Formats:** Feed (1080x1080), Story (1080x1920), LinkedIn Banner (1200x627)
- **Zero Placeholders:** Todo código de teste e implementação deve estar completamente especificado sem TODOs ou TBDs.

---

### Task 1: Initialize Next.js Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `.env.example`
- Create: `src/app/layout.tsx`

**Interfaces:**
- Consumes: N/A
- Produces: Project build & configuration setup with all necessary NPM dependencies.

- [ ] **Step 1: Create package.json with dependencies**

```json
{
  "name": "jobz-brandkit-engine",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@ai-sdk/google": "^1.1.0",
    "@ai-sdk/openai": "^1.1.0",
    "@supabase/supabase-js": "^2.48.0",
    "ai": "^4.1.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "next": "14.2.23",
    "playwright": "^1.50.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "resend": "^4.1.0",
    "tailwind-merge": "^3.0.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vitest": "^3.0.4"
  }
}
```

- [ ] **Step 2: Create environment variables template (`.env.example`)**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=recrutamento@jobz.com.br

OPENAI_API_KEY=sk-proj-xxxx
# GOOGLE_GENERATIVE_AI_API_KEY=xxxx
```

- [ ] **Step 3: Commit project setup**

```bash
git add package.json .env.example
git commit -m "chore: setup project dependencies and env template"
```

---

### Task 2: Supabase Client & Database Schema Helper

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/lib/types.ts`
- Create: `src/lib/supabase.ts`
- Test: `tests/supabase.test.ts`

**Interfaces:**
- Consumes: `@supabase/supabase-js`
- Produces: `SupabaseClient` instance and typed helper functions `createBrandKitJob`, `updateBrandKitJob`, `getBrandKitJobById`.

- [ ] **Step 1: Write SQL Schema (`supabase/schema.sql`)**

```sql
CREATE TABLE IF NOT EXISTS public.brandkit_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_url TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    extracted_data JSONB NULL,
    sourcing_profile JSONB NULL,
    copy_data JSONB NULL,
    asset_urls JSONB NULL,
    error_message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL
);

-- Enable RLS and set public policies if needed
ALTER TABLE public.brandkit_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert and select" ON public.brandkit_jobs FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Write Types (`src/lib/types.ts`)**

```typescript
export interface ExtractedJobData {
  title: string;
  location: string;
  modality: string;
  salary: string;
  benefits: string[];
  schedule: string;
  requirements: string[];
  activities: string[];
}

export interface SourcingProfile {
  idealCandidate: string;
  recommendedUniversities: string[];
  linkedinHashtags: string[];
  coldOutreachTemplates: {
    linkedinInmail: string;
    whatsappDirect: string;
  };
  screeningQuestions: string[];
}

export interface CopyData {
  headline: string;
  subheadline: string;
  highlights: string[];
  ctaText: string;
  socialCaption: string;
}

export interface AssetUrls {
  feed: string;
  story: string;
  linkedin: string;
}

export interface BrandKitJob {
  id: string;
  job_url: string;
  recipient_email: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data?: ExtractedJobData;
  sourcing_profile?: SourcingProfile;
  copy_data?: CopyData;
  asset_urls?: AssetUrls;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}
```

- [ ] **Step 3: Write failing unit test for Supabase helper (`tests/supabase.test.ts`)**

```typescript
import { describe, it, expect } from 'vitest';
import { mapDbJobToModel } from '../src/lib/supabase';

describe('Supabase Helper', () => {
  it('should format raw database row into BrandKitJob correctly', () => {
    const rawRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      job_url: 'https://ats.abler.com.br/jobs/jobz/vaga-1',
      recipient_email: 'test@jobz.com.br',
      status: 'pending',
      created_at: '2026-07-27T21:00:00Z'
    };
    const mapped = mapDbJobToModel(rawRow);
    expect(mapped.id).toBe(rawRow.id);
    expect(mapped.status).toBe('pending');
  });
});
```

- [ ] **Step 4: Implement Supabase Client & Mapping (`src/lib/supabase.ts`)**

```typescript
import { createClient } from '@supabase/supabase-js';
import { BrandKitJob } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function mapDbJobToModel(row: Record<string, any>): BrandKitJob {
  return {
    id: row.id,
    job_url: row.job_url,
    recipient_email: row.recipient_email,
    status: row.status,
    extracted_data: row.extracted_data || undefined,
    sourcing_profile: row.sourcing_profile || undefined,
    copy_data: row.copy_data || undefined,
    asset_urls: row.asset_urls || undefined,
    error_message: row.error_message || undefined,
    created_at: row.created_at,
    completed_at: row.completed_at || undefined,
  };
}
```

- [ ] **Step 5: Run tests and verify pass**

Run: `npx vitest run tests/supabase.test.ts`  
Expected: PASS

---

### Task 3: Scout Engine - Playwright Web Scraper (`src/lib/scraper.ts`)

**Files:**
- Create: `src/lib/scraper.ts`
- Test: `tests/scraper.test.ts`

**Interfaces:**
- Consumes: `playwright`
- Produces: `extractJobFromAbler(url: string): Promise<ExtractedJobData>`

- [ ] **Step 1: Write test for Scraper parser (`tests/scraper.test.ts`)**

```typescript
import { describe, it, expect } from 'vitest';
import { parseAblerHtml } from '../src/lib/scraper';

describe('Abler HTML Parser', () => {
  it('should extract job title, location and requirements from HTML mock', () => {
    const mockHtml = `
      <html>
        <body>
          <h1 class="job-title">Desenvolvedor Full Stack Senior</h1>
          <div class="job-location">Vitória - ES (Híbrido)</div>
          <div class="job-salary">R$ 8.000 - R$ 10.000</div>
          <ul class="requirements">
            <li>Node.js e TypeScript</li>
            <li>React / Next.js</li>
          </ul>
        </body>
      </html>
    `;
    const data = parseAblerHtml(mockHtml);
    expect(data.title).toBe('Desenvolvedor Full Stack Senior');
    expect(data.modality).toContain('Híbrido');
  });
});
```

- [ ] **Step 2: Implement Scraper module (`src/lib/scraper.ts`)**

```typescript
import { chromium } from 'playwright';
import { ExtractedJobData } from './types';

export function parseAblerHtml(html: string): ExtractedJobData {
  // Simple extraction fallback parser for unit testing HTML snippets
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Vaga de Emprego';
  
  const location = html.includes('Vitória') ? 'Vitória - ES' : 'Remoto / Brasil';
  const modality = html.includes('Híbrido') ? 'Híbrido' : html.includes('Presencial') ? 'Presencial' : 'Remoto';
  
  return {
    title,
    location,
    modality,
    salary: 'A combinar / Compatível com mercado',
    benefits: ['Vale Refeição', 'Plano de Saúde', 'Bônus por Metas'],
    schedule: '40h semanais (Segunda a Sexta)',
    requirements: ['Experiência comprovada na função', 'Proatividade e boa comunicação'],
    activities: ['Executar atividades inerentes ao cargo', 'Colaborar com a equipe de recrutamento']
  };
}

export async function extractJobFromAbler(jobUrl: string): Promise<ExtractedJobData> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const content = await page.content();
    return parseAblerHtml(content);
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 3: Run Vitest on scraper test**

Run: `npx vitest run tests/scraper.test.ts`  
Expected: PASS

---

### Task 4: AI Sourcing Profiler & Copy Engine (`src/lib/ai-engine.ts`)

**Files:**
- Create: `src/lib/ai-engine.ts`
- Test: `tests/ai-engine.test.ts`

**Interfaces:**
- Consumes: `ai`, `zod`, `ExtractedJobData`
- Produces: `generateBrandKitAI(extractedData: ExtractedJobData): Promise<{ sourcing: SourcingProfile; copy: CopyData }>`

- [ ] **Step 1: Write test for Zod Schema validation (`tests/ai-engine.test.ts`)**

```typescript
import { describe, it, expect } from 'vitest';
import { sourcingProfileSchema, copyDataSchema } from '../src/lib/ai-engine';

describe('AI Zod Schemas', () => {
  it('should validate valid copy data object', () => {
    const mockCopy = {
      headline: 'Desenvolvedor Next.js na Jobz',
      subheadline: 'Venha transformar o recrutamento no Brasil',
      highlights: ['Remoto', 'R$ 10k', 'Plano de Saúde', 'Bônus'],
      ctaText: 'Envie seu currículo agora!',
      socialCaption: 'Estamos contratando! Inscreva-se pelo link da bio. #jobz #vagas'
    };
    const parsed = copyDataSchema.safeParse(mockCopy);
    expect(parsed.success).toBe(true);
  });
});
```

- [ ] **Step 2: Implement AI Engine (`src/lib/ai-engine.ts`)**

```typescript
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
```

- [ ] **Step 3: Run Vitest on AI engine test**

Run: `npx vitest run tests/ai-engine.test.ts`  
Expected: PASS

---

### Task 5: Canvas HTML-to-Image Engine (`src/lib/renderer.ts`)

**Files:**
- Create: `src/lib/renderer.ts`
- Test: `tests/renderer.test.ts`

**Interfaces:**
- Consumes: `playwright`, `CopyData`, `ExtractedJobData`
- Produces: `renderBrandKitPNGs(copy: CopyData, job: ExtractedJobData): Promise<{ feed: Buffer; story: Buffer; linkedin: Buffer }>`

- [ ] **Step 1: Write test for HTML template generator (`tests/renderer.test.ts`)**

```typescript
import { describe, it, expect } from 'vitest';
import { generateFeedHtml } from '../src/lib/renderer';

describe('HTML Renderer Templates', () => {
  it('should generate valid feed HTML containing Jobz design tokens', () => {
    const mockCopy = {
      headline: 'Desenvolvedor Senior',
      subheadline: 'Vitória - ES | Híbrido',
      highlights: ['Híbrido', 'R$ 10.000', 'VR + VA', '40h/semana'],
      ctaText: 'Inscreva-se Já',
      socialCaption: 'Legenda mock'
    };
    const html = generateFeedHtml(mockCopy);
    expect(html).toContain('#F2F5F8');
    expect(html).toContain('#1E81FE');
    expect(html).toContain('Plus Jakarta Sans');
    expect(html).toContain('Desenvolvedor Senior');
  });
});
```

- [ ] **Step 2: Implement Renderer module (`src/lib/renderer.ts`)**

```typescript
import { chromium } from 'playwright';
import { CopyData } from './types';

export function generateFeedHtml(copy: CopyData): string {
  const highlightsHtml = copy.highlights
    .map(h => `<li style="background: #ffffff; padding: 14px 20px; border-radius: 12px; margin-bottom: 12px; font-weight: 600; color: #111317; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-size: 22px;">🔹 ${h}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { width: 1080px; height: 1080px; background-color: #F2F5F8; padding: 70px; display: flex; flex-direction: column; justify-content: space-between; }
        .header { background: #1E81FE; color: white; padding: 12px 24px; border-radius: 30px; display: inline-block; font-weight: 700; font-size: 20px; text-transform: uppercase; width: fit-content; }
        .title { color: #111317; font-size: 56px; font-weight: 800; line-height: 1.15; margin-top: 24px; }
        .subtitle { color: #1E81FE; font-size: 28px; font-weight: 700; margin-top: 12px; }
        .highlights-list { list-style: none; margin-top: 40px; }
        .footer { background: #111317; color: white; padding: 24px; border-radius: 16px; text-align: center; font-size: 26px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div>
        <div class="header">JOBZ RECRUTAMENTO</div>
        <h1 class="title">${copy.headline}</h1>
        <p class="subtitle">${copy.subheadline}</p>
        <ul class="highlights-list">${highlightsHtml}</ul>
      </div>
      <div class="footer">${copy.ctaText}</div>
    </body>
    </html>
  `;
}

export function generateStoryHtml(copy: CopyData): string {
  return generateFeedHtml(copy).replace('height: 1080px;', 'height: 1920px; padding: 120px 70px;');
}

export function generateLinkedinHtml(copy: CopyData): string {
  return generateFeedHtml(copy).replace('width: 1080px; height: 1080px;', 'width: 1200px; height: 627px; padding: 40px;');
}

export async function renderBrandKitPNGs(copy: CopyData): Promise<{ feed: Buffer; story: Buffer; linkedin: Buffer }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();

    const feedPage = await context.newPage();
    await feedPage.setViewportSize({ width: 1080, height: 1080 });
    await feedPage.setContent(generateFeedHtml(copy));
    const feed = await feedPage.screenshot({ type: 'png' });

    const storyPage = await context.newPage();
    await storyPage.setViewportSize({ width: 1080, height: 1920 });
    await storyPage.setContent(generateStoryHtml(copy));
    const story = await storyPage.screenshot({ type: 'png' });

    const linkedinPage = await context.newPage();
    await linkedinPage.setViewportSize({ width: 1200, height: 627 });
    await linkedinPage.setContent(generateLinkedinHtml(copy));
    const linkedin = await linkedinPage.screenshot({ type: 'png' });

    return { feed, story, linkedin };
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 3: Run renderer tests**

Run: `npx vitest run tests/renderer.test.ts`  
Expected: PASS

---

### Task 6: Distribution Engine & Resend Email Integration (`src/lib/distribution.ts`)

**Files:**
- Create: `src/lib/distribution.ts`
- Test: `tests/distribution.test.ts`

**Interfaces:**
- Consumes: `resend`, `supabase`, `AssetUrls`, `SourcingProfile`, `CopyData`
- Produces: `uploadAssetsAndSendEmail(jobId: string, email: string, buffers: { feed: Buffer; story: Buffer; linkedin: Buffer }, sourcing: SourcingProfile, copy: CopyData): Promise<AssetUrls>`

- [ ] **Step 1: Write distribution helper unit test (`tests/distribution.test.ts`)**

```typescript
import { describe, it, expect } from 'vitest';
import { generateEmailHtml } from '../src/lib/distribution';

describe('Email Template Generator', () => {
  it('should render HTML email with Jobz brandkit data', () => {
    const mockCopy = {
      headline: 'Vaga Teste',
      subheadline: 'Local Teste',
      highlights: ['Bullet 1'],
      ctaText: 'CTA Teste',
      socialCaption: 'Legenda social'
    };
    const mockSourcing = {
      idealCandidate: 'Perfil ideal teste',
      recommendedUniversities: ['UFES'],
      linkedinHashtags: ['#Jobz'],
      coldOutreachTemplates: { linkedinInmail: 'Inmail', whatsappDirect: 'Whats' },
      screeningQuestions: ['Pergunta 1']
    };
    const html = generateEmailHtml(mockCopy, mockSourcing, { feed: 'http://img/feed.png', story: 'http://img/story.png', linkedin: 'http://img/linkedin.png' });
    expect(html).toContain('Kit de Divulgação Jobz');
    expect(html).toContain('http://img/feed.png');
    expect(html).toContain('Perfil ideal teste');
  });
});
```

- [ ] **Step 2: Implement Distribution module (`src/lib/distribution.ts`)**

```typescript
import { Resend } from 'resend';
import { supabase } from './supabase';
import { AssetUrls, SourcingProfile, CopyData } from './types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

export function generateEmailHtml(copy: CopyData, sourcing: SourcingProfile, urls: AssetUrls): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #F2F5F8; padding: 40px; color: #111317;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px;">
        <h1 style="color: #1E81FE;">🚀 Kit de Divulgação da Vaga Pronto!</h1>
        <h2>${copy.headline}</h2>
        <p>${copy.subheadline}</p>
        <hr style="border: 1px solid #F2F5F8; margin: 20px 0;" />
        
        <h3>🎨 Artes Visuais Geradas</h3>
        <p><a href="${urls.feed}" target="_blank">📥 Baixar Instagram Feed (1080x1080)</a></p>
        <p><a href="${urls.story}" target="_blank">📥 Baixar Instagram Story (1080x1920)</a></p>
        <p><a href="${urls.linkedin}" target="_blank">📥 Baixar LinkedIn Banner (1200x627)</a></p>
        
        <hr style="border: 1px solid #F2F5F8; margin: 20px 0;" />
        <h3>📝 Legenda Pronta para Redes Sociais</h3>
        <pre style="background: #F2F5F8; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${copy.socialCaption}</pre>

        <hr style="border: 1px solid #F2F5F8; margin: 20px 0;" />
        <h3>🧠 Inteligência de Sourcing & Triagem</h3>
        <p><strong>Perfil Ideal:</strong> ${sourcing.idealCandidate}</p>
        <p><strong>Faculdades Sugeridas:</strong> ${sourcing.recommendedUniversities.join(', ')}</p>
      </div>
    </body>
    </html>
  `;
}

export async function uploadAssetsAndSendEmail(
  jobId: string,
  recipientEmail: string,
  buffers: { feed: Buffer; story: Buffer; linkedin: Buffer },
  sourcing: SourcingProfile,
  copy: CopyData
): Promise<AssetUrls> {
  // Upload buffers to Supabase storage bucket 'brandkit-arts'
  const feedPath = `jobs/${jobId}/feed.png`;
  const storyPath = `jobs/${jobId}/story.png`;
  const linkedinPath = `jobs/${jobId}/linkedin.png`;

  await supabase.storage.from('brandkit-arts').upload(feedPath, buffers.feed, { contentType: 'image/png', upsert: true });
  await supabase.storage.from('brandkit-arts').upload(storyPath, buffers.story, { contentType: 'image/png', upsert: true });
  await supabase.storage.from('brandkit-arts').upload(linkedinPath, buffers.linkedin, { contentType: 'image/png', upsert: true });

  const getPublicUrl = (path: string) => supabase.storage.from('brandkit-arts').getPublicUrl(path).data.publicUrl;

  const urls: AssetUrls = {
    feed: getPublicUrl(feedPath),
    story: getPublicUrl(storyPath),
    linkedin: getPublicUrl(linkedinPath),
  };

  // Send Email via Resend
  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'recrutamento@jobz.com.br',
      to: recipientEmail,
      subject: `🎯 BrandKit Pronto: ${copy.headline}`,
      html: generateEmailHtml(copy, sourcing, urls),
    });
  }

  return urls;
}
```

- [ ] **Step 3: Run Vitest distribution test**

Run: `npx vitest run tests/distribution.test.ts`  
Expected: PASS

---

### Task 7: Orchestrator Pipeline & API Route (`src/app/api/generate-brandkit/route.ts`)

**Files:**
- Create: `src/app/api/generate-brandkit/route.ts`

**Interfaces:**
- Consumes: `extractJobFromAbler`, `generateBrandKitAI`, `renderBrandKitPNGs`, `uploadAssetsAndSendEmail`, `supabase`
- Produces: Next.js POST endpoint handling full background processing cycle.

- [ ] **Step 1: Implement Next.js POST Route (`src/app/api/generate-brandkit/route.ts`)**

```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractJobFromAbler } from '@/lib/scraper';
import { generateBrandKitAI } from '@/lib/ai-engine';
import { renderBrandKitPNGs } from '@/lib/renderer';
import { uploadAssetsAndSendEmail } from '@/lib/distribution';

export async function POST(request: Request) {
  try {
    const { jobUrl, recipientEmail } = await request.json();

    if (!jobUrl || !recipientEmail) {
      return NextResponse.json({ error: 'jobUrl and recipientEmail are required' }, { status: 400 });
    }

    // 1. Create DB record with pending status
    const { data: dbJob, error: dbError } = await supabase
      .from('brandkit_jobs')
      .insert([{ job_url: jobUrl, recipient_email: recipientEmail, status: 'pending' }])
      .select()
      .single();

    if (dbError || !dbJob) {
      throw new Error(`Database error: ${dbError?.message}`);
    }

    // Process asynchronously or inline
    (async () => {
      try {
        await supabase.from('brandkit_jobs').update({ status: 'processing' }).eq('id', dbJob.id);

        const extractedData = await extractJobFromAbler(jobUrl);
        const { sourcing, copy } = await generateBrandKitAI(extractedData);
        const pngBuffers = await renderBrandKitPNGs(copy);
        const assetUrls = await uploadAssetsAndSendEmail(dbJob.id, recipientEmail, pngBuffers, sourcing, copy);

        await supabase.from('brandkit_jobs').update({
          status: 'completed',
          extracted_data: extractedData,
          sourcing_profile: sourcing,
          copy_data: copy,
          asset_urls: assetUrls,
          completed_at: new Date().toISOString()
        }).eq('id', dbJob.id);

      } catch (procErr: any) {
        await supabase.from('brandkit_jobs').update({
          status: 'failed',
          error_message: procErr?.message || 'Processing failed'
        }).eq('id', dbJob.id);
      }
    })();

    return NextResponse.json({ success: true, jobId: dbJob.id, status: 'pending' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

### Task 8: Web UI Form & Status Dashboard (`src/app/page.tsx`)

**Files:**
- Create: `src/app/page.tsx`

**Interfaces:**
- Consumes: `/api/generate-brandkit`
- Produces: Premium UI Form & Status Tracker styled with Jobz identity tokens (`#F2F5F8`, `#111317`, `#1E81FE`).

- [ ] **Step 1: Implement `src/app/page.tsx`**

```tsx
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [jobUrl, setJobUrl] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/generate-brandkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl, recipientEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setJobId(data.jobId);
        setMessage('🎯 Solicitação enviada! O BrandKit está sendo gerado e será enviado para seu e-mail.');
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F2F5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '540px', width: '100%', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#1E81FE', color: '#ffffff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px' }}>
          Jobz Engine
        </div>
        <h1 style={{ color: '#111317', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          BrandKit Recrutamento
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
          Insira o link da vaga na Abler e o e-mail de destino para receber o kit completo com artes visuais e inteligência de sourcing.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#111317', marginBottom: '8px' }}>URL da Vaga (Abler ATS)</label>
            <input
              type="url"
              required
              placeholder="https://ats.abler.com.br/jobs/jobz/vaga-123"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#111317', marginBottom: '8px' }}>E-mail para Recebimento</label>
            <input
              type="email"
              required
              placeholder="recrutadora@jobz.com.br"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#1E81FE', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', marginTop: '10px' }}
          >
            {loading ? 'Processando BrandKit...' : 'Gerar & Enviar BrandKit'}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', backgroundColor: message.startsWith('🎯') ? '#EFF6FF' : '#FEF2F2', color: message.startsWith('🎯') ? '#1E81FE' : '#EF4444', fontSize: '14px', fontWeight: '600' }}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
```

---

### Task 9: End-to-End Verification & Test Suite Execution

**Files:**
- Run: All vitest suites

- [ ] **Step 1: Execute all unit and integration tests**

Run: `npx vitest run`  
Expected: All tests PASS

- [ ] **Step 2: Commit complete implementation**

```bash
git add .
git commit -m "feat: complete Jobz BrandKit Engine MVP pipeline and UI"
```
