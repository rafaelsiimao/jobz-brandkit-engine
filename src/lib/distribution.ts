import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { supabase } from './supabase';
import { AssetUrls, SourcingProfile, CopyData, ExtractedJobData } from './types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

function getContractBadge(contractType: string): { label: string; color: string; bg: string } {
  switch (contractType) {
    case 'ESTAGIO': return { label: '📚 ESTÁGIO', color: '#1E81FE', bg: '#EBF3FF' };
    case 'PJ': return { label: '🏢 PJ / PRESTADOR', color: '#1E81FE', bg: '#EBF3FF' };
    default: return { label: '💼 CLT', color: '#1E81FE', bg: '#EBF3FF' };
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateEmailHtml(
  copy: CopyData,
  sourcing: SourcingProfile,
  urls: AssetUrls,
  extractedData?: ExtractedJobData
): string {
  const badge = getContractBadge(extractedData?.contractType || 'CLT');
  const safeHeadline = escapeHtml(copy.headline || '');
  const safeCaption = escapeHtml(copy.socialCaption || `🚀 Oportunidade Aberta na Jobz!\n\nEstamos contratando: ${copy.headline}.\nCandidate-se em: jobz.com.br/vagas\n\n#Vagas #Jobz #Capixaba`);
  const highlights = (copy.highlights || []).map(h => escapeHtml(h));

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #F2F5F8; padding: 24px 12px; margin: 0; color: #111317;">
      <div style="max-width: 620px; margin: 0 auto;">

        <!-- Header Banner -->
        <div style="background: #111317; border-radius: 24px 24px 0 0; padding: 36px 32px; text-align: center;">
          <div style="font-size: 28px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 6px;">Jobz</div>
          <div style="font-size: 12px; color: #66A9FF; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Kit Oficial de Divulgação de Vaga</div>
        </div>

        <!-- Main Content Card -->
        <div style="background: #FFFFFF; padding: 36px 32px; border-radius: 0 0 24px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">

          <!-- Contract Badge & Vacancy Title -->
          <div style="margin-bottom: 24px; text-align: center;">
            <div style="display: inline-block; background: ${badge.bg}; color: ${badge.color}; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 999px; margin-bottom: 12px; letter-spacing: 1px; text-transform: uppercase;">
              ${badge.label}
            </div>
            <h1 style="color: #111317; font-size: 26px; margin: 8px 0 12px 0; font-weight: 800; line-height: 1.25;">${safeHeadline}</h1>
            
            <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
              ${highlights.map(h => `<span style="display:inline-block;background:#F1F4F7;color:#5F6673;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;">${h}</span>`).join('')}
            </div>
          </div>

          <hr style="border: 0; border-top: 1px solid #EBF0F5; margin: 28px 0;" />

          <!-- Card Preview & Download Buttons -->
          <div style="margin-bottom: 28px; text-align: center;">
            <div style="font-size: 14px; font-weight: 800; color: #111317; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1.5px;">🎨 Suas Artes Estão Prontas</div>
            <div style="font-size: 12px; font-weight: 700; color: #5F6673; margin-bottom: 16px;">Clique nos botões abaixo para baixar em alta resolução:</div>
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="50%" style="padding: 5px;">
                  <a href="${urls.feed}" target="_blank" style="display:block;background:#1E81FE;color:#FFFFFF;padding:14px 12px;border-radius:14px;font-size:13px;font-weight:800;text-decoration:none;text-align:center;">
                    📷 Feed (1080×1350)
                  </a>
                </td>
                <td width="50%" style="padding: 5px;">
                  <a href="${urls.whatsapp}" target="_blank" style="display:block;background:#111317;color:#FFFFFF;padding:14px 12px;border-radius:14px;font-size:13px;font-weight:800;text-decoration:none;text-align:center;">
                    💬 WhatsApp (1080×1080)
                  </a>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding: 5px;">
                  <a href="${urls.story}" target="_blank" style="display:block;background:#1E81FE;color:#FFFFFF;padding:14px 12px;border-radius:14px;font-size:13px;font-weight:800;text-decoration:none;text-align:center;">
                    📱 Story (1080×1920)
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <!-- Social Copywriting Box -->
          <div style="margin-bottom: 28px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px;">
            <div style="font-size: 12px; font-weight: 800; color: #1E81FE; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: flex; items-center; gap: 6px;">
              📝 Legenda Pronta para Redes Sociais
            </div>
            <div style="font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap; font-family: monospace, sans-serif;">${safeCaption}</div>
          </div>

          <!-- Recruiter Tip Banner -->
          <div style="background: #EBF3FF; border: 1px solid #B2D3FF; color: #1E81FE; padding: 14px 16px; border-radius: 14px; font-size: 12px; font-weight: 700; text-align: center; line-height: 1.4;">
            💡 <strong>Dica Jobz:</strong> Poste nos horários de maior engajamento (09h, 12h e 18h) para aumentar o alcance orgânico da sua vaga.
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px; color: #8A94A3; font-size: 11px; font-weight: 600;">
          Jobz • Gerador Oficial de Kits de Divulgação de Vagas
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function uploadAssetsAndSendEmail(
  jobId: string,
  recipientEmail: string,
  buffers: { feed: Buffer; story: Buffer; whatsapp: Buffer },
  sourcing: SourcingProfile,
  copy: CopyData,
  extractedData?: ExtractedJobData
): Promise<AssetUrls> {
  const feedPath = `jobs/${jobId}/feed.png`;
  const whatsappPath = `jobs/${jobId}/whatsapp.png`;
  const storyPath = `jobs/${jobId}/story.png`;

  try {
    await supabase.storage.from('brandkit-arts').upload(feedPath, buffers.feed, { contentType: 'image/png', upsert: true });
    await supabase.storage.from('brandkit-arts').upload(whatsappPath, buffers.whatsapp, { contentType: 'image/png', upsert: true });
    await supabase.storage.from('brandkit-arts').upload(storyPath, buffers.story, { contentType: 'image/png', upsert: true });
  } catch (err: any) {
    console.error('Aviso no upload de assets para o Storage:', err?.message);
  }

  const getPublicUrl = (path: string) => supabase.storage.from('brandkit-arts').getPublicUrl(path)?.data?.publicUrl || '';

  const urls: AssetUrls = {
    feed: getPublicUrl(feedPath),
    whatsapp: getPublicUrl(whatsappPath),
    story: getPublicUrl(storyPath),
  };

  const subject = `🚀 Seu Kit de Divulgação está Pronto: ${copy.headline} | Jobz`;
  const htmlContent = generateEmailHtml(copy, sourcing, urls, extractedData);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromEmail = process.env.SMTP_FROM || `Jobz Carreira <${process.env.SMTP_USER}>`;

      await transporter.sendMail({
        from: fromEmail,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      console.log(`E-mail enviado via SMTP!`);
      return urls;
    } catch (smtpErr: any) {
      console.warn('Falha via SMTP:', smtpErr?.message);
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });
      console.log(`E-mail enviado via Resend!`);
    } catch (emailErr: any) {
      console.warn('Falha via Resend:', emailErr?.message);
    }
  }

  return urls;
}
