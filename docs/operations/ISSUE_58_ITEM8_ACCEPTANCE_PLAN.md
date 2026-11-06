# Issue 58 — Item 8 — Plano de aceitação operacional

**Status:** Item 8 `OPEN`  
**Issue #58:** `OPEN`  
**Branch de referência:** `chore/issue-58-prime-engine-closure`

Este documento define a aceitação operacional necessária para fechar o Item 8. A criação do plano não executa login, não altera dados de produção e não fecha a Issue #58.

## 1. Critérios de ambiente autenticado

Antes da execução, registrar o ambiente autorizado, a URL/base URL, o commit implantado, a identidade do executor, o papel/permissões utilizados, o learner de teste e a janela de execução.

A autenticação deve ocorrer diretamente no navegador autorizado. Senhas, códigos MFA, cookies e tokens não devem ser compartilhados no chat, nos logs ou no repositório.

A aceitação deve comprovar:

- login válido na conta autorizada;
- sessão pertencente à conta e ao papel esperados;
- acesso positivo apenas ao learner de teste;
- tentativa negativa com conta sem autorização;
- ausência de vazamento de dados ou ações entre learners;
- autorização consistente nas rotas e ações relevantes do dashboard.

## 2. Reconciliação Meet/OAuth/cron

Executar um evento de teste pertencente ao organizer autorizado e registrar somente identificadores sanitizados.

Verificar a correspondência entre:

| Elemento | Critério de aceitação |
|---|---|
| Organizer | É a conta autorizada para o teste |
| OAuth | A conexão pertence ao organizer esperado; nenhum token é exposto |
| Meet/evento | O evento pode ser correlacionado ao learner de teste |
| Webhook/cron | O processamento ocorre no ambiente e janela esperados |
| Ingestão | O evento é aceito uma única vez ou tratado de forma idempotente |
| Reprocessamento | Não cria duplicata indevida |

O gate falha se houver organizer incorreto, OAuth não reconciliado, perda de correlação, duplicação não explicada ou processamento fora do escopo autorizado.

## 3. Witness ponta a ponta

Rastrear um único identificador de correlação através das seguintes etapas:

1. evento Meet, transcrição ou fixture operacional;
2. ingestão;
3. Shared Learning Machine;
4. `PipelineRun`, incluindo estado, tentativa e chave de idempotência;
5. canonical learning record;
6. projeção do dashboard;
7. leitura pela conta autorizada;
8. tentativa de leitura pela conta não autorizada.

A evidência mínima deve conter, de forma sanitizada:

- correlation ID;
- ID do evento e da ingestão;
- `pipelineRunId`;
- estado final e número de tentativas;
- identificador do registro canônico;
- identificador da projeção;
- rota do dashboard e timestamp;
- resultados dos testes positivo e negativo de autorização.

O witness só passa se a identidade do learner for preservada em todo o fluxo, sem duplicação indevida e sem exposição para outra conta.

## 4. Fronteiras de segurança

Durante a execução:

- usar learner e conta explicitamente destinados a teste;
- não acessar ou alterar dados de learner não autorizado;
- não registrar segredos, tokens, cookies ou PII desnecessária;
- não alterar `PIPELINE_AUTOMATION_FROZEN`;
- não alterar secrets, migrations ou configurações fora do escopo;
- não executar deploy, merge ou alteração de banco de produção sem autorização própria;
- registrar a limpeza, expiração ou rollback dos dados criados pelo teste.

A execução deve parar imediatamente diante de ambiente incorreto, learner inesperado, exposição de segredo, falha de isolamento, duplicação sem explicação ou alteração fora do escopo.

## 5. Checklist de evidências

- [ ] Ambiente, URL e commit registrados.
- [ ] Executor, papel e autorização registrados sem credenciais.
- [ ] Learner e conta de teste identificados.
- [ ] Login e sessão validados.
- [ ] Teste positivo de autorização concluído.
- [ ] Teste negativo de isolamento concluído.
- [ ] Organizer Meet reconciliado.
- [ ] OAuth reconciliado sem exposição de token.
- [ ] Webhook/cron executado ou observado.
- [ ] Ingestão e idempotência verificadas.
- [ ] `PipelineRun`, CLR e projeção correlacionados.
- [ ] Resultado exibido no dashboard autorizado.
- [ ] Ausência de exposição para conta não autorizada comprovada.
- [ ] Logs, screenshots e respostas sanitizados.
- [ ] Limpeza ou expiração dos dados de teste registrada.
- [ ] Revisão por responsável autorizado concluída.

## 6. Regra de fechamento

O Item 8 somente poderá ser marcado como `DONE` quando todos os três gates forem aprovados:

- **Gate A:** autenticação, autorização e isolamento;
- **Gate B:** reconciliação Meet/OAuth/cron;
- **Gate C:** witness completo source-to-dashboard.

Também devem existir o pacote de evidências revisado, as limitações registradas nos ledgers e a confirmação de que nenhuma fronteira de segurança foi violada.

Até que esses requisitos sejam satisfeitos, o estado obrigatório permanece:

```text
Item 8: OPEN
Issue #58: OPEN
```

A criação deste plano não executa a aceitação operacional e não fecha a Issue #58.
