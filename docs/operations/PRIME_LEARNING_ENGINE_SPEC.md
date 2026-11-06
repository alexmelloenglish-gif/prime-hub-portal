# PRIME Learning Engine — Especificação operacional

**Status:** contrato de execução e validação automatizada  
**Atualizado:** 2026-11-06  
**Escopo:** Engine compartilhada, retries, Teacher Authority / GL-003, isolamento de learner e providers.

## 1. Fluxo canônico

A execução parte de uma fonte imutável identificada por Transcript e percorre:

`Transcript` → `PipelineRun` → geração estruturada (Prompt 1–4) → artefatos/propostas → `ValidationTask` de Teacher Authority → G2/G3 → projeções G4/G5 → read-back.

A identidade da fonte, a chave de idempotência, os hashes de conteúdo e as referências de artefatos devem acompanhar a execução. Conteúdo gerado por IA permanece não autoritativo até uma decisão docente explícita. Uma projeção ou rascunho não equivale a publicação canônica.

## 2. Política de retry legado

- O retry legado só pode avançar quando a tentativa mais recente estiver `failed`.
- A nova tentativa cria outro `PipelineRun`, com `attemptNumber = último.attemptNumber + 1`, mesma referência ao Transcript e nova chave idempotente por tentativa.
- A tentativa histórica permanece preservada; o Transcript armazenado é a fonte canônica da retomada.
- Estados `completed`, `processing`, `awaiting_teacher_authority` e `awaiting_publication_review` não criam uma nova tentativa.
- Retry direcionado rejeita um `pipelineRunId` histórico quando já existe tentativa mais nova.

**Prova:** `scripts/pipeline-attempts-self-test.mjs` e `scripts/pipeline-retry-state-witness.ts` (`legacy_failed_to_new_attempt`, `completed_to_duplicate_skip`, `processing_to_no_duplicate`).

## 3. Política de retry compartilhado

- `executionMode = shared_learning_machine` identifica a execução compartilhada.
- `normalizedRunIdentity` é a identidade durável e única da execução; a `idempotencyKey` deve corresponder a ela.
- Retry de uma execução compartilhada falha usa `retryMode = same_execution_resume`: mantém o mesmo `PipelineRun`, `attemptNumber`, Transcript e `normalizedRunIdentity`.
- O claim é condicional no banco (`id`, `status = failed`, `executionMode`). O update precisa atingir exatamente uma linha para vencer. Um concorrente perdedor retorna a execução existente como duplicata; não cria outro `PipelineRun`.
- `resumePoint` é estado durável. O claim não deve apagá-lo, reiniciá-lo nem avançá-lo sem executar o estágio correspondente.
- Transcript órfão (sem PipelineRun) recebe a primeira tentativa no mesmo Transcript, preservando o conteúdo/hash persistido em vez de criar fonte duplicada.

**Prova:** `scripts/pipeline-retry-state-witness.ts`, `scripts/pipeline-attempts-self-test.mjs` e `scripts/shared-learning-machine-behavioral-self-test.mjs`. A witness de PostgreSQL verifica uma linha em `processing`, identidade/chave normalizadas, `resumePoint` preservado e claim concorrente único.

## 4. Teacher Authority e GL-003

A Engine deve produzir e persistir, sem autoridade própria:

1. Proveniência da fonte: tipo, referência estável e hash do conteúdo.
2. Proveniência do provider: provider/modelo, prompt version, request/artifact IDs, status HTTP e tentativas.
3. Artefatos e propostas com referências às evidências de origem.
4. Uma `ValidationTask` do tipo `canonical_learning_record_authority`, vinculada ao `PipelineRun`, inicialmente pendente.
5. Decisão explícita `approved` ou `rejected`, com `reviewerId`, `reviewedAt` e hash do payload de autoridade.
6. Read-back canônico G2/G3 e projeções verificadas G4/G5; a decisão não deve promover propostas não aprovadas.

**Critério GL-003:** fonte rastreável + provider/proveniência + artefatos vinculados + decisão docente registrada + hash/rastreabilidade + read-back. Aprovação docente é uma decisão explícita, não uma inferência do modelo.

**Prova sintética:** `scripts/golden-runtime-witness.ts` e `scripts/golden-runtime-witness-redaction-self-test.mjs`. A witness executa com fixture e provider simulados em PostgreSQL descartável. A decisão é criada diretamente no banco de teste para exercitar a continuação canônica; não representa login OAuth nem sessão autenticada de professor em produção.

## 5. Identidade, perfis e isolamento

- A identidade autenticada vem da sessão NextAuth e do usuário persistido; email não é autoridade de relacionamento.
- O vínculo conta→learner é resolvido por `AccountLearnerRelation` ativa, com validade temporal e `studentId` explícito.
- `LEARNER_SELF`, `AUTHORIZED_ACCESS` e `OTHER_AUTHORIZED` são relações distintas. Relação revogada, ausente ou ambígua não autoriza acesso.
- Múltiplos vínculos sem seleção explícita resultam em `NOT_OBSERVABLE / AMBIGUOUS_RELATION`, nunca em escolha silenciosa.
- Preview de outro learner é uma operação administrativa separada; mutações administrativas exigem sessão e papel admin.

**Prova:** `scripts/student-isolation-witness.ts`, `scripts/g6-account-learner-relation-self-test.mjs` e `scripts/young-learner-access-self-test.mjs`. A witness usa contas e learners sintéticos no PostgreSQL descartável. O formato de sessão é simulado; login Google real e read-back autenticado em produção são validações separadas.

## 6. Providers e fallback

- Gemini é verificado pelo endpoint administrativo protegido `/api/admin/gemini-healthcheck`; o endpoint valida credencial/modelo e resposta, sem expor a chave.
- A pool de modelos tenta somente providers configurados, registra tentativas `skipped/failed/success`, emite `model_provider_attempt_failed` e falha com `all_providers_failed` quando nenhum provider funciona.
- O pipeline persiste `ModelGenerationFailed`, `MODEL_PROVIDER_FAILED` e a lista de tentativas.
- Meet é uma integração operacional separada: exige `CRON_SECRET`, conta Google do organizador e escopo `meetings.space.readonly`. Falhas são registradas como `meet_attendance_cron_failed` e retornam HTTP 503.
- Login de aluno solicita apenas `openid email profile`; autorização de Meet não deve ser solicitada ao estudante.
- Testes de contrato não chamam endpoints externos. Provas de rede são executadas somente em staging/produção por healthchecks protegidos e com credenciais do ambiente.

**Prova:** `scripts/providers-health-self-test.mjs`, `scripts/model-provider-pool-self-test.mjs` e rotas/healthchecks descritos acima.

## 7. Dependências

`npm run audit:prime-engine` executa `npm audit --omit=dev`, gera `artifacts/prime-dependency-audit.md` e falha com findings high/critical. O workflow `PRIME Production Dependency Audit` executa no CI quando package/lockfile mudam e anexa o artefato. Atualizações são realizadas em PR próprio; o script de audit não altera lockfile.

**Ledger:** `docs/operations/PRIME_DEPENDENCIES_LEDGER.md`.

## 8. Gates de aceite

| Frente | Teste/artefato obrigatório | Evidência mínima |
|---|---|---|
| Retry legado | `pipeline-attempts-self-test` + retry-state witness | tentativa 2 criada e anterior preservada; COMPLETED/PROCESSING não duplicam |
| Retry compartilhado | retry-state witness | mesmo id/run/key, resumePoint preservado, um claim concorrente |
| GL-003 | Golden Runtime Witness | fonte/provider/artifact/decisão docente/hash e G2/G3/G4/G5 |
| Isolamento | student-isolation witness + G6/young-learner self-tests | A→A permitido, A→B negado, relação revogada negada, ambiguidade fail-closed |
| Providers | providers-health + model-provider self-tests | healthcheck protegido e falhas visíveis/fail-closed |
| Dependências | audit workflow | ledger/artefato por execução, high/critical tratados |

Nenhuma prova sintética encerra, por si só, uma pendência de operação com dados reais. A ativação de automações e retries de learners reais permanece sujeita ao freeze e ao processo operacional independente.
