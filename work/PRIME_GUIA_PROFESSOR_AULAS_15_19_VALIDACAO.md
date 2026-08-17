# Guia prático do professor — aulas das 15h e das 19h

**Objetivo:** explicar exatamente o que Alexandre deverá fazer depois de dar duas aulas reais usadas para validar o fluxo automático do PRIME Digital Hub.

## 1. A ideia mais importante

Depois da aula, o professor **não deve entrar no GitHub, Cloud Shell, Firebase ou Vercel para fazer a aprovação**. Esses ambientes são de operação técnica. A experiência correta do professor é:

1. dar a aula normalmente no Google Meet;
2. receber uma notificação de que a aula está pronta para revisão;
3. abrir uma fila de revisão no próprio portal;
4. confirmar ou rejeitar as propostas apresentadas;
5. publicar somente o que estiver correto;
6. receber a confirmação de que a projeção foi atualizada;
7. abrir o dashboard do aluno e verificar o resultado.

A IA prepara material para decisão. **Quem decide o que se torna oficial é o professor autorizado.**

## 2. O que deve acontecer com as aulas das 15h e das 19h

As duas aulas precisam ser tratadas como duas execuções independentes. Mesmo que sejam do mesmo aluno, elas terão:

| Elemento | Aula das 15h | Aula das 19h |
|---|---|---|
| `lessonId` | Identificador próprio | Identificador próprio |
| `transcriptId` | Identificador do transcript das 15h | Identificador do transcript das 19h |
| `pipelineRunId` | Execução própria | Execução própria |
| `operationKey` | Chave própria de idempotência | Chave própria de idempotência |
| Fila de revisão | Cartão separado | Cartão separado |
| Resultado | Publicado somente após aprovação | Publicado somente após aprovação |

O sistema não pode misturar as duas aulas, somar evidências duplicadas ou atribuir o transcript das 19h à aula das 15h.

## 3. Linha do tempo prática

Os horários abaixo são um exemplo operacional. O tempo real depende de quando o Google Meet disponibiliza o transcript e de qual intervalo foi configurado para o scanner do Drive. O professor não deve ser informado de que o processamento terminou antes de o sistema realmente registrar essa conclusão.

| Momento | O que acontece | O que Alexandre faz |
|---|---|---|
| 15h | Aula 1 começa | Dá a aula normalmente. |
| Fim da aula | Google Meet gera/disponibiliza o transcript | Não edita o transcript para acelerar o processo. |
| Após disponibilidade | Scanner encontra o documento no Drive | Não precisa executar comando. |
| Depois da ingestão | Sistema cria transcript e `PipelineRun` | Aguarda a notificação de revisão. |
| Quando Prompt 1 termina | Propostas e evidências ficam em revisão | Abre o cartão da aula das 15h. |
| Revisão 1 | Confirma aluno, aula, presença e evidências | Aprova, rejeita ou bloqueia. |
| Revisão 2 | Teacher Insight e Class Report ficam disponíveis | Revisa e publica ou devolve. |
| Revisão 3 | Alterações do dashboard aparecem como comparação | Aprova ou rejeita o patch. |
| Revisão 4 | Coaching aparece como recomendação interna | Aceita, edita ou rejeita. |
| Final | Projeções autorizadas são atualizadas | Abre o dashboard e confere. |
| 19h | Aula 2 começa | Repete o mesmo procedimento, mas com outro cartão e outro ID. |

## 4. Como o professor será avisado

A experiência recomendada possui dois canais, para que uma falha em um canal não esconda uma aprovação pendente:

### Canal principal: fila interna do portal

No portal, o professor acessa **Admin → Review Queue**. Um contador mostra quantas aulas estão aguardando decisão. Cada cartão exibe:

```text
1 lesson awaiting review
Student: Rafael Copolillo
Lesson date: 17 Aug 2026, 15:00
Stage: Evidence review required
Source: Google Meet transcript
```

O cartão das 19h aparece separadamente:

```text
1 lesson awaiting review
Student: Louise D. Silva Nogueira
Lesson date: 17 Aug 2026, 19:00
Stage: Evidence review required
Source: Google Meet transcript
```

### Canal complementar: email

O professor recebe um email em `alexandre@primedigitalhub.com.br` quando uma etapa requer sua decisão. O email deve conter apenas informações operacionais mínimas:

```text
Subject: PRIME — lesson ready for human review
Student: Rafael Copolillo
Lesson: 17 Aug 2026, 15:00
Stage: Evidence and identity review
Open review: [secure portal link]
```

O email não deve conter chave Firebase, transcript completo, segredo de ingestão ou informação sensível desnecessária. O link deve levar ao portal autenticado; a aprovação não deve ocorrer respondendo ao email.

### Tipos de notificação

Para não transformar uma aula em dezenas de emails, a fila pode agrupar notificações, mas deve manter as decisões separadas:

| Notificação | Quando ocorre | Decisão exigida |
|---|---|---|
| **New lesson ready for review** | Transcript foi ingerido e Prompt 1 terminou | Identidade, contexto, evidências e presença. |
| **Class report ready for approval** | Evidências/sinais foram validados e o relatório foi gerado | Publicar ou devolver o Class Report. |
| **Dashboard update ready** | Patch de projeção foi calculado | Aprovar ou rejeitar as mudanças. |
| **Coaching recommendation ready** | Prompt 4 produziu recomendação | Aceitar, editar, rejeitar ou deixar interna. |
| **Published successfully** | Todas as decisões obrigatórias foram concluídas | Verificar o dashboard. |
| **Blocked / needs attention** | Identidade, fonte, versão ou processamento falhou | Corrigir ou solicitar reprocessamento. |

## 5. Primeira tela de revisão: o que Alexandre deve fazer

Quando abrir uma aula com status **Evidence review required**, o professor deve olhar primeiro para a identidade, não para o texto produzido pela IA.

### Checklist de identidade

| Pergunta | Ação |
|---|---|
| O nome do aluno está correto? | Se não estiver, bloquear. |
| O email/ID do aluno está correto? | Confirmar antes de qualquer aprovação. |
| A data e o horário correspondem à aula? | Confirmar 15h ou 19h. |
| O transcript pertence a esta reunião? | Conferir link/ID de origem. |
| Já existe outro cartão para a mesma aula? | Se existir, marcar duplicidade; não aprovar os dois. |
| A presença tem fonte autorizada? | Confirmar somente se houver registro; caso contrário, manter desconhecida. |

Depois disso, o professor lê os candidatos de evidência. Cada candidato deve mostrar o trecho do transcript que o sustenta. O professor pode escolher:

- **Accept evidence** — o candidato pode alimentar as próximas etapas;
- **Reject evidence** — o candidato não será usado como fato;
- **Return for revision** — o material precisa ser reprocessado ou corrigido;
- **Block lesson** — há um problema de identidade, origem ou segurança.

## 6. Segunda tela: Teacher Insight e Class Report

Depois da primeira decisão, a fila mostra o Teacher Insight e o Class Report.

### Teacher Insight

O texto começa como uma proposta da IA. Alexandre deve perguntar:

> “Eu realmente escreveria isso como uma observação oficial sobre este aluno, com base nas evidências mostradas?”

Se a resposta for sim, ele seleciona **Publish Teacher Insight**. Se a resposta for não, rejeita ou devolve para revisão. O texto não se torna autoria do professor simplesmente porque foi gerado pela IA.

### Class Report

O Class Report aparece em modo de rascunho. Alexandre compara:

- resumo da aula;
- vocabulário;
- correções;
- foco gramatical;
- recomendações de estudo;
- presença e data;
- links para evidências;
- aluno selecionado.

As opções são:

| Botão | Efeito |
|---|---|
| **Publish Class Report** | O relatório poderá aparecer no dashboard após as etapas seguintes. |
| **Return for revision** | Mantém o relatório em rascunho e solicita correção. |
| **Reject** | Impede o uso daquele relatório como conteúdo oficial. |

## 7. Terceira tela: comparação do que mudará no dashboard

Depois do Class Report, o sistema apresenta uma tela de comparação. Alexandre não aprova uma caixa preta; ele vê o antes e o depois.

```text
CURRENT DASHBOARD PROJECTION
- Class reports: 10
- Vocabulary items: 42
- Corrections: 18
- Attendance records: 10

PROPOSED CHANGE FROM LESSON 15:00
+ Class report: lesson-2026-08-17-1500
+ Vocabulary: 3 items
+ Corrections: 1 item
+ Attendance: unchanged — no authorized attendance source

[Approve projection] [Reject] [Return for revision]
```

A presença deve permanecer sem alteração quando não houver fonte autorizada. O transcript não pode, sozinho, criar uma presença.

Ao aprovar, o professor autoriza o serviço determinístico a aplicar o patch. O serviço verifica a versão atual, a chave de operação e a idempotência. Se a projeção mudou desde a abertura da tela, o sistema bloqueia a aplicação e pede nova revisão.

## 8. Quarta tela: recomendação de coaching

O Prompt 4 produz orientação para o professor. Não é uma ordem, diagnóstico definitivo ou tarefa automaticamente criada.

A tela deve mostrar:

```text
AI COACHING RECOMMENDATION
Basis: Evidence IDs 4, 7 and 9
Recommendation: consider additional practice with...
Status: AI proposed
Requires teacher decision: Yes
Educational action created: No
```

Alexandre pode:

- aceitar como orientação interna;
- editar a recomendação;
- rejeitar;
- devolver para nova análise;
- iniciar, se necessário, um fluxo separado para uma decisão pedagógica autorizada.

A opção **Approve coaching** não deve criar automaticamente uma tarefa student-facing, alterar o nível do aluno ou mudar o Learning Journey.

## 9. Como termina a aula das 15h

A aula das 15h só estará concluída para o sistema quando houver:

1. transcript preservado;
2. identidade confirmada;
3. evidências aceitas ou rejeitadas;
4. presença confirmada somente por fonte autorizada, ou mantida como desconhecida;
5. Teacher Insight publicado ou explicitamente omitido;
6. Class Report publicado;
7. patch de projeção aprovado e aplicado;
8. coaching decidido;
9. dashboard verificado para o aluno correto;
10. pacote de auditoria salvo.

O status final deve ser algo como:

```text
PUBLISHED / TEACHER_VISIBLE
Dashboard verification: passed
Student isolation: passed
Projection version: 11
Pipeline run: run-15h-abc123
```

## 10. Como funciona a aula das 19h

O professor repete o procedimento, mas não reutiliza o cartão da aula das 15h. Ao abrir a fila, ele deve confirmar o horário e o `lessonId`.

Se as duas aulas forem do mesmo aluno, o sistema deve mostrar duas linhas separadas. A aula das 19h pode usar a projeção já atualizada pela aula das 15h, mas deve iniciar com a nova versão como base. Se as duas revisões forem abertas simultaneamente, o controle de versão impede que a segunda sobrescreva a primeira.

Se as aulas forem de alunos diferentes, a confirmação de identidade é ainda mais importante. O professor nunca deve aprovar um relatório apenas porque o texto “parece correto”; deve confirmar student ID, email, data, transcript e referências.

## 11. O que acontece se o professor não responder

A ausência de resposta nunca deve ser interpretada como aprovação.

| Situação | Comportamento correto |
|---|---|
| Professor não abre a notificação | Aula permanece `AWAITING_REVIEW`. |
| Professor abre, mas não decide | Nada é publicado; o cartão permanece pendente. |
| Professor rejeita | Estado muda para `REJECTED` ou `REVISION_REQUIRED`. |
| Professor devolve para revisão | IA/serviço pode reprocessar somente após uma nova execução explícita. |
| Professor aprova evidências, mas não o relatório | O relatório continua em `DRAFT`; não chega ao aluno. |
| Professor aprova o relatório, mas não o patch | O dashboard não recebe a nova projeção longitudinal. |
| Erro de versão | O sistema bloqueia, informa conflito e pede nova revisão. |
| Falha técnica | Estado fica `FAILED`, `RETRYABLE` ou `BLOCKED`; não há publicação silenciosa. |

O sistema pode enviar lembretes, por exemplo, após duas horas e no início do próximo período de trabalho, mas isso deve ser notificação operacional. Nunca deve existir autoaprovação por tempo.

## 12. O que Alexandre precisa acompanhar no dia

Para as aulas das 15h e 19h, o professor só precisa acompanhar quatro coisas:

| O que acompanhar | Onde olhar |
|---|---|
| Se o transcript foi encontrado | Fila de revisão do portal. |
| Se existe cartão aguardando decisão | Sino/contador de notificações e email. |
| Em que etapa cada aula está | Status do cartão: `AWAITING_REVIEW`, `REPORT_DRAFTED`, `PROJECTION_REVIEW`, `COACHING_REVIEW` ou `PUBLISHED`. |
| Se o dashboard terminou correto | Link de verificação exibido no cartão final. |

Ele **não precisa** ficar monitorando Cloud Shell, Vercel, GitHub ou Firebase durante a aula. Esses ambientes só entram quando o sistema informar uma falha operacional para a equipe técnica.

## 13. O que já existe e o que ainda precisa ser implementado

Esta distinção é fundamental para não criar uma expectativa falsa durante o teste das duas aulas.

| Capacidade | Situação atual conhecida |
|---|---|
| Endpoint seguro de ingestão | Implementado no código. |
| Persistência de transcript e `PipelineRun` | Implementada no código. |
| Prompts 1–4 e contratos canônicos | Implementados com estados de proposta/rascunho. |
| Idempotência e controle de versão | Implementados em parte importante do executor. |
| WIF/OIDC e configuração Vercel | Configurados; precisam de prova final no runtime. |
| Perfil Firestore Rafael/Louise | Publicado e preservado. |
| Contenção do fallback cruzado | Corrigida para o dashboard student-facing. |
| Fila visual completa de revisão humana | Ainda precisa estar implementada e testada como interface de uso do professor. |
| Notificações por email/in-app | Precisam estar implementadas e ligadas aos estados do pipeline. |
| Modelo completo de decisões humanas no Prisma | Precisa ser explicitamente modelado para impedir publicação sem aprovação. |
| Execução real de duas aulas | Ainda precisa ser realizada com pacote de evidências completo. |

Portanto, para as aulas das 15h e 19h, o sistema só poderá ser considerado realmente automatizado para o professor quando existir, no domínio oficial, uma tela semelhante a **Admin → Review Queue**, com notificações e botões que gravem decisões humanas auditáveis.

## 14. Procedimento simples para o professor no dia do teste

Antes da aula das 15h, Alexandre deve confirmar apenas que consegue entrar no portal administrativo. Depois de terminar a aula, ele deve continuar suas atividades normalmente e aguardar a notificação.

Quando o aviso chegar, ele deve abrir o cartão, verificar primeiro aluno/data/transcript, aceitar ou rejeitar evidências, revisar o Class Report, aprovar a projeção, decidir sobre o coaching e abrir o link final do dashboard. Para a aula das 19h, deve repetir exatamente o mesmo procedimento com o segundo cartão.

Se nenhuma notificação aparecer dentro do tempo operacional definido, Alexandre não deve concluir que a aula foi publicada. Ele deve verificar a fila manualmente e, se o cartão não existir, registrar o horário e acionar o procedimento técnico de diagnóstico. A ausência de uma notificação não é prova de sucesso.

## 15. Critério de sucesso das duas aulas

As aulas das 15h e 19h terão validado a cadeia somente se, ao final, houver dois pacotes independentes contendo:

```text
transcriptId
lessonId
studentId
pipelineRunId
prompt versions
review decision IDs
published report ID
portfolio patch ID
projection version before/after
coaching decision
final dashboard URL
runtime and audit timestamps
```

O teste será aprovado quando o dashboard apresentar os dados corretos para cada aluno, sem duplicidade, sem mistura entre as aulas, sem publicação automática de proposta da IA e sem necessidade de um commit no GitHub para publicar a aula aprovada.

## Referências

[1]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/continuous-pipeline-architecture.md "PRIME Digital Hub — Continuous Transcript-to-Dashboard Architecture"

[2]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/PRIME_PRODUCTION_OPERATIONS_RUNBOOK.md "PRIME Digital Hub — Production Operations Runbook"

[3]: https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.transcripts.entries/get "Google Meet API — transcript entries"
