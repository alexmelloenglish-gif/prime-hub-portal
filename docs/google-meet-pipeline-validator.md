# Validador de integração Google Meet → PRIME Pipeline

## Objetivo

O `validate-google-meet-pipeline.mjs` verifica a integração entre um transcript produzido pelo Google Meet e o endpoint de ingestão do PRIME Digital Hub. O script foi desenhado para testar a fronteira de integração sem conceder autoridade ao transcript e sem executar alterações canônicas diretamente.

O fluxo validado é:

```text
Google Meet transcript resource
        ↓
Meet REST API: transcript + transcript entries
        ↓
normalização, proveniência e SHA-256
        ↓
contrato PRIME /api/pipeline/ingest
        ↓
Prompt 1 → Prompt 2 → Prompt 3 → Prompt 4
        ↓
projeções e recomendação não vinculante
```

A API REST do Google Meet permite recuperar transcripts e transcript entries depois da conferência. A Google Workspace Events API pode notificar o sistema quando um transcript é iniciado, encerrado ou quando o arquivo é gerado [1] [2]. O evento `google.workspace.meet.transcript.v2.fileGenerated` é o gatilho recomendado para a automação de produção; o script também aceita consulta manual por conference record ou transcript resource.

> O validador verifica a integração e a proveniência. Ele não valida o conteúdo pedagógico do transcript, não publica Teacher Insight, não aprova decisões e não cria ações educacionais.

## Localização

O script está em:

```text
scripts/validate-google-meet-pipeline.mjs
```

Comando npm equivalente:

```bash
npm run validate:google-meet -- <argumentos>
```

## Modos de execução

### Dry-run local

É o modo padrão. Lê um arquivo de fixture, valida a identidade, calcula o hash e imprime um relatório JSON sem chamar o portal.

```bash
npm run validate:google-meet -- \
  --transcript-file ./fixtures/meet-transcript.txt \
  --transcript-id tr_fixture_001 \
  --lesson-id lesson-fixture-001 \
  --student-id student-001 \
  --student-email student@example.com \
  --teacher-id teacher-001 \
  --program english-b2 \
  --class-date 2026-08-16 \
  --dry-run
```

O relatório contém apenas metadados, quantidade de caracteres, quantidade de entradas quando disponível, hash SHA-256, chave de idempotência e o resultado dos checks. O texto integral do transcript não é exibido.

### Dry-run contra a API do Google Meet

Para consultar um transcript específico, forneça um access token OAuth com escopos compatíveis e o resource name:

```bash
export GOOGLE_MEET_ACCESS_TOKEN="..."

npm run validate:google-meet -- \
  --transcript-resource conferenceRecords/RECORD_ID/transcripts/TRANSCRIPT_ID \
  --lesson-id lesson-2026-08-16 \
  --student-id student-001 \
  --student-email student@example.com \
  --teacher-id teacher-001 \
  --program english-b2 \
  --class-date 2026-08-16 \
  --dry-run
```

Para localizar o transcript mais recente de uma conferência:

```bash
npm run validate:google-meet -- \
  --conference-record conferenceRecords/RECORD_ID \
  --lesson-id lesson-2026-08-16 \
  --student-id student-001 \
  --student-email student@example.com \
  --teacher-id teacher-001 \
  --program english-b2 \
  --class-date 2026-08-16 \
  --dry-run
```

O script lista os transcripts do conference record, escolhe o mais recente por `endTime`/`startTime`, recupera suas entradas paginadas e normaliza cada linha no formato `[timestamp] speaker: text`.

### Submissão controlada ao pipeline

A submissão nunca ocorre implicitamente. É necessário fornecer `--submit`, uma origem real do Google Meet e o segredo do endpoint:

```bash
export GOOGLE_MEET_ACCESS_TOKEN="..."
export PRIME_PIPELINE_INGEST_SECRET="..."

npm run validate:google-meet -- \
  --transcript-resource conferenceRecords/RECORD_ID/transcripts/TRANSCRIPT_ID \
  --lesson-id lesson-2026-08-16 \
  --student-id student-001 \
  --student-email student@example.com \
  --teacher-id teacher-001 \
  --program english-b2 \
  --class-date 2026-08-16 \
  --pipeline-url https://www.primedigitalhub.com.br \
  --submit
```

O endpoint recebe o header `x-prime-pipeline-secret`. A resposta `202` significa que a ingestão foi aceita para processamento; `200` representa uma execução duplicada ou já processada. Códigos diferentes de 2xx são reportados como falha.

O script impede a submissão de uma fixture local. Isso evita que um transcript artificial seja confundido com um artefato real do Google Meet.

## Contrato enviado ao PRIME

O payload segue o contrato atual de `parseTranscriptPayload` e contém, no mínimo:

| Campo | Finalidade |
|---|---|
| `lessonId` | Identificador estável da aula; não é derivado do título do Meet. |
| `studentId` | Identificador estável do estudante; nunca é inferido do transcript. |
| `studentEmail` | Identidade usada pela rota atual de ingestão e pelo carregador do portal. |
| `teacherId` | Identificador estável do professor. |
| `program` | Programa/coorte da aula. |
| `classDate` | Data canônica da aula. |
| `transcriptId` | Identificador do transcript no Meet ou da fixture. |
| `transcript` | Texto normalizado que será processado pela pipeline. |
| `source` | Sempre `google_meet` neste validador. |
| `attendanceStatus` | `unknown` por padrão; não é inferido de `LessonCompleted`. |
| `attendanceSource` | Fonte autorizada quando o status é `attended` ou `missed`. |
| `metadata.sourceReference` | Resource name do Google Meet ou referência de fixture. |
| `metadata.contentHash` | SHA-256 do transcript normalizado. |
| `metadata.ingestionId` | Chave operacional `gmeet-{transcriptId}-{hash-prefix}`. |
| `metadata.receivedAt` | Momento em que o validador recebeu o artefato. |

O `contentHash` e o `ingestionId` permitem detectar reenvio do mesmo transcript. A idempotência efetiva também depende da chave única e da lógica do banco/orquestrador do portal.

## Validações executadas

O validador falha antes da submissão quando ocorre qualquer uma das situações abaixo:

| Check | Regra |
|---|---|
| `required_identity` | Aula, estudante, email, professor e programa são obrigatórios. |
| `transcript_id` | O transcript precisa ter uma identidade externa. |
| `transcript_non_empty` | O conteúdo normalizado não pode estar vazio. |
| `source_google_meet` | A origem deve ser `google_meet`. |
| `content_hash` | Deve existir um SHA-256 hexadecimal de 64 caracteres. |
| `provenance` | Resource reference e timestamp de recebimento são obrigatórios. |
| `attendance_authority` | Presença/falta exige uma fonte explícita; na ausência, o status é `unknown`. |
| `transcript_size` | O transcript é limitado a 2.000.000 de caracteres para evitar payloads acidentais excessivos. |

O script não considera a conclusão da pipeline como prova de presença, domínio de conteúdo, qualidade pedagógica ou publicação de insight.

## Códigos de saída

| Código | Significado |
|---:|---|
| `0` | Dry-run validado ou submissão aceita/duplicada. |
| `1` | Erro de configuração, argumento, autenticação ou comunicação. |
| `2` | Payload reprovado em uma validação local. |
| `3` | O endpoint foi chamado, mas respondeu com erro não-2xx. |

O JSON pode ser salvo com `--output ./reports/google-meet-validation.json`. O arquivo deve ser tratado como log operacional e não deve ser versionado se contiver identificadores pessoais.

## Gatilho de produção recomendado

A automação de produção deve assinar uma subscription do Google Workspace Events API para o meeting space ou para o usuário organizador e escutar:

```text
google.workspace.meet.transcript.v2.fileGenerated
```

O handler deve verificar a autenticidade do evento, extrair o resource name do transcript, buscar o artefato pela Meet REST API, construir o payload e enfileirar a execução. O evento deve ser tratado como notificação, não como conteúdo confiável. O worker deve recuperar o recurso novamente pela API, porque o evento referencia o recurso alterado, mas não substitui a leitura autorizada do transcript.

A arquitetura deve manter um caminho de catch-up: consultar periodicamente os eventos ou transcripts recentes para cobrir indisponibilidade do handler, expiração de subscription ou falha de rede. A Google informa que transcript entries retornadas pela API têm retenção de 30 dias depois do encerramento da conferência; portanto, o ingestão deve ocorrer logo após `fileGenerated` [2].

## Segurança

O access token do Google Meet deve ser fornecido exclusivamente por variável de ambiente ou secret manager. Nunca o inclua no comando gravado no histórico do shell, em fixtures ou no repositório. Em produção, usar OAuth de usuário ou domain-wide delegation conforme a política do Google Workspace e conceder o menor escopo necessário.

O segredo `PRIME_PIPELINE_INGEST_SECRET` protege o endpoint atual. Ele deve ser diferente entre desenvolvimento, staging e produção. O portal deve continuar rejeitando requisições sem o header correto, e o validador não deve registrar o segredo nem o transcript integral.

A identidade `studentId` deve vir do cadastro autorizado do PRIME, de uma tabela de associação ou de um mapeamento administrativo. O Google Meet não deve decidir sozinho a qual estudante o transcript pertence. A mesma regra vale para `lessonId`, `teacherId` e `program`.

## Diagnóstico de falhas

Quando o Google Meet retorna `401` ou `403`, revisar token, escopos, usuário organizador/participante e políticas do Workspace. Quando retorna `404`, confirmar o resource name, a conta autenticada e se o artefato foi realmente gerado. Quando não há transcript entries, aguardar a geração do artefato ou verificar se a transcrição estava habilitada antes do fim da conferência.

Quando o endpoint PRIME retorna `401`, conferir `PRIME_PIPELINE_INGEST_SECRET`. Para `400`, revisar os campos de identidade e o contrato do payload. Para `500`, verificar logs do portal, conexão PostgreSQL, geração do Prisma Client e disponibilidade do modelo configurado. Um `200` com `duplicate: true` não deve ser tratado como falha: indica que a chave idempotente já foi processada.

## Limitações conhecidas

Este script não cria subscriptions do Google Workspace Events API, não implementa renovação de subscriptions, não executa OAuth interativo e não substitui um worker persistente. Ele é uma ferramenta de validação e smoke test. A automação de produção ainda precisa de um handler de eventos, uma fila durável, retries com backoff, dead-letter queue, observabilidade e um mapeamento autorizado entre meeting space/aula/estudante.

Também não é correto concluir, a partir deste teste, que a operação pedagógica inteira está comprovada. O script valida a fronteira de ingestão; a publicação de Evidence, Teacher Insight, decisões e ações continua sujeita aos contratos canônicos e à revisão humana definidos nos Prompts 1–4.

## Referências

[1]: https://developers.google.com/workspace/meet/api/guides/overview "Google Meet REST API overview — Google for Developers"

[2]: https://developers.google.com/workspace/meet/api/guides/artifacts "Work with artifacts — Google Meet REST API"

[3]: https://developers.google.com/workspace/events/guides/events-meet "Subscribe to Google Meet events — Google Workspace Events API"

[4]: https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.transcripts.entries/get "Get transcript entries — Google Meet REST API"
