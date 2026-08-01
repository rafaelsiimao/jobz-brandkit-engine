'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search,
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Send, 
  RefreshCw, 
  X,
  MapPin,
  DollarSign,
  Edit3,
  Eye,
  Check,
  Building2,
  Clock,
  Award
} from 'lucide-react';
import { AblerVacancyItem } from '@/lib/abler-api';

interface EditFormState {
  title: string;
  contractType: 'CLT' | 'ESTAGIO' | 'PJ';
  schedule: string;
  salary: string;
  benefits: string;
  modality: string;
  location: string;
  recipientEmail: string;
}

export default function HomePage() {
  // Vacancies State
  const [vacancies, setVacancies] = useState<AblerVacancyItem[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegimeFilter, setSelectedRegimeFilter] = useState<string>('all');

  // Preview & Edit Modal State
  const [selectedVacancy, setSelectedVacancy] = useState<AblerVacancyItem | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState<EditFormState>({
    title: '',
    contractType: 'CLT',
    schedule: '',
    salary: '',
    benefits: '',
    modality: 'Presencial',
    location: '',
    recipientEmail: '',
  });

  // Processing & Success Modal State
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; title: string; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch Vacancies from Abler API V2
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

  useEffect(() => {
    loadVacancies();

    const savedEmail = localStorage.getItem('jobz_recipient_email') || 'rafael.simao@jobz.com.br';
    setFormData((prev) => ({ ...prev, recipientEmail: savedEmail }));
  }, []);

  // Open Preview Modal & Pre-fill Form (purely local state, zero requests)
  const openPreviewModal = (vacancy: AblerVacancyItem) => {
    setSelectedVacancy(vacancy);
    setStatusMessage(null);

    const savedEmail = localStorage.getItem('jobz_recipient_email') || 'rafael.simao@jobz.com.br';
    const isEstagio = vacancy.contractingRegime.toUpperCase().includes('ESTAGIO') || /est[áa]gio/i.test(vacancy.title);
    const isPJ = vacancy.contractingRegime.toUpperCase().includes('PJ') || /pj\b/i.test(vacancy.title);

    const contractType = isEstagio ? 'ESTAGIO' : isPJ ? 'PJ' : 'CLT';

    setFormData({
      title: vacancy.title,
      contractType,
      schedule: isEstagio ? '6h diárias (30h semanais)' : 'Segunda a Sexta • 08h às 17:30h',
      salary: vacancy.salary || (isEstagio ? 'Bolsa a combinar' : 'Compatível com o mercado'),
      benefits: isEstagio 
        ? 'Auxílio Transporte + Recesso Remunerado' 
        : isPJ 
        ? 'Horário Flexível + Home Office' 
        : 'Vale Refeição / Alimentação + Vale Transporte + Plano de Saúde',
      modality: vacancy.workType.includes('Remoto') ? 'Remoto' : vacancy.workType.includes('Híbrido') ? 'Híbrido' : 'Presencial',
      location: vacancy.location || 'Vila Velha / ES',
      recipientEmail: savedEmail,
    });
  };

  const closePreviewModal = () => {
    if (generating) return;
    setSelectedVacancy(null);
  };

  // Submit and Generate Kit
  const handleConfirmAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVacancy || !formData.recipientEmail) return;

    localStorage.setItem('jobz_recipient_email', formData.recipientEmail);

    setGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/generate-brandkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: selectedVacancy.id,
          recipientEmail: formData.recipientEmail,
          customFields: {
            title: formData.title,
            contractType: formData.contractType,
            schedule: formData.schedule,
            salary: formData.salary,
            benefits: [formData.benefits],
            modality: formData.modality,
            location: formData.location,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGenerating(false);
        setSelectedVacancy(null); // Close preview modal
        setShowSuccessModal(true); // Open clear success modal
        setStatusMessage({
          type: 'success',
          title: 'Kit de Artes Enviado com Sucesso! 🚀',
          text: `As 4 artes PNG (Feed, WhatsApp, Story e LinkedIn) no padrão oficial Jobz Carreira foram enviadas para ${formData.recipientEmail}.`,
        });
      } else {
        setGenerating(false);
        setStatusMessage({
          type: 'error',
          title: 'Falha ao Gerar Artes',
          text: data.error || 'Ocorreu um erro ao processar a vaga.',
        });
      }
    } catch (err: any) {
      setGenerating(false);
      setStatusMessage({
        type: 'error',
        title: 'Erro de Conexão',
        text: err?.message || 'Falha ao conectar com o servidor.',
      });
    }
  };

  const filteredVacancies = vacancies.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.includes(searchQuery);

    const matchesRegime =
      selectedRegimeFilter === 'all' || v.contractingRegime.toUpperCase().includes(selectedRegimeFilter.toUpperCase());

    return matchesSearch && matchesRegime;
  });

  // Dynamic Kicker & Labels for Live Card Preview
  const kickerText = formData.contractType === 'ESTAGIO' 
    ? 'VAGA ABERTA · ESTÁGIO' 
    : formData.contractType === 'PJ' 
    ? 'CONTRATO PRESTADOR · PJ' 
    : 'OPORTUNIDADE · CLT';

  const labelHoursText = formData.contractType === 'ESTAGIO' ? 'JORNADA DE ESTÁGIO' : 'JORNADA';
  const labelFinancialText = formData.contractType === 'ESTAGIO' ? 'BOLSA' : formData.contractType === 'PJ' ? 'REMUNERAÇÃO' : 'SALÁRIO';

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
                Jobz Carreira <span className="text-xs font-mono font-bold bg-[#EBF3FF] text-[#1E81FE] px-2.5 py-0.5 rounded-full border border-[#B2D3FF]">Artes V2</span>
              </h1>
              <p className="text-xs text-[#5F6673] font-medium">Gerador de Kits de Divulgação com Preview e Edição em Tempo Real</p>
            </div>
          </div>

          <button
            onClick={loadVacancies}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#5F6673] hover:text-[#111317] bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl hover:bg-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingVacancies ? 'animate-spin' : ''}`} />
            Sincronizar Abler
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Global Feedback Banner */}
        {statusMessage && statusMessage.type === 'error' && (
          <div className="p-5 rounded-2xl border bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0" />
              <div>
                <h4 className="font-bold text-sm">{statusMessage.title}</h4>
                <p className="text-xs font-medium opacity-90">{statusMessage.text}</p>
              </div>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-current opacity-70 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SECTION: VAGAS ABERTAS NA ABLER */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#1E81FE] uppercase tracking-wider mb-1">
                <Briefcase className="w-4 h-4" /> Integração Oficial Abler ATS API V2
              </div>
              <h2 className="text-2xl font-extrabold text-[#111317]">Vagas Abertas da Empresa</h2>
              <p className="text-sm text-[#5F6673]">Selecione uma vaga para visualizar a prévia ao vivo do card e personalizar antes de gerar</p>
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
                value={selectedRegimeFilter}
                onChange={(e) => setSelectedRegimeFilter(e.target.value)}
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
              <p className="text-sm font-semibold text-[#5F6673]">Carregando vagas ativas da Abler...</p>
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
                const isEstagio = vacancy.contractingRegime.toUpperCase().includes('ESTAGIO');
                const isPJ = vacancy.contractingRegime.toUpperCase().includes('PJ');

                return (
                  <div
                    key={vacancy.id}
                    className="bg-white rounded-2xl border border-[#D7DEE7] p-6 shadow-sm hover:shadow-md hover:border-[#B2D3FF] transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1E81FE]/10 rounded-bl-full pointer-events-none group-hover:bg-[#1E81FE] transition-all duration-300" />

                    <div>
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

                      <h3 className="font-extrabold text-lg text-[#111317] group-hover:text-[#1E81FE] transition-colors line-clamp-2 mb-4 leading-snug">
                        {vacancy.title}
                      </h3>

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

                    <button
                      onClick={() => openPreviewModal(vacancy)}
                      className="w-full bg-[#111317] hover:bg-[#1E81FE] text-white font-bold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                    >
                      <Eye className="w-4 h-4 text-[#1E81FE] group-hover:text-white transition-colors" />
                      Visualizar & Gerar Kit
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MODAL DE PREVIEW E EDIÇÃO EM TEMPO REAL */}
        {selectedVacancy && (
          <div className="fixed inset-0 z-50 bg-[#111317]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#D7DEE7] shadow-2xl max-w-6xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-[#D7DEE7] flex items-center justify-between bg-[#FAFAFC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1E81FE] flex items-center justify-center text-white font-bold">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#111317]">Prévia & Edição Interativa do Card</h3>
                    <p className="text-xs text-[#5F6673]">Edite qualquer campo à esquerda para ver a arte atualizar em tempo real à direita</p>
                  </div>
                </div>

                {!generating && (
                  <button
                    onClick={closePreviewModal}
                    className="p-2 text-[#8A94A3] hover:text-[#111317] hover:bg-[#EBF0F5] rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Modal Body: Split Screen */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1">
                
                {/* LEFT COLUMN: EDIT FORM */}
                <div className="lg:col-span-6 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#D7DEE7] bg-white">
                  <div className="flex items-center justify-between border-b border-[#EBF0F5] pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E81FE] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Campos Editáveis do Card
                    </span>
                    <span className="text-xs font-mono text-[#8A94A3]">Vaga #{selectedVacancy.id}</span>
                  </div>

                  <form onSubmit={handleConfirmAndGenerate} className="space-y-4">
                    {/* Título da Vaga */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                        Título da Vaga (Somente o Título)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2.5 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-sm font-bold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Regime de Contratação */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                        Regime de Contratação
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['CLT', 'ESTAGIO', 'PJ'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, contractType: type })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                              formData.contractType === type
                                ? 'bg-[#1E81FE] text-white border-[#1E81FE] shadow-sm'
                                : 'bg-[#FAFAFC] text-[#5F6673] border-[#D7DEE7] hover:bg-white'
                            }`}
                          >
                            {type === 'ESTAGIO' ? 'Estágio' : type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Jornada */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                        {formData.contractType === 'ESTAGIO' ? 'Jornada de Estágio' : 'Jornada de Trabalho'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2.5 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-sm font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Salário / Bolsa / Remuneração */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                        {formData.contractType === 'ESTAGIO' ? 'Bolsa' : formData.contractType === 'PJ' ? 'Remuneração' : 'Salário'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2.5 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-sm font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Benefícios */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                        Benefícios
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2.5 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Modalidade & Localidade */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                          Modalidade
                        </label>
                        <select
                          value={formData.modality}
                          onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                          disabled={generating}
                          className="w-full px-3 py-2.5 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Híbrido">Híbrido</option>
                          <option value="Remoto">Remoto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                          Localidade
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          disabled={generating}
                          className="w-full px-3 py-2.5 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Destinatário do E-mail */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#1E81FE] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> E-mail de Envio do Kit
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        disabled={generating}
                        className="w-full px-4 py-2.5 bg-[#EBF3FF] border border-[#B2D3FF] rounded-xl text-sm font-bold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
                      />
                    </div>
                  </form>
                </div>

                {/* RIGHT COLUMN: LIVE CARD PREVIEW */}
                <div className="lg:col-span-6 p-6 sm:p-8 bg-[#F2F5F8] flex flex-col justify-between items-center">
                  <div className="w-full mb-3 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#1E81FE]" /> Visualização em Tempo Real (Card Feed 1080x1350)
                    </span>
                    <span className="text-[11px] font-mono text-[#1E81FE] font-bold">100% Fiel ao PNG</span>
                  </div>

                  {/* Simulated Live Card */}
                  <div className="w-full max-w-[420px] aspect-[1/1.25] bg-white rounded-3xl border border-[#D7DEE7] p-7 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300">
                    
                    {/* Top Right Blue Accent Corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1E81FE] rounded-bl-full pointer-events-none" />

                    <div className="space-y-4">
                      {/* Logo SVG Oficial */}
                      <div className="flex items-center">
                        <svg className="h-7 w-auto" viewBox="0 0 206.91 100" fill="none">
                          <path fill="#111317" fillRule="evenodd" d="M12.18,23.38v56.55c0,2.53-.68,4.48-2.05,5.84s-3.3,2.05-5.83,2.05H0v12.18h3.37c5.33,0,9.64-.68,12.91-2.05,3.28-1.37,5.71-3.56,7.28-6.6,1.57-3.04,2.35-7.12,2.35-12.24V23.38h-13.73ZM12.18,23.38v10.65h13.73v-10.65h-13.73Z"/>
                          <path fill="#1E81FE" fillRule="evenodd" d="M32.51,0c0,11.23-9.12,20.35-20.35,20.35V0h20.35Z"/>
                          <path fill="#111317" fillRule="evenodd" d="M63.5,80.95c-4.92,0-9.25-.78-13.01-2.36-3.76-1.57-6.93-3.7-9.53-6.4-2.6-2.7-4.56-5.75-5.89-9.17s-2-6.97-2-10.65v-2.15c0-3.82.7-7.46,2.1-10.91,1.4-3.45,3.41-6.52,6.04-9.22s5.82-4.81,9.58-6.35c3.76-1.54,7.99-2.3,12.7-2.3s8.95.77,12.7,2.3c3.75,1.54,6.95,3.65,9.58,6.35,2.63,2.7,4.63,5.77,5.99,9.22,1.37,3.45,2.05,7.08,2.05,10.91v2.15c0,3.69-.67,7.24-2,10.65s-3.3,6.47-5.89,9.17-5.77,4.83-9.53,6.4-8.06,2.36-12.91,2.36c0,0,.02,0,.02,0ZM63.5,68.76c3.48,0,6.42-.77,8.81-2.3,2.39-1.54,4.2-3.62,5.43-6.25s1.84-5.62,1.84-8.96-.63-6.43-1.89-9.06-3.11-4.71-5.53-6.25-5.31-2.3-8.66-2.3-6.23.77-8.66,2.3c-2.42,1.54-4.29,3.62-5.58,6.25-1.3,2.63-1.95,5.65-1.95,9.06s.63,6.34,1.9,8.96c1.26,2.63,3.09,4.71,5.48,6.25s5.33,2.3,8.81,2.3Z"/>
                          <path fill="#111317" fillRule="evenodd" d="M133.88,80.85c-4.58,0-8.6-.97-12.09-2.92s-6.21-4.8-8.19-8.55-3.07-8.3-3.28-13.62h2.15v23.25h-11.27V4.23h14.24v37.39l-3.79,5.84c.27-5.74,1.42-10.52,3.43-14.34s4.73-6.69,8.14-8.6c3.41-1.91,7.27-2.87,11.58-2.87,3.82,0,7.31.72,10.45,2.15s5.84,3.43,8.09,5.99c2.25,2.56,3.98,5.55,5.17,8.96s1.79,7.14,1.79,11.17v2.15c0,4.03-.61,7.78-1.85,11.27-1.23,3.48-3,6.54-5.33,9.17-2.32,2.63-5.11,4.68-8.35,6.15s-6.88,2.2-10.91,2.2h.02ZM130.7,68.87c3.07,0,5.75-.77,8.04-2.3,2.29-1.54,4.08-3.64,5.38-6.3s1.95-5.74,1.95-9.22-.65-6.62-1.95-9.22c-1.3-2.59-3.09-4.61-5.38-6.04-2.29-1.43-4.97-2.15-8.04-2.15-2.8,0-5.38.61-7.73,1.84s-4.27,3.04-5.74,5.43-2.2,5.26-2.2,8.6v4.1c0,3.21.75,5.94,2.25,8.19,1.5,2.25,3.45,4,5.84,5.22,2.39,1.54,4.92,1.85,7.58,1.85h0Z"/>
                          <path fill="#1E81FE" fillRule="evenodd" d="M163.48,79.01v-11.27l27.45-32.98v1.64l-2.15-2.87,1.74.82h-27.14v-10.96h42.41v11.27l-27.45,32.98v-1.54l2.25,2.87-1.74-.92h28.07v10.96h-43.44Z"/>
                        </svg>
                      </div>

                      {/* Kicker */}
                      <div className="text-[11px] font-mono font-bold text-[#1E81FE] uppercase tracking-wider">
                        {kickerText}
                      </div>

                      {/* Title */}
                      <div className="text-xl font-extrabold text-[#111317] leading-tight line-clamp-2">
                        {formData.title || 'Título da Vaga'}
                      </div>

                      {/* Content Rows */}
                      <div className="space-y-3 pt-1 text-xs">
                        <div>
                          <div className="font-bold text-[#8A94A3] text-[10px] tracking-wider uppercase">{labelHoursText}</div>
                          <div className="font-extrabold text-[#111317] line-clamp-1">{formData.schedule}</div>
                        </div>
                        <div>
                          <div className="font-bold text-[#8A94A3] text-[10px] tracking-wider uppercase">{labelFinancialText}</div>
                          <div className="font-extrabold text-[#111317] line-clamp-1">{formData.salary}</div>
                        </div>
                        <div>
                          <div className="font-bold text-[#8A94A3] text-[10px] tracking-wider uppercase">BENEFÍCIOS</div>
                          <div className="font-semibold text-[#111317] line-clamp-2">{formData.benefits}</div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Pills & Banner */}
                    <div className="space-y-3 w-full pt-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[#1E81FE] bg-[#EBF3FF] border border-[#B2D3FF] px-2 py-0.5 rounded-full">
                          {formData.modality}
                        </span>
                        <span className="text-[10px] font-semibold text-[#5F6673] bg-[#FAFAFC] border border-[#D7DEE7] px-2 py-0.5 rounded-full">
                          {formData.location}
                        </span>
                        <span className="text-[10px] font-semibold text-[#5F6673] bg-[#FAFAFC] border border-[#D7DEE7] px-2 py-0.5 rounded-full">
                          Aberta
                        </span>
                      </div>

                      <div className="bg-[#111317] text-white rounded-xl py-2 px-3 text-center text-xs font-bold flex items-center justify-center gap-1">
                        <span>👉 Candidate-se em:</span>
                        <span className="text-[#66A9FF]">jobz.com.br/vagas</span>
                      </div>
                    </div>

                  </div>

                  {/* Submit Button */}
                  <div className="w-full pt-4">
                    <button
                      type="button"
                      onClick={handleConfirmAndGenerate}
                      disabled={generating || !formData.recipientEmail}
                      className="w-full bg-[#1E81FE] hover:bg-blue-600 text-white font-extrabold text-sm py-4 px-6 rounded-2xl transition-all shadow-lg shadow-[#1E81FE]/30 flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Gerando artes & Enviando e-mail...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          🚀 Confirmar & Disparar Artes por E-mail
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO DE SUCESSO */}
        {showSuccessModal && statusMessage?.type === 'success' && (
          <div className="fixed inset-0 z-50 bg-[#111317]/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#D7DEE7] shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="w-20 h-20 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center mx-auto mb-6 text-[#16A34A] shadow-md shadow-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-extrabold text-[#111317] mb-2">
                {statusMessage.title}
              </h3>
              
              <p className="text-sm text-[#5F6673] font-medium leading-relaxed mb-8">
                {statusMessage.text}
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setStatusMessage(null);
                }}
                className="w-full bg-[#111317] hover:bg-[#1E81FE] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-md"
              >
                Entendido, Ver Outras Vagas
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
