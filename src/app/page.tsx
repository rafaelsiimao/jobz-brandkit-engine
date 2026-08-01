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
  FileText,
  Globe,
  Inbox,
  Clock,
  Wallet,
  Gift,
  ListChecks,
  Download,
  ToggleLeft,
  ToggleRight,
  Instagram,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { AblerVacancyItem } from '@/lib/abler-api';
import { JOBZ_LOGO_PNG_BASE64 } from '@/lib/logo-png-base64';
import { AssetUrls } from '@/lib/types';

interface EditFormState {
  title: string;
  contractType: 'CLT' | 'ESTAGIO' | 'PJ';
  schedule: string;
  salary: string;
  benefits: string;
  modality: string;
  location: string;
  recipientEmail: string;
  candidatureType: 'platform' | 'email';
  candidatureEmail: string;
  showRequirements: boolean;
  requirementsList: string;
  previewFormat: 'feed' | 'whatsapp' | 'story';
}

export default function HomePage() {
  const [vacancies, setVacancies] = useState<AblerVacancyItem[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegimeFilter, setSelectedRegimeFilter] = useState<string>('all');

  const [selectedVacancy, setSelectedVacancy] = useState<AblerVacancyItem | null>(null);
  const [formData, setFormData] = useState<EditFormState>({
    title: '',
    contractType: 'CLT',
    schedule: '',
    salary: '',
    benefits: '',
    modality: 'Presencial',
    location: '',
    recipientEmail: '',
    candidatureType: 'platform',
    candidatureEmail: '',
    showRequirements: true,
    requirementsList: 'Ensino Superior Completo • Pacote Office • Boa Comunicação',
    previewFormat: 'feed',
  });

  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; title: string; text: string } | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<AssetUrls | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setFormData((prev) => ({ 
      ...prev, 
      recipientEmail: savedEmail,
      candidatureEmail: savedEmail
    }));
  }, []);

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
      candidatureType: 'platform',
      candidatureEmail: savedEmail,
      showRequirements: true,
      requirementsList: 'Ensino Superior Completo • Conhecimentos na Área • Boa Comunicação',
      previewFormat: 'feed',
    });
  };

  const closePreviewModal = () => {
    if (generating) return;
    setSelectedVacancy(null);
  };

  const handleConfirmAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVacancy || !formData.recipientEmail) return;

    localStorage.setItem('jobz_recipient_email', formData.recipientEmail);

    setGenerating(true);
    setStatusMessage(null);
    setGeneratedAssets(null);

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
            candidatureType: formData.candidatureType,
            candidatureEmail: formData.candidatureEmail,
            showRequirements: formData.showRequirements,
            requirementsList: formData.requirementsList,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGenerating(false);
        setSelectedVacancy(null);
        if (data.assetUrls) {
          setGeneratedAssets(data.assetUrls);
        }
        setShowSuccessModal(true);
        setStatusMessage({
          type: 'success',
          title: 'Artes Geradas com Sucesso! 🚀',
          text: `Suas 3 artes (Feed, WhatsApp e Story) no padrão oficial Jobz Carreira estão prontas para download abaixo e foram enviadas para ${formData.recipientEmail}.`,
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
              <p className="text-xs text-[#5F6673] font-medium">Gerador de Kits de Divulgação de Vagas com Geração Instantânea</p>
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
              <p className="text-sm text-[#5F6673]">Selecione uma vaga para visualizar a prévia em tempo real e personalizar o kit de artes</p>
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
            <div className="bg-white rounded-3xl border border-[#D7DEE7] shadow-2xl max-w-6xl w-full my-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-[#D7DEE7] flex items-center justify-between bg-[#FAFAFC] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1E81FE] flex items-center justify-center text-white font-bold">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111317]">Prévia & Edição Interativa do Card</h3>
                    <p className="text-xs text-[#5F6673]">Edite qualquer campo à esquerda para ver a arte atualizar em tempo real à direita</p>
                  </div>
                </div>

                {!generating && (
                  <button
                    onClick={closePreviewModal}
                    className="p-2 text-[#8A94A3] hover:text-[#111317] hover:bg-[#EBF0F5] rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal Body: Split Screen */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1">
                
                {/* LEFT COLUMN: EDIT FORM */}
                <div className="lg:col-span-6 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-[#D7DEE7] bg-white overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#EBF0F5] pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E81FE] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Campos Editáveis da Arte
                    </span>
                    <span className="text-xs font-mono text-[#8A94A3]">Vaga #{selectedVacancy.id}</span>
                  </div>

                  <form onSubmit={handleConfirmAndGenerate} className="space-y-3.5">
                    {/* Título da Vaga */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                        Título da Vaga (Destaque Principal)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-sm font-bold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all"
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
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#1E81FE]" />
                        {formData.contractType === 'ESTAGIO' ? 'Jornada de Estágio' : 'Jornada de Trabalho'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Salário / Bolsa / Remuneração */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-[#1E81FE]" />
                        {formData.contractType === 'ESTAGIO' ? 'Bolsa' : formData.contractType === 'PJ' ? 'Remuneração' : 'Salário'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Benefícios (Sem truncamento) */}
                    <div>
                      <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-[#1E81FE]" /> Benefícios (Quebra Automática de Linha)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* BLOCO OPCIONAL DE REQUISITOS (TOGGLE ON/OFF) */}
                    <div className="pt-2 border-t border-[#EBF0F5] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#111317] uppercase tracking-wider flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-[#1E81FE]" /> Exibir Requisitos na Arte
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, showRequirements: !formData.showRequirements })}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all border ${
                            formData.showRequirements
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-gray-100 text-gray-500 border-gray-300'
                          }`}
                        >
                          {formData.showRequirements ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" /> LIGADO (ON)
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-gray-400" /> DESLIGADO (OFF)
                            </>
                          )}
                        </button>
                      </div>

                      {formData.showRequirements && (
                        <div className="animate-in fade-in duration-150 pt-1">
                          <label className="block text-[11px] font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                            Requisitos Essenciais (Quebra Automática de Linha)
                          </label>
                          <textarea
                            rows={3}
                            value={formData.requirementsList}
                            onChange={(e) => setFormData({ ...formData, requirementsList: e.target.value })}
                            disabled={generating}
                            placeholder="Ensino Superior Completo • Pacote Office • Boa Comunicação"
                            className="w-full px-3.5 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none transition-all resize-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Modalidade & Localidade */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-[#5F6673] uppercase tracking-wider mb-1">
                          Modalidade
                        </label>
                        <select
                          value={formData.modality}
                          onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                          disabled={generating}
                          className="w-full px-3 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
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
                          className="w-full px-3 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-semibold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* SELEÇÃO DO CANAL DE CANDIDATURA */}
                    <div className="pt-2 space-y-2 border-t border-[#EBF0F5]">
                      <label className="block text-xs font-bold text-[#111317] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Inbox className="w-3.5 h-3.5 text-[#1E81FE]" /> Canal de Recebimento de Candidaturas
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, candidatureType: 'platform' })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            formData.candidatureType === 'platform'
                              ? 'bg-[#111317] text-white border-[#111317] shadow-sm'
                              : 'bg-[#FAFAFC] text-[#5F6673] border-[#D7DEE7] hover:bg-white'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Plataforma Jobz
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, candidatureType: 'email' })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            formData.candidatureType === 'email'
                              ? 'bg-[#1E81FE] text-white border-[#1E81FE] shadow-sm'
                              : 'bg-[#FAFAFC] text-[#5F6673] border-[#D7DEE7] hover:bg-white'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          E-mail Direto
                        </button>
                      </div>

                      {formData.candidatureType === 'email' && (
                        <div className="pt-1 animate-in fade-in duration-150">
                          <label className="block text-[11px] font-bold text-[#1E81FE] uppercase tracking-wider mb-1">
                            E-mail para Receber os Currículos
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.candidatureEmail}
                            onChange={(e) => setFormData({ ...formData, candidatureEmail: e.target.value })}
                            disabled={generating}
                            placeholder="vagas@jobz.com.br"
                            className="w-full px-3.5 py-2 bg-[#EBF3FF] border border-[#B2D3FF] rounded-xl text-xs font-bold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Destinatário do E-mail do Recrutador */}
                    <div className="pt-2 border-t border-[#EBF0F5]">
                      <label className="block text-xs font-bold text-[#1E81FE] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Enviar Cópia do Kit para meu E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        disabled={generating}
                        className="w-full px-3.5 py-2 bg-[#FAFAFC] border border-[#D7DEE7] rounded-xl text-xs font-bold text-[#111317] focus:bg-white focus:border-[#1E81FE] focus:outline-none"
                      />
                    </div>
                  </form>
                </div>

                {/* RIGHT COLUMN: LIVE CARD PREVIEW (STRICT ORDERED FLOW, ZERO OVERLAPPING) */}
                <div className="lg:col-span-6 p-5 sm:p-6 bg-[#E5E9EE] flex flex-col justify-start items-center gap-4 overflow-y-auto">
                  
                  {/* MULTI-FORMAT SELECTOR TABS (ALWAYS TOP, RELATIVE Z-10) */}
                  <div className="w-full space-y-2 shrink-0 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#1E81FE]" /> Prévia Ao Vivo em Multi-Formatos
                      </span>
                      <span className="text-[11px] font-mono text-[#1E81FE] font-bold">Fundo #F1F4F7</span>
                    </div>

                    {/* Format Selector Tabs */}
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-white rounded-2xl border border-[#D7DEE7] shadow-sm">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, previewFormat: 'feed' })}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                          formData.previewFormat === 'feed'
                            ? 'bg-[#1E81FE] text-white shadow-sm'
                            : 'text-[#5F6673] hover:bg-[#FAFAFC]'
                        }`}
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Feed 4:5</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, previewFormat: 'whatsapp' })}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                          formData.previewFormat === 'whatsapp'
                            ? 'bg-[#1E81FE] text-white shadow-sm'
                            : 'text-[#5F6673] hover:bg-[#FAFAFC]'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp 1:1</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, previewFormat: 'story' })}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                          formData.previewFormat === 'story'
                            ? 'bg-[#1E81FE] text-white shadow-sm'
                            : 'text-[#5F6673] hover:bg-[#FAFAFC]'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Story 9:16</span>
                      </button>

                    </div>
                  </div>

                  {/* Simulated Dynamic Live Card Container (No cuts, zero overlapping, full multiline text) */}
                  <div className="w-full flex items-center justify-center py-2 shrink-0 my-auto relative z-0">
                    <div className={`w-full bg-[#F1F4F7] border border-[#D7DEE7] shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                      formData.previewFormat === 'story'
                        ? 'max-w-[285px] aspect-[9/16] p-4 text-xs'
                        : formData.previewFormat === 'whatsapp'
                        ? 'max-w-[360px] aspect-square p-5 text-xs'
                        : 'max-w-[370px] aspect-[1/1.25] p-5 text-xs'
                    }`}>
                      
                      {/* Top Right Blue Accent Corner — 25% do card */}
                      <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-[#1E81FE] rounded-bl-full pointer-events-none" />

                      <div className="space-y-2.5">
                        {/* Logo PNG Oficial */}
                        <div className="flex items-center">
                          <img src={JOBZ_LOGO_PNG_BASE64} className="h-6 w-auto" alt="Jobz Carreira" />
                        </div>

                        {/* Kicker */}
                        <div className="text-[10px] font-mono font-bold text-[#1E81FE] uppercase tracking-wider">
                          {kickerText}
                        </div>

                        {/* Title */}
                        <div className="text-xl font-extrabold text-[#111317] leading-tight line-clamp-2">
                          {formData.title || 'Título da Vaga'}
                        </div>

                        {/* Modalidade Tag */}
                        <div className="pt-0.5">
                          <span className="text-[9px] font-bold text-[#1E81FE] bg-[#EBF3FF] border border-[#B2D3FF] px-2 py-0.5 rounded-full inline-block">
                            {formData.modality || 'Presencial'}
                          </span>
                        </div>

                        {/* Content Rows with Vector Icons */}
                        <div className="space-y-2 pt-0.5">
                          <div>
                            <div className="font-bold text-[#8A94A3] text-[9px] tracking-wider uppercase flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#1E81FE]" /> {labelHoursText}
                            </div>
                            <div className="font-extrabold text-[#111317] pl-4 text-xs break-words">{formData.schedule}</div>
                          </div>

                          <div>
                            <div className="font-bold text-[#8A94A3] text-[9px] tracking-wider uppercase flex items-center gap-1">
                              <Wallet className="w-3 h-3 text-[#1E81FE]" /> {labelFinancialText}
                            </div>
                            <div className="font-extrabold text-[#111317] pl-4 text-xs break-words">{formData.salary}</div>
                          </div>

                          <div>
                            <div className="font-bold text-[#8A94A3] text-[9px] tracking-wider uppercase flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#1E81FE]" /> LOCALIZAÇÃO
                            </div>
                            <div className="font-extrabold text-[#111317] pl-4 text-xs break-words">{formData.location}</div>
                          </div>

                          <div>
                            <div className="font-bold text-[#8A94A3] text-[9px] tracking-wider uppercase flex items-center gap-1">
                              <Gift className="w-3 h-3 text-[#1E81FE]" /> BENEFÍCIOS
                            </div>
                            <div className="font-semibold text-[#111317] pl-4 text-xs break-words leading-snug">{formData.benefits}</div>
                          </div>

                          {formData.showRequirements && formData.requirementsList && (
                            <div className="animate-in fade-in duration-150">
                              <div className="font-bold text-[#8A94A3] text-[9px] tracking-wider uppercase flex items-center gap-1">
                                <ListChecks className="w-3 h-3 text-[#1E81FE]" /> REQUISITOS ESSENCIAIS
                              </div>
                              <div className="font-semibold text-[#111317] pl-4 text-xs break-words leading-snug">{formData.requirementsList}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Dynamic Banner */}
                      <div className="w-full pt-2">
                        {formData.candidatureType === 'email' ? (
                          <div className="space-y-0.5">
                            <div className="bg-[#EBF3FF] border border-[#B2D3FF] text-[#1E81FE] text-[9px] font-bold py-0.5 px-1.5 rounded-md text-center">
                              📄 Aceitamos somente currículos em formato PDF
                            </div>
                            <div className="bg-[#111317] text-white rounded-lg py-1.5 px-2.5 text-center text-[11px] font-bold flex items-center justify-center gap-1">
                              <span>👉 Envie seu CV para:</span>
                              <span className="text-[#66A9FF] truncate">{formData.candidatureEmail || 'vagas@jobz.com.br'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#111317] text-white rounded-lg py-2 px-2.5 text-center text-[11px] font-bold flex items-center justify-center gap-1">
                            <span>👉 Candidate-se em:</span>
                            <span className="text-[#66A9FF]">jobz.com.br/vagas</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full pt-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleConfirmAndGenerate}
                      disabled={generating || !formData.recipientEmail}
                      className="w-full bg-[#1E81FE] hover:bg-blue-600 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#1E81FE]/30 flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Gerando artes instantaneamente...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          🚀 Confirmar & Gerar Kit de Artes
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO COM BOTÕES DE DOWNLOAD DIRETO */}
        {showSuccessModal && statusMessage?.type === 'success' && (
          <div className="fixed inset-0 z-50 bg-[#111317]/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#D7DEE7] shadow-2xl max-w-lg w-full p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center mx-auto mb-4 text-[#16A34A] shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-extrabold text-[#111317] mb-2">
                {statusMessage.title}
              </h3>
              
              <p className="text-xs text-[#5F6673] font-medium leading-relaxed mb-6">
                {statusMessage.text}
              </p>

              {/* 4 INSTANT 1-CLICK DOWNLOAD BUTTONS */}
              {generatedAssets && (
                <div className="space-y-2.5 mb-6 text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E81FE] block text-center mb-2">
                    📥 Download Direto dos Arquivos PNG em 1 Clique
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={generatedAssets.feed}
                      target="_blank"
                      rel="noreferrer"
                      download="jobz-feed.png"
                      className="bg-[#FAFAFC] hover:bg-[#EBF3FF] border border-[#D7DEE7] hover:border-[#B2D3FF] p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-[#111317] hover:text-[#1E81FE] transition-all shadow-sm group"
                    >
                      <Download className="w-4 h-4 text-[#1E81FE] group-hover:scale-110 transition-transform" />
                      <span>Feed (1080x1350)</span>
                    </a>

                    <a
                      href={generatedAssets.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      download="jobz-whatsapp.png"
                      className="bg-[#FAFAFC] hover:bg-[#EBF3FF] border border-[#D7DEE7] hover:border-[#B2D3FF] p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-[#111317] hover:text-[#1E81FE] transition-all shadow-sm group"
                    >
                      <Download className="w-4 h-4 text-[#1E81FE] group-hover:scale-110 transition-transform" />
                      <span>WhatsApp (1080x1080)</span>
                    </a>

                    <a
                      href={generatedAssets.story}
                      target="_blank"
                      rel="noreferrer"
                      download="jobz-story.png"
                      className="bg-[#FAFAFC] hover:bg-[#EBF3FF] border border-[#D7DEE7] hover:border-[#B2D3FF] p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-[#111317] hover:text-[#1E81FE] transition-all shadow-sm group"
                    >
                      <Download className="w-4 h-4 text-[#1E81FE] group-hover:scale-110 transition-transform" />
                      <span>Story (1080x1920)</span>
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setStatusMessage(null);
                  setGeneratedAssets(null);
                }}
                className="w-full bg-[#111317] hover:bg-[#1E81FE] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-md"
              >
                Concluir & Ver Outras Vagas
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
