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

  // Extract modality
  let modality = 'Presencial';
  if (/h[ií]brido/i.test(h0)) modality = 'Híbrido';
  else if (/remoto|home\s*office/i.test(h0)) modality = 'Remoto';

  // Extract location
  const locParts = h0.split('|');
  const location = truncateText(locParts[1] || locParts[0] || 'Brasil', 40);

  // Extract contract type / kicker
  let contractKicker = 'OPORTUNIDADE · CLT';
  if (/est[áa]gio/i.test(h1) || /est[áa]gio/i.test(h2) || /est[áa]gio/i.test(h0)) {
    contractKicker = 'VAGA ABERTA · ESTÁGIO';
  } else if (/pj\b|prestador/i.test(h2) || /pj\b|prestador/i.test(h0)) {
    contractKicker = 'CONTRATO PRESTADOR · PJ';
  } else if (/clt/i.test(h0) || /clt/i.test(h2)) {
    contractKicker = 'OPORTUNIDADE · CLT';
  }

  // Determine Label 1 (Hours)
  let labelHours = 'JORNADA';
  if (/est[áa]gio/i.test(contractKicker)) {
    labelHours = 'JORNADA DE ESTÁGIO';
  }

  // Determine Label 2 (Financial)
  let labelFinancial = 'SALÁRIO';
  if (/est[áa]gio/i.test(contractKicker)) {
    labelFinancial = 'BOLSA';
  } else if (/pj/i.test(contractKicker)) {
    labelFinancial = 'REMUNERAÇÃO';
  }

  // Values
  const valueHours = truncateText(h1.replace(/^jornada(?:\s*de\s*est[áa]gio)?[:\s]*/i, ''), 60);
  const valueFinancial = truncateText(h2.replace(/^(?:sal[áa]rio|remunera[çc][ãa]o|bolsa)[:\s]*/i, ''), 60);
  const valueBenefits = truncateText(h3.replace(/^benef[íi]cios[:\s]*/i, ''), 70);

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
      width: 1080px; height: 1350px; background-color: #FFFFFF; color: #111317;
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

export function generateLinkedinHtml(copy: CopyData): string {
  const html = generateFeedHtml(copy);
  return html.replace('1080px', '1200px').replace('1350px', '627px');
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

export async function renderBrandKitPNGs(copy: CopyData): Promise<{ feed: Buffer; story: Buffer; linkedin: Buffer; whatsapp: Buffer }> {
  const headline = truncateText(copy.headline || 'Oportunidade de Emprego', 65);
  const parsed = parseCardHighlights(copy.highlights);

  const isEmail = copy.candidatureType === 'email';
  const emailAddress = copy.candidatureEmail || 'vagas@jobz.com.br';

  // 1. Feed (1080 x 1350) - 100% Canvas, Zero Outer Gray Frame
  const feedJsx = (
    <div
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: '#FFFFFF',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 64px',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      }}
    >
      {/* Top Right Blue Corner Accent Element */}
      <div
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          width: '160px',
          height: '160px',
          borderRadius: '0 0 0 160px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Logo Top Left */}
        <div style={{ display: 'flex', marginBottom: '40px' }}>
          <JobzLogoPng height={58} />
        </div>

        {/* Kicker */}
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2.5px', marginBottom: '24px' }}>
          {parsed.contractKicker}
        </div>

        {/* Headline */}
        <div style={{ fontSize: '56px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '52px' }}>
          {headline}
        </div>

        {/* Highlight Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
          {/* Row 1: Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
            <div style={{ fontSize: '30px', color: '#111317', fontWeight: 700, lineHeight: 1.25 }}>{parsed.valueHours}</div>
          </div>

          {/* Row 2: Financial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
            <div style={{ fontSize: '30px', color: '#111317', fontWeight: 700, lineHeight: 1.25 }}>{parsed.valueFinancial}</div>
          </div>

          {/* Row 3: Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
            <div style={{ fontSize: '30px', color: '#111317', fontWeight: 700, lineHeight: 1.25 }}>{parsed.valueBenefits}</div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
        {/* Pills */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '28px', borderTop: '2px solid #EBF0F5' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '12px 24px', borderRadius: '999px', fontSize: '20px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '12px 24px', borderRadius: '999px', fontSize: '20px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
          <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '12px 24px', borderRadius: '999px', fontSize: '20px', fontWeight: 600, display: 'flex' }}>
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

  // 2. WhatsApp (1080 x 1080) - 100% Canvas, Zero Outer Gray Frame
  const whatsappJsx = (
    <div
      style={{
        width: '1080px',
        height: '1080px',
        backgroundColor: '#FFFFFF',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 56px',
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
          width: '140px',
          height: '140px',
          borderRadius: '0 0 0 140px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', marginBottom: '32px' }}>
          <JobzLogoPng height={50} />
        </div>

        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2px', marginBottom: '18px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '46px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '36px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
            <div style={{ fontSize: '25px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueHours}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
            <div style={{ fontSize: '25px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueFinancial}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
            <div style={{ fontSize: '25px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueBenefits}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '2px solid #EBF0F5' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 600, display: 'flex' }}>
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

  // 3. Story (1080 x 1920) - 100% Canvas, Zero Outer Gray Frame
  const storyJsx = (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: '#FFFFFF',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '110px 80px',
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
          width: '220px',
          height: '220px',
          borderRadius: '0 0 0 220px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', marginBottom: '56px' }}>
          <JobzLogoPng height={72} />
        </div>

        <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E81FE', letterSpacing: '3px', marginBottom: '32px' }}>
          {parsed.contractKicker}
        </div>

        <div style={{ fontSize: '68px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '72px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginBottom: '64px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
            <div style={{ fontSize: '38px', color: '#111317', fontWeight: 700, lineHeight: 1.25 }}>{parsed.valueHours}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
            <div style={{ fontSize: '38px', color: '#111317', fontWeight: 700, lineHeight: 1.25 }}>{parsed.valueFinancial}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '22px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
            <div style={{ fontSize: '38px', color: '#111317', fontWeight: 700, lineHeight: 1.25 }}>{parsed.valueBenefits}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', width: '100%' }}>
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', paddingTop: '36px', borderTop: '2px solid #EBF0F5' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '16px 32px', borderRadius: '999px', fontSize: '24px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '16px 32px', borderRadius: '999px', fontSize: '24px', fontWeight: 600, display: 'flex' }}>
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

  // 4. LinkedIn (1200 x 627) - 100% Canvas, Zero Outer Gray Frame
  const linkedinJsx = (
    <div
      style={{
        width: '1200px',
        height: '627px',
        backgroundColor: '#FFFFFF',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px 52px',
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
          width: '120px',
          height: '120px',
          borderRadius: '0 0 0 120px',
          backgroundColor: '#1E81FE',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <JobzLogoPng height={42} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E81FE', letterSpacing: '1.5px', marginRight: '80px' }}>
            {parsed.contractKicker}
          </div>
        </div>

        <div style={{ fontSize: '38px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '24px' }}>
          {headline}
        </div>

        <div style={{ display: 'flex', gap: '36px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
            <div style={{ fontSize: '20px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueHours}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
            <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueFinancial}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
            <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueBenefits}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: '16px', borderTop: '2px solid #EBF0F5' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '8px 16px', borderRadius: '999px', fontSize: '15px', fontWeight: 700, display: 'flex' }}>
            {parsed.modality}
          </div>
          <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '8px 16px', borderRadius: '999px', fontSize: '15px', fontWeight: 600, display: 'flex' }}>
            {parsed.location}
          </div>
        </div>

        {isEmail ? (
          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '14px', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: 700 }}>
            <span>👉 Envie seu CV (PDF) para:</span>
            <span style={{ color: '#66A9FF' }}>{emailAddress}</span>
          </div>
        ) : (
          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '14px', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        )}
      </div>
    </div>
  );

  const [feed, whatsapp, story, linkedin] = await Promise.all([
    renderJsxToBuffer(feedJsx, 1080, 1350),
    renderJsxToBuffer(whatsappJsx, 1080, 1080),
    renderJsxToBuffer(storyJsx, 1080, 1920),
    renderJsxToBuffer(linkedinJsx, 1200, 627),
  ]);

  return { feed, story, linkedin, whatsapp };
}
