# PRIME — Estado das evidências

**Atualizado:** 15/09/2026  
**Finalidade:** ponto de entrada para consultar o que cada piloto acrescenta, quais claims são defensáveis e o que ainda falta verificar. Os casos usam rótulos anonimizados.

## Visão consolidada

| Caso | Contribuição mais forte | Nível de verificação | Limite principal |
| --- | --- | --- | --- |
| Piloto G | Personalização cumulativa documentada: memória de quatro aulas preservada, conectada ao estado atual, prioridades e próxima ação | Portfólio, fontes de aula e snapshots antes/depois inspecionados | Não prova a nova cadeia Candidate/Review/Canonicalization nem impacto causal |
| Piloto V | Captura de fonte real e Candidate assistido persistido em Preview | Código e logs de execução inspecionados; Candidate predefinido | Downstream de autoridade e segundo ciclo não demonstrados |
| Piloto L | Projeção longitudinal com múltiplas aulas, estado/target teacher-validated, prioridades, ação e memória | Admin Preview fornecido + commits canônicos de validação docente | Não prova execução da ação ou novo ciclo |
| Piloto I | Uma aula produz estado inicial contextualizado, prioridades e tarefa estruturada | Admin Preview fornecido | Personalização inicial; não demonstra acúmulo entre aulas |
| Piloto C | Síntese longitudinal cumulativa de múltiplas aulas + próxima ação ligada ao contexto/interesse | Admin Preview fornecido | Não demonstra ciclo sucessivo executado |
| Piloto R | Histórico → estado/prioridade → ação → entradas exibidas em memória | Admin Preview fornecido | Autoria, timestamp, persistência e downstream review não verificados |
| Piloto D | Projeção parcial com contexto, vocabulário e feedback, preservando lacunas de autoridade | Admin Preview fornecido | Priority/action autorizados permanecem incompletos |

A matriz consolidada está em [PILOT_EVIDENCE_MATRIX_CONSOLIDATED_2026-09-15.md](audits/PILOT_EVIDENCE_MATRIX_CONSOLIDATED_2026-09-15.md).

## Piloto G — distinção entre evidência pedagógica e runs históricos

A personalização cumulativa permanece **demonstrada no nível do piloto controlado e mediado pelo professor**, porque os artefatos primários e snapshots antes/depois mostram que evidência anterior permaneceu disponível, alterou a representação atual, informou prioridades e mudou a próxima ação.

Separadamente, três historical `PipelineRun` traces fornecidos depois mostram:

- `processing completed`;
- `evidence 0`;
- `0 persisted candidate refs`;
- `review no_pending_review`;
- `report published/not_proven`;
- attendance explicitamente **NOT PROVEN at the operational run layer**.

Portanto, esses runs demonstram processamento técnico concluído, não a cadeia nova:

**Source → Candidate → Teacher Review → Teacher Decision → Canonicalization → Projection Authorization → Learner-facing Projection**.

Os traces não reduzem a evidência pedagógica já estabelecida; apenas impedem usar o status técnico `completed` como prova do novo Engine E2E.

## Como interpretar `Pipeline` e `Published reports` no Admin

A tela Teacher Intelligence enriquece o diretório com dois campos técnicos vindos do banco:

- **Pipeline** mostra o `status` do `PipelineRun` mais recente encontrado para o aluno;
- **Published reports** conta registros de `ClassReportProjection` com `documentStatus = published`.

Esses rótulos são metadados operacionais/históricos. Portanto:

- `Pipeline: completed` significa que o run técnico mais recente terminou com status `completed`; **não significa**, por si só, teacher review concluído, canonicalização, projeção autorizada, personalização cumulativa ou learning loop fechado;
- `Published reports: N` significa que existem `N` projeções de class report marcadas como publicadas; **não significa** `N` evidências validadas, `N` aulas canônicas completas ou fechamento do Engine;
- `failed` ou `NO DATA` também não provam ausência de memória longitudinal no dashboard atual, porque projeções canônicas podem usar snapshots do repositório independentes do último run histórico.

Código de referência: [`lib/admin-dashboard.ts`](../lib/admin-dashboard.ts) e [`app/dashboard/admin/intelligence/students/page.tsx`](../app/dashboard/admin/intelligence/students/page.tsx).

## O que os novos casos acrescentam

### Piloto L

A projeção longitudinal conecta três aulas, estado atual e target explicitamente validados pelo professor, objetivo/foco, prioridades, ação contextualizada, memória pedagógica e feedback. O caso demonstra continuidade apresentada na interface e sustentada pelo registro canônico; não comprova execução da ação, autoria de tentativa, novo Candidate ou novo ciclo.

### Piloto I

Uma primeira aula é transformada em objetivo profissional específico, prioridades de linguagem e uma ação estruturada. O caso demonstra personalização inicial contextualizada e um baseline acionável; não demonstra ainda personalização cumulativa entre múltiplas interações.

### Piloto C

A projeção sintetiza múltiplas aulas em estado atual, prioridades e uma próxima ação ligada ao contexto forte do aluno. Também preserva memória histórica sem inventar data ou presença. Isso demonstra representação longitudinal cumulativa e personalização da próxima ação, mas não a execução de um ciclo sucessivo.

### Piloto R

A projeção preserva onze presenças e dez relatórios detalhados, explicitando a lacuna quando uma presença não tem report detalhado. A prioridade de reciclagem lexical vira uma atividade concreta, e a interface exibe entradas sob `Your locked sentences`. Isso fortalece a cadeia **histórico → prioridade → ação → memória exibida**, mas Admin Preview não prova autoria autenticada, timestamp, persistência durável, novo Candidate ou revisão posterior.

## Teacher Intelligence — auditoria semântica do runtime

A auditoria do cockpit e do diretório autorizado encontrou uma distinção importante entre verdade operacional e verdade pedagógica.

### O que está correto

- Teacher Intelligence preserva `NOT_PROVEN`/`FAILED` em vez de fabricar Learning State, Signal ou Insight canônico.
- O diretório de alunos passa os perfis pelo boundary `isAuthorizedLearner(...)`, que exige `operatingEligibility = learner` e `activationAuthority` não nulo.
- O conjunto fornecido mostra nove learners autorizados; o prospect sem autoridade de ativação permanece fora do diretório.

### O que precisa de correção semântica

- `Recent lessons` é atualmente o tamanho de `listTeacherLessons(12)`, isto é, os 12 `PipelineRun` mais recentes, não 12 aulas únicas. No estado fornecido, eram 12 attempts do mesmo lesson identity, todos failed.
- `Items needing attention` soma review tasks, evidence, signals, insights e draft reports, mas não runtime failures. Assim pode mostrar `0` enquanto múltiplos `FAILED` aparecem abaixo.
- `Pipeline` significa apenas o status do latest historical `PipelineRun`.
- `Published reports` significa apenas o número de `ClassReportProjection` rows com `documentStatus = published`, não todo o histórico longitudinal do learner.
- O botão `Runtime lessons` em cada card atualmente aponta para a lista genérica de lessons, não para um histórico filtrado por learner.

Correção recomendada: usar `Unique recent lessons` ou `Processing attempts`; renomear `Items needing attention` para `Teacher review items`; acrescentar `Runtime exceptions`; e tornar explícito que `Pipeline`/`Published reports` são metadados de runtime.

Auditoria completa: [TEACHER_INTELLIGENCE_RUNTIME_SEMANTICS_AUDIT_2026-09-15.md](audits/TEACHER_INTELLIGENCE_RUNTIME_SEMANTICS_AUDIT_2026-09-15.md).

## Claims defensáveis agora

- **Piloto G:** “O PRIME demonstra personalização cumulativa documentada em um caso controlado, mediado pelo professor.”
- **Conjunto dos pilotos:** “O PRIME já demonstra representações longitudinais que preservam evidências selecionadas, conectam histórico a prioridades atuais e produzem próximas ações contextualizadas com limites explícitos de autoridade e evidência.”
- **Piloto V:** “Um teste assistido em Preview demonstrou captura de fonte real e persistência de Candidate sob review gating.”
- **Piloto R:** “Uma projeção apresentada conecta evidência longitudinal a uma atividade concreta e a entradas de memória exibidas; autoria e downstream review ainda não foram verificados.”
- **Teacher Intelligence:** “O cockpit preserva falha e incerteza de runtime sem promovê-las automaticamente a verdade pedagógica, embora suas agregações e labels operacionais ainda precisem de correção semântica.”

Esses resultados **não comprovam** capacidade universal, execução completa do Engine, automação full-loop ou impacto causal em motivação, retenção, proficiência ou resultados institucionais.

## O que falta para demonstrar o ciclo completo

**Primeiro percurso:** fonte → Candidate → revisão docente → decisão docente → canonicalização → autorização de projeção → projeção ao aluno.

**Percurso subsequente:** ação autorizada → tentativa real autenticada com autoria/data → novo Candidate → segunda revisão/decisão → estado e próxima ação mantidos ou atualizados com justificativa.

Cada transição precisa de registros vinculados. Trabalho manual ou assistido é compatível com end-to-end; o critério é a evidência da cadeia, não o grau de automação.

## Onde consultar e como atualizar

- [Auditoria detalhada e fontes públicas](audits/PRIME_CLAIM_EVIDENCE_STATUS_2026-09-15.md)
- [Matriz consolidada dos sete pilotos](audits/PILOT_EVIDENCE_MATRIX_CONSOLIDATED_2026-09-15.md)
- [Teacher Intelligence — runtime & UI semantics audit](audits/TEACHER_INTELLIGENCE_RUNTIME_SEMANTICS_AUDIT_2026-09-15.md)
- [Tese de produto](product/PRIME-LEARNING-OS-PRODUCT-THESIS.md)
- [Checkpoint de autoridade](PRIME_CANONICAL_MIGRATION_ARCHITECTURE_CHECKPOINT_2026-09-11.md)
- [PR de documentação #20](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/20)

Ao receber nova evidência, atualizar este resumo e acrescentar a evidência datada à auditoria. Preservar a distinção entre fonte primária, texto fornecido, implementação, execução e impacto. Não reiniciar a investigação nem reduzir um achado verificado a “relato” por falta de contexto. Não publicar contatos, transcrições, frases pessoais ou links privados de alunos.

**Integração:** consulte o estado do PR #20; a existência destes documentos na branch não equivale a merge em `main`.
