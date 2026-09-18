# G6 — Registro de Reconciliação da Execução da Migration

**Data do registro:** 2026-09-18  
**Status:** SCHEMA APPLIED / PROVENANCE OPEN  
**Gate:** G6  
**Migration:** `20260918100000_add_account_learner_relation`

## Resumo executivo

A migration de schema do G6 foi aplicada no PostgreSQL/Neon configurado para o projeto. O registro `_prisma_migrations` confirma a aplicação sem rollback, e a leitura do schema confirma que as duas tabelas de autoridade foram materializadas com os invariantes esperados.

A aplicação ocorreu antes da sequência operacional prescrita pelo ADR-003. O operador, a referência de aprovação, o registro de release e a confirmação do plano de recuperação não estão identificados nos artefatos atualmente preservados. Esses campos permanecem **UNKNOWN**. Este documento não preenche essas lacunas por inferência.

A aplicação da migration não criou nenhuma relação de domínio. As tabelas `account_learner_relations` e `account_learner_relation_events` estão vazias. Portanto, a infraestrutura de schema está presente, mas não existe autorização conta → learner.

> **G6 schema migration was applied before the prescribed post-merge operational sequence; the database state is valid and domain rows remain zero, but the operator/authorization provenance of that execution remains unresolved.**

## Linha do tempo factual

| Evento | Evidência | Estado |
|---|---|---|
| Aplicação da migration G6 | `_prisma_migrations` | `started_at = 2026-09-18 08:00:54.053 UTC` |
| Finalização da migration G6 | `_prisma_migrations` | `finished_at = 2026-09-18 08:00:54.236 UTC` |
| Rollback | `_prisma_migrations` | `rolled_back_at = NULL` |
| Merge da PR #33 | GitHub | merge commit `2a7e6da748dca9df8251756c5ca8dbd1df3da8b7` |
| Deployment Production | Vercel | `dpl_FdzG6LSTr8GdahEHoYUDayAV1T6y`, `READY` |

A conversão do horário da migration corresponde a **2026-09-18 05:00:54 BRT**. A migration foi aplicada antes do merge da PR #33 e antes do deployment Production do merge commit.

## Estado de schema confirmado

As seguintes estruturas estão presentes:

```text
account_learner_relations
account_learner_relation_events
```

A leitura read-only encontrou os invariantes previstos no contrato G6:

```text
unique(userId, studentId)       PRESENT
status checks                   PRESENT
relationType checks             PRESENT
validity checks                 PRESENT
revocation fields               PRESENT
foreign keys                    PRESENT
```

Os detalhes acima comprovam a materialização do schema. Eles não comprovam que qualquer usuário esteja autorizado a acessar um learner.

## Estado de domínio confirmado

```text
account_learner_relations       rows = 0
account_learner_relation_events rows = 0
Gustavo relation                NOT CREATED
domain authorization             NONE
```

A ausência de linhas é uma propriedade importante do estado atual. Ela deve ser preservada até que uma operação administrativa explícita crie uma relação válida por meio do serviço server-side definido pelo ADR-002.

Nenhuma evidência desta reconciliação autoriza:

- procurar uma conta por e-mail;
- converter `studentEmail` em `studentId`;
- criar uma relação para Gustavo;
- inferir uma relação de responsável ou contato;
- executar shadow resolution;
- fazer dashboard cutover;
- alterar o CLR ou a projeção G5.

## Reconciliação com o ADR-003

O ADR-003 define a sequência operacional esperada:

```text
merge em main
    ↓
Production build sem migration
    ↓
aprovação operacional separada
    ↓
prisma migrate deploy
    ↓
read-back do schema
```

A evidência preservada demonstra que a aplicação real da migration ocorreu antes dessa sequência. Portanto, o resultado não deve ser descrito como uma execução conforme ao ADR-003.

| Controle de governança | Resultado |
|---|---|
| Migration aplicada | **PROVEN** |
| Schema read-back | **PASS** |
| Relações de domínio = 0 | **PASS** |
| Operador | **UNKNOWN** |
| Referência de aprovação | **UNKNOWN** |
| Registro de release | **UNKNOWN** |
| Confirmação do plano de recuperação | **UNKNOWN** |
| Conformidade temporal com ADR-003 | **NOT PROVEN / DIVERGENT** |

O estado `UNKNOWN` significa que a evidência não está disponível nos artefatos preservados. Não significa que a execução foi necessariamente não autorizada; significa que a autorização não pode ser demonstrada.

## Ações proibidas neste checkpoint

Não executar novamente:

```bash
npm run db:migrate:deploy
```

A migration já consta como aplicada. Um retry cego poderia gerar ruído operacional e não resolveria a lacuna de proveniência.

Também não executar qualquer write de domínio. A infraestrutura de autoridade deve continuar vazia enquanto a reconciliação de governança não for encerrada.

## Próximo checkpoint

A próxima atividade é exclusivamente reconciliar a proveniência da execução:

```text
identificar operador
    ↓
localizar aprovação
    ↓
localizar release record
    ↓
confirmar recovery-plan decision
    ↓
registrar evidência ou manter UNKNOWN
```

Essa atividade não deve alterar o banco. Se os artefatos não forem encontrados, o estado correto continuará sendo `PROVEN / PROVENANCE OPEN`, com a divergência temporal registrada.

Somente depois desse checkpoint poderá ser avaliada uma operação separada de autorização de conta → learner. Essa operação exigirá uma `User.id` real, um `studentId` explícito, autoridade administrativa, fonte de autorização e evento de lifecycle. Ela não será criada automaticamente pela migration nem por igualdade de e-mail.

## Estado canônico de G6

```text
PR #33                         MERGED
main                           2a7e6da
Production deployment          READY
GitHub Contract                PASS
Vercel                         READY

G6 migration                   APPLIED
Schema read-back               PASS
AccountLearnerRelation rows    0
Relation event rows            0
Gustavo relation               NOT CREATED
Domain authorization           NONE

Operator                       UNKNOWN
Approval reference             UNKNOWN
Release record                 UNKNOWN
Recovery confirmation          UNKNOWN
ADR-003 sequence compliance   NOT PROVEN / DIVERGENT

CLR                            UNCHANGED
G5                             UNCHANGED
Dashboard                      UNCHANGED
Shadow resolution              NOT STARTED
Domain writes                  NONE
```

## Referências

[1]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/architecture/ADR-002-ACCOUNT-LEARNER-AUTHORIZED-RELATION_2026-09-18.md "ADR-002 — Authorized Account to Learner Relation"
[2]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/architecture/ADR-003-DATABASE-MIGRATION-DEPLOYMENT-POLICY_2026-09-18.md "ADR-003 — Política de Execução e Deploy de Migrations"
[3]: https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/main/docs/architecture/G6-ACCOUNT-LEARNER-RELATION-IMPLEMENTATION-CONTRACT_2026-09-18.md "G6 AccountLearnerRelation Implementation Contract"
