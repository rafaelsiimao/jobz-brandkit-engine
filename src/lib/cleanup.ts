import { supabase } from './supabase';

export async function cleanExpiredJobs(): Promise<{ cleanedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let cleanedCount = 0;

  try {
    const now = new Date();
    // Vagas criadas ha mais de 48 horas (2 dias)
    const cutoffDate = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const { data: expiredJobs, error: fetchError } = await supabase
      .from('brandkit_jobs')
      .select('id, job_url, created_at, status')
      .filter('status', 'neq', 'expired')
      .filter('created_at', 'lt', cutoffDate);

    if (fetchError) {
      console.warn('Aviso ao buscar vagas expiradas para limpeza:', fetchError.message);
      return { cleanedCount: 0, errors: [fetchError.message] };
    }

    if (!expiredJobs || expiredJobs.length === 0) {
      return { cleanedCount: 0, errors: [] };
    }

    for (const job of expiredJobs) {
      try {
        // Apaga os 4 arquivos PNG de artes do Supabase Storage bucket 'brandkit-arts'
        const pathsToDelete = [
          `jobs/${job.id}/feed.png`,
          `jobs/${job.id}/whatsapp.png`,
          `jobs/${job.id}/story.png`,
          `jobs/${job.id}/linkedin.png`,
        ];

        await supabase.storage.from('brandkit-arts').remove(pathsToDelete);

        // Atualiza a linha no Supabase DB para status 'expired' e limpa asset_urls
        const { error: updateError } = await supabase
          .from('brandkit_jobs')
          .update({
            status: 'expired',
            asset_urls: null,
            error_message: 'Artes removidas do servidor após 48 horas (política de retenção)',
          })
          .eq('id', job.id);

        if (updateError) {
          errors.push(`Erro ao atualizar job ${job.id}: ${updateError.message}`);
        } else {
          cleanedCount++;
        }
      } catch (jobErr: any) {
        errors.push(`Exceção no job ${job.id}: ${jobErr?.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Exceção geral na limpeza de expiração: ${err?.message}`);
  }

  return { cleanedCount, errors };
}
