import { Resend } from 'resend';
import { supabase } from './supabase';
import { AssetUrls, SourcingProfile, CopyData } from './types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

export function generateEmailHtml(copy: CopyData, sourcing: SourcingProfile, urls: AssetUrls): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F2F5F8; padding: 40px; color: #111317;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h1 style="color: #1E81FE; font-size: 24px; margin-bottom: 8px;">🚀 Kit de Divulgação Jobz Pronto!</h1>
        <h2 style="color: #111317; font-size: 20px; margin-top: 0;">${copy.headline}</h2>
        <p style="color: #555; font-size: 14px;">${copy.subheadline}</p>
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        
        <h3 style="color: #111317; font-size: 16px;">🎨 Artes Visuais Geradas</h3>
        <p><a href="${urls.feed}" target="_blank" style="color: #1E81FE; font-weight: bold; text-decoration: none;">📥 Baixar Instagram Feed (1080x1350)</a></p>
        <p><a href="${urls.whatsapp}" target="_blank" style="color: #1E81FE; font-weight: bold; text-decoration: none;">📥 Baixar WhatsApp Card (1080x1080)</a></p>
        <p><a href="${urls.story}" target="_blank" style="color: #1E81FE; font-weight: bold; text-decoration: none;">📥 Baixar Instagram Story (1080x1920)</a></p>
        <p><a href="${urls.linkedin}" target="_blank" style="color: #1E81FE; font-weight: bold; text-decoration: none;">📥 Baixar LinkedIn Banner (1200x627)</a></p>
        
        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <h3 style="color: #111317; font-size: 16px;">📝 Legenda Pronta para Redes Sociais</h3>
        <pre style="background: #F2F5F8; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #333;">${copy.socialCaption}</pre>

        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <h3 style="color: #111317; font-size: 16px;">🧠 Inteligência de Sourcing & Triagem</h3>
        <p style="font-size: 14px;"><strong>Perfil Ideal:</strong> ${sourcing.idealCandidate}</p>
        <p style="font-size: 14px;"><strong>Faculdades Sugeridas:</strong> ${sourcing.recommendedUniversities.join(', ')}</p>
        <p style="font-size: 14px;"><strong>Hashtags LinkedIn:</strong> ${sourcing.linkedinHashtags.join(' ')}</p>
      </div>
    </body>
    </html>
  `;
}

export async function uploadAssetsAndSendEmail(
  jobId: string,
  recipientEmail: string,
  buffers: { feed: Buffer; story: Buffer; linkedin: Buffer; whatsapp: Buffer },
  sourcing: SourcingProfile,
  copy: CopyData
): Promise<AssetUrls> {
  const feedPath = `jobs/${jobId}/feed.png`;
  const whatsappPath = `jobs/${jobId}/whatsapp.png`;
  const storyPath = `jobs/${jobId}/story.png`;
  const linkedinPath = `jobs/${jobId}/linkedin.png`;

  await supabase.storage.from('brandkit-arts').upload(feedPath, buffers.feed, { contentType: 'image/png', upsert: true });
  await supabase.storage.from('brandkit-arts').upload(whatsappPath, buffers.whatsapp, { contentType: 'image/png', upsert: true });
  await supabase.storage.from('brandkit-arts').upload(storyPath, buffers.story, { contentType: 'image/png', upsert: true });
  await supabase.storage.from('brandkit-arts').upload(linkedinPath, buffers.linkedin, { contentType: 'image/png', upsert: true });

  const getPublicUrl = (path: string) => supabase.storage.from('brandkit-arts').getPublicUrl(path).data.publicUrl;

  const urls: AssetUrls = {
    feed: getPublicUrl(feedPath),
    whatsapp: getPublicUrl(whatsappPath),
    story: getPublicUrl(storyPath),
    linkedin: getPublicUrl(linkedinPath),
  };

  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'recrutamento@jobz.com.br',
      to: recipientEmail,
      subject: `🎯 BrandKit Pronto: ${copy.headline}`,
      html: generateEmailHtml(copy, sourcing, urls),
    });
  }

  return urls;
}
