# PRIME DIGITAL HUB — FORENSIC SNAPSHOT

## Snapshot operacional e de evidência

**Data:** 31 de agosto de 2026  
**Purpose:** ponto de retorno canônico para evitar retrabalho e preservar a separação entre fatos já auditados e ações ainda bloqueadas.  
**Modo:** READ-ONLY / diagnóstico.  
**Regra:** este documento registra o estado conhecido até este ponto; nenhuma conclusão abaixo autoriza execução de retry, alteração de código, schema, ambiente, trigger ou deployment.

---

## 1. ESTADO DA IMPLEMENTAÇÃO DO RETRY

O mecanismo de retry direcionado já está implementado e publicado em Production.

- **Production deployment:** `dpl_51Jfb5ZfhcuhffrWB5R2G4gNzF6c`
- **GitHub SHA:** `43eda9442732887089a85d23111baa320ab04ca1`
- **Endpoint alvo:** `POST /api/admin/pipeline/retry`
- **Cadeia:** `retryFailedPipelineRun()` → `processLessonTranscript()`
- **Regra:** NÃO implementar, refatorar, migrar ou modificar o mecanismo de retry durante esta investigação.
- **Laura:** retry ainda NÃO executado.

---

## 2. NEON — ESTADO FORENSE CONFIRMADO

**Projeto:** `holy-block-04720208` (`neon-sky-forest`)  
**Branch:** `br-cold-cloud-anwml3lu` (`main`)  
**Database:** `neondb`  
**Schema:** `public`

### Integridade histórica

Os seis PipelineRuns auditados permanecem preservados como `failed`, com Transcript, `sourceFileId`, `lessonId`, `idempotencyKey` e evento `GeminiGenerationFailed`.

Todos os seis apresentam:

```text
errorCode = GEMINI_HTTP_ERROR
errorMessage = Gemini request failed with HTTP 403
pipeline event = GeminiGenerationFailed
provider = gemini
stage = prompt-1
httpStatus = 403
```

Todos possuem zero artefatos downstream no momento da auditoria:

```text
EvidenceCandidate = 0
LearningSignal = 0
TeacherInsight = 0
ReviewTask = 0
ClassReport = 0
Portfolio = 0
```

### Laura — registro histórico

- **Historical PipelineRun:** `cmtcqbiy800006cqasv3nsziu`
- **Transcript:** `cmtcqbiyy00026cqafg8r788w`
- **Lesson:** `lesson_a3368991e6ba0c79`
- **Status:** `failed`
- **Error:** Gemini HTTP 403 no Prompt 1
- **EvidenceCandidate:** 0
- **Downstream:** 0

**Historical record intact = YES.**

---

## 3. RETRY / IDEMPOTENCY — O QUE O BANCO PROVA

É estruturalmente possível criar um novo PipelineRun para Laura sem alterar schema, preservando o histórico, desde que o retry:

1. reutilize o Transcript histórico;
2. use novo `id`;
3. use nova `idempotencyKey`;
4. use novo `attemptNumber`.

A criação de um novo Transcript usando o mesmo `sourceFileId` é bloqueada por `UNIQUE(sourceFileId)`.

Não existe `UNIQUE(lessonId)` em `pipeline_runs`.

Não existe atualmente uma relação explícita persistida `retry_of`, `parentRunId`, `replayOf` ou equivalente. `attemptNumber` apenas numera tentativas.

**Conclusão:** o retry estrutural pode preservar o histórico sem migration; linhagem explícita exigiria mudança futura somente se isso se tornar requisito.

---

## 4. CAUSALIDADE — REGRAS CANÔNICAS

As seguintes falhas devem permanecer separadas:

- Firebase `UNAUTHENTICATED`
- Drive `ingest_http_500`
- histórico `drive_http_403`
- histórico `invalid_grant`
- Gemini HTTP 403
- defeito/questão de retry ou idempotência
- Apps Script runtime/trigger errors
- Cloud Billing / Payments restriction

Nenhuma dessas falhas deve ser considerada causa de outra sem evidência runtime específica.

Para os seis históricos, a sequência persistida é:

```text
Transcript recebido/persistido
        ↓
Prompt 1 alcançado
        ↓
Gemini chamado pelo pipeline
        ↓
HTTP 403
        ↓
GeminiGenerationFailed
        ↓
PipelineRun = failed
        ↓
sem artefatos downstream
```

---

## 5. APPS SCRIPT — ESTADO DA AUDITORIA

Projeto candidato principal:

- **Nome:** `PRIME Digital Hub — Google Meet Transcript Automation`
- **Script ID:** `1ZCiOyQPRQocSMbAER9c0FelY494I5TTLP639XWdrzmNrSqzbekNIByB5`
- **Owner:** `alexandre@primedigitalhub.com.br`
- **Última modificação observada:** `2026-08-27T14:39:56.912Z`

Quatro projetos relacionados foram descobertos no Drive.

O conteúdo real do Apps Script, `appsscript.json`, triggers e histórico de execução não pôde ser lido na auditoria anterior por limitação de escopos/autenticação. Portanto, o Apps Script não foi comprovado como causa do Gemini 403.

```text
PROMPT_1_403_CAUSED_BY_APPS_SCRIPT = NOT_PROVEN
```

---

## 6. PORTAL / VERCEL — CAMINHO DO PROMPT 1

A evidência do repositório auditada no SHA `43eda9442732887089a85d23111baa320ab04ca1` estabelece:

```text
entrada externa / Apps Script (se aplicável)
        ↓
/api/pipeline/ingest
        ↓
processLessonTranscript()
        ↓
runPromptOne()
        ↓
lib/pipeline/prompts.ts
        ↓
Gemini generateContent
```

A rota de ingestão valida o segredo de pipeline e chama `processLessonTranscript()`; a chamada direta ao Gemini ocorre posteriormente na camada de geração de prompts.

Configuração identificada no código:

```text
GOOGLE_AI_STUDIO_API_KEY
PRIME_PIPELINE_MODEL
```

O valor efetivamente configurado em Production não deve ser presumido sem verificação de ambiente/runtime.

---

## 7. NOVO CHECKPOINT — GOOGLE CLOUD BILLING / GEMINI ACCESS

Um relatório de auditoria externo foi incorporado ao estado operacional desta investigação.

### Evidência reportada

O healthcheck isolado do Gemini foi reportado como alcançando o provedor e retornando:

```text
HTTP 403
PERMISSION_DENIED
Your project has been denied access. Please contact support.
```

O mesmo relatório registrou uma tentativa de configuração de Cloud Billing que falhou com:

```text
OR_BACR2_59
Unable to complete billing setup.
Unable to configure your account.
```

Também foi reportada a existência de uma conta de billing anterior encerrada e impossibilidade de tratá-la como uma conta ativa disponível para o projeto.

**Estado operacional adotado neste snapshot:**

```text
GOOGLE_CLOUD_BILLING = BLOCKED
BILLING_SETUP = FAILED / OR_BACR2_59
ACTIVE_BILLING_ACCOUNT_FOR_PROJECT = NO
GEMINI_PROVIDER_ACCESS = FAIL
CURRENT_GEMINI_RESULT = 403 PERMISSION_DENIED
```

### Segurança de registro

Este repositório é público. **Não registrar neste snapshot números completos ou identificadores financeiros sensíveis, dados de cartão, CVV, tokens, chaves de API ou segredos.** Os detalhes financeiros do relatório externo devem permanecer apenas no ambiente privado apropriado/Console de Billing.

### Causalidade

O estado de Billing/Gemini é agora o **bloqueio operacional atual reportado**, mas deve continuar separado dos seis erros históricos de Apps Script, Drive, Firestore e retry. O código histórico prova o Gemini 403; o relatório de Billing fornece a evidência operacional atual que deve ser resolvida antes de qualquer retry.

---

## 8. DRIVE / INGESTÃO — REGRA PARA O RETRY

O retry direcionado foi desenhado para reconstruir o processamento a partir do Transcript canônico já persistido.

Portanto, um erro atual em `/api/cron/drive-transcripts` não deve ser automaticamente considerado bloqueador do retry histórico, desde que o caminho efetivo de `retryFailedPipelineRun()` continue reutilizando o Transcript persistido.

Essa condição deve ser confirmada no código/runtime antes da execução.

---

## 9. FIRESTORE — REGRA DE CAUSALIDADE

O erro histórico `UNAUTHENTICATED` do Firestore permanece separado do Gemini 403.

Antes do retry, deve ser confirmado se `retryFailedPipelineRun()` / `processLessonTranscript()` consulta Firestore no caminho crítico ou se Firestore é restrito à projeção/admin/dashboard.

Não inferir causalidade sem evidência do caminho de execução.

---

## 10. ESTADO OPERACIONAL ATUAL

```text
APPS SCRIPT = NÃO PROVADO COMO CAUSA DO 403
NEON HISTORICAL RECORDS = PRESERVADOS
RETRY IMPLEMENTATION = JÁ PUBLICADO
GEMINI HEALTHCHECK = 403 / PERMISSION_DENIED
GOOGLE CLOUD BILLING = BLOQUEADO

LAURA RETRY = NÃO EXECUTADO
GL-003 = NÃO EXECUTADO
FULL PIPELINE = BLOQUEADO
```

### O que NÃO fazer agora

- não executar retry da Laura;
- não executar GL-003;
- não alterar código;
- não alterar schema;
- não alterar variáveis de ambiente sem novo gate autorizado;
- não alterar triggers Apps Script;
- não realizar nova ingestão como substituto do retry;
- não recriar Transcript;
- não descartar Transcript ou Lesson histórica como inválida;
- não criar repetidamente novas contas de Billing enquanto o bloqueio administrativo não estiver resolvido.

---

## 11. PONTO EXATO DE RETOMADA

A investigação deve continuar **a partir do bloqueio de Billing/Gemini**, sem repetir as auditorias Neon já concluídas.

```text
1. Resolver / esclarecer Cloud Billing / Payments restriction
        ↓
2. Confirmar Billing account ACTIVE e utilizável pelo projeto
        ↓
3. Confirmar acesso permitido ao Gemini
        ↓
4. Validar o healthcheck mínimo do Gemini
        ↓
5. Confirmar configuração Production do provider/model
        ↓
6. Completar pre-flight do retry
        ↓
7. Somente se SAFE = YES, executar UMA única retentativa controlada da Laura
```

Até o passo 4 passar, não executar Laura nem GL-003.

---

## 12. CHECKPOINT CANÔNICO

| Item | Estado |
|---|---|
| Histórico dos seis runs preservado | **CONFIRMADO** |
| Transcript da Laura preservado | **CONFIRMADO** |
| Falha histórica Prompt 1 / Gemini 403 | **CONFIRMADO** |
| Artefatos downstream dos seis históricos | **0** |
| Retry estrutural sem migration | **CONFIRMADO** |
| Novo Transcript com mesmo sourceFileId | **BLOQUEADO por UNIQUE(sourceFileId)** |
| Retry lineage explícito `retry_of` | **NÃO EXISTE** |
| Apps Script encontrado | **SIM** |
| Apps Script como causa do Gemini 403 | **NÃO PROVADO** |
| Chamada Gemini no portal/Vercel | **SUPORTADA PELO CÓDIGO AUDITADO** |
| Firestore como causa do Gemini 403 | **NÃO PROVADO** |
| Drive ingest como causa do Gemini 403 | **NÃO PROVADO** |
| Gemini healthcheck | **403 / PERMISSION_DENIED** |
| Cloud Billing setup | **BLOQUEADO / OR_BACR2_59** |
| Active Billing utilizável pelo projeto | **NÃO DISPONÍVEL NO RELATÓRIO AUDITADO** |
| Laura retry executado | **NÃO** |
| GL-003 executado | **NÃO** |
| Código modificado nesta investigação | **NÃO** |
| Schema modificado nesta investigação | **NÃO** |
| Deployment realizado nesta investigação | **NÃO** |

---

## 13. REGRA FINAL DESTE SNAPSHOT

Este documento é um **checkpoint de retorno**.

Qualquer agente que retome a investigação deve primeiro ler este snapshot e tratar os fatos aqui registrados como estado já estabelecido. Não deve refazer buscas Neon/Idempotency já concluídas, não deve modificar componentes já auditados e não deve executar retry apenas porque o banco estruturalmente permite fazê-lo.

**STATUS DO SNAPSHOT: LOCKED FOR CONTINUATION — BILLING/GEMINI BLOCKER**
