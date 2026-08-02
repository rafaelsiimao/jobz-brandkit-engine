# Especificação do Projeto: Automação de Abertura de Vagas na Abler com Intake Conversacional (Estilo Chat/WhatsApp)

## 1. Visão Geral do Projeto

O objetivo deste projeto é automatizar completamente o fluxo de abertura e formalização de vagas para os clientes da Jobz. 

Hoje, o cliente preenche um dos 4 formulários desconectados no WordPress (Fluent Forms), o qual envia um PDF por e-mail para que uma colaboradora preencha manualmente o cadastro na plataforma **Abler**.

Com esta automação:
1. O cliente interage com uma **Interface Conversacional estilo Chat (inspiração WhatsApp)** hospedada na **Vercel** ou via atendimento direto no WhatsApp.
2. O **n8n** consulta o **Agendor CRM** pelo CNPJ/E-mail do cliente, eliminando o retrabalho de preencher dados cadastrais repetidos.
3. Se for um cliente novo, o sistema coleta os dados cadastrais e registra automaticamente no Agendor CRM e na Abler.
4. A **IA (OpenAI/Claude)** analisa o briefing ou anexo (PDF/Word/Texto bruto), gerando descrições polidas e organizadas em HTML para os campos oficiais da Abler.
5. O briefing original do cliente é preservado em uma nota interna na timeline da vaga.
6. A vaga é criada na **Abler API V2** com status de **Rascunho (`draft`)** ou **Aguardando Aprovação (`waiting_approval`)**.
7. A colaboradora interna recebe um alerta para apenas revisar e publicar a vaga no painel nativo da Abler.

---

## 2. Arquitetura da Solução

```
 ┌─────────────────────────────────────────────────────────┐
 │   Frontend Conversacional (Vercel) / WhatsApp Bot      │
 └────────────────────────────┬────────────────────────────┘
                              │ Webhook HTTP (JSON / FormData)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   Orquestrador n8n                      │
 └──────┬─────────────────────┬───────────────────┬────────┘
        │                     │                   │
        ▼                     ▼                   ▼
┌──────────────┐     ┌──────────────────┐  ┌──────────────┐
│ Agendor CRM  │     │ IA Engine        │  │  Abler API   │
│ (Busca/Criar │     │ (Formatting &    │  │ (Vacancies & │
│ Cliente)     │     │  HTML structuring│  │  Customers)  │
└──────────────┘     └──────────────────┘  └──────────────┘
                                                  │
                                                  ▼
                                     ┌────────────────────────┐
                                     │ Notificação Equipe    │
                                     │ (Rascunho Pronto)      │
                                     └────────────────────────┘
```

---

## 3. Componentes do Sistema

### 3.1. Frontend Conversacional (Vercel - Web App Chat)
- **Tecnologia**: React / Next.js com Vanilla CSS/Tailwind.
- **Design/UX**: Interface inspirada na experiência do WhatsApp (balões de mensagem, indicação de digitação, botões de resposta rápida, upload de arquivos).
- **Recursos**:
  - Suporte a parâmetros na URL: `vagas.jobz.com.br?cnpj=12345678000199` ou `?agendor_id=xyz` (Link Mágico).
  - Reconhecimento dinâmico da empresa assim que o CNPJ é informado.
  - Fluxo adaptativo (Vaga CLT/PJ, Vaga Estágio, Formalização de Estágio).
  - Permite envio de anexos (PDF/Doc) ou digitação de texto bruto.

### 3.2. Integração com Agendor CRM (n8n)
- **Endpoint**: Busca de empresas por CNPJ ou E-mail na API do Agendor.
- **Lógica**:
  - **Encontrado**: Extrai Razão Social, Nome Fantasia, Endereço, Contato RH e Contato Financeiro.
  - **Não Encontrado**: O chat solicita os dados cadastrais mínimos e o n8n cria o registro no Agendor CRM.

### 3.3. Motor de Inteligência Artificial (n8n + OpenAI/Claude)
- **Entrada**: Briefing digitado, arquivo PDF/Word enviado, ou respostas rápidas do chat.
- **Processamento**:
  - Gera `title` da vaga padronizado.
  - Gera `description` estruturada em HTML.
  - Extrai `mandatory_requirements` (HTML list) e `desirable_requirements` (HTML list).
  - Mapeia faixa salarial, carga horária, modalidade (Presencial/Híbrido/Remoto).
  - **Preservação de Contexto**: Mantém o texto original do cliente separado para a nota interna.

### 3.4. Integração com Abler API V2
- **Autenticação**: Header `X-API-INT-TOKEN`.
- **Fluxo de Chamadas HTTP**:
  1. `POST /api/company/v1/customers` (Se cliente for novo na Abler).
  2. `POST /api/company/v1/vacancies` com `form: process_data` (Status inicial: `draft` ou `waiting_approval`).
  3. `PATCH /api/company/v1/vacancies/{id}` com `form: role_description`.
  4. `PATCH /api/company/v1/vacancies/{id}` com `form: journey_remuneration`.
  5. `PATCH /api/company/v1/vacancies/{id}` com `form: mobility_location`.
  6. `PATCH /api/company/v1/vacancies/{id}` com `form: acquirements`.
  7. `POST /api/company/v1/vacancies/{id}/add_occurrence`: Adiciona nota na timeline com o **Briefing Original do Cliente**.

### 3.5. Notificação de Revisão Humanizada
- Envio de alerta imediato por E-mail / WhatsApp / Slack para a colaboradora responsável:
  > *"🎉 Nova vaga para **[Razão Social]** criada como Rascunho na Abler!\n\n📌 **Cargo**: [Título do Cargo]\n🔗 **Link Abler**: https://hulk-smash.abler.com.br/vacancies/[ID]\n\nRevise as informações e clique em publicar!"*

---

## 4. Tratamento de Erros e Casos Limite

- **CNPJ Inválido ou Não Digitado**: Validação nativa com máscara de CNPJ/CPF no frontend + consulta à API de Receita se for cliente novo.
- **Falha na Leitura do PDF de Briefing**: Se o cliente enviar um PDF corrompido ou protegido, a IA notifica o n8n e o chat solicita que o cliente cole o texto diretamente.
- **Falha/Timeout na API da Abler**: O n8n tenta 3 re-tentativas (retry loop). Em caso de erro persistente, notifica a equipe interna com o JSON consolidado.

---

## 5. Plano de Verificação e Testes

### Automated Tests / API Testing
- Teste de chamadas n8n mockando payload do Agendor CRM.
- Teste de requisição `POST` e `PATCH` na Abler Staging (`https://hulk-smash.getabler.com`).
- Validação de retorno das rotas com token `X-API-INT-TOKEN`.

### Manual Verification
- Teste do fluxo completo no frontend conversacional na Vercel.
- Verificação da criação do Rascunho no painel da Abler.
- Verificação da notificação enviada à colaboradora.
