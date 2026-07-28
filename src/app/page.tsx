'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Link as LinkIcon, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Briefcase,
  Layers,
  Image as ImageIcon,
  Send,
  History,
  Download,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { BrandKitJob } from '@/lib/types';

export default function HomePage() {
  const [jobUrl, setJobUrl] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'completed' | 'error'>('idle');
  const [activeJobStatus, setActiveJobStatus] = useState<string>('pending');
  const [message, setMessage] = useState<string | null>(null);

  // History & Resend States
  const [jobs, setJobs] = useState<BrandKitJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [resendEmails, setResendEmails] = useState<Record<string, string>>({});
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<Record<string, { success?: boolean; message?: string }>>({});
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        
        // If we are tracking an active job, find its status
        if (jobId) {
          const currentJob = data.jobs.find((j: BrandKitJob) => j.id === jobId);
          if (currentJob) {
            setActiveJobStatus(currentJob.status);
            if (currentJob.status === 'completed') {
              setStatus('completed');
              setLoading(false);
              setMessage('BrandKit gerado e enviado com sucesso para o seu e-mail!');
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            } else if (currentJob.status === 'failed') {
              setStatus('error');
              setLoading(false);
              setMessage(currentJob.error_message || 'Ocorreu um erro no processamento.');
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar histórico de vagas:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startPolling = (targetJobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(() => {
      fetchJobs();
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('pending');
    setActiveJobStatus('pending');
    setMessage(null);
    setJobId(null);

    try {
      const res = await fetch('/api/generate-brandkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl, recipientEmail })
      });
      const data = await res.json();

      if (res.ok) {
        setJobId(data.jobId);
        setActiveJobStatus(data.status || 'scraping');
        
        if (data.status === 'completed') {
          setStatus('completed');
          setLoading(false);
          setMessage('BrandKit gerado e enviado com sucesso para o seu e-mail!');
          fetchJobs();
        } else {
          // Poll every 2s for step updates
          startPolling(data.jobId);
        }
      } else {
        setStatus('error');
        setLoading(false);
        setMessage(data.error || 'Ocorreu um erro ao processar a requisição.');
      }
    } catch (err: any) {
      setStatus('error');
      setLoading(false);
      setMessage(err.message || 'Erro de conexão com o servidor.');
    }
  };

  const handleResend = async (job: BrandKitJob) => {
    const targetEmail = resendEmails[job.id];
    if (!targetEmail) return;

    setResendingId(job.id);
    setResendStatus((prev) => ({ ...prev, [job.id]: {} }));

    try {
      const res = await fetch('/api/jobs/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, newEmail: targetEmail })
      });
      const data = await res.json();

      if (res.ok) {
        setResendStatus((prev) => ({
          ...prev,
          [job.id]: { success: true, message: data.message || `Enviado para ${targetEmail}!` }
        }));
        setResendEmails((prev) => ({ ...prev, [job.id]: '' }));
      } else {
        setResendStatus((prev) => ({
          ...prev,
          [job.id]: { success: false, message: data.error || 'Erro ao reenviar e-mail.' }
        }));
      }
    } catch (err: any) {
      setResendStatus((prev) => ({
        ...prev,
        [job.id]: { success: false, message: err.message || 'Erro de conexão.' }
      }));
    } finally {
      setResendingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaptionId(id);
    setTimeout(() => setCopiedCaptionId(null), 2500);
  };

  // Helper to determine step completion in stepper
  const getStepState = (stepKey: string) => {
    const order = ['pending', 'scraping', 'generating_ai', 'rendering_arts', 'uploading_and_mailing', 'completed'];
    const currentIndex = order.indexOf(activeJobStatus);
    const stepIndex = order.indexOf(stepKey);

    if (activeJobStatus === 'completed') return 'completed';
    if (currentIndex === stepIndex) return 'active';
    if (currentIndex > stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <main className="min-h-screen bg-[#F2F5F8] text-[#111317] flex flex-col justify-between p-4 sm:p-6 md:p-12 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E81FE] flex items-center justify-center text-white shadow-lg shadow-[#1E81FE]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-[#111317]">Jobz Engine</h1>
            <p className="text-xs text-gray-500 font-medium">BrandKit & Sourcing Intelligence</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1E81FE]/10 text-[#1E81FE] border border-[#1E81FE]/20">
          MVP v1.0
        </span>
      </header>

      {/* Main Grid Container */}
      <div className="max-w-5xl mx-auto w-full my-6 space-y-8">
        
        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#1E81FE]/10 text-[#1E81FE] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              Gerador de Kit de Divulgação
            </div>
            <h2 className="text-3xl font-extrabold text-[#111317] tracking-tight mb-3">
              BrandKit Recrutamento
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Insira o link da vaga na Abler ATS e o e-mail de destino para receber o kit completo contendo artes para redes sociais e perfil de sourcing inteligente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="jobUrl" className="block text-xs font-bold uppercase tracking-wider text-[#111317] mb-2">
                URL da Vaga (Abler ATS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  id="jobUrl"
                  type="url"
                  required
                  placeholder="https://ats.abler.com.br/jobs/jobz/vaga-123"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-[#111317] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E81FE] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="recipientEmail" className="block text-xs font-bold uppercase tracking-wider text-[#111317] mb-2">
                E-mail para Recebimento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="recipientEmail"
                  type="email"
                  required
                  placeholder="recrutadora@jobz.com.br"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-[#111317] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E81FE] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#1E81FE] hover:bg-[#196edb] active:scale-[0.99] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#1E81FE]/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Gerar & Enviar BrandKit</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Status Alert & Live Stepper Screen */}
          {status !== 'idle' && (
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              {status === 'completed' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-950 mb-1">Solicitação Concluída!</h4>
                    <p className="text-emerald-800 leading-relaxed text-xs sm:text-sm">{message}</p>
                    {jobId && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-emerald-200 text-xs font-mono text-emerald-700">
                        <span>Job ID:</span>
                        <span className="font-bold">{jobId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-900 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-950 mb-1">Falha no Envio</h4>
                    <p className="text-rose-800 leading-relaxed text-xs sm:text-sm">{message}</p>
                  </div>
                </div>
              )}

              {/* Live Pipeline Stepper Screen */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#111317] flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 text-[#1E81FE] animate-spin" />}
                    <span>Acompanhamento da Pipeline em Tempo Real</span>
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1E81FE]/10 text-[#1E81FE] uppercase">
                    {activeJobStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      getStepState('scraping') === 'active'
                        ? 'bg-blue-50 border-[#1E81FE] ring-2 ring-[#1E81FE]/20 text-[#1E81FE] font-bold'
                        : getStepState('scraping') === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-gray-400 opacity-60'
                    }`}
                  >
                    {getStepState('scraping') === 'active' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1E81FE] shrink-0" />
                    ) : getStepState('scraping') === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Briefcase className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider">Etapa 1</div>
                      <div className="text-xs truncate">1. Scraping Abler</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      getStepState('generating_ai') === 'active'
                        ? 'bg-blue-50 border-[#1E81FE] ring-2 ring-[#1E81FE]/20 text-[#1E81FE] font-bold'
                        : getStepState('generating_ai') === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-gray-400 opacity-60'
                    }`}
                  >
                    {getStepState('generating_ai') === 'active' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1E81FE] shrink-0" />
                    ) : getStepState('generating_ai') === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Layers className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider">Etapa 2</div>
                      <div className="text-xs truncate">2. IA Sourcing</div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      getStepState('rendering_arts') === 'active'
                        ? 'bg-blue-50 border-[#1E81FE] ring-2 ring-[#1E81FE]/20 text-[#1E81FE] font-bold'
                        : getStepState('rendering_arts') === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-gray-400 opacity-60'
                    }`}
                  >
                    {getStepState('rendering_arts') === 'active' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1E81FE] shrink-0" />
                    ) : getStepState('rendering_arts') === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider">Etapa 3</div>
                      <div className="text-xs truncate">3. Render 4 Artes</div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      getStepState('uploading_and_mailing') === 'active'
                        ? 'bg-blue-50 border-[#1E81FE] ring-2 ring-[#1E81FE]/20 text-[#1E81FE] font-bold'
                        : getStepState('uploading_and_mailing') === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-gray-400 opacity-60'
                    }`}
                  >
                    {getStepState('uploading_and_mailing') === 'active' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1E81FE] shrink-0" />
                    ) : getStepState('uploading_and_mailing') === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Send className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider">Etapa 4</div>
                      <div className="text-xs truncate">4. Envio E-mail</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1E81FE]/10 text-[#1E81FE] flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#111317]">
                  Histórico de BrandKits Gerados
                </h3>
                <p className="text-xs text-gray-500">
                  Gerencie as vagas cadastradas no Supabase e reenvie os materiais para outros e-mails
                </p>
              </div>
            </div>
            <button
              onClick={fetchJobs}
              disabled={loadingJobs}
              className="p-2 rounded-xl border border-slate-200 text-gray-600 hover:text-[#1E81FE] hover:bg-slate-50 transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingJobs ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {loadingJobs && jobs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E81FE]" />
              <span className="text-xs font-medium">Carregando histórico do Supabase...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
              Nenhum BrandKit gerado até o momento. Cadastre a primeira vaga no formulário acima!
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Job Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#111317]">
                        {job.copy_data?.headline || job.extracted_data?.title || 'Vaga Abler'}
                      </h4>
                      <a
                        href={job.job_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1E81FE] font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-xs">{job.job_url}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400">
                        {new Date(job.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          job.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {job.status === 'completed'
                          ? 'Concluído'
                          : job.status === 'scraping'
                          ? '🔍 Extraindo Vaga'
                          : job.status === 'generating_ai'
                          ? '🧠 Gerando IA'
                          : job.status === 'rendering_arts'
                          ? '🎨 Desenhando Artes'
                          : job.status === 'uploading_and_mailing'
                          ? '📧 Enviando E-mail'
                          : job.status === 'failed'
                          ? 'Falhou'
                          : 'Processando'}
                      </span>
                    </div>
                  </div>

                  {/* Asset Downloads & Actions */}
                  {job.status === 'completed' && job.asset_urls && (
                    <div className="pt-3 border-t border-slate-200/60 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider mr-1">Baixar Artes:</span>
                        <a
                          href={job.asset_urls.feed}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E81FE] text-gray-700 hover:text-[#1E81FE] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Feed (1080x1350)</span>
                        </a>
                        <a
                          href={job.asset_urls.whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E81FE] text-gray-700 hover:text-[#1E81FE] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>WhatsApp (1080x1080)</span>
                        </a>
                        <a
                          href={job.asset_urls.story}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E81FE] text-gray-700 hover:text-[#1E81FE] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Story (1080x1920)</span>
                        </a>
                        <a
                          href={job.asset_urls.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E81FE] text-gray-700 hover:text-[#1E81FE] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>LinkedIn (1200x627)</span>
                        </a>
                      </div>

                      {/* Copy caption */}
                      {job.copy_data?.socialCaption && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(job.copy_data!.socialCaption, job.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-gray-700 text-xs font-semibold transition-all inline-flex items-center gap-1"
                          >
                            {copiedCaptionId === job.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Legenda Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-gray-500" />
                                <span>Copiar Legenda</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Resend Form */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="email"
                          placeholder="Novo e-mail de destino..."
                          value={resendEmails[job.id] || ''}
                          onChange={(e) =>
                            setResendEmails((prev) => ({ ...prev, [job.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-[#111317] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E81FE]"
                        />
                        <button
                          onClick={() => handleResend(job)}
                          disabled={resendingId === job.id || !resendEmails[job.id]}
                          className="px-4 py-1.5 rounded-xl bg-[#1E81FE] hover:bg-[#196edb] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {resendingId === job.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Reenviar BrandKit</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Resend status alert */}
                      {resendStatus[job.id]?.message && (
                        <div
                          className={`text-xs font-semibold p-2 rounded-lg ${
                            resendStatus[job.id].success
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {resendStatus[job.id].message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-gray-400">
        Jobz BrandKit Engine &copy; {new Date().getFullYear()} — Desenvolvido com Next.js & TailwindCSS
      </footer>
    </main>
  );
}
