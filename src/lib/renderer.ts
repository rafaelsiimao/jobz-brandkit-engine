import { chromium } from 'playwright';
import { Resvg } from '@resvg/resvg-js';
import { CopyData } from './types';
import { FONT_PLUS_JAKARTA_SANS_BOLD_BASE64 } from './font-data';

const fontBuffer = Buffer.from(FONT_PLUS_JAKARTA_SANS_BOLD_BASE64, 'base64');

function cleanText(str: string): string {
  if (!str) return '';
  // Remove emojis and non-standard symbols that can break font rendering
  const textWithoutEmoji = str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  
  return textWithoutEmoji
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
      width: 1080px;
      height: 1350px;
      background-color: #F2F5F8;
      color: #111317;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 70px;
      overflow: hidden;
      position: relative;
    }
    .bg-circle-1 {
      position: absolute; top: -150px; right: -150px; width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(30,129,254,0.14) 0%, rgba(242,245,248,0) 70%);
      border-radius: 50%; z-index: 1;
    }
    header { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
    .logo { height: 70px; object-fit: contain; }
    main { z-index: 2; margin-top: 20px; }
    .category { color: #1E81FE; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    h1 { font-size: 58px; font-weight: 800; line-height: 1.1; color: #111317; margin-bottom: 20px; letter-spacing: -1.5px; }
    .subtitle { font-size: 30px; font-weight: 500; color: #4A5568; margin-bottom: 40px; line-height: 1.3; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-card {
      background-color: #FFFFFF; padding: 24px 30px; border-radius: 20px;
      border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      display: flex; align-items: center; gap: 18px;
    }
    .info-icon { font-size: 34px; line-height: 1; }
    .info-text-group { display: flex; flex-direction: column; }
    .info-label { font-size: 18px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 26px; font-weight: 700; color: #111317; }
    footer {
      z-index: 2; display: flex; justify-content: space-between; align-items: center;
      background-color: #111317; padding: 32px 48px; border-radius: 24px;
    }
    .cta-text { color: #FFFFFF; font-size: 32px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
    .btn-cta {
      background-color: #1E81FE; color: #FFFFFF; font-size: 28px; font-weight: 800;
      padding: 16px 32px; border-radius: 14px; text-decoration: none; display: inline-block;
      box-shadow: 0 8px 20px rgba(30, 129, 254, 0.4);
    }
  </style>
</head>
<body>
  <div class="bg-circle-1"></div>
  <header>
    <img class="logo" src="https://jobz.com.br/wp-content/uploads/2025/02/logocor01.png" alt="Jobz Logo">
  </header>
  <main>
    <div class="category">OPORTUNIDADE DE EMPREGO</div>
    <h1>${copy.headline}</h1>
    <div class="subtitle">${copy.subheadline}</div>
    <div class="grid-info">
      <div class="info-card">
        <span class="info-icon">📍</span>
        <div class="info-text-group">
          <span class="info-label">Localização</span>
          <span class="info-value">${loc}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">⏰</span>
        <div class="info-text-group">
          <span class="info-label">Modelo / Horário</span>
          <span class="info-value">${mod}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">💰</span>
        <div class="info-text-group">
          <span class="info-label">Remuneração</span>
          <span class="info-value">${sal}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🎓</span>
        <div class="info-text-group">
          <span class="info-label">Requisito</span>
          <span class="info-value">${req}</span>
        </div>
      </div>
    </div>
  </main>
  <footer>
    <div class="cta-text">👉 Candidate-se pelo link na bio!</div>
    <div class="btn-cta">${copy.ctaText || 'Inscreva-se'}</div>
  </footer>
</body>
</html>`;
}

export function generateWhatsappHtml(copy: CopyData): string {
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
      width: 1080px;
      height: 1080px;
      background-color: #F2F5F8;
      color: #111317;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 70px;
      overflow: hidden;
      position: relative;
    }
    header { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
    .logo { height: 60px; object-fit: contain; }
    main { z-index: 2; margin-top: 10px; }
    .category { color: #1E81FE; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    h1 { font-size: 50px; font-weight: 800; line-height: 1.1; color: #111317; margin-bottom: 16px; }
    .subtitle { font-size: 26px; font-weight: 500; color: #4A5568; margin-bottom: 30px; line-height: 1.3; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .info-card {
      background-color: #FFFFFF; padding: 20px 24px; border-radius: 18px;
      border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      display: flex; align-items: center; gap: 16px;
    }
    .info-icon { font-size: 30px; line-height: 1; }
    .info-text-group { display: flex; flex-direction: column; }
    .info-label { font-size: 16px; font-weight: 600; color: #718096; text-transform: uppercase; }
    .info-value { font-size: 22px; font-weight: 700; color: #111317; }
    footer {
      z-index: 2; display: flex; justify-content: space-between; align-items: center;
      background-color: #111317; padding: 24px 40px; border-radius: 20px;
    }
    .cta-text { color: #FFFFFF; font-size: 26px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .btn-cta {
      background-color: #1E81FE; color: #FFFFFF; font-size: 24px; font-weight: 800;
      padding: 12px 28px; border-radius: 12px; text-decoration: none; display: inline-block;
    }
  </style>
</head>
<body>
  <header>
    <img class="logo" src="https://jobz.com.br/wp-content/uploads/2025/02/logocor01.png" alt="Jobz Logo">
  </header>
  <main>
    <div class="category">OPORTUNIDADE DE EMPREGO</div>
    <h1>${copy.headline}</h1>
    <div class="subtitle">${copy.subheadline}</div>
    <div class="grid-info">
      <div class="info-card">
        <span class="info-icon">📍</span>
        <div class="info-text-group">
          <span class="info-label">Localização</span>
          <span class="info-value">${loc}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">⏰</span>
        <div class="info-text-group">
          <span class="info-label">Modelo</span>
          <span class="info-value">${mod}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">💰</span>
        <div class="info-text-group">
          <span class="info-label">Remuneração</span>
          <span class="info-value">${sal}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🎓</span>
        <div class="info-text-group">
          <span class="info-label">Requisito</span>
          <span class="info-value">${req}</span>
        </div>
      </div>
    </div>
  </main>
  <footer>
    <div class="cta-text">👉 Clique no link e candidate-se!</div>
    <div class="btn-cta">${copy.ctaText || 'Inscreva-se'}</div>
  </footer>
</body>
</html>`;
}

export function generateStoryHtml(copy: CopyData): string {
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
      width: 1080px;
      height: 1920px;
      background-color: #F2F5F8;
      color: #111317;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 120px 80px;
      overflow: hidden;
      position: relative;
    }
    header { z-index: 2; display: flex; flex-direction: column; align-items: flex-start; gap: 30px; }
    .logo { height: 80px; object-fit: contain; }
    main { z-index: 2; display: flex; flex-direction: column; gap: 36px; }
    .category { color: #1E81FE; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; }
    h1 { font-size: 80px; font-weight: 800; line-height: 1.05; color: #111317; }
    .subtitle { font-size: 38px; font-weight: 500; color: #4A5568; line-height: 1.35; }
    .info-list { display: flex; flex-direction: column; gap: 24px; margin-top: 20px; }
    .info-item {
      background: #FFFFFF; padding: 32px 40px; border-radius: 24px;
      border: 1px solid #E2E8F0; box-shadow: 0 6px 24px rgba(0,0,0,0.04);
      display: flex; align-items: center; gap: 28px;
    }
    .info-icon { font-size: 48px; }
    .info-content { display: flex; flex-direction: column; }
    .info-title { font-size: 24px; font-weight: 600; color: #718096; text-transform: uppercase; }
    .info-detail { font-size: 36px; font-weight: 700; color: #111317; }
    footer { z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 24px; }
    .cta-box {
      width: 100%; background-color: #111317; color: #FFFFFF; padding: 40px;
      border-radius: 28px; text-align: center;
    }
    .cta-heading { font-size: 40px; font-weight: 800; color: #1E81FE; margin-bottom: 8px; }
    .cta-sub { font-size: 32px; font-weight: 600; color: #E2E8F0; }
  </style>
</head>
<body>
  <header>
    <img class="logo" src="https://jobz.com.br/wp-content/uploads/2025/02/logocor01.png" alt="Jobz Logo">
  </header>
  <main>
    <div class="category">OPORTUNIDADE DE EMPREGO</div>
    <h1>${copy.headline}</h1>
    <div class="subtitle">${copy.subheadline}</div>
    <div class="info-list">
      <div class="info-item">
        <span class="info-icon">📍</span>
        <div class="info-content">
          <span class="info-title">Localização</span>
          <span class="info-detail">${loc}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">⏰</span>
        <div class="info-content">
          <span class="info-title">Modelo / Jornada</span>
          <span class="info-detail">${mod}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">💰</span>
        <div class="info-content">
          <span class="info-title">Remuneração</span>
          <span class="info-detail">${sal}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">🎓</span>
        <div class="info-content">
          <span class="info-title">Requisitos</span>
          <span class="info-detail">${req}</span>
        </div>
      </div>
    </div>
  </main>
  <footer>
    <div class="cta-box">
      <div class="cta-heading">👉 Candidate-se pelo link na bio!</div>
      <div class="cta-sub">Inscreva-se em menos de 1 minuto</div>
    </div>
  </footer>
</body>
</html>`;
}

export function generateLinkedinHtml(copy: CopyData): string {
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
      width: 1200px; height: 627px; background-color: #F2F5F8; color: #111317;
      display: flex; flex-direction: column; justify-content: space-between; padding: 48px; overflow: hidden; position: relative;
    }
    header { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
    .logo { height: 50px; object-fit: contain; }
    main { z-index: 2; margin-top: 10px; }
    .category { color: #1E81FE; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    h1 { font-size: 40px; font-weight: 800; line-height: 1.1; color: #111317; margin-bottom: 12px; }
    .subtitle { font-size: 22px; font-weight: 500; color: #4A5568; margin-bottom: 24px; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .info-card {
      background: #FFFFFF; padding: 14px 20px; border-radius: 14px; border: 1px solid #E2E8F0;
      display: flex; align-items: center; gap: 12px;
    }
    .info-icon { font-size: 22px; }
    .info-text-group { display: flex; flex-direction: column; }
    .info-label { font-size: 13px; font-weight: 600; color: #718096; text-transform: uppercase; }
    .info-value { font-size: 18px; font-weight: 700; color: #111317; }
    footer {
      z-index: 2; display: flex; justify-content: space-between; align-items: center;
      background-color: #111317; padding: 20px 32px; border-radius: 16px;
    }
    .cta-text { color: #FFFFFF; font-size: 22px; font-weight: 700; }
    .btn-cta { background-color: #1E81FE; color: #FFFFFF; font-size: 20px; font-weight: 800; padding: 10px 24px; border-radius: 10px; }
  </style>
</head>
<body>
  <header>
    <img class="logo" src="https://jobz.com.br/wp-content/uploads/2025/02/logocor01.png" alt="Jobz Logo">
  </header>
  <main>
    <div class="category">OPORTUNIDADE DE EMPREGO</div>
    <h1>${copy.headline}</h1>
    <div class="subtitle">${copy.subheadline}</div>
    <div class="grid-info">
      <div class="info-card"><span class="info-icon">📍</span><div class="info-text-group"><span class="info-label">Local</span><span class="info-value">${loc}</span></div></div>
      <div class="info-card"><span class="info-icon">⏰</span><div class="info-text-group"><span class="info-label">Modelo</span><span class="info-value">${mod}</span></div></div>
      <div class="info-card"><span class="info-icon">💰</span><div class="info-text-group"><span class="info-label">Remuneração</span><span class="info-value">${sal}</span></div></div>
      <div class="info-card"><span class="info-icon">🎓</span><div class="info-text-group"><span class="info-label">Requisito</span><span class="info-value">${req}</span></div></div>
    </div>
  </main>
  <footer>
    <div class="cta-text">👉 Candidate-se via LinkedIn ou pelo link!</div>
    <div class="btn-cta">${copy.ctaText || 'Inscreva-se'}</div>
  </footer>
</body>
</html>`;
}

function createRealPngBuffer(width: number, height: number, copy: CopyData, formatLabel: string): Buffer {
  const safeHeadline = cleanText(copy.headline || 'Oportunidade de Emprego');
  const safeSubheadline = cleanText(copy.subheadline || 'Venha fazer parte do time Jobz');
  const safeCta = cleanText(copy.ctaText || 'Inscreva-se');

  const highlights = copy.highlights || [];
  const loc = cleanText(highlights[0] || 'Vitória / ES');
  const mod = cleanText(highlights[1] || 'Presencial / Híbrido');
  const sal = cleanText(highlights[2] || 'A combinar');
  const req = cleanText(highlights[3] || 'Requisitos da Vaga');

  const cardW = Math.floor(width / 2 - 70);

  // SVG using native SVG vector icons instead of unicode emojis for 100% reliable font rendering
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#F2F5F8"/>
    
    <!-- Jobz Blue Accent Header Bar -->
    <rect x="60" y="50" width="120" height="8" rx="4" fill="#1E81FE"/>

    <!-- Category Badge Header -->
    <text x="60" y="95" font-family="Plus Jakarta Sans, sans-serif" font-size="24" font-weight="bold" fill="#1E81FE">OPORTUNIDADE DE EMPREGO</text>
    
    <!-- Headline & Subheadline -->
    <text x="60" y="170" font-family="Plus Jakarta Sans, sans-serif" font-size="46" font-weight="bold" fill="#111317">${safeHeadline}</text>
    <text x="60" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="24" font-weight="bold" fill="#4A5568">${safeSubheadline}</text>
    
    <!-- 2x2 Info Cards -->
    <!-- Card 1: Localização -->
    <g transform="translate(60, 310)">
      <rect width="${cardW}" height="105" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1E81FE" transform="translate(24, 24) scale(1.4)"/>
      <text x="70" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="bold" fill="#718096">LOCALIZAÇÃO</text>
      <text x="70" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="bold" fill="#111317">${loc.slice(0, 24)}</text>
    </g>

    <!-- Card 2: Modelo / Horário -->
    <g transform="translate(${width / 2 + 10}, 310)">
      <rect width="${cardW}" height="105" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#1E81FE" transform="translate(24, 24) scale(1.4)"/>
      <text x="70" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="bold" fill="#718096">MODELO / HORÁRIO</text>
      <text x="70" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="bold" fill="#111317">${mod.slice(0, 24)}</text>
    </g>

    <!-- Card 3: Remuneração -->
    <g transform="translate(60, 440)">
      <rect width="${cardW}" height="105" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="#1E81FE" transform="translate(24, 24) scale(1.4)"/>
      <text x="70" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="bold" fill="#718096">REMUNERAÇÃO</text>
      <text x="70" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="bold" fill="#111317">${sal.slice(0, 24)}</text>
    </g>

    <!-- Card 4: Requisito -->
    <g transform="translate(${width / 2 + 10}, 440)">
      <rect width="${cardW}" height="105" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#1E81FE" transform="translate(24, 24) scale(1.4)"/>
      <text x="70" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="bold" fill="#718096">REQUISITO</text>
      <text x="70" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="bold" fill="#111317">${req.slice(0, 24)}</text>
    </g>
    
    <!-- Dark Footer Container -->
    <rect x="60" y="${height - 140}" width="${width - 120}" height="85" rx="22" fill="#111317"/>
    <text x="95" y="${height - 87}" font-family="Plus Jakarta Sans, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF">Candidate-se pelo link na bio!</text>
    
    <!-- Blue CTA Button -->
    <rect x="${width - 330}" y="${height - 125}" width="240" height="55" rx="14" fill="#1E81FE"/>
    <text x="${width - 210}" y="${height - 90}" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeCta}</text>
  </svg>`;

  try {
    const resvgOptions: any = {
      fitTo: { mode: 'width', value: width },
      font: {
        fontBuffers: [fontBuffer],
        defaultFontFamily: 'Plus Jakarta Sans',
      }
    };

    const resvg = new Resvg(svg, resvgOptions);
    return resvg.render().asPng();
  } catch (err) {
    console.error('Erro na renderização Resvg:', err);
    return Buffer.from(svg);
  }
}

export async function renderBrandKitPNGs(copy: CopyData): Promise<{ feed: Buffer; story: Buffer; linkedin: Buffer; whatsapp: Buffer }> {
  if (process.env.VERCEL === '1') {
    return {
      feed: createRealPngBuffer(1080, 1350, copy, 'Feed'),
      whatsapp: createRealPngBuffer(1080, 1080, copy, 'WhatsApp'),
      story: createRealPngBuffer(1080, 1920, copy, 'Story'),
      linkedin: createRealPngBuffer(1200, 627, copy, 'LinkedIn')
    };
  }

  try {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const context = await browser.newContext();

      const feedPage = await context.newPage();
      await feedPage.setViewportSize({ width: 1080, height: 1350 });
      await feedPage.setContent(generateFeedHtml(copy));
      const feed = await feedPage.screenshot({ type: 'png' });

      const whatsappPage = await context.newPage();
      await whatsappPage.setViewportSize({ width: 1080, height: 1080 });
      await whatsappPage.setContent(generateWhatsappHtml(copy));
      const whatsapp = await whatsappPage.screenshot({ type: 'png' });

      const storyPage = await context.newPage();
      await storyPage.setViewportSize({ width: 1080, height: 1920 });
      await storyPage.setContent(generateStoryHtml(copy));
      const story = await storyPage.screenshot({ type: 'png' });

      const linkedinPage = await context.newPage();
      await linkedinPage.setViewportSize({ width: 1200, height: 627 });
      await linkedinPage.setContent(generateLinkedinHtml(copy));
      const linkedin = await linkedinPage.screenshot({ type: 'png' });

      return { feed, story, linkedin, whatsapp };
    } finally {
      await browser.close();
    }
  } catch (err: any) {
    console.warn('Playwright nao disponivel no servidor, gerando PNGs com Resvg:', err?.message);
    return {
      feed: createRealPngBuffer(1080, 1350, copy, 'Feed'),
      whatsapp: createRealPngBuffer(1080, 1080, copy, 'WhatsApp'),
      story: createRealPngBuffer(1080, 1920, copy, 'Story'),
      linkedin: createRealPngBuffer(1200, 627, copy, 'LinkedIn')
    };
  }
}
