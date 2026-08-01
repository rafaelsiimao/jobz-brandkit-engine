import React from 'react';
import { ImageResponse } from 'next/og';
import { CopyData } from './types';
import { FONT_PLUS_JAKARTA_SANS_BOLD_BASE64 } from './font-data';

const fontBuffer = Buffer.from(FONT_PLUS_JAKARTA_SANS_BOLD_BASE64, 'base64');

// Data URI do SVG Oficial Jobz Carreira para garantir renderizacao 100% confiável no Satori/@vercel/og
const LOGO_SVG_DATA_URI = `data:image/svg+xml;utf8,<svg id="Camada_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 206.91 100"><defs><style>.st0{fill:%231e81fe;}.st1{fill:%23111317;}</style></defs><path class="st1" d="M12.18,23.38v56.55c0,2.53-.68,4.48-2.05,5.84s-3.3,2.05-5.83,2.05H0v12.18h3.37c5.33,0,9.64-.68,12.91-2.05,3.28-1.37,5.71-3.56,7.28-6.6,1.57-3.04,2.35-7.12,2.35-12.24V23.38h-13.73ZM12.18,23.38v10.65h13.73v-10.65h-13.73Z"/><path class="st0" d="M32.51,0c0,11.23-9.12,20.35-20.35,20.35V0h20.35Z"/><path class="st1" d="M63.5,80.95c-4.92,0-9.25-.78-13.01-2.36-3.76-1.57-6.93-3.7-9.53-6.4-2.6-2.7-4.56-5.75-5.89-9.17s-2-6.97-2-10.65v-2.15c0-3.82.7-7.46,2.1-10.91,1.4-3.45,3.41-6.52,6.04-9.22s5.82-4.81,9.58-6.35c3.76-1.54,7.99-2.3,12.7-2.3s8.95.77,12.7,2.3c3.75,1.54,6.95,3.65,9.58,6.35,2.63,2.7,4.63,5.77,5.99,9.22,1.37,3.45,2.05,7.08,2.05,10.91v2.15c0,3.69-.67,7.24-2,10.65s-3.3,6.47-5.89,9.17-5.77,4.83-9.53,6.4-8.06,2.36-12.91,2.36c0,0,.02,0,.02,0ZM63.5,68.76c3.48,0,6.42-.77,8.81-2.3,2.39-1.54,4.2-3.62,5.43-6.25s1.84-5.62,1.84-8.98v-2.15c0-3.48-.61-6.5-1.84-9.08s-3.04-4.66-5.43-6.25c-2.39-1.59-5.33-2.38-8.81-2.38s-6.47.79-8.86,2.38c-2.39,1.59-4.2,3.67-5.43,6.25s-1.84,5.6-1.84,9.08v2.15c0,3.36.61,6.35,1.84,8.98,1.23,2.63,3.04,4.71,5.43,6.25,2.39,1.54,5.35,2.3,8.86,2.3Z"/><path class="st1" d="M96.06,23.38v56.34h13.73v-22.33c0-3.76,1.06-6.66,3.17-8.71,2.12-2.05,5.19-3.07,9.22-3.07s7.04.97,9.07,2.92c2.03,1.95,3.04,4.77,3.04,8.45v22.74h13.73v-23.77c0-7.38-2.14-13.06-6.4-17.02-4.27-3.96-10.15-5.94-17.63-5.94-4.51,0-8.54.91-12.09,2.72s-6.32,4.36-8.3,7.63V23.38h-13.54Z"/><path class="st1" d="M190.56,66.82h-26.63c.48,3.21,1.88,5.71,4.2,7.48,2.32,1.78,5.33,2.66,9.02,2.66s6.25-.68,8.5-2.05c2.25-1.37,4.06-3.21,5.43-5.53h14.13c-1.91,5.19-5.16,9.29-9.73,12.29-4.58,3-10.42,4.5-17.53,4.5s-13.23-1.57-17.72-4.71c-4.49-3.14-7.85-7.38-10.09-12.7-2.24-5.33-3.36-11.21-3.36-17.63s1.14-12.44,3.43-17.77c2.29-5.33,5.65-9.53,10.09-12.6,4.44-3.07,10.03-4.61,16.77-4.61s12.04,1.48,16.4,4.45c4.36,2.97,7.6,7.1,9.73,12.39,2.13,5.29,3.2,11.31,3.2,18.04v5.79ZM177.04,56.16c-.27-3.28-1.57-5.84-3.89-7.69-2.32-1.84-5.26-2.77-8.81-2.77s-6.49.92-8.81,2.77c-2.32,1.84-3.62,4.41-3.89,7.69h25.4Z"/></svg>`;

const LOGO_SVG_URL = 'https://jobz.com.br/brandbook/jobz-carreira/assets/jobz-carreira-logo-preto.svg';
const CTA_FOOTER_TEXT = 'Candidate-se em: jobz.com.br/vagas';

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
  const h1 = cleanText(safeHighlights[1] || 'Jornada: 40h semanais');
  const h2 = cleanText(safeHighlights[2] || 'Salário: Compatível com o mercado');
  const h3 = cleanText(safeHighlights[3] || 'Benefícios: Vale Transporte + VR');

  // Extract modality
  let modality = 'Presencial';
  if (/h[ií]brido/i.test(h0)) modality = 'Híbrido';
  else if (/remoto|home\s*office/i.test(h0)) modality = 'Remoto';

  // Extract location
  const locParts = h0.split('|');
  const location = truncateText(locParts[1] || locParts[0] || 'Brasil', 35);

  // Extract contract type / kicker
  let contractKicker = 'OPORTUNIDADE · VAGA ABERTA';
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
  const valueHours = truncateText(h1.replace(/^jornada(?:\s*de\s*est[áa]gio)?[:\s]*/i, ''), 50);
  const valueFinancial = truncateText(h2.replace(/^(?:sal[áa]rio|remunera[çc][ãa]o|bolsa)[:\s]*/i, ''), 50);
  const valueBenefits = truncateText(h3.replace(/^benef[íi]cios[:\s]*/i, ''), 55);

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

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body {
      width: 1080px; height: 1350px; background-color: #F2F5F8; color: #111317;
      display: flex; flex-direction: column; justify-content: space-between; padding: 80px 70px;
    }
  </style>
</head>
<body>
  <div>
    <img src="${LOGO_SVG_URL}" alt="Jobz Carreira" />
    <div style="color: #1E81FE;">${parsed.contractKicker}</div>
    <h1>${headline}</h1>
    <div>${parsed.labelHours}: ${parsed.valueHours}</div>
    <div>${parsed.labelFinancial}: ${parsed.valueFinancial}</div>
    <div>BENEFÍCIOS: ${parsed.valueBenefits}</div>
    <div>${parsed.modality} | ${parsed.location}</div>
  </div>
  <div>👉 ${CTA_FOOTER_TEXT}</div>
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

  // 1. Feed (1080 x 1350)
  const feedJsx = (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F2F5F8',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '70px 60px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      {/* Official Jobz Carreira Card Container */}
      <div
        style={{
          width: '920px',
          height: '1150px',
          backgroundColor: '#FFFFFF',
          borderRadius: '36px',
          border: '1px solid #D7DEE7',
          padding: '64px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(17, 19, 23, 0.08)',
        }}
      >
        {/* Proprietary Blue Corner Element */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            top: '-30px',
            width: '140px',
            height: '140px',
            borderRadius: '0 0 0 140px',
            backgroundColor: '#1E81FE',
            display: 'flex',
          }}
        />

        {/* Card Header & Content */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Logo Top Left */}
          <div style={{ display: 'flex', marginBottom: '32px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SVG_DATA_URI} alt="Jobz Carreira" style={{ height: '54px', width: 'auto' }} />
          </div>

          {/* Monospace Kicker */}
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2px', marginBottom: '20px' }}>
            {parsed.contractKicker}
          </div>

          {/* Job Title */}
          <div style={{ fontSize: '50px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '40px' }}>
            {headline}
          </div>

          {/* Detail Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
            {/* Row 1: Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
              <div style={{ fontSize: '26px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueHours}</div>
            </div>

            {/* Row 2: Financial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
              <div style={{ fontSize: '26px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueFinancial}</div>
            </div>

            {/* Row 3: Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '16px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
              <div style={{ fontSize: '26px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueBenefits}</div>
            </div>
          </div>
        </div>

        {/* Card Footer: Pill Tags & CTA Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Pill Tags */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '24px', borderTop: '1px solid #EBF0F5' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 700, display: 'flex' }}>
              {parsed.modality}
            </div>
            <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 600, display: 'flex' }}>
              {parsed.location}
            </div>
            <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '10px 20px', borderRadius: '999px', fontSize: '18px', fontWeight: 600, display: 'flex' }}>
              Aberta
            </div>
          </div>

          {/* Dark Footer CTA Banner */}
          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '20px', padding: '22px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '22px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. WhatsApp (1080 x 1080)
  const whatsappJsx = (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F2F5F8',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px 40px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div
        style={{
          width: '940px',
          height: '940px',
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          border: '1px solid #D7DEE7',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(17, 19, 23, 0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-24px',
            top: '-24px',
            width: '120px',
            height: '120px',
            borderRadius: '0 0 0 120px',
            backgroundColor: '#1E81FE',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', marginBottom: '24px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SVG_DATA_URI} alt="Jobz Carreira" style={{ height: '46px', width: 'auto' }} />
          </div>

          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E81FE', letterSpacing: '1.5px', marginBottom: '14px' }}>
            {parsed.contractKicker}
          </div>

          <div style={{ fontSize: '42px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '28px' }}>
            {headline}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '14px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
              <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueHours}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '14px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
              <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueFinancial}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '14px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
              <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueBenefits}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '18px', borderTop: '1px solid #EBF0F5' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '8px 16px', borderRadius: '999px', fontSize: '16px', fontWeight: 700, display: 'flex' }}>
              {parsed.modality}
            </div>
            <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '8px 16px', borderRadius: '999px', fontSize: '16px', fontWeight: 600, display: 'flex' }}>
              {parsed.location}
            </div>
          </div>

          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '16px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '19px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Story (1080 x 1920)
  const storyJsx = (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F2F5F8',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '90px 60px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div
        style={{
          width: '920px',
          height: '1680px',
          backgroundColor: '#FFFFFF',
          borderRadius: '40px',
          border: '1px solid #D7DEE7',
          padding: '80px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(17, 19, 23, 0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-36px',
            top: '-36px',
            width: '160px',
            height: '160px',
            borderRadius: '0 0 0 160px',
            backgroundColor: '#1E81FE',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', marginBottom: '40px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SVG_DATA_URI} alt="Jobz Carreira" style={{ height: '64px', width: 'auto' }} />
          </div>

          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2px', marginBottom: '24px' }}>
            {parsed.contractKicker}
          </div>

          <div style={{ fontSize: '58px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '56px' }}>
            {headline}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
              <div style={{ fontSize: '32px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueHours}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
              <div style={{ fontSize: '32px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueFinancial}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '18px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
              <div style={{ fontSize: '32px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueBenefits}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '32px', borderTop: '1px solid #EBF0F5' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '14px 28px', borderRadius: '999px', fontSize: '22px', fontWeight: 700, display: 'flex' }}>
              {parsed.modality}
            </div>
            <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '14px 28px', borderRadius: '999px', fontSize: '22px', fontWeight: 600, display: 'flex' }}>
              {parsed.location}
            </div>
          </div>

          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '24px', padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '26px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. LinkedIn (1200 x 627)
  const linkedinJsx = (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F2F5F8',
        color: '#111317',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px 40px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div
        style={{
          width: '1120px',
          height: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #D7DEE7',
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(17, 19, 23, 0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '0 0 0 100px',
            backgroundColor: '#1E81FE',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SVG_DATA_URI} alt="Jobz Carreira" style={{ height: '36px', width: 'auto' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E81FE', letterSpacing: '1px', marginRight: '70px' }}>
              {parsed.contractKicker}
            </div>
          </div>

          <div style={{ fontSize: '34px', fontWeight: 800, color: '#111317', lineHeight: 1.15, marginBottom: '20px' }}>
            {headline}
          </div>

          <div style={{ display: 'flex', gap: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelHours}</div>
              <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueHours}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>{parsed.labelFinancial}</div>
              <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueFinancial}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#8A94A3', fontWeight: 700, letterSpacing: '1px' }}>BENEFÍCIOS</div>
              <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700, lineHeight: 1.2 }}>{parsed.valueBenefits}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: '14px', borderTop: '1px solid #EBF0F5' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ backgroundColor: '#EBF3FF', border: '1px solid #B2D3FF', color: '#1E81FE', padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: 700, display: 'flex' }}>
              {parsed.modality}
            </div>
            <div style={{ backgroundColor: '#FAFAFC', border: '1px solid #D7DEE7', color: '#5F6673', padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, display: 'flex' }}>
              {parsed.location}
            </div>
          </div>

          <div style={{ backgroundColor: '#111317', color: '#FFFFFF', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 700 }}>
            <span>👉 Candidate-se em:</span>
            <span style={{ color: '#66A9FF' }}>jobz.com.br/vagas</span>
          </div>
        </div>
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
