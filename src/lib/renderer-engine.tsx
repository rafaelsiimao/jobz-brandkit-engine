import React from 'react';
import { ImageResponse } from 'next/og';
import { CopyData } from './types';
import { FONT_PLUS_JAKARTA_SANS_BOLD_BASE64 } from './font-data';

const fontBuffer = Buffer.from(FONT_PLUS_JAKARTA_SANS_BOLD_BASE64, 'base64');

function cleanText(str: string): string {
  if (!str) return '';
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

export function generateFeedHtml(copy: CopyData): string {
  const highlights = copy.highlights || [];
  const loc = highlights[0] || 'Vitória / ES';
  const mod = highlights[1] || 'Presencial / Híbrido';
  const sal = highlights[2] || 'A combinar';
  const req = highlights[3] || 'Requisitos da Vaga';

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
    .badge { color: #1E81FE; font-weight: bold; }
  </style>
</head>
<body>
  <div class="badge">OPORTUNIDADE DE EMPREGO</div>
  <h1>${copy.headline}</h1>
  <p>${copy.subheadline}</p>
  <div>${loc} | ${mod} | ${sal} | ${req}</div>
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
  const headline = cleanText(copy.headline) || 'Oportunidade de Emprego';
  const subheadline = cleanText(copy.subheadline) || 'Venha fazer parte do time Jobz';
  const ctaText = cleanText(copy.ctaText) || 'Inscreva-se';

  const highlights = copy.highlights || [];
  const loc = cleanText(highlights[0]) || 'Vitória / ES';
  const mod = cleanText(highlights[1]) || 'Presencial / Híbrido';
  const sal = cleanText(highlights[2]) || 'A combinar';
  const req = cleanText(highlights[3]) || 'Requisitos da Vaga';

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
        justifyContent: 'space-between',
        padding: '70px 60px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', width: '100px', height: '6px', backgroundColor: '#1E81FE', borderRadius: '3px' }} />
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#1E81FE', letterSpacing: '1.5px', marginTop: '10px' }}>
          OPORTUNIDADE DE EMPREGO
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        <div style={{ fontSize: '54px', fontWeight: 700, color: '#111317', lineHeight: 1.1 }}>
          {headline}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#4A5568', lineHeight: 1.3 }}>
          {subheadline}
        </div>
      </div>

      {/* 2x2 Grid Info Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Card 1 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '15px', color: '#718096', fontWeight: 700 }}>LOCALIZAÇÃO</div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700 }}>{loc}</div>
          </div>
          {/* Card 2 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '15px', color: '#718096', fontWeight: 700 }}>MODELO / HORÁRIO</div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700 }}>{mod}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Card 3 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '15px', color: '#718096', fontWeight: 700 }}>REMUNERAÇÃO</div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700 }}>{sal}</div>
          </div>
          {/* Card 4 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '15px', color: '#718096', fontWeight: 700 }}>REQUISITO</div>
            <div style={{ fontSize: '24px', color: '#111317', fontWeight: 700 }}>{req}</div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#111317',
          padding: '28px 40px',
          borderRadius: '24px',
        }}
      >
        <div style={{ fontSize: '26px', color: '#FFFFFF', fontWeight: 700 }}>
          Candidate-se pelo link na bio!
        </div>
        <div
          style={{
            backgroundColor: '#1E81FE',
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            padding: '14px 32px',
            borderRadius: '14px',
            display: 'flex',
          }}
        >
          {ctaText}
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
        justifyContent: 'space-between',
        padding: '50px 50px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', width: '90px', height: '6px', backgroundColor: '#1E81FE', borderRadius: '3px' }} />
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#1E81FE', letterSpacing: '1px', marginTop: '8px' }}>
          OPORTUNIDADE DE EMPREGO
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '46px', fontWeight: 700, color: '#111317', lineHeight: 1.1 }}>
          {headline}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#4A5568', lineHeight: 1.3 }}>
          {subheadline}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '14px', color: '#718096', fontWeight: 700 }}>LOCALIZAÇÃO</div>
            <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700 }}>{loc}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '14px', color: '#718096', fontWeight: 700 }}>MODELO</div>
            <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700 }}>{mod}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '14px', color: '#718096', fontWeight: 700 }}>REMUNERAÇÃO</div>
            <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700 }}>{sal}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '14px', color: '#718096', fontWeight: 700 }}>REQUISITO</div>
            <div style={{ fontSize: '22px', color: '#111317', fontWeight: 700 }}>{req}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111317', padding: '22px 32px', borderRadius: '20px' }}>
        <div style={{ fontSize: '22px', color: '#FFFFFF', fontWeight: 700 }}>Clique no link e candidate-se!</div>
        <div style={{ backgroundColor: '#1E81FE', color: '#FFFFFF', fontSize: '20px', fontWeight: 700, padding: '12px 28px', borderRadius: '12px', display: 'flex' }}>{ctaText}</div>
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
        justifyContent: 'space-between',
        padding: '100px 70px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', width: '120px', height: '8px', backgroundColor: '#1E81FE', borderRadius: '4px' }} />
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E81FE', letterSpacing: '2px', marginTop: '14px' }}>
          OPORTUNIDADE DE EMPREGO
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ fontSize: '72px', fontWeight: 700, color: '#111317', lineHeight: 1.1 }}>
          {headline}
        </div>
        <div style={{ fontSize: '36px', fontWeight: 700, color: '#4A5568', lineHeight: 1.35 }}>
          {subheadline}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '20px', color: '#718096', fontWeight: 700 }}>LOCALIZAÇÃO</div>
          <div style={{ fontSize: '34px', color: '#111317', fontWeight: 700 }}>{loc}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '20px', color: '#718096', fontWeight: 700 }}>MODELO / JORNADA</div>
          <div style={{ fontSize: '34px', color: '#111317', fontWeight: 700 }}>{mod}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '20px', color: '#718096', fontWeight: 700 }}>REMUNERAÇÃO</div>
          <div style={{ fontSize: '34px', color: '#111317', fontWeight: 700 }}>{sal}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '20px', color: '#718096', fontWeight: 700 }}>REQUISITOS</div>
          <div style={{ fontSize: '34px', color: '#111317', fontWeight: 700 }}>{req}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#111317', borderRadius: '28px', padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', color: '#1E81FE', fontWeight: 700 }}>Candidate-se pelo link na bio!</div>
        <div style={{ fontSize: '28px', color: '#E2E8F0', fontWeight: 700 }}>Inscreva-se em menos de 1 minuto</div>
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
        justifyContent: 'space-between',
        padding: '45px 50px',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', width: '80px', height: '5px', backgroundColor: '#1E81FE', borderRadius: '3px' }} />
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E81FE', letterSpacing: '1px', marginTop: '6px' }}>
          OPORTUNIDADE DE EMPREGO
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '40px', fontWeight: 700, color: '#111317', lineHeight: 1.1 }}>
          {headline}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#4A5568', lineHeight: 1.3 }}>
          {subheadline}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px' }}>
        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700 }}>LOCALIZAÇÃO</div>
          <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700 }}>{loc}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700 }}>MODELO</div>
          <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700 }}>{mod}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700 }}>REMUNERAÇÃO</div>
          <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700 }}>{sal}</div>
        </div>
        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: 700 }}>REQUISITO</div>
          <div style={{ fontSize: '18px', color: '#111317', fontWeight: 700 }}>{req}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111317', padding: '18px 28px', borderRadius: '16px' }}>
        <div style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: 700 }}>Candidate-se via LinkedIn ou pelo link!</div>
        <div style={{ backgroundColor: '#1E81FE', color: '#FFFFFF', fontSize: '18px', fontWeight: 700, padding: '10px 24px', borderRadius: '10px', display: 'flex' }}>{ctaText}</div>
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
