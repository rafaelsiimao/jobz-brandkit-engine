import React from 'react';
import { ImageResponse } from 'next/og';
import { CopyData } from './types';
import { FONT_PLUS_JAKARTA_SANS_BOLD_BASE64 } from './font-data';
import { JOBZ_LOGO_PNG_BASE64 } from './logo-png-base64';

const fontBuffer = Buffer.from(FONT_PLUS_JAKARTA_SANS_BOLD_BASE64, 'base64');

const JobzLogoPng = ({ height = 50 }: { height?: number }) => {
  const width = Math.round(height * (206.91 / 100));
  return (
    <img src={JOBZ_LOGO_PNG_BASE64} alt="Jobz Carreira" style={{ height: `${height}px`, width: `${width}px` }} />
  );
};

// Vector SVG Icons for Satori & HTML Rendering
const ClockIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const WalletIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const GiftIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const CheckListIcon = ({ size = 22, color = '#1D4ED8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const MapPinIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function decodeUnicodeEscapes(str: string): string {
  if (!str) return '';
  let decoded = str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  decoded = decoded.replace(/\\n/g, ' ').replace(/\\t/g, ' ');
  return decoded;
}

function cleanText(str: string): string {
  if (!str) return '';
  let decoded = decodeUnicodeEscapes(str);

  const jsPayloadCutoffs = [
    ',allDescriptions:',
    'allDescriptions:',
    ',educationalLevel:',
    'educationalLevel:',
    'locationToMatch:',
    'hideCompany:',
    'publishedAt:',
    ',slug:',
    'exclusivePcd:'
  ];

  for (const cutoff of jsPayloadCutoffs) {
    const idx = decoded.indexOf(cutoff);
    if (idx !== -1) {
      decoded = decoded.slice(0, idx);
    }
  }

  decoded = decoded.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  decoded = decoded.replace(/<[^>]+>/g, ' ');
  decoded = decoded.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return decoded.replace(/\s+/g, ' ').trim();
}

function truncateText(str: string, maxLen: number): string {
  const cleaned = cleanText(str);
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3).trim() + '...';
}

function parseCardHighlights(copy: CopyData) {
  const highlights = Array.isArray(copy.highlights) ? copy.highlights : [];
  const h0 = cleanText(highlights[0] || 'Presencial | Vitória / ES');
  const h1 = cleanText(highlights[1] || 'Jornada: Segunda a Sexta • 08h às 17:30h');
  const h2 = cleanText(highlights[2] || 'Salário: Compatível com o mercado');
  const h3 = cleanText(highlights[3] || 'Benefícios: Vale Refeição + VT + Plano de Saúde');

  // Dynamic Modality
  let modality = 'Presencial';
  if (/h[ií]brido/i.test(h0) || /h[ií]brido/i.test(copy.contractType || '')) modality = 'Híbrido';
  else if (/remoto|home\s*office/i.test(h0) || /remoto/i.test(copy.contractType || '')) modality = 'Remoto';

  // Dynamic Location
  const locParts = h0.split('|');
  const rawLoc = (locParts[1] || locParts[0] || 'Vitória / ES').trim();
  const location = truncateText(rawLoc.replace(/^localizac[aã]o[:\s]*/i, ''), 40);

  // Dynamic Kicker
  const ctUpper = (copy.contractType || '').toUpperCase();
  let contractKicker = 'OPORTUNIDADE · CLT';
  if (ctUpper === 'ESTAGIO' || /est[áa]gio/i.test(h1) || /est[áa]gio/i.test(h2) || /est[áa]gio/i.test(h0)) {
    contractKicker = 'VAGA ABERTA · ESTÁGIO';
  } else if (ctUpper === 'PJ' || /pj\b|prestador|remunera[çc][ãa]o/i.test(h2) || /pj\b|prestador/i.test(h0)) {
    contractKicker = 'CONTRATO PRESTADOR · PJ';
  }

  let labelHours = 'JORNADA DE TRABALHO';
  if (/est[áa]gio/i.test(contractKicker)) {
    labelHours = 'JORNADA DE ESTÁGIO';
  }

  let labelFinancial = 'SALÁRIO MENSAL';
  if (/est[áa]gio/i.test(contractKicker)) {
    labelFinancial = 'BOLSA AUXÍLIO';
  } else if (/pj/i.test(contractKicker)) {
    labelFinancial = 'REMUNERAÇÃO MENSAL';
  }

  const valueHours = truncateText(cleanText(h1.replace(/^jornada(?:\s*de\s*est[áa]gio|\s*de\s*trabalho)?[:\s]*/i, '')), 70);
  const valueFinancial = truncateText(cleanText(h2.replace(/^(?:sal[áa]rio(?:\s*mensal)?|remunera[çc][ãa]o(?:\s*mensal)?|bolsa(?:\s*aux[íi]lio)?)[:\s]*/i, '')), 60);

  // Benefits (Max 140 chars with dynamic text sizing if long)
  const rawBenefits = cleanText(h3.replace(/^benef[íi]cios[:\s]*/i, ''));
  const valueBenefits = truncateText(rawBenefits, 140);

  // Requirements (Max 160 chars)
  const rawReqs = cleanText(copy.requirementsList || '');
  const valueRequirements = truncateText(rawReqs, 160);

  // Vacancy Tag Code (e.g. Vaga #1042 or #ID)
  const vacancyTag = copy.sourcingProfile?.idealExperience ? `#${copy.sourcingProfile.idealExperience}` : 'Vaga Aberta';

  return {
    modality,
    location,
    contractKicker,
    labelHours,
    labelFinancial,
    valueHours,
    valueFinancial,
    valueBenefits,
    valueRequirements,
    vacancyTag,
  };
}

export function generateFeedHtml(copy: CopyData): string {
  const parsed = parseCardHighlights(copy);
  const headline = cleanText(copy.headline || 'Desenvolvedor Full Stack Senior');
  const isEmail = copy.candidatureType === 'email';
  const rawCustom = (copy.customCtaPrefix || '').trim();
  const hasCustom = rawCustom.length > 0;

  const ctaLine = hasCustom
    ? (rawCustom.startsWith('👉') ? rawCustom : `👉 ${rawCustom}`)
    : isEmail
    ? `Candidate-se em: <span class="link">${copy.candidatureEmail || 'vagas@jobz.com.br'}</span>`
    : `Candidate-se em: <span class="link">jobz.com.br/vagas</span>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px; height: 1350px; background-color: #F1F4F7; color: #111317;
      font-family: 'Plus Jakarta Sans', sans-serif; position: relative; overflow: hidden;
      padding: 80px 68px 0px 68px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .top-curve { position: absolute; top: 0; right: 0; width: 440px; height: 440px; border-radius: 0 0 0 100%; background: #1E81FE; pointer-events: none; z-index: 1; }
    .content-top { position: relative; z-index: 2; }
    .logo { height: 80px; width: auto; margin-bottom: 44px; }
    .kicker { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #1E81FE; margin-bottom: 16px; }
    .title { font-size: 58px; font-weight: 800; line-height: 1.1; color: #111317; letter-spacing: -0.025em; margin-bottom: 40px; }
    .pills-stack { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
    .pill-item { background: #FFFFFF; border-radius: 28px; padding: 24px 32px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 10px 24px rgba(17, 19, 23, 0.03); }
    .pill-header { display: flex; align-items: center; gap: 10px; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #66A9FF; }
    .pill-header svg { width: 24px; height: 24px; flex-shrink: 0; }
    .pill-value { font-size: 28px; font-weight: 700; color: #111317; line-height: 1.25; }
    .pill-value.blue-val { color: #1E81FE; font-size: 34px; font-weight: 800; }
    .pill-reqs { background: #BFDBFE; border: 2px solid #3B82F6; border-radius: 28px; padding: 24px 32px; display: flex; flex-direction: column; gap: 6px; }
    .pill-reqs .pill-header { color: #1D4ED8; }
    .pill-reqs .pill-value { color: #1E293B; font-size: 24px; font-weight: 600; }
    .tags-row { display: flex; justify-content: center; align-items: center; gap: 14px; width: 100%; margin-bottom: 24px; }
    .tags-row span { font-family: 'JetBrains Mono', monospace; font-size: 19px; font-weight: 600; border: 2px solid #D7DEE7; border-radius: 999px; padding: 10px 24px; color: #475569; background-color: #FFFFFF; }
    .tags-row span.highlight { background-color: #EBF3FF; border-color: #B2D3FF; color: #1E81FE; font-weight: 700; }
    .cta-bar { position: relative; z-index: 2; background-color: #111317; color: #FFFFFF; border-radius: 32px 32px 0 0; padding: 38px 40px 48px 40px; text-align: center; font-size: 30px; font-weight: 700; display: flex; items-center: center; justify-content: center; gap: 10px; margin-left: -68px; margin-right: -68px; width: 1080px; }
    .cta-bar span.link { color: #38BDF8; font-weight: 800; }
  </style>
</head>
<body>
  <div class="top-curve"></div>
  <div class="content-top">
    <img src="${JOBZ_LOGO_PNG_BASE64}" class="logo" alt="Jobz Carreira" />
    <div class="kicker">${parsed.contractKicker}</div>
    <h1 class="title">${headline}</h1>

    <div class="pills-stack">
      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          LOCAL DE TRABALHO
        </div>
        <div class="pill-value">${parsed.location}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${parsed.labelHours}
        </div>
        <div class="pill-value">${parsed.valueHours}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          ${parsed.labelFinancial}
        </div>
        <div class="pill-value blue-val">${parsed.valueFinancial}</div>
      </div>

      ${parsed.valueBenefits ? `
      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
          BENEFÍCIOS
        </div>
        <div class="pill-value">${parsed.valueBenefits}</div>
      </div>
      ` : ''}

      ${copy.showRequirements && parsed.valueRequirements ? `
      <div class="pill-reqs">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>
          REQUISITOS ESSENCIAIS
        </div>
        <div class="pill-value">${parsed.valueRequirements}</div>
      </div>
      ` : ''}
    </div>

    <div class="tags-row">
      <span class="highlight">${parsed.modality}</span>
      <span>${parsed.location}</span>
      <span>${parsed.vacancyTag}</span>
    </div>
  </div>

  <div class="cta-bar">
    ${ctaLine}
  </div>
</body>
</html>`;
}

export function generateWhatsappHtml(copy: CopyData): string {
  const parsed = parseCardHighlights(copy);
  const headline = cleanText(copy.headline || 'Desenvolvedor Full Stack Senior');
  const isEmail = copy.candidatureType === 'email';
  const rawCustom = (copy.customCtaPrefix || '').trim();
  const hasCustom = rawCustom.length > 0;

  const ctaLine = hasCustom
    ? (rawCustom.startsWith('👉') ? rawCustom : `👉 ${rawCustom}`)
    : isEmail
    ? `Candidate-se em: <span class="link">${copy.candidatureEmail || 'vagas@jobz.com.br'}</span>`
    : `Candidate-se em: <span class="link">jobz.com.br/vagas</span>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px; height: 1080px; background-color: #F1F4F7; color: #111317;
      font-family: 'Plus Jakarta Sans', sans-serif; position: relative; overflow: hidden;
      padding: 60px 60px 0px 60px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .top-curve { position: absolute; top: 0; right: 0; width: 360px; height: 360px; border-radius: 0 0 0 100%; background: #1E81FE; pointer-events: none; z-index: 1; }
    .content-top { position: relative; z-index: 2; }
    .logo { height: 64px; width: auto; margin-bottom: 32px; }
    .kicker { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #1E81FE; margin-bottom: 12px; }
    .title { font-size: 46px; font-weight: 800; line-height: 1.1; color: #111317; letter-spacing: -0.025em; margin-bottom: 32px; }
    .grid-stack { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .pill-item { background: #FFFFFF; border-radius: 24px; padding: 20px 24px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 8px 24px rgba(17, 19, 23, 0.03); }
    .pill-header { display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #66A9FF; }
    .pill-header svg { width: 20px; height: 20px; flex-shrink: 0; }
    .pill-value { font-size: 22px; font-weight: 700; color: #111317; line-height: 1.25; }
    .pill-value.blue-val { color: #1E81FE; font-size: 26px; font-weight: 800; }
    .pill-reqs { grid-column: span 2; background: #BFDBFE; border: 1.5px solid #3B82F6; border-radius: 24px; padding: 20px 24px; display: flex; flex-direction: column; gap: 4px; }
    .pill-reqs .pill-header { color: #1D4ED8; }
    .pill-reqs .pill-value { color: #1E293B; font-size: 20px; font-weight: 600; }
    .tags-row { display: flex; justify-content: center; align-items: center; gap: 12px; width: 100%; margin-bottom: 20px; }
    .tags-row span { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; border: 1.5px solid #D7DEE7; border-radius: 999px; padding: 8px 20px; color: #475569; background-color: #FFFFFF; }
    .tags-row span.highlight { background-color: #EBF3FF; border-color: #B2D3FF; color: #1E81FE; font-weight: 700; }
    .cta-bar { position: relative; z-index: 2; background-color: #111317; color: #FFFFFF; border-radius: 28px 28px 0 0; padding: 28px 32px 36px 32px; text-align: center; font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; margin-left: -60px; margin-right: -60px; width: 1080px; }
    .cta-bar span.link { color: #38BDF8; font-weight: 800; }
  </style>
</head>
<body>
  <div class="top-curve"></div>
  <div class="content-top">
    <img src="${JOBZ_LOGO_PNG_BASE64}" class="logo" alt="Jobz Carreira" />
    <div class="kicker">${parsed.contractKicker}</div>
    <h1 class="title">${headline}</h1>

    <div class="grid-stack">
      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          LOCAL
        </div>
        <div class="pill-value">${parsed.location}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          JORNADA
        </div>
        <div class="pill-value">${parsed.valueHours}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          SALÁRIO
        </div>
        <div class="pill-value blue-val">${parsed.valueFinancial}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
          BENEFÍCIOS
        </div>
        <div class="pill-value">${parsed.valueBenefits || 'Compatíveis'}</div>
      </div>

      ${copy.showRequirements && parsed.valueRequirements ? `
      <div class="pill-reqs">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>
          REQUISITOS ESSENCIAIS
        </div>
        <div class="pill-value">${parsed.valueRequirements}</div>
      </div>
      ` : ''}
    </div>

    <div class="tags-row">
      <span class="highlight">${parsed.modality}</span>
      <span>${parsed.location}</span>
      <span>${parsed.vacancyTag}</span>
    </div>
  </div>

  <div class="cta-bar">
    ${ctaLine}
  </div>
</body>
</html>`;
}

export function generateStoryHtml(copy: CopyData): string {
  const parsed = parseCardHighlights(copy);
  const headline = cleanText(copy.headline || 'Desenvolvedor Full Stack Senior');
  const isEmail = copy.candidatureType === 'email';
  const rawCustom = (copy.customCtaPrefix || '').trim();
  const hasCustom = rawCustom.length > 0;

  const ctaLine = hasCustom
    ? (rawCustom.startsWith('👉') ? rawCustom : `👉 ${rawCustom}`)
    : isEmail
    ? `Candidate-se em: <span class="link">${copy.candidatureEmail || 'vagas@jobz.com.br'}</span>`
    : `Candidate-se em: <span class="link">jobz.com.br/vagas</span>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px; height: 1920px; background-color: #F1F4F7; color: #111317;
      font-family: 'Plus Jakarta Sans', sans-serif; position: relative; overflow: hidden;
      padding: 100px 76px 0px 76px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .top-curve { position: absolute; top: 0; right: 0; width: 540px; height: 540px; border-radius: 0 0 0 100%; background: #1E81FE; pointer-events: none; z-index: 1; }
    .content-top { position: relative; z-index: 2; }
    .logo { height: 100px; width: auto; margin-bottom: 64px; }
    .kicker { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #1E81FE; margin-bottom: 20px; }
    .title { font-size: 72px; font-weight: 800; line-height: 1.08; color: #111317; letter-spacing: -0.03em; margin-bottom: 48px; }
    .pills-stack { display: flex; flex-direction: column; gap: 20px; margin-bottom: 36px; }
    .pill-item { background: #FFFFFF; border-radius: 32px; padding: 28px 36px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 10px 30px rgba(17, 19, 23, 0.03); }
    .pill-header { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 19px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #66A9FF; }
    .pill-header svg { width: 28px; height: 28px; flex-shrink: 0; }
    .pill-value { font-size: 34px; font-weight: 700; color: #111317; line-height: 1.25; }
    .pill-value.blue-val { color: #1E81FE; font-size: 40px; font-weight: 800; }
    .pill-reqs { background: #BFDBFE; border: 2px solid #3B82F6; border-radius: 32px; padding: 28px 36px; display: flex; flex-direction: column; gap: 6px; }
    .pill-reqs .pill-header { color: #1D4ED8; }
    .pill-reqs .pill-value { color: #1E293B; font-size: 28px; font-weight: 600; }
    .tags-row { display: flex; justify-content: center; align-items: center; gap: 18px; width: 100%; margin-top: 10px; margin-bottom: 28px; }
    .tags-row span { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 600; border: 2px solid #D7DEE7; border-radius: 999px; padding: 12px 30px; color: #475569; background-color: #FFFFFF; }
    .tags-row span.highlight { background-color: #EBF3FF; border-color: #B2D3FF; color: #1E81FE; font-weight: 700; }
    .cta-bar { position: relative; z-index: 2; background-color: #111317; color: #FFFFFF; border-radius: 40px 40px 0 0; padding: 56px 50px 76px 50px; text-align: center; font-size: 38px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 12px; margin-left: -76px; margin-right: -76px; width: 1080px; }
    .cta-bar span.link { color: #38BDF8; font-weight: 800; }
  </style>
</head>
<body>
  <div class="top-curve"></div>
  <div class="content-top">
    <img src="${JOBZ_LOGO_PNG_BASE64}" class="logo" alt="Jobz Carreira" />
    <div class="kicker">${parsed.contractKicker}</div>
    <h1 class="title">${headline}</h1>

    <div class="pills-stack">
      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          LOCAL DE TRABALHO
        </div>
        <div class="pill-value">${parsed.location}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${parsed.labelHours}
        </div>
        <div class="pill-value">${parsed.valueHours}</div>
      </div>

      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          ${parsed.labelFinancial}
        </div>
        <div class="pill-value blue-val">${parsed.valueFinancial}</div>
      </div>

      ${parsed.valueBenefits ? `
      <div class="pill-item">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1E81FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
          BENEFÍCIOS
        </div>
        <div class="pill-value">${parsed.valueBenefits}</div>
      </div>
      ` : ''}

      ${copy.showRequirements && parsed.valueRequirements ? `
      <div class="pill-reqs">
        <div class="pill-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>
          REQUISITOS ESSENCIAIS
        </div>
        <div class="pill-value">${parsed.valueRequirements}</div>
      </div>
      ` : ''}
    </div>

    <div class="tags-row">
      <span class="highlight">${parsed.modality}</span>
      <span>${parsed.location}</span>
      <span>${parsed.vacancyTag}</span>
    </div>
  </div>

  <div class="cta-bar">
    ${ctaLine}
  </div>
</body>
</html>`;
}

async function renderJsxToBuffer(element: React.ReactElement, width: number, height: number): Promise<Buffer> {
  const response = new ImageResponse(element, {
    width,
    height,
    fonts: [
      {
        name: 'Plus Jakarta Sans',
        data: fontBuffer,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function renderBrandKitPNGs(copy: CopyData): Promise<{ feed: Buffer; story: Buffer; whatsapp: Buffer }> {
  const headline = cleanText(copy.headline || 'Oportunidade de Emprego');
  const parsed = parseCardHighlights(copy);

  const isEmail = copy.candidatureType === 'email';
  const emailAddress = copy.candidatureEmail || 'vagas@jobz.com.br';
  const rawCustom = (copy.customCtaPrefix || '').trim();
  const hasCustom = rawCustom.length > 0;
  const customCtaText = hasCustom ? (rawCustom.startsWith('👉') ? rawCustom : `👉 ${rawCustom}`) : '';

  // 1. Feed (1080 x 1350)
  const feedJsx = (
    <div
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: '#F1F4F7',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 68px 0px 68px',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          width: '440px',
          height: '440px',
          borderRadius: '0 0 0 440px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', zIndex: 2 }}>
        <div style={{ display: 'flex', marginBottom: '44px' }}>
          <JobzLogoPng height={80} />
        </div>

        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2.5px', marginBottom: '16px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '58px', fontWeight: 800, color: '#111317', lineHeight: 1.1, marginBottom: '40px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '28px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#66A9FF' }}>
              <MapPinIcon size={24} color="#1E81FE" />
              <span>LOCAL DE TRABALHO</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111317' }}>{parsed.location}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '28px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#66A9FF' }}>
              <ClockIcon size={24} color="#1E81FE" />
              <span>{parsed.labelHours}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111317' }}>{parsed.valueHours}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '28px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#66A9FF' }}>
              <WalletIcon size={24} color="#1E81FE" />
              <span>{parsed.labelFinancial}</span>
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#1E81FE' }}>{parsed.valueFinancial}</div>
          </div>

          {!!parsed.valueBenefits && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '28px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#66A9FF' }}>
                <GiftIcon size={24} color="#1E81FE" />
                <span>BENEFÍCIOS</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111317' }}>{parsed.valueBenefits}</div>
            </div>
          )}

          {copy.showRequirements && !!parsed.valueRequirements && (
            <div style={{ backgroundColor: '#BFDBFE', border: '2px solid #3B82F6', borderRadius: '28px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#1D4ED8' }}>
                <CheckListIcon size={24} color="#1D4ED8" />
                <span>REQUISITOS ESSENCIAIS</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>{parsed.valueRequirements}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '2px solid #B2D3FF', color: '#1E81FE', borderRadius: '999px', padding: '10px 24px', fontSize: '19px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #D7DEE7', color: '#475569', borderRadius: '999px', padding: '10px 24px', fontSize: '19px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #D7DEE7', color: '#475569', borderRadius: '999px', padding: '10px 24px', fontSize: '19px', fontWeight: 600, display: 'flex' }}>
            {parsed.vacancyTag}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '32px 32px 0 0', padding: '38px 40px 48px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '30px', fontWeight: 700, zIndex: 2, marginLeft: '-68px', marginRight: '-68px', width: '1080px' }}>
        {hasCustom ? (
          <span>{customCtaText}</span>
        ) : isEmail ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>Candidate-se em:</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>{emailAddress}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>Candidate-se em:</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>jobz.com.br/vagas</span>
          </div>
        )}
      </div>
    </div>
  );

  // 2. WhatsApp (1080 x 1080)
  const whatsappJsx = (
    <div
      style={{
        width: '1080px',
        height: '1080px',
        backgroundColor: '#F1F4F7',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 60px 0px 60px',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          width: '360px',
          height: '360px',
          borderRadius: '0 0 0 360px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', zIndex: 2 }}>
        <div style={{ display: 'flex', marginBottom: '32px' }}>
          <JobzLogoPng height={64} />
        </div>

        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2px', marginBottom: '12px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '46px', fontWeight: 800, color: '#111317', lineHeight: 1.1, marginBottom: '32px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px', width: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#66A9FF' }}>
              <MapPinIcon size={20} color="#1E81FE" />
              <span>LOCAL</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111317' }}>{parsed.location}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px', width: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#66A9FF' }}>
              <ClockIcon size={20} color="#1E81FE" />
              <span>JORNADA</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111317' }}>{parsed.valueHours}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px', width: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#66A9FF' }}>
              <WalletIcon size={20} color="#1E81FE" />
              <span>SALÁRIO</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E81FE' }}>{parsed.valueFinancial}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px', width: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#66A9FF' }}>
              <GiftIcon size={20} color="#1E81FE" />
              <span>BENEFÍCIOS</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111317' }}>{parsed.valueBenefits || 'Compatíveis'}</div>
          </div>

          {copy.showRequirements && !!parsed.valueRequirements && (
            <div style={{ backgroundColor: '#BFDBFE', border: '1.5px solid #3B82F6', borderRadius: '24px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px', width: '936px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#1D4ED8' }}>
                <CheckListIcon size={20} color="#1D4ED8" />
                <span>REQUISITOS ESSENCIAIS</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#1E293B' }}>{parsed.valueRequirements}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1.5px solid #B2D3FF', color: '#1E81FE', borderRadius: '999px', padding: '8px 20px', fontSize: '16px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #D7DEE7', color: '#475569', borderRadius: '999px', padding: '8px 20px', fontSize: '16px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #D7DEE7', color: '#475569', borderRadius: '999px', padding: '8px 20px', fontSize: '16px', fontWeight: 600, display: 'flex' }}>
            {parsed.vacancyTag}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '28px 28px 0 0', padding: '28px 32px 36px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '24px', fontWeight: 700, zIndex: 2, marginLeft: '-60px', marginRight: '-60px', width: '1080px' }}>
        {hasCustom ? (
          <span>{customCtaText}</span>
        ) : isEmail ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <span>Candidate-se em:</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>{emailAddress}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px' }}>
            <span>Candidate-se em:</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>jobz.com.br/vagas</span>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Story (1080 x 1920)
  const storyJsx = (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: '#F1F4F7',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '100px 76px 0px 76px',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          width: '540px',
          height: '540px',
          borderRadius: '0 0 0 540px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', zIndex: 2 }}>
        <div style={{ display: 'flex', marginBottom: '64px' }}>
          <JobzLogoPng height={100} />
        </div>

        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E81FE', letterSpacing: '3px', marginBottom: '20px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '72px', fontWeight: 800, color: '#111317', lineHeight: 1.08, marginBottom: '48px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', fontWeight: 700, color: '#66A9FF' }}>
              <MapPinIcon size={28} color="#1E81FE" />
              <span>LOCAL DE TRABALHO</span>
            </div>
            <div style={{ fontSize: '34px', fontWeight: 700, color: '#111317' }}>{parsed.location}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', fontWeight: 700, color: '#66A9FF' }}>
              <ClockIcon size={28} color="#1E81FE" />
              <span>{parsed.labelHours}</span>
            </div>
            <div style={{ fontSize: '34px', fontWeight: 700, color: '#111317' }}>{parsed.valueHours}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', fontWeight: 700, color: '#66A9FF' }}>
              <WalletIcon size={28} color="#1E81FE" />
              <span>{parsed.labelFinancial}</span>
            </div>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#1E81FE' }}>{parsed.valueFinancial}</div>
          </div>

          {!!parsed.valueBenefits && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', fontWeight: 700, color: '#66A9FF' }}>
                <GiftIcon size={28} color="#1E81FE" />
                <span>BENEFÍCIOS</span>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 700, color: '#111317' }}>{parsed.valueBenefits}</div>
            </div>
          )}

          {copy.showRequirements && !!parsed.valueRequirements && (
            <div style={{ backgroundColor: '#BFDBFE', border: '2px solid #3B82F6', borderRadius: '32px', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', fontWeight: 700, color: '#1D4ED8' }}>
                <CheckListIcon size={28} color="#1D4ED8" />
                <span>REQUISITOS ESSENCIAIS</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#1E293B' }}>{parsed.valueRequirements}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px', width: '100%', marginTop: '10px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '2px solid #B2D3FF', color: '#1E81FE', borderRadius: '999px', padding: '12px 30px', fontSize: '24px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #D7DEE7', color: '#475569', borderRadius: '999px', padding: '12px 30px', fontSize: '24px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #D7DEE7', color: '#475569', borderRadius: '999px', padding: '12px 30px', fontSize: '24px', fontWeight: 600, display: 'flex' }}>
            {parsed.vacancyTag}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '40px 40px 0 0', padding: '56px 50px 76px 50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '38px', fontWeight: 700, zIndex: 2, marginLeft: '-76px', marginRight: '-76px', width: '1080px' }}>
        {hasCustom ? (
          <span>{customCtaText}</span>
        ) : isEmail ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>Candidate-se em:</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>{emailAddress}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>Candidate-se em:</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>jobz.com.br/vagas</span>
          </div>
        )}
      </div>
    </div>
  );

  const [feed, whatsapp, story] = await Promise.all([
    renderJsxToBuffer(feedJsx, 1080, 1350),
    renderJsxToBuffer(whatsappJsx, 1080, 1080),
    renderJsxToBuffer(storyJsx, 1080, 1920),
  ]);

  return { feed, story, whatsapp };
}
