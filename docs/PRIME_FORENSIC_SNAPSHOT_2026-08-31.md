# PRIME DIGITAL HUB — FORENSIC SNAPSHOT

## Snapshot operacional e de evidência

**Data:** 31 de agosto de 2026  
**Purpose:** ponto de retorno canônico para evitar retrabalho e impedir que hipóteses históricas sejam tratadas como fatos atuais.  
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

O objetivo atual é somente provar dependências e causalidade antes de uma execução controlada.

---

## 2. NEON — ESTADO FORENSE CONFIRMADO

**Projeto:** `holy-block-04720208` (`neon-sky-forest`)  
**Branch:** `br-cold-cloud-anwml3lu` (`main`)  
**Database:** `neondb`  
**Schema:** `public`

### Tabelas canônicas relevantes

- `pipeline_runs`
- `transcripts`
- `lessons`
- `pipeline_events`
- `evidence_candidates`
- `learning_signal_proposals`
- `teacher_insight_proposals`
- `review_tasks`
- `class_report_projections`
- `portfolio_projections`

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
- **Student:** `lauramgcstemp@gmail.com`
- **sourceFileId:** `1gvkGGRuzn-cHz4rrRVG0sXU_-hND_QKgHnmj2qnL534`
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

A constraint relevante é:

```text
UNIQUE(transcriptId, attemptNumber)
```

Também existe:

```text
UNIQUE(idempotencyKey)
```

Não existe `UNIQUE(lessonId)` em `pipeline_runs`.

A criação de um novo Transcript usando o mesmo `sourceFileId` NÃO é possível devido a:

```text
transcripts_sourceFileId_key
UNIQUE(sourceFileId)
```

Portanto, o caminho correto para o retry é reutilizar o Transcript histórico, não recriá-lo.

### Retry lineage

Não existe atualmente uma relação explícita persistida `retry_of`, `parentRunId`, `replayOf` ou equivalente.

`attemptNumber` permite numerar tentativas, mas não identifica explicitamente o PipelineRun pai.

Isso NÃO bloqueia estruturalmente o retry atual; apenas significa que uma linhagem explícita e auditável exigiria mudança estrutural futura, caso seja requisito.

---

## 4. CAUSALIDADE — REGRAS CANÔNICAS

As seguintes falhas devem permanecer separadas:

- Firebase `UNAUTHENTICATED`
- Drive `ingest_http_500`
- histórico `drive_http_403`
- histórico `invalid_grant`
- Gemini HTTP 403
- defeito/questão de retry ou idempotência

Nenhuma dessas falhas deve ser considerada causa de outra sem evidência runtime específica.

### O que está comprovado

Para os seis históricos auditados:

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

### O que NÃO está comprovado

Não há evidência suficiente para afirmar que:

- Apps Script causou o Gemini 403;
- Firestore causou o Gemini 403;
- `/api/cron/drive-transcripts` causou o Gemini 403;
- `ingest_http_500` histórico causou o Gemini 403;
- `drive_http_403` histórico causou o Gemini 403;
- `invalid_grant` histórico causou o Gemini 403.

---

## 5. APPS SCRIPT — ESTADO DA AUDITORIA

Foram encontrados quatro projetos Apps Script relacionados no Drive.

### Candidato principal

**Nome:** `PRIME Digital Hub — Google Meet Transcript Automation`  
**Script ID:** `1ZCiOyQPRQocSMbAER9c0FelY494I5TTLP639XWdrzmNrSqzbekNIByB5`  
**Owner:** `alexandre@primedigitalhub.com.br`  
**Última modificação observada:** `2026-08-27T14:39:56.912Z`

Outros candidatos encontrados:

- `PRIME Digital Hub Automation`
- `Projeto sem título` — modificado em 18/08
- `Projeto sem título` — modificado em 24/07

### Limitação de acesso

O conteúdo real dos projetos Apps Script, `appsscript.json`, triggers e histórico de execução NÃO puderam ser lidos porque a API disponível não possuía os escopos necessários. A interface web também estava autenticada como `alexmello.english@gmail.com`, enquanto os projetos foram identificados como pertencentes a `alexandre@primedigitalhub.com.br`.

Portanto:

```text
RUNTIME_VERSION = UNKNOWN
TRIGGER_FUNCTION = UNKNOWN
APPS_SCRIPT_CALLS_GEMINI_DIRECTLY = UNKNOWN
APPS_SCRIPT_CALLS_PORTAL_ENDPOINT = UNKNOWN
V8_MIGRATION_REQUIRED = NOT_PROVEN
```

Não alterar runtime, triggers ou código Apps Script com base apenas em hipótese.

---

## 6. PORTAL / VERCEL — CAMINHO DO PROMPT 1

A evidência disponível no repositório indica que a chamada direta ao Gemini ocorre no runtime do portal, não na rota de ingestão em si.

Arquitetura observada:

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

A rota `/api/pipeline/ingest` valida `x-prime-pipeline-secret`, recebe o payload e chama `processLessonTranscript(payload)`.

A camada de prompts é a que realiza a chamada HTTP ao Gemini.

Configuração identificada no código/documentação:

```text
GOOGLE_AI_STUDIO_API_KEY
PRIME_PIPELINE_MODEL
```

O modelo padrão documentado no código auditado é `gemini-3.7-flash`.

**Importante:** isso é evidência do repositório; o valor efetivamente configurado em Production não deve ser presumido sem uma verificação de ambiente/runtime.

---

## 7. DRIVE / INGESTÃO — REGRA PARA O RETRY

O retry direcionado foi desenhado para reconstruir o processamento a partir do Transcript canônico já persistido.

Logo, para o cenário da Laura, a nova tentativa não deve ser conceitualmente tratada como uma nova ingestão de Drive.

Isso significa que um erro atual de:

```text
/api/cron/drive-transcripts
```

não deve ser automaticamente considerado bloqueador do retry histórico, desde que a implementação atual de `retryFailedPipelineRun()` realmente utilize o Transcript persistido e não reexecute a reconciliação do Drive.

Essa última condição deve ser confirmada no código/runtime antes da execução.

---

## 8. FIRESTORE — REGRA DE CAUSALIDADE

O dashboard/admin utiliza Firestore para identidade/perfil do aluno e projeções relacionadas.

Foi observado anteriormente um problema de autenticação Firestore (`UNAUTHENTICATED`).

Neste snapshot, esse erro permanece como **DEPENDÊNCIA A CLASSIFICAR**, não como causa do Gemini 403 histórico.

A pergunta operacional correta antes do retry é:

> `retryFailedPipelineRun()` / `processLessonTranscript()` precisa consultar o diretório Firestore para executar Prompt 1, ou o Firestore está restrito à projeção/admin/dashboard?

Não assumir resposta sem evidência do caminho de execução.

---

## 9. DASHBOARD — EVIDÊNCIA DE PROCESSAMENTO

O Admin Panel atualmente mostra estados de pipeline por aluno e uma seção de atividade recente persistida.

Para os históricos de falha observados, o dashboard mostra `failed`, `report not published` e `Portfolio: not applied`.

Para runs completos, há evidência correspondente de:

```text
completed
report published
Portfolio: applied
```

Isso confirma que a camada de dashboard está refletindo estado persistido do pipeline; não deve ser usada isoladamente para inferir a causa técnica de uma falha.

---

## 10. ESTADO ATUAL DO GL-003

O mecanismo direcionado está publicado, mas a execução continua deliberadamente bloqueada enquanto o pre-flight não concluir todas as dependências críticas.

### Não executar ainda

- não executar retry da Laura;
- não executar GL-003;
- não alterar código;
- não alterar schema;
- não alterar variáveis de ambiente;
- não alterar triggers Apps Script;
- não realizar nova ingestão como substituto do retry;
- não descartar Transcript ou Lesson histórica como inválida.

### Princípio de preservação

Uma falha de processamento no Prompt 1 **não transforma a aula em aula inválida**.

Enquanto o Transcript canônico estiver preservado e o failure estiver localizado, a aula permanece candidata à recuperação pelo mecanismo de retry.

---

## 11. PONTO EXATO DE RETOMADA

A próxima investigação deve começar daqui, sem repetir as auditorias já concluídas:

```text
1. Código atual do retry
   ↓
2. Confirmar exatamente quais funções/serviços ele chama
   ↓
3. Confirmar se reutiliza o Transcript histórico
   ↓
4. Confirmar se Firestore está ou não no caminho crítico
   ↓
5. Confirmar primeiro provider externo chamado pelo retry
   ↓
6. Confirmar configuração/runtime desse provider em Production
   ↓
7. Só então emitir SAFE TO EXECUTE
   ↓
8. Se SAFE = YES, executar UMA única retentativa controlada
```

**Não repetir a descoberta do schema Neon.**  
**Não repetir a auditoria dos seis históricos.**  
**Não recriar Transcript.**  
**Não interpretar o Gemini 403 como erro de Apps Script sem nova evidência.**

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
| Conteúdo/manifesto/triggers Apps Script auditados | **NÃO — acesso insuficiente** |
| Apps Script como causa do Gemini 403 | **NÃO PROVADO** |
| Vercel/portal como executor da chamada Gemini | **SUPORTADO PELO CÓDIGO AUDITADO** |
| Firestore como causa do Gemini 403 | **NÃO PROVADO** |
| Drive ingest como causa do Gemini 403 | **NÃO PROVADO** |
| Laura retry executado | **NÃO** |
| GL-003 executado | **NÃO** |
| Código modificado nesta investigação | **NÃO** |
| Schema modificado nesta investigação | **NÃO** |
| Deployment realizado nesta investigação | **NÃO** |

---

## 13. REGRA FINAL DESTE SNAPSHOT

Este documento é um **checkpoint de retorno**.

Qualquer agente que retome a investigação deve primeiro ler este snapshot e tratar seus fatos confirmados como estado já estabelecido. Não deve refazer buscas ou modificar componentes já auditados sem evidência nova de regressão, mudança de requisito ou contradição verificável.

**STATUS DO SNAPSHOT: LOCKED FOR CONTINUATION**
