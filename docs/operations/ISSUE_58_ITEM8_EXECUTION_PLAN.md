# Issue 58 — Item 8 — Plano de execução para aceitação autenticada e witness E2E

**Status do plano:** pronto para execução; nenhum teste operacional foi executado por este documento.  
**Issue:** `#58` — permanece `OPEN` até a evidência final ser aceita.  
**Branch de referência:** `chore/issue-58-prime-engine-closure`  
**Head de CI de referência:** `465c727d43b772b70f494e5c6bd20998070cbbb8`

## 1. Objetivo

Validar os critérios operacionais que não são cobertos pelos workflows sintéticos de CI:

1. aceitação autenticada e isolamento por learner;
2. reconciliação entre Meet, organizer OAuth e processamento por cron/webhook;
3. witness real de ponta a ponta, da origem do evento até o dashboard;
4. preservação das fronteiras de segurança e das condições de congelamento operacional.

O objetivo é produzir uma evidência reproduzível e limitada a um ambiente autorizado, não executar mudanças indiscriminadas em produção.

## 2. Pré-condições e autorização

Antes de iniciar, registrar:

- ambiente-alvo: staging, sandbox operacional ou produção explicitamente autorizada;
- URL/base URL e commit implantado;
- identidade do executor e papel/permissões usados no teste;
- learner de teste, conta de teste e organizer de teste;
- janela de execução e responsável pela aprovação;
- `DATABASE_URL`/serviços utilizados, sem registrar segredos ou tokens;
- estratégia de limpeza ou expiração dos dados sintéticos.

Se houver uma tela de login, MFA ou solicitação de senha, o executor deve realizar a autenticação diretamente no navegador autorizado. Senhas, códigos MFA e tokens não devem ser compartilhados no chat, em arquivos do repositório ou nos artefatos do teste.

Não prosseguir se a autorização do ambiente, da conta ou do learner de teste não estiver documentada.

## 3. Dados e invariantes do teste

Usar um learner e uma conta explicitamente destinados a teste. Criar um identificador de correlação único, por exemplo:

```text
issue-58-item-8-<timestamp>
```

O identificador deve aparecer, quando suportado, no evento de origem, ingestão, `PipelineRun`, registro canônico, projeção e evidência do dashboard.

Invariantes obrigatórios:

- nenhum learner real não autorizado;
- nenhum dado de produção alterado sem aprovação explícita;
- nenhum segredo ou token persistido nos logs;
- `PIPELINE_AUTOMATION_FROZEN` permanece inalterado;
- exatamente um fluxo de teste rastreável deve chegar ao dashboard esperado;
- uma conta sem autorização não pode consultar o learner de teste.

## 4. Fase A — Validação de autenticação e isolamento

### A1. Login e sessão

1. Abrir o ambiente autorizado em navegador controlado.
2. O usuário autorizado realiza login e MFA, se aplicável.
3. Confirmar que a sessão pertence à conta de teste esperada.
4. Registrar apenas metadados não sensíveis: timestamp, ambiente, papel e identificador não secreto da sessão/conta.

### A2. Autorização positiva

1. Acessar o dashboard do learner de teste.
2. Confirmar que a conta autorizada visualiza apenas os dados esperados.
3. Confirmar que as rotas, ações e projeções permitidas correspondem ao papel da conta.
4. Registrar URL/rota, status esperado e evidência visual ou resposta sanitizada.

### A3. Isolamento negativo

1. Usar uma segunda conta de teste sem autorização para o learner.
2. Tentar acessar diretamente a rota e o identificador do learner autorizado.
3. Confirmar resposta de negação, ausência de dados ou redirecionamento conforme o contrato.
4. Repetir a checagem para uma ação sensível do dashboard, quando disponível.

**Gate A:** aceitar somente se a conta autorizada visualizar o escopo correto e a conta não autorizada não obtiver dados ou ações do learner protegido.

## 5. Fase B — Reconciliação Meet, OAuth e cron/webhook

### B1. Organizer e evento

1. Criar ou selecionar uma reunião de teste pertencente ao organizer autorizado.
2. Registrar o identificador do evento/reunião e o organizer de forma sanitizada.
3. Confirmar que o vínculo da reunião corresponde à conta OAuth esperada.
4. Produzir um evento controlado de presença/transcrição ou o fixture operacional equivalente aprovado pelo ambiente.

### B2. Entrada operacional

1. Confirmar o recebimento pelo webhook ou pela fonte de ingestão prevista.
2. Se o fluxo for agendado, executar ou aguardar o cron autorizado.
3. Confirmar que o evento foi aceito uma única vez ou que a idempotência funcionou.
4. Registrar timestamps, status e IDs de correlação; não registrar tokens, cookies ou payloads sensíveis completos.

### B3. Reconciliação

Comparar os seguintes vínculos:

| Elemento | Evidência esperada |
|---|---|
| Organizer | Conta autorizada e estável durante o fluxo |
| OAuth | Conexão correta, sem expor token |
| Meet/evento | ID correlacionado ao learner de teste |
| Webhook/cron | Execução no horário e ambiente esperados |
| Ingestão | Um registro aceito e rastreável |
| Idempotência | Repetição não cria duplicata indevida |

**Gate B:** aceitar somente se organizer, OAuth, evento e processamento operacional apontarem para o mesmo fluxo de teste e não houver duplicação ou perda de correlação.

## 6. Fase C — Witness E2E source-to-dashboard

Rastrear um único fluxo através das seguintes etapas:

1. **Origem:** evento Meet/transcrição/fixture operacional criado para o teste.
2. **Ingestão:** registro recebido e associado ao identificador de correlação.
3. **Shared Learning Machine:** processamento iniciado no modo esperado.
4. **PipelineRun:** ID, estado, tentativa e chave de idempotência preservados.
5. **Canonical Learning Record:** registro canônico criado ou atualizado para o learner correto.
6. **Projeção:** estado derivado e projeção do dashboard atualizados.
7. **Dashboard:** conta autorizada visualiza o resultado esperado.
8. **Isolamento:** conta não autorizada continua sem acesso ao mesmo resultado.

A evidência mínima deve incluir, de forma sanitizada:

- correlation ID;
- ID do evento/ingestão;
- `pipelineRunId`;
- estado final e número de tentativas;
- ID ou chave do registro canônico;
- ID/chave da projeção;
- rota do dashboard e timestamp de leitura;
- resultado dos testes positivo e negativo de autorização.

**Gate C:** aceitar somente se o mesmo fluxo puder ser seguido sem quebra de identidade, duplicação indevida ou exposição para outra conta.

## 7. Critérios de parada e falha

Parar imediatamente e registrar o incidente se ocorrer qualquer um destes eventos:

- login em conta ou ambiente diferente do autorizado;
- exposição de segredo, token, cookie ou PII não necessária;
- learner incorreto ou dado real inesperado;
- ausência de isolamento entre contas;
- duplicação de ingestão ou `PipelineRun` sem explicação;
- alteração fora do escopo em banco, migration, cron ou configuração;
- tentativa de desativar `PIPELINE_AUTOMATION_FROZEN`;
- falha de correlação entre Meet/OAuth/cron e o learner;
- impossibilidade de limpar ou expirar o dado criado pelo teste.

Uma falha operacional deve manter o Item 8 como `OPEN`; não transformar um teste parcial em aceitação.

## 8. Pacote de evidências

Ao terminar, reunir um pacote contendo:

- ambiente, commit e janela de execução;
- autorização e papéis, sem credenciais;
- matriz de testes A1–A3, B1–B3 e C1–C8;
- IDs de correlação sanitizados;
- logs ou respostas minimizadas;
- screenshots do dashboard sem PII desnecessária;
- resultado positivo e negativo de isolamento;
- evidência de limpeza/expiração;
- links de CI relevantes e limitações conhecidas;
- decisão: `PASS`, `PASS WITH LIMITATIONS` ou `FAIL`.

## 9. Critério de fechamento do Item 8

Marcar o Item 8 como `DONE` somente quando todos os gates abaixo forem `PASS`:

- [ ] Gate A — autenticação, autorização e isolamento;
- [ ] Gate B — Meet, organizer OAuth e cron/webhook reconciliados;
- [ ] Gate C — witness source-to-dashboard completo;
- [ ] pacote de evidências revisado por responsável autorizado;
- [ ] limites e eventuais exceções registrados no `PRIME_EXECUTION_CLOSURE_LEDGER.md`;
- [ ] nenhum segredo, dado não autorizado, migration ou alteração fora do escopo;
- [ ] Issue #58 atualizada para refletir a decisão real.

Sem esses artefatos, o estado correto continua sendo **Item 8 OPEN / Issue #58 OPEN**.

## 10. Pós-execução

Se os três gates passarem, atualizar:

- `docs/operations/PRIME_EXECUTION_CLOSURE_LEDGER.md`;
- `docs/operations/ISSUE_58_ITEM7_RECONCILIATION.md`;
- este plano com a data e o resultado da execução;
- comentário da Issue #58 com links para as evidências sanitizadas.

Se qualquer gate falhar, registrar a falha, preservar os artefatos mínimos necessários e abrir uma ação corretiva específica sem fechar o Item 8.
