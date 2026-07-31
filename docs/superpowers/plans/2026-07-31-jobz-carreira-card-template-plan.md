# Jobz Carreira Official Card Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the PNG image render engine (`src/lib/renderer-engine.tsx`) to match the official Jobz Carreira Brandbook card template (`CardVaga.html`) with strict data fidelity and zero alucinations.

**Architecture:** Update Satori/JSX layouts for Feed (1080×1350), WhatsApp (1080×1080), Story (1080×1920), and LinkedIn (1200×627). Integrate the official SVG logo from `https://jobz.com.br/brandbook/jobz-carreira/assets/jobz-carreira-logo-preto.svg`, the proprietary `#1E81FE` blue corner arc, dynamic compensation labels (`Salário`, `Remuneração`, `Bolsa`), dynamic hours labels (`Jornada`, `Jornada de Estágio`), and the CTA footer `👉 Candidate-se em: jobz.com.br/vagas`.

**Tech Stack:** Next.js 14, Satori (`@vercel/og`), TypeScript, Vitest.

## Global Constraints

- SVG Logo: `https://jobz.com.br/brandbook/jobz-carreira/assets/jobz-carreira-logo-preto.svg`
- CTA Footer Text: `👉 Candidate-se em: jobz.com.br/vagas`
- Contract Dynamic Labels:
  - CLT: `Salário:` and `Jornada:`
  - PJ: `Remuneração:` and `Jornada:`
  - ESTÁGIO: `Bolsa:` and `Jornada de Estágio:`
- Zero Hallucinations: Modality, location, and compensation must strictly match extracted Abler data.

---

### Task 1: Update PNG Render Engine Layouts & JSX (`src/lib/renderer-engine.tsx`)

**Files:**
- Modify: `src/lib/renderer-engine.tsx`
- Test: `tests/renderer.test.ts`

**Interfaces:**
- Consumes: `CopyData` from `src/lib/types.ts`
- Produces: `renderBrandKitPNGs(copy: CopyData): Promise<{ feed: Buffer; story: Buffer; linkedin: Buffer; whatsapp: Buffer }>`

- [ ] **Step 1: Write the failing unit tests in `tests/renderer.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { generateFeedHtml } from '../src/lib/renderer-engine';
import { CopyData } from '../src/lib/types';

describe('Official Jobz Carreira Card Template', () => {
  const mockEstagioCopy: CopyData = {
    headline: 'Estágio em Marketing Digital',
    subheadline: 'Vila Velha / ES',
    highlights: ['Presencial | Vila Velha / ES', '6h diárias (30h semanais)', 'R$ 1.200 / mês', 'Auxílio Transporte + VR'],
    ctaText: 'Inscreva-se',
    socialCaption: 'Legenda de teste'
  };

  it('should include official Jobz logo SVG, blue corner element and Candidate-se CTA string', () => {
    const html = generateFeedHtml(mockEstagioCopy);
    expect(html).toContain('jobz-carreira-logo-preto.svg');
    expect(html).toContain('Candidate-se em: jobz.com.br/vagas');
    expect(html).toContain('#1E81FE');
  });
});
```

- [ ] **Step 2: Run vitest to verify test failure**

Run: `npx vitest run tests/renderer.test.ts`  
Expected: FAIL with missing logo string or CTA text match.

- [ ] **Step 3: Implement official Jobz Carreira layout in `src/lib/renderer-engine.tsx`**

Update `generateFeedHtml`, `generateStoryHtml`, `generateLinkedinHtml`, `generateWhatsappHtml`, and JSX elements in `renderBrandKitPNGs` to render:
1. Top-left logo: `https://jobz.com.br/brandbook/jobz-carreira/assets/jobz-carreira-logo-preto.svg`
2. Top-right blue corner arc (`#1E81FE`, `border-radius: 0 0 0 96px`)
3. Mono header kicker (e.g. `VAGA ABERTA · ESTÁGIO` / `OPORTUNIDADE · CLT` / `CONTRATO PRESTADOR · PJ`)
4. Dynamic Detail Rows (`Jornada` / `Jornada de Estágio`, `Salário` / `Remuneração` / `Bolsa`, `Benefícios`)
5. Footer CTA: `👉 Candidate-se em: jobz.com.br/vagas`

- [ ] **Step 4: Run vitest to verify test passes**

Run: `npx vitest run tests/renderer.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/renderer-engine.tsx tests/renderer.test.ts
git commit -m "feat: implement official Jobz Carreira card template in PNG render engine"
```

---

### Task 2: Audit Scraper & AI Engine for Zero Hallucinations (`src/lib/scraper.ts` & `src/lib/ai-engine.ts`)

**Files:**
- Modify: `src/lib/scraper.ts`
- Modify: `src/lib/ai-engine.ts`
- Test: `tests/scraper.test.ts`
- Test: `tests/ai-engine.test.ts`

**Interfaces:**
- Consumes: `ExtractedJobData` from `src/lib/types.ts`
- Produces: `generateBrandKitAI(extractedData: ExtractedJobData): Promise<{ sourcing: SourcingProfile; copy: CopyData }>`

- [ ] **Step 1: Write test verifying modality and compensation preservation**

```typescript
import { describe, it, expect } from 'vitest';
import { generateBrandKitAI } from '../src/lib/ai-engine';
import { ExtractedJobData } from '../src/lib/types';

describe('Zero Hallucination AI Mapping', () => {
  it('should strictly preserve exact Presencial modality from extracted data', async () => {
    const mockExtracted: ExtractedJobData = {
      title: 'Estagiário de Odontologia',
      location: 'Vila Velha / ES',
      modality: 'Presencial',
      salary: 'R$ 1.000 + R$ 200 VT',
      benefits: ['Auxílio Transporte'],
      schedule: '08h às 12h (Seg a Sex)',
      requirements: ['Cursando Odontologia'],
      activities: ['Prática clínica'],
      contractType: 'ESTAGIO',
      seniorityLevel: 'Estágio',
      rawDescription: 'Vaga de estágio presencial em Vila Velha.'
    };

    const { copy } = await generateBrandKitAI(mockExtracted);
    expect(copy.highlights[0]).toContain('Presencial');
    expect(copy.highlights[1]).toContain('Jornada de Estágio');
    expect(copy.highlights[2]).toContain('Bolsa:');
  });
});
```

- [ ] **Step 2: Run vitest to verify test failure**

Run: `npx vitest run tests/ai-engine.test.ts`  
Expected: FAIL

- [ ] **Step 3: Update `ai-engine.ts` copy mapping to construct exact labels**

Map `highlights` with exact labels based on `extractedData.contractType`:
- `highlights[0]`: `${extractedData.modality} | ${extractedData.location}`
- `highlights[1]`: `contractType === 'ESTAGIO' ? 'Jornada de Estágio: ' + schedule : 'Jornada: ' + schedule`
- `highlights[2]`: `contractType === 'ESTAGIO' ? 'Bolsa: ' + salary : contractType === 'PJ' ? 'Remuneração: ' + salary : 'Salário: ' + salary`
- `highlights[3]`: `Benefícios: ' + benefits.slice(0, 2).join(' + ')`

- [ ] **Step 4: Run full test suite and verify all pass**

Run: `npx vitest run`  
Expected: PASS (18+ tests passing)

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/ai-engine.ts tests/ai-engine.test.ts
git commit -m "feat: enforce strict data fidelity and dynamic contract labels in AI engine"
```

---

### Task 3: Production Build & Full Verification

**Files:**
- All modified files

- [ ] **Step 1: Run full Vitest suite**

Run: `npx vitest run`  
Expected: PASS (100% green)

- [ ] **Step 2: Run production Next.js build**

Run: `npm run build`  
Expected: PASS (Compiled successfully, static pages generated)

- [ ] **Step 3: Commit and push to main**

```bash
git add .
git commit -m "feat: complete Jobz Carreira official card template integration v2.0"
git push
```
