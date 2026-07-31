# Design Specification: Jobz Carreira Official Card Template (v2.0)

**Date:** 2026-07-31  
**Status:** Design Proposal — Awaiting Final User Review  

---

## 1. Overview
This specification details the redesign of the PNG image render engine (`src/lib/renderer-engine.tsx`) to match the official **Jobz Carreira Brandbook Card Template** (`CardVaga.html`).

The new design provides a clean, institutional, and accessible visual hierarchy for recruitment social posts (Feed, WhatsApp, Story, LinkedIn), enforcing **100% data fidelity** with zero hallucinations.

---

## 2. Visual Architecture & Layout (Brandbook Standard)

### Key Visual Components
1. **Official SVG Logo (`https://jobz.com.br/brandbook/jobz-carreira/assets/jobz-carreira-logo-preto.svg`):**
   - Positioned in the top-left header of every job card.
2. **Proprietary Blue Corner Element (`#1E81FE`):**
   - Top-right corner arc with `border-radius: 0 0 0 96px` and `#1E81FE` fill.
3. **Card Container (`#FFFFFF` on `#F2F5F8` background):**
   - Rounded corners (`24px`), subtle border (`1px solid #D7DEE7`), and soft shadow (`box-shadow: 0 12px 36px rgba(17, 19, 23, 0.06)`).
4. **Header Kicker (Mono font):**
   - Monospace label in `#1E81FE` (e.g. `VAGA ABERTA · ESTÁGIO` / `OPORTUNIDADE · CLT` / `CONTRATO PRESTADOR · PJ`).
5. **Job Title:**
   - Bold title in `Plus Jakarta Sans` (`#111317`). Exactly as extracted from Abler.
6. **Dynamic Detail Rows:**
   - **Hours/Schedule:** `Jornada` for CLT/PJ, `Jornada de Estágio` for Internship.
   - **Financial Compensation:** `Salário` for CLT, `Remuneração` for PJ, `Bolsa` for Internship.
   - **Benefits:** Real extracted benefits.
7. **Pill Tags (Footer):**
   - Rounded pills (`border-radius: 999px`, `border: 1px solid #D7DEE7`) displaying Real Modality (`Presencial`, `Híbrido`, `Remoto`), Location (`Cidade / UF`), and Contract Type (`CLT`, `PJ`, `Estágio`).
8. **Footer CTA Banner (`#111317` background):**
   - Text: `👉 Candidate-se em: jobz.com.br/vagas`.

---

## 3. Strict Data Fidelity Rules (Zero Hallucinations)

- **Modality:** Extracted from Abler without modification. If Abler specifies "Presencial", the card **MUST** display "Presencial".
- **Financial Compensation:** Real extracted text only (e.g., "A combinar", "R$ 1.200 / mês").
- **Schedule:** Real extracted text or standard format ("40h semanais", "6h diárias").

---

## 4. Render Engine Technical Changes (`src/lib/renderer-engine.tsx`)

1. **JSX/Satori Element Tree:**
   - Rebuild JSX layouts for:
     - `feedJsx` (1080 × 1350)
     - `whatsappJsx` (1080 × 1080)
     - `storyJsx` (1080 × 1920)
     - `linkedinJsx` (1200 × 627)
2. **Text Sanitization & Truncation:**
   - Use `truncateText()` with dynamic font sizes to guarantee zero layout overflow across all aspect ratios.
3. **SVG Logo Embedding:**
   - Embed official Jobz Carreira SVG logo in top-left header.

---

## 5. Verification & Testing Strategy

1. **Unit Tests (`tests/renderer.test.ts`):**
   - Verify presence of official brandbook elements, dynamic labels (`Salário`, `Remuneração`, `Bolsa`, `Jornada de Estágio`), and CTA string `jobz.com.br/vagas`.
2. **Automated Verification:**
   - `npx vitest run` (100% green).
   - `npm run build` (Clean compilation).
