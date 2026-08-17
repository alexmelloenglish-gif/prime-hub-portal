# PRIME Digital Hub — Fluxo completo: Google Meet → transcript → dashboard

**Versão:** 1.0  
**Data:** 17 de agosto de 2026  
**Produto student-facing:** dashboard do aluno  
**Professor autorizado:** Alexandre Mello (`alexandre@primedigitalhub.com.br`)

## 1. Resposta direta

Depois que uma aula termina no Google Meet e o transcript é gerado, o transcript **não vai diretamente para o dashboard**. Ele entra em um fluxo controlado por estados, no qual a inteligência artificial produz propostas, os serviços autorizados persistem evidências e projeções, e o professor ou administrador realiza as aprovações humanas antes de qualquer informação se tornar oficial ou visível ao aluno.

A cadeia correta é:

```text
Google Meet encerra a aula
        ↓
Transcript é disponibilizado no Drive/Docs
        ↓
Scanner encontra o transcript e identifica a aula
        ↓
Ingestão segura e idempotente no pipeline
        ↓
Prompt 1: extração e propostas não oficiais
        ↓
VALIDAÇÃO HUMANA 1: identidade, aula, fontes e evidências
        ↓
Serviço de evidências e sinais valida os registros aceitos
        ↓
VALIDAÇÃO HUMANA 2: sinais e Teacher Insight
        ↓
Prompt 2: Class Report em rascunho
        ↓
VALIDAÇÃO HUMANA 3: publicação do Class Report
        ↓
Prompt 3: patch idempotente de projeção do portfólio
        ↓
VALIDAÇÃO HUMANA 4: aprovação da atualização da projeção
        ↓
Prompt 4: recomendação de coaching para o professor
        ↓
VALIDAÇÃO HUMANA 5: decisão sobre a orientação pedagógica
        ↓
Serviços autorizados atualizam PostgreSQL/Firestore
        ↓
Dashboard mostra somente projeções aprovadas
```

O Google Docs do portfólio pode servir como fonte interna de conteúdo e evidência, mas **não é o produto entregue ao aluno**. O produto é o dashboard. O GitHub publica código; ele não deve ser necessário para que uma nova aula aprovada apareça no dashboard.[1]

## 2. O que acontece imediatamente após a aula

### Etapa 0 — A aula termina e o transcript nasce

O professor realiza a aula no Google Meet. Ao final, o Google Meet disponibiliza o transcript conforme a configuração da conta e da reunião. O transcript precisa conservar, no mínimo, um identificador externo, a data/horário, a referência da reunião, o estudante associado e o conteúdo textual. Quando a API do Meet for utilizada, as entradas de transcript devem permanecer rastreáveis ao registro da conferência e às respectivas fontes.[3]

O transcript original é um **registro bruto**. Ele não é ainda uma aula validada, um relatório oficial, uma decisão pedagógica ou uma atualização do progresso do aluno.

### Etapa 1 — Scanner do Drive localiza o transcript

Um scanner automatizado consulta a pasta configurada do Google Drive em intervalos regulares ou por um mecanismo de notificação seguido de reconciliação. O scanner procura documentos novos ou modificados, aplica o filtro de origem esperado e extrai os metadados necessários.

Antes de encaminhar o conteúdo, o scanner verifica:

| Verificação | Objetivo |
|---|---|
| Documento pertence à pasta autorizada | Evitar ingestão de material não relacionado. |
| Transcript possui identificador externo | Permitir rastreabilidade e deduplicação. |
| Student email/ID pode ser mapeado | Impedir que o conteúdo seja atribuído ao aluno errado. |
| Professor e programa são conhecidos | Preservar autoria e contexto. |
| Data da aula é identificável | Ordenar a progressão e impedir registros deslocados. |
| Conteúdo não foi processado anteriormente | Evitar duplicidade. |

Se a identidade do estudante não puder ser determinada com segurança, o item vai para **BLOCKED / NEEDS_MAPPING**. Ele não deve ser enviado para processamento como se a identidade fosse conhecida.

## 3. Ingestão segura e idempotente

### Etapa 2 — O transcript entra no endpoint de ingestão

O scanner envia uma requisição `POST` para o endpoint seguro de ingestão. Em produção, a requisição precisa conter o segredo de ingestão no header configurado, por exemplo `x-prime-pipeline-secret`. O endpoint valida o JSON, exige `lessonId`, `studentEmail` e `transcript`, normaliza o email e define a origem como `google_meet` quando apropriado.

A primeira operação de negócio é criar ou localizar um `PipelineRun`. A chave de idempotência é baseada no email normalizado, no identificador estável da aula e no transcript ou identificador externo da reunião:

```text
normalizedStudentEmail : lessonId : transcriptId/externalMeetingId
```

Se o mesmo transcript for enviado duas vezes, o segundo envio deve retornar um resultado de duplicidade ou no-op. Ele não pode criar uma segunda aula, segundo relatório, segundo patch ou segundo conjunto de evidências.

O sistema grava:

| Registro | Conteúdo |
|---|---|
| `PipelineRun` | Identidade do processamento, estado, chave de idempotência e erros. |
| `Transcript` | Texto bruto, origem, student email, lesson ID, datas e metadados. |
| `PipelineEvent` | Eventos de auditoria da execução. |

O estado passa de `RECEIVED` para `PROCESSING`. O transcript original permanece preservado; nenhuma etapa posterior deve substituí-lo por um resumo produzido pela IA.

## 4. Prompt 1 — extração, nunca autoridade

### Etapa 3 — Prompt 1 analisa o transcript

O Prompt 1 recebe o transcript e os metadados da aula. Ele pode:

- organizar observações;
- propor `Evidence Candidates` com trechos rastreáveis;
- propor `Learning Signal Proposals` baseadas em referências de evidência;
- propor `Teacher Insight Proposals`;
- produzir candidatos de vocabulário, gramática e fatos para apresentação;
- apontar possíveis transições como sugestões.

O Prompt 1 **não pode**:

- validar evidência;
- declarar presença com base apenas no texto;
- publicar Teacher Insight;
- criar uma decisão pedagógica;
- executar uma ação educacional;
- alterar SER, Learning Journey ou Institutional Memory;
- mutar o perfil Firestore;
- alterar o dashboard;
- declarar que um evento de domínio ocorreu.

A saída obrigatória permanece semelhante a:

```json
{
  "artifact_status": "draft",
  "authority_status": "non_authoritative",
  "implementation_status": "not_proven",
  "teacher_insight_proposals": [
    {
      "is_official": false,
      "requires_human_review": true,
      "author_type": "ai"
    }
  ]
}
```

O resultado é armazenado como artefato e propostas. O estado operacional passa para `PROPOSALS_READY` e depois para `AWAITING_REVIEW`.

> **Regra principal:** o fato de o Prompt 1 ter escrito algo não transforma aquilo em fato oficial.

## 5. Validação humana 1 — identidade, aula e evidências

Esta é a primeira entrada obrigatória do professor ou administrador no painel interno de revisão. O revisor não deve editar JSON bruto. Ele recebe um cartão de revisão com:

- transcript e link de origem;
- aluno identificado;
- data, lesson ID e reunião;
- trechos de suporte no transcript;
- candidatos de evidência;
- origem da presença, se houver;
- confiança e avisos de ambiguidade;
- possíveis problemas de identidade ou duplicidade.

O revisor realiza três decisões separadas:

| Decisão humana | Estados possíveis | Efeito |
|---|---|---|
| Confirmar identidade e contexto | `accepted` ou `blocked` | Permite ou bloqueia a continuidade. |
| Aceitar/rejeitar Evidence Candidate | `accepted` ou `rejected` | Cria evidência disponível para validação; não publica dashboard por si só. |
| Confirmar presença | `validated`, `rejected` ou `unknown` | Somente fonte autorizada pode gerar presença oficial. |

A presença nunca deve ser inferida do transcript. Se não existir um registro autorizado de attendance, o sistema deve manter `unknown`, `null` ou `proposed`; não deve transformar frases como “até a próxima aula” em presença confirmada.

Cada ação humana grava:

```text
reviewer_id
reviewer_role
reviewed_at
previous_state
next_state
reason
source_pipeline_run_id
source_transcript_id
selected_evidence_ids
```

Se houver dúvida, o revisor seleciona **Return for revision** ou **Block**. O pipeline não deve avançar silenciosamente.

## 6. Validação de evidências e Learning Signals

### Etapa 4 — Serviços autorizados transformam aceites em registros válidos

Depois da decisão humana, um serviço de evidências persiste os candidatos aceitos como evidência validada. Um serviço de Learning Signals pode então verificar se cada sinal possui pelo menos uma referência de evidência aceita.

O fluxo correto é:

```text
EvidenceCandidate
        ↓ decisão humana
EvidencePersisted / EvidenceRejected
        ↓ serviço de validação
LearningSignalValidated / LearningSignalRejected
```

A IA pode ajudar a organizar ou justificar, mas não pode substituir o evento de validação humana. A relação deve ser rastreável:

```text
Learning Signal → Evidence IDs → Transcript ID → Pipeline Run ID
```

## 7. Validação humana 2 — Teacher Insight

### Etapa 5 — Professor decide se o insight pode ser oficial

O Prompt 1 pode sugerir um Teacher Insight, mas o insight começa como:

```text
status = proposed
is_official = false
requires_human_review = true
```

O professor analisa o texto, as evidências de suporte e a formulação pedagógica. Ele pode:

- publicar o insight;
- rejeitar o insight;
- devolver para revisão;
- editar dentro da interface autorizada, mantendo a proveniência.

Somente depois de uma decisão explícita o registro pode assumir algo equivalente a:

```text
teacher_insight.state = InsightPublished
validation_event_id = <evento da aprovação>
```

Um insight não publicado não pode ser apresentado pelo Prompt 2 como feedback oficial do professor.

## 8. Prompt 2 — Class Report em rascunho

### Etapa 6 — Geração do relatório da aula

O Prompt 2 recebe exclusivamente:

- fatos autorizados da aula;
- evidências validadas;
- sinais validados;
- conteúdo de aprendizagem validado;
- Teacher Insight publicado, quando existir;
- referências de origem;
- contexto de aluno, professor, data e lesson ID.

Ele não deve receber propostas ainda não validadas como se fossem fatos. O Class Report é uma **projeção documental**, não uma nova fonte de verdade do domínio.

O resultado inicial deve ser:

```text
documentStatus = draft
authorityStatus = non_authoritative
implementationStatus = not_proven
promptVersion = prompt-2.v2.0
```

O relatório pode conter resumo, destaques de evidência, gramática, vocabulário, correções e recomendações de estudo. Ele não pode inventar presença, mudança de nível, progresso oficial, atualização de portfólio ou evento de domínio.

## 9. Validação humana 3 — publicação do Class Report

### Etapa 7 — Professor revisa o relatório antes de torná-lo student-facing

O professor vê o Class Report em modo de pré-visualização e compara:

- resumo com as evidências aceitas;
- vocabulário e correções com o transcript;
- presença com a fonte autorizada;
- Teacher Insight com o insight publicado;
- recomendações com o que realmente foi trabalhado;
- links e identidade do estudante.

O professor seleciona:

| Ação | Resultado |
|---|---|
| **Publish Class Report** | `documentStatus = published`; o relatório pode alimentar a projeção student-facing. |
| **Return for revision** | O relatório continua `draft`; nenhuma publicação ocorre. |
| **Reject** | O relatório não é usado como conteúdo oficial. |

A publicação precisa gerar um evento de auditoria que relacione o report ID, a versão do relatório, o reviewer ID e a execução do pipeline.

## 10. Prompt 3 — patch de projeção, não mutação de domínio

### Etapa 8 — Prompt 3 produz uma operação idempotente

Depois de o Class Report estar autorizado para publicação, o Prompt 3 recebe o relatório e os registros autorizados. Ele produz um `PortfolioProjectionPatch` com:

- `operation_id`;
- `operation_key`;
- `base_projection_version`;
- `expected_projection_version`;
- `source_references`;
- precondições;
- operações idempotentes;
- operações excluídas por falta de autoridade.

O Prompt 3 pode descrever, por exemplo, uma referência ao Class Report publicado, um novo item de vocabulário ou uma correção autorizada. Ele não pode criar SER, Learning Journey, decisão pedagógica, ação educacional ou verdade de domínio.

O serviço determinístico que aplica o patch deve verificar:

1. se a versão atual é igual a `base_projection_version`;
2. se `operation_key` já foi aplicada;
3. se a operação tem fonte autorizada;
4. se a operação é idempotente;
5. se o histórico será preservado;
6. se o novo estado mantém integridade referencial.

## 11. Validação humana 4 — aprovação da projeção do dashboard

### Etapa 9 — Professor aprova o conjunto de mudanças

Antes de o patch alterar a projeção que abastece o dashboard, o professor visualiza uma comparação:

```text
Estado anterior → Alterações propostas → Estado posterior
```

A tela deve mostrar, por exemplo:

| Item | Antes | Proposto | Fonte | Decisão |
|---|---|---|---|---|
| Class report | Ausente | Report da lesson X | Report publicado | Aprovar/rejeitar |
| Vocabulário | 12 itens | +3 itens | Evidências validadas | Aprovar/rejeitar |
| Correção | Histórico anterior | +1 correção | Evidence IDs | Aprovar/rejeitar |
| Attendance | 10 aulas | Sem alteração | Fonte autorizada ausente | Não inferir |

O professor seleciona **Approve projection patch** ou **Reject / return for revision**. Somente o serviço determinístico, após a aprovação, executa a transação no PostgreSQL/Prisma. Nenhum botão deve escrever JSON arbitrário diretamente no Firestore.

Após a aplicação, o serviço registra:

```text
projection_version anterior
projection_version nova
operation_key
patch_id
applied_at
approved_by
source_run_id
```

Se a versão mudou entre a revisão e a aplicação, o patch é rejeitado por conflito de versão e precisa ser revisado novamente. Ele não deve sobrescrever o trabalho mais recente.

## 12. Prompt 4 — recomendação interna, nunca decisão

### Etapa 10 — Prompt 4 produz coaching recommendation

O Prompt 4 recebe somente conteúdo autorizado e publicado:

- Evidence em estado persistido;
- Learning Signals validados;
- Teacher Insight publicado;
- Class Report publicado ou projeção autorizada;
- contexto do aluno e do professor;
- referências rastreáveis.

Ele produz uma recomendação interna para consideração do professor. O resultado permanece:

```text
recommendationStatus = ai_proposed
authority = recommendation_only
requiresTeacherDecision = true
educationalActionCreated = false
```

O Prompt 4 não pode diagnosticar definitivamente, alterar nível, criar decisão pedagógica, executar ação educacional, alterar SER, alterar Learning Journey ou publicar algo diretamente no dashboard.

## 13. Validação humana 5 — decisão sobre coaching

### Etapa 11 — Professor aceita, edita ou rejeita a recomendação

O professor examina a recomendação e suas bases. Ele pode:

- aceitar como orientação interna;
- editar a redação;
- rejeitar;
- devolver para nova análise;
- transformar a recomendação em uma decisão pedagógica por meio do fluxo autorizado, caso essa função exista e seja explicitamente registrada.

A aceitação de uma recomendação **não deve ser confundida** com a execução de uma ação educacional. Se o professor quiser criar uma tarefa ou mudança oficial, deve existir um serviço e um registro de decisão separados.

A recomendação aprovada pode aparecer na área autorizada do professor. Ela não deve se tornar automaticamente uma afirmação oficial ou uma mudança de domínio no perfil do aluno.

## 14. Publicação final no dashboard

### Etapa 12 — Projeções aprovadas tornam-se visíveis

Depois das aprovações necessárias, os serviços autorizados atualizam as fontes corretas:

| Conteúdo | Fonte de publicação |
|---|---|
| Identidade, perfil e links do aluno | Firestore `students/{documentId}` |
| Transcript bruto | PostgreSQL `Transcript`; não é conteúdo oficial por padrão. |
| Evidência e sinais | Registros de evidência/sinais com estados de validação. |
| Class Report | `ClassReportProjection` publicado. |
| Progresso longitudinal | `PortfolioProjection` atualizado com versão e operação idempotente. |
| Coaching | `CoachingGuidance` aprovado na área autorizada. |
| Código da aplicação | GitHub e deployment Vercel; não é necessário para cada aula aprovada. |

O dashboard lê o perfil canônico do aluno e as projeções aprovadas. Ele não deve renderizar o Prompt 1 bruto nem um fallback com dados de outro aluno.

Para Rafael, o dashboard deve resolver o perfil correto e preservar os dez registros históricos. Para Louise, o dashboard deve resolver o documento correto, respeitar o alias de email necessário e mostrar apenas seus próprios links e conteúdo. Se Firestore estiver indisponível, o fallback deve ser neutro ou student-specific; nunca pode exibir os seis registros antigos do Rafael para Louise.

## 15. Estados completos da execução

A execução aceita deve seguir uma máquina de estados semelhante a esta:

```text
RECEIVED
  ↓
PROCESSING
  ↓
PROPOSALS_READY
  ↓
AWAITING_REVIEW
  ↓
EVIDENCE_VALIDATED
  ↓
INSIGHT_PUBLISHED ou INSIGHT_OMITTED
  ↓
REPORT_DRAFTED
  ↓
REPORT_PUBLISHED
  ↓
PROJECTION_PATCH_DRAFTED
  ↓
PROJECTION_APPLIED
  ↓
COACHING_REVIEW
  ↓
PUBLISHED / TEACHER_VISIBLE
```

Os caminhos de falha são explícitos:

```text
PROCESSING → FAILED → RETRYABLE ou BLOCKED
AWAITING_REVIEW → REJECTED → REVISION_REQUIRED
PROJECTION_DRAFTED → VERSION_CONFLICT → REVIEW_REQUIRED
```

Nenhum erro deve ser mascarado por um fallback que pareça uma publicação válida.

## 16. O que o professor verá na prática

Em uma operação normal, o professor não precisa editar arquivos JSON, entrar no Cloud Shell, copiar uma chave Firebase ou fazer commit no GitHub para publicar uma aula. Ele deve abrir a fila interna e ver um cartão semelhante a este:

```text
Student: Rafael Copolillo
Lesson: 2026-08-17
Transcript: meet-transcript-abc123
Pipeline run: run-xyz789
Status: Awaiting human review

[1] Evidence candidates: 8
[2] Attendance source: not supplied / unknown
[3] Teacher insight: proposed, not official
[4] Class report: draft
[5] Portfolio patch: draft, base version 10
[6] Coaching: recommendation only
```

As decisões aparecem em ordem. O professor confirma a identidade e as evidências, publica ou rejeita o insight, revisa o Class Report, aprova ou rejeita as mudanças de projeção e decide o que fazer com o coaching. O sistema impede avanço quando uma decisão anterior obrigatória não existe.

## 17. Evidências que devem ficar retidas

Para declarar a execução de ponta a ponta como comprovada, o sistema deve guardar um pacote de evidências com:

| Evidência | Por que é necessária |
|---|---|
| Transcript ID e URL de origem | Provar qual aula foi processada. |
| Student ID e email normalizado | Provar que a aula foi atribuída ao aluno correto. |
| Pipeline run ID | Relacionar todas as etapas. |
| Prompt versions | Provar qual contrato foi usado. |
| Prompt 1 artifact | Provar que a extração era não autoritativa. |
| Evidence review decisions | Provar quais fatos foram aceitos/rejeitados. |
| Teacher Insight decision | Provar autoria e publicação. |
| Class Report draft e published version | Provar a revisão antes da publicação. |
| Portfolio patch e operation key | Provar idempotência e versão. |
| Projection version before/after | Provar que não houve sobrescrita silenciosa. |
| Coaching decision | Provar que recomendação não virou decisão automaticamente. |
| Dashboard verification URL | Provar o resultado student-facing. |
| Reviewer, timestamps e motivos | Provar governança humana. |

## 18. O que significa “ponta a ponta comprovado”

O fluxo só deve ser declarado **End-to-End Accepted** quando todos os itens abaixo forem verdadeiros no mesmo teste controlado:

1. Um transcript real é localizado no Drive sem intervenção manual no código.
2. O transcript é ingerido uma única vez e recebe `PipelineRun` e `Transcript`.
3. A identidade do aluno é confirmada e não há risco de cruzamento de perfis.
4. Prompt 1 produz somente propostas não oficiais.
5. O professor aceita ou rejeita evidências e sinais na fila.
6. Teacher Insight só se torna oficial após aprovação explícita.
7. Prompt 2 gera um Class Report usando somente entradas autorizadas.
8. O professor publica o Class Report.
9. Prompt 3 gera um patch idempotente; o professor o aprova; o serviço aplica a transação com controle de versão.
10. Prompt 4 gera uma recomendação; o professor decide seu destino.
11. Firestore e PostgreSQL são atualizados nas fontes corretas.
12. O dashboard mostra a aula para o aluno correto, sem GitHub commit por aula.
13. O reprocessamento do mesmo transcript produz duplicidade controlada ou no-op.
14. A evidência completa da execução é preservada.

## 19. Situação atual versus fluxo plenamente aceito

A arquitetura, os contratos dos quatro prompts, a ingestão, a persistência, os identificadores, o WIF e a contenção de fallback já foram implementados em grande parte. Entretanto, a aceitação plena exige confirmar e/ou concluir alguns pontos:

| Área | Situação responsável |
|---|---|
| WIF/OIDC | Configurado; falta prova final nos logs de runtime e leitura Firestore autoritativa. |
| Student dashboard containment | Contido; Louise não deve receber o fallback antigo do Rafael. |
| Human approval model | Definido na arquitetura, mas precisa estar explicitamente modelado e aplicado antes da publicação. |
| Pipeline executor | Executa as etapas e persiste artefatos; precisa impedir aplicação/publicação antes das aprovações no fluxo final. |
| Admin directory | Deve remover o fallback Rafael-only antes da aceitação final. |
| End-to-end real run | Ainda precisa de uma aula real com pacote de evidências completo. |
| Node.js | Deve ser atualizado para 24.x antes do prazo operacional informado pela Vercel. |

A distinção é importante: **o desenho acima é o fluxo que será aceito como correto quando comprovado; o código existente já contém grande parte dos contratos e persistências, mas a validação humana precisa ser uma barreira técnica real, não apenas uma regra descrita em documentação.**

## Referências

[1]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/continuous-pipeline-architecture.md "PRIME Digital Hub — Continuous Transcript-to-Dashboard Architecture"

[2]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/PRIME_PRODUCTION_OPERATIONS_RUNBOOK.md "PRIME Digital Hub — Production Operations Runbook"

[3]: https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.transcripts.entries/get "Google Meet API — transcript entries"

[4]: https://developers.google.com/workspace/drive/api/guides/push "Google Drive API — notifications for resource changes"
