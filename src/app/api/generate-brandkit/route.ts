import { NextRequest, NextResponse } from 'next/server';
import { fetchVacancyDetailsFromAbler } from '@/lib/abler-api';
import { renderBrandKitPNGs } from '@/lib/renderer-engine';
import { uploadAssetsAndSendEmail } from '@/lib/distribution';
import { supabase } from '@/lib/supabase';
import { ContractType, CopyData, SourcingProfile } from '@/lib/types';

export async function POST(req: NextRequest) {
  let jobId: string | null = null;

  try {
    const body = await req.json();
    const { vacancyId, recipientEmail, customFields } = body;

    if (!vacancyId) {
      return NextResponse.json({ error: 'ID da vaga Abler é obrigatório' }, { status: 400 });
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json({ error: 'E-mail de destino inválido' }, { status: 400 });
    }

    // 1. Criar registro no banco Supabase
    const { data: dbJob, error: createError } = await supabase
      .from('brandkit_jobs')
      .insert({
        job_url: `https://abler.com.br/vagas/${vacancyId}`,
        recipient_email: recipientEmail,
        status: 'scraping',
      })
      .select()
      .single();

    if (createError || !dbJob) {
      console.warn('Aviso: Supabase indisponível, gerando kit em modo direto:', createError?.message);
      jobId = `job_${Date.now()}`;
    } else {
      jobId = dbJob.id;
    }

    // 2. Extração rápida via Abler API V2
    const extractedData = await fetchVacancyDetailsFromAbler(String(vacancyId));

    // Aplicar substituições personalizadas do modal de edição da recrutadora
    if (customFields) {
      if (customFields.title) extractedData.title = customFields.title;
      if (customFields.contractType) extractedData.contractType = customFields.contractType as ContractType;
      if (customFields.salary) extractedData.salary = customFields.salary;
      if (customFields.schedule) extractedData.schedule = customFields.schedule;
      if (customFields.location) extractedData.location = customFields.location;
      if (customFields.benefits && Array.isArray(customFields.benefits)) extractedData.benefits = customFields.benefits;
      if (customFields.modality) extractedData.modality = customFields.modality;
    }

    // 3. Montar objeto CopyData instantaneamente (sem chamadas lentas de IA)
    const modalityLoc = `${customFields?.modality || extractedData.modality} | ${customFields?.location || extractedData.location}`;
    const scheduleStr = `Jornada: ${customFields?.schedule || extractedData.schedule}`;
    const salaryStr = `${extractedData.contractType === 'ESTAGIO' ? 'Bolsa' : extractedData.contractType === 'PJ' ? 'Remuneração' : 'Salário'}: ${customFields?.salary || extractedData.salary}`;
    const benefitsStr = `Benefícios: ${Array.isArray(customFields?.benefits) ? customFields.benefits.join(', ') : extractedData.benefits.join(', ')}`;

    const copy: CopyData = {
      headline: customFields?.title || extractedData.title,
      subheadline: modalityLoc,
      highlights: [modalityLoc, scheduleStr, salaryStr, benefitsStr],
      ctaText: 'Candidate-se em: jobz.com.br/vagas',
      socialCaption: `Confira a vaga de ${extractedData.title} na Jobz Carreira!`,
      candidatureType: customFields?.candidatureType || 'platform',
      candidatureEmail: customFields?.candidatureEmail || recipientEmail,
      showRequirements: typeof customFields?.showRequirements === 'boolean' ? customFields.showRequirements : true,
      requirementsList: customFields?.requirementsList || (extractedData.requirements?.join(' • ') || 'Ensino Superior Completo • Pacote Office • Boa Comunicação'),
    };

    const sourcing: SourcingProfile = {
      idealCandidate: `Profissional qualificado para o cargo de ${extractedData.title}.`,
      hardSkills: extractedData.requirements || [],
      softSkills: ['Boa Comunicação', 'Trabalho em Equipe'],
      companyExpectations: 'Comprometimento com metas e excelência.',
      sourcingChannels: {
        universities: [],
        facebookGroups: [],
        whatsappTelegramCommunities: [],
        linkedinSearchQueries: [],
        specializedPlatforms: [],
      },
      coldOutreachTemplates: {
        linkedinInmail: '',
        whatsappDirect: '',
      },
      screeningQuestions: [],
      recommendedUniversities: [],
      linkedinHashtags: [],
    };

    // 4. Renderização síncrona ultra-rápida das artes PNG
    const pngBuffers = await renderBrandKitPNGs(copy);

    // 5. Upload & Envio do E-mail
    const assetUrls = await uploadAssetsAndSendEmail(
      jobId || `job_${Date.now()}`,
      recipientEmail,
      pngBuffers,
      sourcing,
      copy,
      extractedData
    );

    // Atualizar estado concluído
    await supabase
      .from('brandkit_jobs')
      .update({
        status: 'completed',
        asset_urls: assetUrls,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      jobId,
      status: 'completed',
      assetUrls,
      message: 'Kit de divulgação de vaga gerado com sucesso em alta velocidade!'
    });

  } catch (err: any) {
    const errorMsg = err?.message || 'Erro durante o processamento da vaga';
    console.error('Falha no pipeline de artes da vaga:', errorMsg);

    if (jobId) {
      await supabase
        .from('brandkit_jobs')
        .update({
          status: 'failed',
          error_message: errorMsg,
        })
        .eq('id', jobId);
    }

    return NextResponse.json(
      { error: errorMsg, jobId, status: 'failed' },
      { status: 500 }
    );
  }
}
