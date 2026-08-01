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

// Vector SVG Icons for Satori Rendering
const ClockIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const WalletIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
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

const CheckListIcon = ({ size = 22, color = '#1E81FE' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
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

function parseCardHighlights(highlights: string[] = []) {
  const safeHighlights = Array.isArray(highlights) ? highlights : [];
  const h0 = cleanText(safeHighlights[0] || 'Presencial | Vitória / ES');
  const h1 = cleanText(safeHighlights[1] || 'Jornada: Segunda a Sexta • 08h às 17:30h');
  const h2 = cleanText(safeHighlights[2] || 'Salário: Compatível com o mercado');
  const h3 = cleanText(safeHighlights[3] || 'Benefícios: Vale Refeição + VT + Plano de Saúde');

  let modality = 'Presencial';
  if (/h[ií]brido/i.test(h0)) modality = 'Híbrido';
  else if (/remoto|home\s*office/i.test(h0)) modality = 'Remoto';

  const locParts = h0.split('|');
  const location = truncateText(locParts[1] || locParts[0] || 'Brasil', 40);

  let contractKicker = 'OPORTUNIDADE · CLT';
  if (/est[áa]gio/i.test(h1) || /est[áa]gio/i.test(h2) || /est[áa]gio/i.test(h0)) {
    contractKicker = 'VAGA ABERTA · ESTÁGIO';
  } else if (/pj\b|prestador/i.test(h2) || /pj\b|prestador/i.test(h0)) {
    contractKicker = 'CONTRATO PRESTADOR · PJ';
  } else if (/clt/i.test(h0) || /clt/i.test(h2)) {
    contractKicker = 'OPORTUNIDADE · CLT';
  }

  let labelHours = 'JORNADA';
  if (/est[áa]gio/i.test(contractKicker)) {
    labelHours = 'JORNADA DE ESTÁGIO';
  }

  let labelFinancial = 'SALÁRIO';
  if (/est[áa]gio/i.test(contractKicker)) {
    labelFinancial = 'BOLSA';
  } else if (/pj/i.test(contractKicker)) {
    labelFinancial = 'REMUNERAÇÃO';
  }

  const valueHours = cleanText(h1.replace(/^jornada(?:\s*de\s*est[áa]gio)?[:\s]*/i, ''));
  const valueFinancial = cleanText(h2.replace(/^(?:sal[áa]rio|remunera[çc][ãa]o|bolsa)[:\s]*/i, ''));
  const valueBenefits = cleanText(h3.replace(/^benef[íi]cios[:\s]*/i, ''));

  return {
    modality,
    location,
    contractKicker,
    labelHours,
    labelFinancial,
    valueHours,
    valueFinancial,
    valueBenefits,
  };
}

export function generateFeedHtml(copy: CopyData): string {
  const parsed = parseCardHighlights(copy.highlights);
  const headline = truncateText(copy.headline, 60);
  const isEmail = copy.candidatureType === 'email';
  const ctaLine = isEmail 
    ? `👉 Envie seu CV para: ${copy.candidatureEmail || 'vagas@jobz.com.br'} (Apenas em PDF)` 
    : `👉 Candidate-se em: jobz.com.br/vagas`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body {
      width: 1080px; height: 1350px; background-color: #F1F4F7; color: #111317;
      display: flex; flex-direction: column; justify-content: space-between; padding: 80px 70px;
    }
  </style>
</head>
<body>
  <div>
    <img src="${JOBZ_LOGO_PNG_BASE64}" alt="Jobz Carreira" style="height: 54px;" />
    <div style="color: #1E81FE;">${parsed.contractKicker}</div>
    <h1>${headline}</h1>
    <div>${parsed.labelHours}: ${parsed.valueHours}</div>
    <div>${parsed.labelFinancial}: ${parsed.valueFinancial}</div>
    <div>BENEFÍCIOS: ${parsed.valueBenefits}</div>
    ${copy.showRequirements && copy.requirementsList ? `<div>REQUISITOS: ${copy.requirementsList}</div>` : ''}
    <div>${parsed.modality} | ${parsed.location}</div>
  </div>
  <div>${ctaLine}</div>
</body>
</html>`;
}

export function generateWhatsappHtml(copy: CopyData): string {
  const html = generateFeedHtml(copy);
  return html.replace('1350px', '1080px');
}

export function generateStoryHtml(copy: CopyData): string {
  const html = generateFeedHtml(copy);
  return html.replace('1350px', '1920px');
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
  const headline = truncateText(copy.headline || 'Oportunidade de Emprego', 65);
  const parsed = parseCardHighlights(copy.highlights);

  const isEmail = copy.candidatureType === 'email';
  const emailAddress = copy.candidatureEmail || 'vagas@jobz.com.br';
  const showReqs = copy.showRequirements && !!copy.requirementsList;
  const reqsText = cleanText(copy.requirementsList || '');

  // 1. Feed (1080 x 1350) - Canvas Background #F1F4F7
  const feedJsx = (
    <div
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: '#F1F4F7',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        padding: '72px 64px',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      }}
    >
      {/* Top Right Blue Corner Accent Element — 25% da largura = ~270px */}
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          width: '270px',
          height: '270px',
          borderRadius: '0 0 0 270px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      {/* Logo Top Left */}
      <div style={{ display: 'flex', marginBottom: '32px' }}>
        <JobzLogoPng height={58} />
      </div>

      {/* Kicker */}
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2.5px', marginBottom: '16px' }}>
        {parsed.contractKicker}
      </div>

      {/* Headline */}
      <div style={{ fontSize: '64px', fontWeight: 800, color: '#111317', lineHeight: 1.12, marginBottom: '40px' }}>
        {headline}
      </div>

      {/* Highlight Rows — flex:1 expands to fill vertical space */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Row 1: Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockIcon size={22} color="#1E81FE" />
              <span style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</span>
            </div>
            <div style={{ fontSize: '28px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '30px' }}>{parsed.valueHours}</div>
          </div>

          {/* Row 2: Financial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WalletIcon size={22} color="#1E81FE" />
              <span style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</span>
            </div>
            <div style={{ fontSize: '28px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '30px' }}>{parsed.valueFinancial}</div>
          </div>

          {/* Row 3: Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GiftIcon size={22} color="#1E81FE" />
              <span style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</span>
            </div>
            <div style={{ fontSize: '28px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '30px' }}>{parsed.valueBenefits}</div>
          </div>

          {/* Row 4: Requisitos Opcionais */}
          {showReqs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckListIcon size={22} color="#1E81FE" />
                <span style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>REQUISITOS ESSENCIAIS</span>
              </div>
              <div style={{ fontSize: '26px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '30px' }}>{reqsText}</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Pills */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '24px', borderTop: '2px solid #D7DEE7' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '12px 24px', borderRadius: '999px', fontSize: '20px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D7DEE7', color: '#5F6673', padding: '12px 24px', borderRadius: '999px', fontSize: '20px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D7DEE7', color: '#5F6673', padding: '12px 24px', borderRadius: '999px', fontSize: '20px', fontWeight: 600, display: 'flex' }}>
            Vaga Aberta
          </div>
        </div>

        {/* CTA Footer Banner */}
        {isEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '18px', fontWeight: 700, textAlign: 'center' }}>
              📄 Aceitamos somente currículos em formato PDF
            </div>
            <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '22px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '24px', fontWeight: 700 }}>
              <span>👉 Envie seu CV para:</span>
              <span style={{ color: '#66A9FF' }}>{emailAddress}</span>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '22px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '24px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        )}
      </div>
    </div>
  );

  // 2. WhatsApp (1080 x 1080) - Canvas Background #F1F4F7
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
        padding: '52px 52px',
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
          width: '270px',
          height: '270px',
          borderRadius: '0 0 0 270px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', marginBottom: '28px' }}>
          <JobzLogoPng height={48} />
        </div>

        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2px', marginBottom: '16px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '50px', fontWeight: 800, color: '#111317', lineHeight: 1.12, marginBottom: '32px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockIcon size={20} color="#1E81FE" />
              <span style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</span>
            </div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700, lineHeight: 1.2, paddingLeft: '28px' }}>{parsed.valueHours}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WalletIcon size={20} color="#1E81FE" />
              <span style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</span>
            </div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700, lineHeight: 1.2, paddingLeft: '28px' }}>{parsed.valueFinancial}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GiftIcon size={20} color="#1E81FE" />
              <span style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</span>
            </div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700, lineHeight: 1.2, paddingLeft: '28px' }}>{parsed.valueBenefits}</div>
          </div>

          {showReqs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckListIcon size={20} color="#1E81FE" />
                <span style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>REQUISITOS</span>
              </div>
              <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700, lineHeight: 1.2, paddingLeft: '28px' }}>{reqsText}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '2px solid #D7DEE7' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D7DEE7', color: '#5F6673', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
        </div>

        {isEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', borderRadius: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>
              📄 Aceitamos somente currículos em formato PDF
            </div>
            <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '18px', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '21px', fontWeight: 700 }}>
              <span>👉 Envie seu CV para:</span>
              <span style={{ color: '#66A9FF' }}>{emailAddress}</span>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '18px', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '21px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Story (1080 x 1920) - Canvas Background #F1F4F7
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
        padding: '100px 76px',
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
          width: '300px',
          height: '300px',
          borderRadius: '0 0 0 300px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', marginBottom: '52px' }}>
          <JobzLogoPng height={72} />
        </div>

        <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E81FE', letterSpacing: '3px', marginBottom: '28px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '72px', fontWeight: 800, color: '#111317', lineHeight: 1.12, marginBottom: '64px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '42px', marginBottom: '56px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClockIcon size={26} color="#1E81FE" />
              <span style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</span>
            </div>
            <div style={{ fontSize: '36px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '36px' }}>{parsed.valueHours}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <WalletIcon size={26} color="#1E81FE" />
              <span style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</span>
            </div>
            <div style={{ fontSize: '36px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '36px' }}>{parsed.valueFinancial}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GiftIcon size={26} color="#1E81FE" />
              <span style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</span>
            </div>
            <div style={{ fontSize: '36px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '36px' }}>{parsed.valueBenefits}</div>
          </div>

          {showReqs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckListIcon size={26} color="#1E81FE" />
                <span style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>REQUISITOS ESSENCIAIS</span>
              </div>
              <div style={{ fontSize: '34px', color: '#111317', fontWeight: 700, lineHeight: 1.25, paddingLeft: '36px' }}>{reqsText}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', paddingTop: '32px', borderTop: '2px solid #D7DEE7' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '16px 32px', borderRadius: '999px', fontSize: '24px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D7DEE7', color: '#5F6673', padding: '16px 32px', borderRadius: '999px', fontSize: '24px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
        </div>

        {isEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', borderRadius: '18px', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>
              📄 Aceitamos somente currículos em formato PDF
            </div>
            <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '28px', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', fontSize: '28px', fontWeight: 700 }}>
              <span>👉 Envie seu CV para:</span>
              <span style={{ color: '#66A9FF' }}>{emailAddress}</span>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '28px', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', fontSize: '28px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
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
