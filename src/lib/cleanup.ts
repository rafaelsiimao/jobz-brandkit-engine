import { supabase } from './supabase';

export async function cleanExpiredJobs(): Promise<{ cleanedCount: number; purgedDbCount: number; errors: string[] }> {
  const errors: string[] = [];
  let cleanedCount = 0;
  let purgedDbCount = 0;

  try {
    const now = new Date();
    // 1. Vagas criadas ha mais de 48 horas (2 dias) -> Apaga PNGs do Storage para manter consumo < 50 MB
    const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const { data: expiredJobs, error: fetchError } = await supabase
      .from('brandkit_jobs')
      .select('id, job_url, created_at, status')
      .filter('status', 'neq', 'expired')
      .filter('created_at', 'lt', cutoff48h);

    if (fetchError) {
      console.warn('Aviso ao buscar vagas expiradas para limpeza:', fetchError.message);
      errors.push(fetchError.message);
    } else if (expiredJobs && expiredJobs.length > 0) {
      for (const job of expiredJobs) {
        try {
          const pathsToDelete = [
            `jobs/${job.id}/feed.png`,
            `jobs/${job.id}/whatsapp.png`,
            `jobs/${job.id}/story.png`,
            `jobs/${job.id}/linkedin.png`,
          ];

          await supabase.storage.from('brandkit-arts').remove(pathsToDelete);

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
    }

    // 2. Vagas criadas ha mais de 30 dias -> Purga completa da linha no Postgres DB
    const cutoff30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldJobs, error: purgeFetchError } = await supabase
      .from('brandkit_jobs')
      .select('id')
      .filter('created_at', 'lt', cutoff30d);

    if (purgeFetchError) {
      console.warn('Aviso ao buscar registros de 30 dias para purga:', purgeFetchError.message);
    } else if (oldJobs && oldJobs.length > 0) {
      const oldIds = oldJobs.map((j) => j.id);
      const { error: deleteError } = await supabase
        .from('brandkit_jobs')
        .delete()
        .in('id', oldIds);

      if (deleteError) {
        errors.push(`Erro ao purgar registros antigos do DB: ${deleteError.message}`);
      } else {
        purgedDbCount = oldIds.length;
      }
    }
  } catch (err: any) {
    errors.push(`Exceção geral na limpeza de expiração: ${err?.message}`);
  }

  return { cleanedCount, purgedDbCount, errors };
}
