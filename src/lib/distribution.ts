import { Resend } from 'resend';
import { supabase } from './supabase';
import { AssetUrls, SourcingProfile, CopyData, ExtractedJobData } from './types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

function getContractBadge(contractType: string): { label: string; color: string; bg: string } {
  switch (contractType) {
    case 'ESTAGIO': return { label: '📚 ESTÁGIO', color: '#7C3AED', bg: '#F3E8FF' };
    case 'PJ': return { label: '🏢 PJ / PRESTADOR', color: '#EA580C', bg: '#FFF7ED' };
    default: return { label: '💼 CLT', color: '#059669', bg: '#ECFDF5' };
  }
}

export function generateEmailHtml(
  copy: CopyData,
  sourcing: SourcingProfile,
  urls: AssetUrls,
  extractedData?: ExtractedJobData
): string {
  const badge = getContractBadge(extractedData?.contractType || 'CLT');
  const contractType = extractedData?.contractType || 'CLT';
  const seniorityLevel = extractedData?.seniorityLevel || 'Pleno';

  const hardSkillsHtml = (sourcing.hardSkills || []).map(s =>
    `<span style="display:inline-block;background:#EBF5FF;color:#1E81FE;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:600;margin:3px 4px;">${s}</span>`
  ).join('');

  const softSkillsHtml = (sourcing.softSkills || []).map(s =>
    `<span style="display:inline-block;background:#F0FDF4;color:#15803D;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:600;margin:3px 4px;">${s}</span>`
  ).join('');

  const questionsHtml = (sourcing.screeningQuestions || []).map((q, i) =>
    `<div style="padding:10px 14px;background:#F8FAFC;border-radius:10px;margin-bottom:6px;font-size:13px;color:#334155;">
      <strong style="color:#1E81FE;">${i + 1}.</strong> ${q}
    </div>`
  ).join('');

  // Sourcing channels section
  const channels = sourcing.sourcingChannels || {
    universities: sourcing.recommendedUniversities || [],
    facebookGroups: [],
    whatsappTelegramCommunities: [],
    linkedinSearchQueries: [],
    specializedPlatforms: [],
  };

  let sourcingHtml = '';

  if (contractType === 'ESTAGIO' && channels.universities.length > 0) {
    sourcingHtml += `
      <div style="margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:#7C3AED;margin-bottom:8px;">🎓 Faculdades Recomendadas</div>
        <div>${channels.universities.map(u =>
          `<span style="display:inline-block;background:#F3E8FF;color:#7C3AED;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:600;margin:3px 4px;">${u}</span>`
        ).join('')}</div>
      </div>`;
  }

  if (channels.facebookGroups.length > 0) {
    sourcingHtml += `
      <div style="margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:#1877F2;margin-bottom:8px;">📘 Grupos do Facebook</div>
        <div>${channels.facebookGroups.map(g =>
          `<div style="padding:6px 12px;background:#EFF6FF;border-radius:8px;margin-bottom:4px;font-size:13px;color:#1E40AF;">• ${g}</div>`
        ).join('')}</div>
      </div>`;
  }

  if (channels.whatsappTelegramCommunities.length > 0) {
    sourcingHtml += `
      <div style="margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:#25D366;margin-bottom:8px;">💬 Comunidades WhatsApp / Telegram</div>
        <div>${channels.whatsappTelegramCommunities.map(c =>
          `<div style="padding:6px 12px;background:#F0FDF4;border-radius:8px;margin-bottom:4px;font-size:13px;color:#166534;">• ${c}</div>`
        ).join('')}</div>
      </div>`;
  }

  if (channels.linkedinSearchQueries.length > 0) {
    sourcingHtml += `
      <div style="margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:#0A66C2;margin-bottom:8px;">🔍 Buscas Booleanas para LinkedIn</div>
        <div>${channels.linkedinSearchQueries.map(q =>
          `<div style="padding:8px 12px;background:#F1F5F9;border-radius:8px;margin-bottom:4px;font-size:12px;font-family:monospace;color:#334155;">${q}</div>`
        ).join('')}</div>
      </div>`;
  }

  if (channels.specializedPlatforms.length > 0) {
    sourcingHtml += `
      <div style="margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:#DC2626;margin-bottom:8px;">🌐 Plataformas Especializadas</div>
        <div>${channels.specializedPlatforms.map(p =>
          `<span style="display:inline-block;background:#FEF2F2;color:#DC2626;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:600;margin:3px 4px;">${p}</span>`
        ).join('')}</div>
      </div>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #F2F5F8; padding: 20px; margin: 0; color: #111317;">
      <div style="max-width: 680px; margin: 0 auto;">

        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #111317 0%, #1E293B 100%); border-radius: 20px 20px 0 0; padding: 32px 36px; text-align: center;">
          <div style="font-size: 28px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Jobz Engine</div>
          <div style="font-size: 13px; color: #94A3B8; font-weight: 500;">Dossier de Inteligência de Recrutamento</div>
        </div>

        <!-- Main Content -->
        <div style="background: #FFFFFF; padding: 36px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <!-- Contract Badge & Title -->
          <div style="margin-bottom: 28px;">
            <div style="display: inline-block; background: ${badge.bg}; color: ${badge.color}; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 10px; margin-bottom: 12px; letter-spacing: 0.5px;">
              ${badge.label} — ${seniorityLevel}
            </div>
            <h1 style="color: #111317; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">${copy.headline}</h1>
            <p style="color: #64748B; font-size: 15px; margin: 0; line-height: 1.5;">${copy.subheadline}</p>
            <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
              ${copy.highlights.map(h => `<span style="display:inline-block;background:#F1F5F9;color:#475569;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;">${h}</span>`).join('')}
            </div>
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 2px solid #F1F5F9; margin: 24px 0;" />

          <!-- Section 1: Perfil Ideal -->
          <div style="margin-bottom: 28px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 12px;">🎯 Perfil do Candidato Ideal</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; background: #F8FAFC; padding: 16px; border-radius: 12px; border-left: 4px solid #1E81FE;">
              ${sourcing.idealCandidate}
            </p>
          </div>

          <!-- Section 2: Competências -->
          <div style="margin-bottom: 28px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 16px;">🛠 Matriz de Competências</h2>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 14px; font-weight: 700; color: #1E81FE; margin-bottom: 8px;">Hard Skills (Técnicas)</div>
              <div>${hardSkillsHtml || '<span style="color:#94A3B8;font-size:13px;">Não identificadas</span>'}</div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 14px; font-weight: 700; color: #15803D; margin-bottom: 8px;">Soft Skills (Comportamentais)</div>
              <div>${softSkillsHtml || '<span style="color:#94A3B8;font-size:13px;">Não identificadas</span>'}</div>
            </div>

            ${sourcing.companyExpectations ? `
            <div style="margin-bottom: 8px;">
              <div style="font-size: 14px; font-weight: 700; color: #B45309; margin-bottom: 8px;">🏢 O que a Empresa Espera</div>
              <p style="color: #475569; font-size: 13px; line-height: 1.6; background: #FFFBEB; padding: 14px; border-radius: 10px; border-left: 4px solid #F59E0B;">
                ${sourcing.companyExpectations}
              </p>
            </div>` : ''}
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 2px solid #F1F5F9; margin: 24px 0;" />

          <!-- Section 3: Onde Encontrar Candidatos -->
          <div style="margin-bottom: 28px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 16px;">📍 Onde Encontrar o Candidato Ideal</h2>
            ${sourcingHtml || '<p style="color:#94A3B8;font-size:13px;">Dados de sourcing não disponíveis.</p>'}
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 2px solid #F1F5F9; margin: 24px 0;" />

          <!-- Section 4: Playbook de Abordagem -->
          <div style="margin-bottom: 28px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 16px;">💬 Playbook de Abordagem</h2>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: #0A66C2; margin-bottom: 6px;">LinkedIn InMail</div>
              <div style="background: #F1F5F9; padding: 14px; border-radius: 10px; font-size: 13px; color: #334155; line-height: 1.5; border-left: 4px solid #0A66C2;">
                ${sourcing.coldOutreachTemplates?.linkedinInmail || ''}
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 13px; font-weight: 700; color: #25D366; margin-bottom: 6px;">WhatsApp / DM</div>
              <div style="background: #F0FDF4; padding: 14px; border-radius: 10px; font-size: 13px; color: #166534; line-height: 1.5; border-left: 4px solid #25D366;">
                ${sourcing.coldOutreachTemplates?.whatsappDirect || ''}
              </div>
            </div>
          </div>

          <!-- Section 5: Perguntas de Triagem -->
          <div style="margin-bottom: 28px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 12px;">❓ Perguntas de Triagem Rápida</h2>
            ${questionsHtml || '<p style="color:#94A3B8;font-size:13px;">Nenhuma pergunta gerada.</p>'}
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 2px solid #F1F5F9; margin: 24px 0;" />

          <!-- Section 6: Legenda Pronta -->
          <div style="margin-bottom: 28px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 12px;">📝 Legenda Pronta para Redes Sociais</h2>
            <pre style="background: #F8FAFC; padding: 16px; border-radius: 12px; white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #334155; line-height: 1.6; border: 1px solid #E2E8F0;">${copy.socialCaption}</pre>
          </div>

          <!-- Section 7: Artes para Download -->
          <div style="margin-bottom: 16px;">
            <h2 style="color: #111317; font-size: 18px; font-weight: 700; margin-bottom: 16px;">🎨 Kit de Artes para Divulgação</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <a href="${urls.feed}" target="_blank" style="display:inline-block;background:#1E81FE;color:#FFFFFF;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">📥 Feed (1080×1350)</a>
              <a href="${urls.whatsapp}" target="_blank" style="display:inline-block;background:#25D366;color:#FFFFFF;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">📥 WhatsApp (1080×1080)</a>
              <a href="${urls.story}" target="_blank" style="display:inline-block;background:#E4405F;color:#FFFFFF;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">📥 Story (1080×1920)</a>
              <a href="${urls.linkedin}" target="_blank" style="display:inline-block;background:#0A66C2;color:#FFFFFF;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">📥 LinkedIn (1200×627)</a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #94A3B8; font-size: 11px;">
          Gerado automaticamente pela <strong>Jobz Engine</strong> • Dossier de Inteligência de Recrutamento
        </div>
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
  copy: CopyData,
  extractedData?: ExtractedJobData
): Promise<AssetUrls> {
  const feedPath = `jobs/${jobId}/feed.png`;
  const whatsappPath = `jobs/${jobId}/whatsapp.png`;
  const storyPath = `jobs/${jobId}/story.png`;
  const linkedinPath = `jobs/${jobId}/linkedin.png`;

  // Upload artes para o Supabase Storage
  try {
    await supabase.storage.from('brandkit-arts').upload(feedPath, buffers.feed, { contentType: 'image/png', upsert: true });
    await supabase.storage.from('brandkit-arts').upload(whatsappPath, buffers.whatsapp, { contentType: 'image/png', upsert: true });
    await supabase.storage.from('brandkit-arts').upload(storyPath, buffers.story, { contentType: 'image/png', upsert: true });
    await supabase.storage.from('brandkit-arts').upload(linkedinPath, buffers.linkedin, { contentType: 'image/png', upsert: true });
  } catch (err: any) {
    console.error('Aviso no upload de assets para o Storage:', err?.message);
  }

  const getPublicUrl = (path: string) => supabase.storage.from('brandkit-arts').getPublicUrl(path).data.publicUrl;

  const urls: AssetUrls = {
    feed: getPublicUrl(feedPath),
    whatsapp: getPublicUrl(whatsappPath),
    story: getPublicUrl(storyPath),
    linkedin: getPublicUrl(linkedinPath),
  };

  // Envio de e-mail via Resend com verificação de erro explícita
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `🎯 Dossier de Sourcing: ${copy.headline} (${getContractBadge(extractedData?.contractType || 'CLT').label})`,
        html: generateEmailHtml(copy, sourcing, urls, extractedData),
      });

      if (sendResult.error) {
        console.warn(`Aviso Resend (${sendResult.error.name}):`, sendResult.error.message);
      } else {
        console.log(`E-mail disparado com sucesso via Resend! ID: ${sendResult.data?.id}`);
      }
    } catch (emailErr: any) {
      console.warn('Aviso: E-mail não pôde ser disparado via Resend:', emailErr?.message);
    }
  }

  return urls;
}
