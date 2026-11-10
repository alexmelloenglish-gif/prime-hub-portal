# PRIME Data Retention and Controlled Deletion Policy v1

**Status:** proposta implementável para revisão
**Escopo:** snapshots, transcripts, evidências, sinais, insights, reports, áudio e eventos operacionais do PRIME Digital Hub.

## Objetivo

Reduzir exposição desnecessária de dados pessoais e pedagógicos, preservando a autoridade histórica necessária para auditoria e continuidade da aprendizagem. Nenhum dado histórico deve ser apagado, anonimizado ou reescrito automaticamente sem uma decisão registrada e uma referência de origem.

## Classificação e retenção padrão

| Classe | Exemplos | Retenção padrão | Regra |
|---|---|---:|---|
| Identidade e autorização | e-mail, relação conta→learner, eventos de vínculo | Enquanto a relação estiver ativa + 12 meses | Excluir ou anonimizar após encerramento, salvo obrigação/decisão documentada |
| Fonte de aula | transcript, sourceFileId, provenance, hash | 24 meses após a última decisão pedagógica relacionada | Manter o mínimo necessário para reproduzir a decisão |
| Evidência pedagógica | Evidence Candidate, Signal, Insight, review decision | Vida da relação educacional + 24 meses | Não apagar evidência aceita sem preservar decisão de retenção |
| Projeção do aluno | dashboard, portfolio projection, class report | Vida da relação educacional + 24 meses | Excluir/anonimizar somente por processo controlado |
| Áudio | submission de voz e metadados | 90 dias após review ou rejeição | Storage privado, TTL e exclusão verificável |
| Eventos técnicos | PipelineRun, PipelineEvent, logs de execução | 180 dias | Remover payloads sensíveis antes de estender retenção |
| Backups e snapshots de desenvolvimento | JSONs, fixtures e exports | Não permitido por padrão | Manter apenas itens aprovados, anonimizados ou necessários para teste |

Os prazos são defaults de produto e não substituem orientação jurídica, contratual ou regulatória.

## Regras de exclusão

1. **Sem exclusão automática de histórico pedagógico.** A aplicação deve exigir uma solicitação identificada, escopo explícito, motivo e revisão administrativa.
2. **Sem alteração de presença ou relatório para “limpar” dados.** Correção exige evidência de origem e registro de reconciliação.
3. **Áudio deve ser excluído primeiro.** A retenção de áudio não deve ser usada como substituto para retenção de evidência textual já revisada.
4. **Anonimização é preferível à remoção quando a evidência histórica ainda for necessária.** O vínculo entre identidade e registro deve ser removido de forma irreversível, preservando somente o que for justificável.
5. **Snapshots versionados são tratados como dados de produção.** Não adicionar novos exports reais ao repositório sem aprovação explícita e classificação no inventário.
6. **Toda execução de exclusão precisa produzir um recibo.** O recibo deve registrar operador, escopo, contagem, horário, resultado e referência da solicitação, sem conter conteúdo pessoal desnecessário.

## Fluxo controlado

```text
solicitação identificada
→ classificação do escopo
→ revisão administrativa
→ dry-run com contagens
→ confirmação explícita
→ execução idempotente
→ recibo sem PII
→ verificação de ausência
```

O primeiro entregável de implementação é o inventário limitado (`npm run privacy:inventory`). Ele classifica caminhos rastreados por padrões conhecidos e conta arquivos cujo conteúdo contém somente dois padrões: e-mails e URLs de Google Docs. A saída contém contagens e categorias, não valores encontrados. **Isto não é um scanner abrangente de PII/DLP:** não inspeciona semanticamente transcripts, áudio, imagens, PDFs, payloads do banco, arquivos não rastreados, histórico Git ou conteúdo externo; também não comprova detecção de todo arquivo sensível novo fora de áreas aprovadas. Resultados negativos significam apenas que os padrões implementados não foram encontrados no escopo lido. A execução destrutiva permanece separada e não faz parte deste lote.

## Escopo real e limitações do inventário

- Entradas: somente arquivos retornados por `git ls-files` no checkout em que o comando é executado.
- Classificação: padrões de caminho para snapshots, portfolios, documentos forenses, mídia, exports e fixtures.
- Busca no conteúdo: somente expressões regulares para e-mails e URLs de Google Docs; não valida se um candidato é dado pessoal real.
- Saída: contagens, categorias e número de arquivos candidatos; nenhum caminho ou valor encontrado é impresso.
- Arquivos binários/ilegíveis: leitura como texto UTF-8 com falhas ignoradas; portanto, não há garantia de inspeção de conteúdo binário.
- Não cobre banco de dados, storage remoto, transcripts fora do repositório, áudio, imagens, anexos, histórico Git ou arquivos não rastreados.

## Fora do escopo desta versão

- Apagar snapshots existentes automaticamente.
- Reescrever dados históricos de estudantes.
- Executar migrations em produção.
- Decidir prazos legais finais.
- Migrar imediatamente todo o áudio para um provedor externo.

## Critério de aceite

A política será considerada implementada quando:

- o inventário seguro rodar localmente e no CI;
- o escopo de varredura e suas limitações estiverem explícitos; detecção abrangente de novos arquivos sensíveis exige um controle adicional de allowlist/policy e não é fornecida por este inventário;
- qualquer exclusão futura exigir dry-run, confirmação e recibo;
- o owner do produto aprovar os prazos definitivos.
