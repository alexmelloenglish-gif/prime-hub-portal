# Automação de transcrições: Google Drive → PRIME Pipeline

## Objetivo

O PRIME Digital Hub pode receber transcrições exportadas do Google Meet por meio de uma pasta controlada do Google Drive. O scanner implementado em `scripts/scan-drive-transcripts.mjs` lista os arquivos da pasta, recupera Google Docs ou arquivos textuais, calcula a proveniência, gera uma chave estável de aula e, somente quando solicitado com `--submit`, envia o payload ao endpoint protegido `/api/pipeline/ingest`.

A fonte original permanece no Drive. O scanner não move, renomeia ou apaga arquivos e não grava o conteúdo bruto no relatório operacional.

## Fluxo implementado

| Etapa | Comportamento |
|---|---|
| 1. Descoberta | Lista filhos diretos da pasta configurada por `GOOGLE_DRIVE_FOLDER_ID`. |
| 2. Filtro | Processa Google Docs, `text/plain`, `text/vtt` e `application/json`; registra outros MIME types como não suportados. |
| 3. Recuperação | Exporta Google Docs como texto ou baixa o arquivo textual com a Drive API. |
| 4. Proveniência | Registra `sourceFileId`, nome, MIME type, URL, horários e SHA-256 do conteúdo. |
| 5. Identidade | Recebe `studentId`, `studentEmail` e `teacherId` por configuração; não infere identidade a partir do nome do arquivo. |
| 6. Aula | Deriva `lessonId` de `studentId` + `sourceFileId`, tornando a operação determinística. |
| 7. Idempotência | Usa `fileId`, `modifiedTime` e `md5Checksum` no estado local para evitar reenvio de arquivo já submetido. |
| 8. Envio | Mantém `dry-run` como padrão. O envio exige `--submit`, URL do pipeline e segredo. |

## Execução segura

O primeiro teste deve ser executado sem `--submit`:

```bash
export GOOGLE_DRIVE_ACCESS_TOKEN='token-oauth-de-curta-duracao'
export GOOGLE_DRIVE_FOLDER_ID='1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw'
export DRIVE_TRANSCRIPT_STUDENT_ID='stu_c5930e6e76ae'
export DRIVE_TRANSCRIPT_STUDENT_EMAIL='louise_nogueira@hotmail.com'
export DRIVE_TRANSCRIPT_TEACHER_ID='teacher_alexandre_mello_v1'
export DRIVE_TRANSCRIPT_TEACHER_NAME='Alexandre Mello'
export DRIVE_TRANSCRIPT_PROGRAM='Prime Digital Hub'

npm run scan:drive-transcripts
```

O resultado informa quantidade de arquivos, arquivos ignorados, MIME types não suportados, `lessonId`, hash e tamanho, mas não exibe o transcript. O estado padrão é salvo em `.runtime/drive-transcript-state.json`, que deve permanecer fora do Git.

Depois de validar o relatório e confirmar que a identidade está correta, o envio controlado usa:

```bash
export PRIME_PIPELINE_INGEST_URL='https://www.primedigitalhub.com.br/api/pipeline/ingest'
export PRIME_PIPELINE_INGEST_SECRET='secret-configurado-no-ambiente-do-portal'

npm run scan:drive-transcripts -- --submit
```

O modo `--submit` deve ser executado primeiro em staging. Em produção, o operador deve confirmar o arquivo, o estudante, o hash e a data antes de autorizar a submissão.

## Identidade e associação de estudantes

O scanner não deve ser usado com uma pasta que contenha transcrições de vários estudantes sem uma regra adicional de roteamento. A configuração atual associa toda a execução a uma identidade explícita. Para uma pasta compartilhada por vários alunos, implemente primeiro uma tabela de roteamento controlada por `sourceFileId`, pasta de origem ou metadado aprovado. Nunca use o nome do arquivo como única fonte de identidade.

Para Louise, a ficha inicial usa:

| Campo | Valor |
|---|---|
| `studentId` | `stu_c5930e6e76ae` |
| `studentEmail` | `louise_nogueira@hotmail.com` |
| `lessonId` da aula documentada | `lesson_7fb6ee4263fd1731` |
| `sourceDocumentId` | `102fKHv_pC4eT9K8xanOJdET23PrWOz2fv9wRTZrlC94` |
| Status do perfil | `draft` |
| Status da aula | `draft` / `non_authoritative` |

O perfil do Rafael recebeu apenas os metadados `studentId`, `identityVersion`, `identitySource` e `profileStatus`, sem reformatar ou reescrever seu histórico.

## Gatilho contínuo

A implementação atual é um **scanner controlado por execução**. Ela não cria automaticamente uma assinatura de eventos nem um cron no ambiente publicado. Para execução contínua, há duas opções:

A rota canônica também aplica uma segunda barreira de idempotência: quando o payload inclui `metadata.sourceFileId`, o pipeline usa `drive:<sourceFileId>` como chave estável e consulta o transcript já vinculado ao arquivo antes de executar qualquer prompt. O mesmo `sourceFileId` não pode ser reassociado a outro aluno. Essa proteção evita que uma nova chamada para o mesmo arquivo gere uma nova execução, mas não substitui o filtro do Flow: o Flow ainda precisa observar somente a pasta de entrada e nunca tratar documentos gerados como novos transcripts.

1. Um worker persistente ou job agendado executa `npm run scan:drive-transcripts` em intervalos curtos. O estado e os retries precisam estar em armazenamento persistente, não no filesystem efêmero.
2. Uma assinatura do Google Workspace Events/Drive notifica um endpoint público de webhook quando um arquivo é adicionado ou alterado na pasta. O webhook deve validar a origem, enfileirar o `fileId` e deixar o scanner buscar o conteúdo de forma idempotente.

A segunda opção é preferível para baixa latência, mas exige OAuth/escopos, endpoint público, renovação da assinatura, validação de notificações e um worker durável. A primeira opção é mais simples para staging e pode ser usada até que o webhook esteja operacional.

> A documentação oficial do Google descreve assinaturas de eventos para alterações em arquivos e pastas do Drive, mas a assinatura não substitui a leitura idempotente do arquivo nem a validação de autorização do estudante. [1] [2]

## Segurança e privacidade

O access token do Drive deve ser fornecido somente por variável de ambiente ou secret manager. Ele não deve ser gravado no estado, no relatório, no Git ou no browser. O segredo do pipeline deve ser separado do token do Drive. O scanner não deve imprimir conteúdo do transcript, e o relatório operacional deve conter apenas metadados e hashes.

A fonte original deve permanecer no Drive com as permissões vigentes. O pipeline deve receber apenas o conteúdo necessário para a análise da aula e manter `sourceDocumentId`, `sourceFileId` e `sourceHash` para auditoria.

## Limitações atuais

O scanner não processa PDF automaticamente, não faz OCR, não interpreta uma pasta multiestudante sem roteamento e não configura sozinho um job persistente. Ele também não comprova, por si só, a publicação de Evidence, Teacher Insight ou decisões do domínio. A execução do endpoint precisa de banco, segredo e serviços de modelo configurados.

A validação real de ponta a ponta exige um ambiente de staging com `DATABASE_URL`, Firebase/Firestore quando necessário, `PRIME_PIPELINE_INGEST_SECRET`, um access token do Drive e uma URL de ingestão acessível. Sem esses recursos, o teste deve permanecer em dry-run.

## Referências

[1]: https://developers.google.com/workspace/drive/api/guides/events-overview "Google Drive API — Events overview"

[2]: https://developers.google.com/workspace/events/guides/events-drive "Google Workspace Events — Subscribe to Google Drive events"
