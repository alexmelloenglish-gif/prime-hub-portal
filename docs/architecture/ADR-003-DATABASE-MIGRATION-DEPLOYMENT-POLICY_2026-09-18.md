# ADR-003 — Política de Execução e Deploy de Migrations

**Data:** 2026-09-18  
**Status:** ACCEPTED  
**Escopo:** execução de migrations Prisma, separação entre build e alteração de schema, autorização operacional e rollback para G6.

## Decisão

A aplicação de migrations de banco será uma etapa **explícita, separada e protegida** do build e do deploy da aplicação.

O build do Vercel, incluindo Preview e Production, **não executará** `prisma migrate deploy`. O Vercel continuará responsável por compilar, validar e empacotar a aplicação. A alteração do schema será executada somente por um operador de release autorizado, em uma etapa manual ou em um workflow protegido que exija aprovação explícita.

O comando canônico de aplicação é:

```text
npm run db:migrate:deploy
```

Esse comando é um alias versionado para:

```text
prisma migrate deploy
```

A existência de uma migration no repositório não autoriza sua execução. A execução exige que as pré-condições desta decisão estejam satisfeitas e que o operador registre o resultado.

## Motivo

Build e migration têm propriedades operacionais diferentes. O build deve ser repetível, seguro para Preview e livre de writes no banco. A migration altera estado persistente e pode afetar todos os ambientes que compartilham o banco. Misturar as duas etapas faria uma compilação, um retry do Vercel ou uma promoção de Preview poderem produzir uma alteração de schema sem uma decisão operacional identificável.

Esta separação preserva o estado fail-closed do G6. A implementação de `AccountLearnerRelation` pode ser revisada e validada sem criar relações, sem alterar o Canonical Learning Record e sem modificar as projeções G5.

## Responsabilidades

O **autor da mudança** é responsável por fornecer a migration, seus invariantes, a compatibilidade esperada e os testes estruturais.

O **CI** é responsável por executar os testes contratuais e confirmar que a migration e o código permanecem consistentes. O CI não recebe permissão para aplicar a migration no banco compartilhado.

O **Vercel** é responsável pelo build e pelo deploy da aplicação. O Vercel não recebe permissão para executar `prisma migrate deploy` em Preview ou Production.

O **release operator** é a pessoa autorizada a executar a migration. Essa execução deve ocorrer após o merge em `main`, salvo uma exceção documentada para um ambiente isolado. O operador deve usar credenciais do ambiente de destino, verificar o alvo antes da execução e registrar o commit, a migration, o ambiente, o horário, o resultado e qualquer ação de recuperação.

A autorização de uma migration não autoriza a criação de relações de domínio. Depois de uma migration de G6, `AccountLearnerRelation` continua sem linhas até que uma operação administrativa explícita crie uma relação válida.

## Ambientes e ordem de execução

A sequência padrão é:

```text
pull request
    ↓
CI contratual + validação local + Vercel Preview
    ↓
revisão da migration e aprovação de merge
    ↓
merge em main
    ↓
Vercel Production build/deploy, sem migration
    ↓
aprovação operacional da migration
    ↓
prisma migrate deploy no ambiente de destino
    ↓
verificação read-back do schema e dos invariantes
    ↓
qualquer write de domínio somente em operação posterior e explícita
```

Uma migration de produção não deve ser executada a partir de uma branch de feature ou de um deployment Preview. O código e as migrations aplicados devem corresponder ao commit aprovado em `main`.

Quando houver um ambiente de staging ou isolado disponível, a migration deve ser aplicada e verificada nele antes da produção. A ausência desse ambiente não autoriza inferência de sucesso; nesse caso, o registro operacional deve declarar que a verificação foi feita diretamente no alvo de produção sob a janela aprovada.

## Pré-condições obrigatórias

Antes da execução, o release operator deve confirmar:

1. A PR foi revisada e não está em estado Draft.
2. O commit a ser promovido está em `main` e corresponde ao artefato validado.
3. O CI contratual está verde para esse commit.
4. O deployment Vercel correspondente está `READY` e foi construído sem executar migrations.
5. `prisma validate`, `prisma generate`, o TypeScript e o build de produção passaram para o mesmo estado do código.
6. A migration está ordenada corretamente em relação às migrations já aplicadas.
7. A mudança é compatível com a versão da aplicação que está em execução ou a ordem de rollout foi explicitamente aprovada.
8. O operador confirmou o ambiente e a conexão de destino antes de executar o comando.
9. Existe um plano de recuperação adequado ao tipo de mudança. Para migrations destrutivas ou irreversíveis, a execução permanece bloqueada até que a recuperação seja aprovada.
10. A autorização está registrada com commit, nome da migration e ambiente.

Se qualquer pré-condição não puder ser demonstrada, a execução deve parar sem tentar compensar a ausência por inferência.

## Regras específicas para G6

A migration `20260918100000_add_account_learner_relation` pode criar a infraestrutura de relação e seus eventos, mas não pode inserir uma relação automaticamente.

A aplicação da migration não pode:

- procurar `User` por e-mail para criar uma relação;
- converter `studentEmail` em `studentId`;
- criar uma relação para Gustavo ou qualquer outro learner;
- alterar o CLR;
- alterar a projeção G5;
- executar shadow resolution como efeito colateral;
- fazer cutover de dashboard;
- preencher `guardianEmail` ou `accountContactEmail` por inferência.

Após a migration, o estado esperado do domínio é:

```text
schema infrastructure       PRESENT
AccountLearnerRelation rows  ZERO
relation events              ZERO
Gustavo relation             NOT CREATED
canonical records            UNCHANGED
G5 projections               UNCHANGED
dashboard routing            UNCHANGED
```

Uma primeira relação só poderá ser criada por uma operação privilegiada server-side, com `User.id` existente, `studentId` explícito, autoridade administrativa, `sourceType`, `sourceReference` e evento de autorização persistido.

## Verificação pós-execução

O operador deve confirmar, sem criar dados de domínio:

```text
migration status = applied
schema invariants = valid
AccountLearnerRelation row count = unchanged
AccountLearnerRelationEvent row count = unchanged
G1–G5 records = unchanged
```

A verificação deve ser read-only. A presença das tabelas não prova que uma conta está autorizada a acessar um learner. Essa autorização só existe para uma relação `ACTIVE` criada pelo serviço privilegiado e válida segundo o resolver fail-closed.

## Falha e recuperação

Se `prisma migrate deploy` falhar, o operador deve preservar a saída do comando e não executar novamente de forma cega. Deve verificar o estado de migration antes de qualquer retry, identificar se a falha ocorreu antes, durante ou depois da aplicação, e seguir o procedimento de recuperação aprovado para aquela migration.

Não é permitido usar `prisma db push`, editar manualmente a tabela `_prisma_migrations`, apagar registros de migration ou criar uma migration corretiva improvisada para contornar uma falha.

Uma migration transacional pode ser reavaliada somente após a confirmação do estado do banco. Uma migration parcialmente aplicada ou não reversível exige investigação e uma mudança corretiva versionada. O rollback de aplicação não é considerado rollback de schema; se a aplicação anterior não for compatível com o schema novo, essa incompatibilidade deve ter sido tratada no plano de rollout antes da execução.

## Evidência e registro

Cada execução autorizada deve registrar, no mínimo:

```text
commit SHA
migration name
environment
operator identity
approval reference
start time
finish time
command result
post-migration verification result
recovery action, if any
```

O registro deve ser anexado ao release ou ao artefato operacional correspondente. A ausência do registro impede declarar a migration como verificada.

## Consequências

A política adiciona uma etapa operacional explícita ao rollout, mas elimina a possibilidade de um build automático alterar o banco. Isso torna o fluxo compatível com o princípio de menor autoridade e mantém Preview, CI e produção separáveis.

A política não exige alteração do Vercel build atual: o contrato já define que `vercel-build` executa o build e os self-tests, sem `prisma migrate deploy`. A infraestrutura de execução manual ou workflow protegido deve ser disponibilizada pelo processo de release antes da primeira migration em produção; até lá, a migration permanece não aplicada.

## Estado resultante para a PR #33

Com este ADR, a política de migration está formalizada e aceita. Isso não equivale a autorização para executar a migration da PR #33.

```text
policy decision       ACCEPTED
PR #33                technically validated / still DRAFT until review policy is applied
Vercel build          no migration
migration execution   NOT AUTHORIZED FOR THIS PR
migration applied     NO
relation creation     NO
production writes     NONE
```

## Registro de aprovação

A aceitação deste ADR formaliza a decisão operacional solicitada em 2026-09-18. Ela não autoriza merge, `prisma migrate deploy` ou criação de qualquer `AccountLearnerRelation`.

**Aprovado por:** decisão de governança G6 registrada no fluxo da tarefa  
**Data de aprovação:** 2026-09-18

## Apêndice — comando operacional

```bash
# somente após as pré-condições e aprovação operacional
npm run db:migrate:deploy
```

O comando deve ser executado com as variáveis de ambiente do alvo explicitamente selecionado. URLs locais fictícias usadas para validação estática não são credenciais de execução.

## Referências

[1]: https://www.prisma.io/docs/orm/prisma-migrate/workflows/production-troubleshooting "Prisma ORM production troubleshooting"
[2]: https://www.prisma.io/docs/orm/prisma-migrate/workflows/production-and-testing "Prisma ORM production and testing workflows"
[3]: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment "GitHub Actions environments and deployment protection rules"

A política interna deste ADR é a autoridade operacional do projeto. As referências externas documentam os mecanismos gerais de migration e proteção de ambientes.
