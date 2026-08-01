'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Search,
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Image as ImageIcon, 
  Send, 
  Download, 
  RefreshCw, 
  Clock,
  X,
  Building2,
  MapPin,
  DollarSign,
  ChevronRight,
  Filter
} from 'lucide-react';
import { BrandKitJob } from '@/lib/types';
import { AblerVacancyItem } from '@/lib/abler-api';

export default function HomePage() {
  // Abler Vacancies State
  const [vacancies, setVacancies] = useState<AblerVacancyItem[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegime, setSelectedRegime] = useState<string>('all');

  // Modal & Generation State
  const [selectedVacancy, setSelectedVacancy] = useState<AblerVacancyItem | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<string>('idle');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // History State
  const [jobs, setJobs] = useState<BrandKitJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [resendEmails, setResendEmails] = useState<Record<string, string>>({});
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<Record<string, { success?: boolean; message?: string }>>({});

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Company Vacancies from Abler API V2
  const loadVacancies = async () => {
    setLoadingVacancies(true);
    try {
      const res = await fetch('/api/vacancies');
      const data = await res.json();
      if (data.vacancies) {
        setVacancies(data.vacancies);
      }
    } catch (err) {
      console.error('Erro ao carregar vagas da Abler:', err);
    } finally {
      setLoadingVacancies(false);
    }
  };

  // Fetch Generated Jobs History
  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);

        if (activeJobId) {
          const currentJob = data.jobs.find((j: BrandKitJob) => j.id === activeJobId);
          if (currentJob) {
            setPipelineStep(currentJob.status);
            if (currentJob.status === 'completed') {
              setGenerating(false);
              setStatusMessage({ type: 'success', text: 'Kit de artes gerado e enviado com sucesso para seu e-mail!' });
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            } else if (currentJob.status === 'failed') {
              setGenerating(false);
              setStatusMessage({ type: 'error', text: currentJob.error_message || 'Erro ao processar a vaga.' });
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  };

  useEffect(() => {
    loadVacancies();
    fetchJobs();

    // Default recipient email from localStorage if available
    const savedEmail = localStorage.getItem('jobz_recipient_email');
    if (savedEmail) {
      setRecipientEmail(savedEmail);
    } else {
      setRecipientEmail('rafael.simao@jobz.com.br');
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const openGenerateModal = (vacancy: AblerVacancyItem) => {
    setSelectedVacancy(vacancy);
    setStatusMessage(null);
  };

  const closeModal = () => {
    if (generating) return;
    setSelectedVacancy(null);
  };

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVacancy || !recipientEmail) return;

    localStorage.setItem('jobz_recipient_email', recipientEmail);

    setGenerating(true);
    setPipelineStep('pending');
    setStatusMessage(null);

    // Start Polling for progress
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(fetchJobs, 800);

    try {
      const res = await fetch('/api/generate-brandkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: selectedVacancy.id,
          recipientEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setActiveJobId(data.jobId);
      } else {
        setGenerating(false);
        setStatusMessage({ type: 'error', text: data.error || 'Falha ao iniciar processamento' });
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    } catch (err: any) {
      setGenerating(false);
      setStatusMessage({ type: 'error', text: err?.message || 'Erro de conexão com o servidor' });
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
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
        body: JSON.stringify({ jobId: job.id, newEmail: targetEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setResendStatus((prev) => ({
          ...prev,
          [job.id]: { success: true, message: data.message || `Enviado para ${targetEmail}!` },
        }));
        setResendEmails((prev) => ({ ...prev, [job.id]: '' }));
      } else {
        setResendStatus((prev) => ({
          ...prev,
          [job.id]: { success: false, message: data.error || 'Erro ao reenviar e-mail.' },
        }));
      }
    } catch (err: any) {
      setResendStatus((prev) => ({
        ...prev,
        [job.id]: { success: false, message: err?.message || 'Erro de rede' },
      }));
    } finally {
      setResendingId(null);
    }
  };

  const filteredVacancies = vacancies.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.includes(searchQuery);

    const matchesRegime =
      selectedRegime === 'all' || v.contractingRegime.toUpperCase() === selectedRegime.toUpperCase();

    return matchesSearch && matchesRegime;
  });

  return (
    <div className="min-h-screen bg-[#F2F5F8] text-[#111317] font-sans antialiased selection:bg-[#1E81FE] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#D7DEE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E81FE] flex items-center justify-center text-white shadow-md shadow-[#1E81FE]/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-[#111317] flex items-center gap-2">
                Jobz Carreira <span className="text-xs font-mono font-bold bg-[#EBF3FF] text-[#1E81FE] px-2.5 py-0.5 rounded-full border border-[#B2D3FF]">Artes v2.0</span>
              </h1>
              <p className="text-xs text-[#5F6673] font-medium">Gerador Automático de Kits de Divulgação de Vagas Abler</p>
            </div>
          </div>

          <button
            onClick={() => { loadVacancies(); fetchJobs(); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#5F6673] hover:text-[#111317] bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl hover:bg-white transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sincronizar Abler
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Global Feedback Status Banner */}
        {statusMessage && (
          <div
            className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
              statusMessage.type === 'success'
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0" />
              )}
              <span className="font-semibold text-sm">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SECTION 1: VAGAS ATIVAS NA ABLER */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#1E81FE] uppercase tracking-wider mb-1">
                <Briefcase className="w-4 h-4" /> Integração Oficial Abler ATS
              </div>
              <h2 className="text-2xl font-extrabold text-[#111317]">Vagas Abertas na Empresa</h2>
              <p className="text-sm text-[#5F6673]">Selecione uma vaga para gerar os 4 cards PNG de divulgação (Feed, WhatsApp, Story, LinkedIn)</p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A94A3]" />
                <input
                  type="text"
                  placeholder="Buscar por título ou cidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D7DEE7] rounded-xl text-sm font-medium text-[#111317] placeholder:text-[#8A94A3] focus:outline-none focus:border-[#1E81FE] focus:ring-2 focus:ring-[#1E81FE]/15 shadow-sm transition-all"
                />
              </div>

              <select
                value={selectedRegime}
                onChange={(e) => setSelectedRegime(e.target.value)}
                className="bg-white border border-[#D7DEE7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#111317] focus:outline-none focus:border-[#1E81FE] shadow-sm"
              >
                <option value="all">Todos os Contratos</option>
                <option value="CLT">CLT</option>
                <option value="ESTAGIO">Estágio</option>
                <option value="PJ">PJ</option>
              </select>
            </div>
          </div>

          {/* Vacancies Grid */}
          {loadingVacancies ? (
            <div className="bg-white rounded-2xl border border-[#D7DEE7] p-12 text-center shadow-sm">
              <Loader2 className="w-8 h-8 text-[#1E81FE] animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#5F6673]">Carregando vagas da Abler API V2...</p>
            </div>
          ) : filteredVacancies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D7DEE7] p-12 text-center shadow-sm">
              <Briefcase className="w-10 h-10 text-[#8A94A3] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#111317]">Nenhuma vaga encontrada</h3>
              <p className="text-sm text-[#5F6673] mt-1">Nenhuma vaga ativa corresponde aos seus filtros de busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVacancies.map((vacancy) => {
                const isEstagio = vacancy.contractingRegime.toUpperCase() === 'ESTAGIO';
                const isPJ = vacancy.contractingRegime.toUpperCase() === 'PJ';

                return (
                  <div
                    key={vacancy.id}
                    className="bg-white rounded-2xl border border-[#D7DEE7] p-6 shadow-sm hover:shadow-md hover:border-[#B2D3FF] transition-all flex flex-direction flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top Corner Blue Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1E81FE]/10 rounded-bl-full pointer-events-none group-hover:bg-[#1E81FE] transition-all duration-300" />

                    <div>
                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isEstagio
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : isPJ
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {vacancy.contractingRegime}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-[#5F6673] bg-[#FAFAFC] border border-[#D7DEE7] px-2.5 py-1 rounded-full">
                          Vaga #{vacancy.id}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-lg text-[#111317] group-hover:text-[#1E81FE] transition-colors line-clamp-2 mb-4 leading-snug">
                        {vacancy.title}
                      </h3>

                      {/* Detail Rows */}
                      <div className="space-y-2.5 mb-6 text-xs text-[#5F6673] font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#8A94A3] shrink-0" />
                          <span className="truncate">{vacancy.location} ({vacancy.workType})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#8A94A3] shrink-0" />
                          <span className="font-semibold text-[#111317]">
                            {isEstagio ? 'Bolsa: ' : isPJ ? 'Remuneração: ' : 'Salário: '}
                            {vacancy.salary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openGenerateModal(vacancy)}
                      className="w-full bg-[#111317] hover:bg-[#1E81FE] text-white font-bold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                    >
                      <Sparkles className="w-4 h-4 text-[#1E81FE] group-hover:text-white transition-colors" />
                      Gerar Kit de Divulgação
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MODAL: CONFIRMAR ENVIO DE E-MAIL E GERAR KIT */}
        {selectedVacancy && (
          <div className="fixed inset-0 z-50 bg-[#111317]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#D7DEE7] shadow-2xl max-w-lg w-full p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              {!generating && (
                <button
                  onClick={closeModal}
                  className="absolute top-6 right-6 text-[#8A94A3] hover:text-[#111317] transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              )}

              {/* Modal Content */}
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#1E81FE] uppercase tracking-wider bg-[#EBF3FF] px-3 py-1 rounded-full border border-[#B2D3FF] mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Kit de Divulgação em 1-Clique
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#111317] leading-tight">
                    {selectedVacancy.title}
                  </h3>
                  <p className="text-xs text-[#5F6673] font-medium mt-1">
                    Vaga #{selectedVacancy.id} • {selectedVacancy.location} ({selectedVacancy.contractingRegime})
                  </p>
                </div>

                <form onSubmit={handleStartGeneration} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6673] mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1E81FE]" /> E-mail de Destino do Recrutador
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@jobz.com.br"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      disabled={generating}
                      className="w-full px-4 py-3 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-sm font-semibold text-[#111317] placeholder:text-[#8A94A3] focus:outline-none focus:border-[#1E81FE] focus:bg-white transition-all disabled:opacity-50"
                    />
                    <p className="text-[11px] text-[#8A94A3] mt-1.5">
                      As 4 artes (Feed, WhatsApp, Story, LinkedIn) no padrão oficial do Brandbook serão enviadas para este e-mail.
                    </p>
                  </div>

                  {/* Progress Box during generation */}
                  {generating && (
                    <div className="bg-[#FAFAFC] rounded-2xl border border-[#D7DEE7] p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-[#111317]">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-[#1E81FE] animate-spin" />
                          Gerando artes no padrão Jobz...
                        </span>
                        <span className="font-mono text-[#1E81FE]">{pipelineStep}</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#1E81FE] h-full transition-all duration-500 animate-pulse w-3/4" />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {!generating && (
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-3 text-sm font-bold text-[#5F6673] hover:text-[#111317] transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={generating || !recipientEmail}
                      className="bg-[#1E81FE] hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-[#1E81FE]/25 disabled:opacity-50 flex items-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Kit de Artes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HISTÓRICO DE KITS GERADOS & DOWNLOADS (Expira em 48h) */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4 text-[#1E81FE]" /> Histórico & Expiração Automática
            </div>
            <h2 className="text-2xl font-extrabold text-[#111317]">Kits Gerados Recentemente</h2>
            <p className="text-sm text-[#5F6673]">Artes PNG permanecem disponíveis para download imediato por 48 horas</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#D7DEE7] shadow-sm overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <ImageIcon className="w-10 h-10 text-[#8A94A3] mx-auto mb-3" />
                <h3 className="font-bold text-base text-[#111317]">Nenhum kit gerado ainda</h3>
                <p className="text-sm text-[#5F6673] mt-1">Selecione uma vaga acima para gerar seu primeiro kit de divulgação.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EBF0F5]">
                {jobs.map((job) => {
                  const isExpired = job.status === 'expired';
                  const isCompleted = job.status === 'completed';

                  // Calculate hours left if expires_at is present
                  let hoursLeft: number | null = null;
                  if (job.expires_at) {
                    const diffMs = new Date(job.expires_at).getTime() - Date.now();
                    hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
                  }

                  return (
                    <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAFAFC] transition-colors">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isExpired
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isCompleted ? '✓ Concluído' : isExpired ? '⌛ Expirado (48h)' : job.status}
                          </span>

                          {hoursLeft !== null && !isExpired && (
                            <span className="text-[11px] font-mono font-semibold text-[#1E81FE] bg-[#EBF3FF] px-2.5 py-0.5 rounded-full border border-[#B2D3FF]">
                              ⌛ Expira em {hoursLeft}h
                            </span>
                          )}

                          <span className="text-xs text-[#8A94A3] font-medium">
                            Enviado para: <strong className="text-[#111317]">{job.recipient_email}</strong>
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base text-[#111317]">
                          {job.copy_data?.headline || job.job_url}
                        </h4>

                        {job.copy_data?.highlights && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.copy_data.highlights.map((h, idx) => (
                              <span key={idx} className="text-[11px] font-mono font-medium text-[#5F6673] bg-white border border-[#D7DEE7] px-2 py-0.5 rounded-md">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Links & Download Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {isCompleted && job.asset_urls && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={job.asset_urls.feed}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-[#1E81FE] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Feed
                            </a>
                            <a
                              href={job.asset_urls.whatsapp}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-[#25D366] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                            <a
                              href={job.asset_urls.story}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-[#E4405F] hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Story
                            </a>
                            <a
                              href={job.asset_urls.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-[#0A66C2] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> LinkedIn
                            </a>
                          </div>
                        )}

                        {/* Re-send Box */}
                        {isCompleted && (
                          <div className="flex items-center gap-1.5 bg-[#FAFAFC] p-1 border border-[#D7DEE7] rounded-xl">
                            <input
                              type="email"
                              placeholder="Outro e-mail..."
                              value={resendEmails[job.id] || ''}
                              onChange={(e) => setResendEmails({ ...resendEmails, [job.id]: e.target.value })}
                              className="w-32 px-2.5 py-1 bg-transparent text-xs font-medium text-[#111317] placeholder:text-[#8A94A3] focus:outline-none"
                            />
                            <button
                              onClick={() => handleResend(job)}
                              disabled={resendingId === job.id || !resendEmails[job.id]}
                              className="px-3 py-1 bg-[#111317] hover:bg-[#1E81FE] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                            >
                              Reenviar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
