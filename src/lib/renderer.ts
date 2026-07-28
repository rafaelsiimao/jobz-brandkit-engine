import { chromium } from 'playwright';
import { Resvg } from '@resvg/resvg-js';
import { CopyData } from './types';

export function generateFeedHtml(copy: CopyData): string {
  const highlightsHtml = (copy.highlights || [])
    .map(
      (h) =>
        `<li style="background: #ffffff; padding: 18px 26px; border-radius: 14px; margin-bottom: 16px; font-weight: 600; color: #111317; box-shadow: 0 4px 12px rgba(0,0,0,0.04); font-size: 24px;">🔹 ${h}</li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { width: 1080px; height: 1350px; background-color: #F2F5F8; padding: 80px 70px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    .badge { background: #1E81FE; color: #ffffff; padding: 12px 24px; border-radius: 30px; display: inline-block; font-weight: 700; font-size: 20px; text-transform: uppercase; width: fit-content; }
    .title { color: #111317; font-size: 56px; font-weight: 800; line-height: 1.15; margin-top: 28px; }
    .subtitle { color: #1E81FE; font-size: 30px; font-weight: 700; margin-top: 14px; }
    .highlights-list { list-style: none; margin-top: 40px; }
    .cta-button { background: #111317; color: #ffffff; padding: 26px; border-radius: 18px; text-align: center; font-size: 26px; font-weight: 700; }
  </style>
</head>
<body>
  <div>
    <div class="badge">JOBZ RECRUTAMENTO</div>
    <h1 class="title">${copy.headline}</h1>
    <p class="subtitle">${copy.subheadline}</p>
    <ul class="highlights-list">${highlightsHtml}</ul>
  </div>
  <div class="cta-button">${copy.ctaText}</div>
</body>
</html>`;
}

export function generateWhatsappHtml(copy: CopyData): string {
  const highlightsHtml = (copy.highlights || [])
    .map(
      (h) =>
        `<li style="background: #ffffff; padding: 16px 24px; border-radius: 14px; margin-bottom: 14px; font-weight: 600; color: #111317; box-shadow: 0 4px 12px rgba(0,0,0,0.04); font-size: 22px;">🔹 ${h}</li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { width: 1080px; height: 1080px; background-color: #F2F5F8; padding: 70px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    .badge { background: #1E81FE; color: #ffffff; padding: 12px 24px; border-radius: 30px; display: inline-block; font-weight: 700; font-size: 20px; text-transform: uppercase; width: fit-content; }
    .title { color: #111317; font-size: 54px; font-weight: 800; line-height: 1.15; margin-top: 24px; }
    .subtitle { color: #1E81FE; font-size: 28px; font-weight: 700; margin-top: 12px; }
    .highlights-list { list-style: none; margin-top: 36px; }
    .cta-button { background: #111317; color: #ffffff; padding: 24px; border-radius: 16px; text-align: center; font-size: 26px; font-weight: 700; }
  </style>
</head>
<body>
  <div>
    <div class="badge">JOBZ RECRUTAMENTO</div>
    <h1 class="title">${copy.headline}</h1>
    <p class="subtitle">${copy.subheadline}</p>
    <ul class="highlights-list">${highlightsHtml}</ul>
  </div>
  <div class="cta-button">${copy.ctaText}</div>
</body>
</html>`;
}

export function generateStoryHtml(copy: CopyData): string {
  const highlightsHtml = (copy.highlights || [])
    .map(
      (h) =>
        `<li style="background: #ffffff; padding: 20px 28px; border-radius: 16px; margin-bottom: 18px; font-weight: 600; color: #111317; box-shadow: 0 4px 12px rgba(0,0,0,0.04); font-size: 26px;">🔹 ${h}</li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { width: 1080px; height: 1920px; background-color: #F2F5F8; padding: 120px 70px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    .badge { background: #1E81FE; color: #ffffff; padding: 14px 28px; border-radius: 30px; display: inline-block; font-weight: 700; font-size: 22px; text-transform: uppercase; width: fit-content; }
    .title { color: #111317; font-size: 60px; font-weight: 800; line-height: 1.15; margin-top: 32px; }
    .subtitle { color: #1E81FE; font-size: 32px; font-weight: 700; margin-top: 16px; }
    .highlights-list { list-style: none; margin-top: 48px; }
    .cta-button { background: #111317; color: #ffffff; padding: 28px; border-radius: 20px; text-align: center; font-size: 28px; font-weight: 700; }
  </style>
</head>
<body>
  <div>
    <div class="badge">JOBZ RECRUTAMENTO</div>
    <h1 class="title">${copy.headline}</h1>
    <p class="subtitle">${copy.subheadline}</p>
    <ul class="highlights-list">${highlightsHtml}</ul>
  </div>
  <div class="cta-button">${copy.ctaText}</div>
</body>
</html>`;
}

export function generateLinkedinHtml(copy: CopyData): string {
  const highlightsHtml = (copy.highlights || [])
    .map(
      (h) =>
        `<span style="background: #ffffff; padding: 10px 18px; border-radius: 10px; margin-right: 12px; margin-bottom: 10px; font-weight: 600; color: #111317; font-size: 18px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">🔹 ${h}</span>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { width: 1200px; height: 627px; background-color: #F2F5F8; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
    .badge { background: #1E81FE; color: #ffffff; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: 700; font-size: 16px; text-transform: uppercase; width: fit-content; }
    .title { color: #111317; font-size: 40px; font-weight: 800; line-height: 1.15; margin-top: 16px; }
    .subtitle { color: #1E81FE; font-size: 22px; font-weight: 700; margin-top: 8px; }
    .highlights-container { margin-top: 24px; }
    .cta-button { background: #111317; color: #ffffff; padding: 18px; border-radius: 12px; text-align: center; font-size: 22px; font-weight: 700; width: fit-content; padding-left: 36px; padding-right: 36px; }
  </style>
</head>
<body>
  <div>
    <div class="badge">JOBZ RECRUTAMENTO</div>
    <h1 class="title">${copy.headline}</h1>
    <p class="subtitle">${copy.subheadline}</p>
    <div class="highlights-container">${highlightsHtml}</div>
  </div>
  <div class="cta-button">${copy.ctaText}</div>
</body>
</html>`;
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createRealPngBuffer(width: number, height: number, copy: CopyData, formatLabel: string): Buffer {
  const safeHeadline = escapeXml(copy.headline || 'Oportunidade de Emprego');
  const safeSubheadline = escapeXml(copy.subheadline || 'Venha fazer parte do time Jobz');
  const safeCta = escapeXml(copy.ctaText || 'Cadastre-se na Jobz');

  const highlightsSvg = (copy.highlights || [])
    .slice(0, 4)
    .map((h, idx) => {
      const safeH = escapeXml(h);
      const boxY = 320 + idx * 75;
      return `
        <rect x="60" y="${boxY}" width="${width - 120}" height="60" rx="14" fill="#FFFFFF"/>
        <circle cx="95" cy="${boxY + 30}" r="9" fill="#1E81FE"/>
        <text x="120" y="${boxY + 37}" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#111317">${safeH}</text>
      `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#F2F5F8"/>
    
    <!-- Badge Header -->
    <rect x="60" y="60" width="300" height="48" rx="24" fill="#1E81FE"/>
    <text x="80" y="91" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">JOBZ RECRUTAMENTO</text>
    
    <!-- Title and Subtitle -->
    <text x="60" y="180" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="44" font-weight="bold" fill="#111317">${safeHeadline}</text>
    <text x="60" y="240" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#1E81FE">${safeSubheadline}</text>
    
    <!-- Highlights List -->
    <g>${highlightsSvg}</g>
    
    <!-- CTA Button -->
    <rect x="60" y="${height - 130}" width="${width - 120}" height="70" rx="20" fill="#111317"/>
    <text x="${width / 2}" y="${height - 86}" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeCta}</text>
  </svg>`;

  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: width },
    });
    return resvg.render().asPng();
  } catch (err) {
    console.error('Erro na renderização Resvg:', err);
    return Buffer.from(svg);
  }
}

export async function renderBrandKitPNGs(copy: CopyData): Promise<{ feed: Buffer; story: Buffer; linkedin: Buffer; whatsapp: Buffer }> {
  // No ambiente Vercel Serverless, utiliza o renderizador ultra-rapido Resvg PNG direto (evita timeouts)
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
    console.warn('Playwright nao disponivel no servidor, gerando PNGs reais com Resvg:', err?.message);
    return {
      feed: createRealPngBuffer(1080, 1350, copy, 'Feed'),
      whatsapp: createRealPngBuffer(1080, 1080, copy, 'WhatsApp'),
      story: createRealPngBuffer(1080, 1920, copy, 'Story'),
      linkedin: createRealPngBuffer(1200, 627, copy, 'LinkedIn')
    };
  }
}
