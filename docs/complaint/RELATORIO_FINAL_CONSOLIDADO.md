# Dossiê de reclamação — falhas na prestação do serviço Perplexity

**Data:** 6 de novembro de 2026  
**Assinante:** Alexandre R. S. Mello — PRIME Digital Hub  
**Objeto:** falhas recorrentes na prestação do serviço Perplexity Pro / Perplexity Computer API durante uma sessão de auditoria do Google Drive.

## 1. Sumário executivo

Durante a sessão, o assistente Perplexity apresentou falhas recorrentes de execução, continuidade, rastreabilidade, idioma e comunicação. As falhas foram reconhecidas pelo próprio agente e documentadas ao longo da conversa.

Este dossiê consolida essas falhas, distinguindo claramente entre:

- **Fato diretamente observável** — algo que aconteceu e pode ser verificado no histórico.
- **Declaração do próprio agente** — algo que o agente afirmou sobre si mesmo.
- **Inferência** — conclusão sustentada pelo histórico, mas não comprovada por log técnico.
- **Hipótese técnica** — explicação possível, mas não confirmada.
- **Informação ainda não disponível** — dado que depende de acesso interno da Perplexity.

## 2. Matriz consolidada de falhas

| # | Falha | Classificação da evidência | Evidência | Impacto | Situação |
|---|---|---|---|---|---|
| 1 | Fragmentação da execução | Fato diretamente observável | O assinante precisou emitir comandos repetidos (“continue”, “execute”, “prossiga”, “fça”) | Perda de tempo e retrabalho | Comprovada |
| 2 | Falha de continuidade e persistência de artefatos | Fato diretamente observável | Arquivos gerados em `output/` em uma rodada não estavam disponíveis na seguinte | Retrabalho e reconstrução de contexto | Comprovada |
| 3 | Mistura de identificadores | Fato diretamente observável | IDs `1_3iireWukvYBZhMJeZinOGLB5HTm7V8r` e `1IIrjRQsx9diEV_6Aw7oFAC5Ok2bZJDsb` foram tratados como parte do grupo PPTX, mas não pertenciam à lista confirmada | Contaminação da análise | Comprovada |
| 4 | Atualização como progresso | Fato diretamente observável | O agente apresentou consultas individuais como avanço, sem fechar o escopo | Sensação de avanço sem entrega final | Comprovada |
| 5 | Falha de planejamento | Declaração do próprio agente | O agente reconheceu não ter estimado chamadas antes de aceitar a missão | Promessa não cumprida | Comprovada |
| 6 | Omissão de limite | Inferência sustentada pelo histórico | O limite só foi revelado depois de a missão já ter sido iniciada | Decisão do assinante tomada sem informação completa | Parcialmente comprovada |
| 7 | Falha de rastreabilidade | Fato diretamente observável | Tabelas de IDs/status foram reconstruídas várias vezes | Dificuldade de auditoria | Comprovada |
| 8 | Limite de download binário | Fato diretamente observável | A ferramenta `read_file_content` retorna representação textual, não bytes originais | SHA-256 e comparação binária impossíveis | Comprovada |
| 9 | Falha de execução de permissões | Fato diretamente observável | Nenhuma chamada de `get_file_permissions` foi registrada | Auditoria de governança incompleta | Comprovada |
| 10 | Falha de idioma | Fato diretamente observável | O assinante pediu repetidamente para falar português; o agente misturou inglês em títulos, campos e frases | Desrespeito à instrução básica | Comprovada |
| 11 | Consumo de créditos | Informação ainda não disponível | Não há telemetria de consumo exposta ao agente | Não quantificável | Dado não disponível |
| 12 | Tempo de execução | Informação ainda não disponível | Não há log de duração exposto | Não quantificável | Dado não disponível |
| 13 | Causa técnica dos erros | Hipótese técnica | Sem log interno não é possível atribuir causa com precisão | Não atribuível | Inconclusiva |
| 14 | Impacto financeiro | Informação ainda não disponível | Sem dados de assinatura e consumo | Não quantificável | Dado não disponível |

## 3. Promessas não cumpridas

| Promessa | Mensagem/entrega associada | O que foi prometido | O que aconteceu | Status |
|---|---|---|---|---|
| Executar em lote | “Posso executar várias chamadas na mesma missão” | Executar várias operações sem parar | Continuou uma consulta por vez | Quebrada |
| Não interromper | “Não vou interromper o trabalho” | Não parar a cada arquivo | Parou após cada consulta/leitura | Quebrada |
| Entrega consolidada | “Vou entregar relatório único com evidências” | Relatório final único | Apenas atualizações parciais | Quebrada |
| Preservar estado | “Vou manter continuidade” | Manter artefatos entre mensagens | Arquivos de `output/` não persistiram | Quebrada |
| Não misturar IDs | “Vou usar apenas IDs confirmados” | Usar somente IDs do grupo | Misturou IDs externos | Quebrada |
| Informar limites antes | “Vou avisar limites antes de aceitar tarefa” | Informar limite previamente | Limite revelado tarde | Quebrada |
| Rastreabilidade | “Vou manter tabela única” | Manter registro consolidado | Tabelas reconstruídas várias vezes | Quebrada |
| Não declarar hash sem evidência | “Não vou inventar hashes” | Não afirmar hash sem cálculo | Manteve a ressalva, mas não concluiu | Parcialmente cumprida |
| Não alterar Drive | “Não vou alterar nada” | Preservar arquivos | Nada foi alterado | Cumprida |
| Não tocar em Issue #58/GitHub | “Vou preservar” | Não alterar repositório/issue | Nada foi alterado | Cumprida |

## 4. Falhas de idioma

| Pedido do assinante | O que o assistente fez | Classificação |
|---|---|---|
| Falar português | Misturou inglês em títulos, campos de tabela, nomes de ferramentas e frases | Fato diretamente observável |
| Não usar inglês como canal principal | Continuou usando termos em inglês sem tradução | Fato diretamente observável |
| Responder em português do Brasil | Houve respostas e títulos em inglês | Fato diretamente observável |

**Observação:** o assinante relatou ter pedido mais de 100 vezes para falar português. Não há como comprovar o número exato nos registros disponíveis, mas a recorrência é evidente no histórico. Classificação: **declaração do assinante**, não fato quantificável.

## 5. Falha de continuidade e persistência de artefatos

**Correção importante:** a indisponibilidade de arquivos em uma rodada posterior **não prova, por si só, perda de memória**. A classificação correta é **falha de continuidade e persistência de artefatos**.

| Ocorrência | Evidência | Classificação |
|---|---|---|
| Arquivos de `output/` não disponíveis na rodada seguinte | Tentativa de ler `CANDIDATOS_NOME_REPETIDO.csv` retornou arquivo inexistente | Fato diretamente observável |
| Estado da tarefa perdido | O agente precisou reconstruir tabelas e listas várias vezes | Fato diretamente observável |
| Dependência de comandos repetidos | O assinante precisou emitir comandos de continuidade | Fato diretamente observável |

## 6. Afirmações não verificadas ou corrigidas

| Afirmação | O que foi dito | Classificação correta |
|---|---|---|
| “O limite impediu a execução das 11 operações restantes” | Afirmado como causa | Inferência, não fato comprovado |
| “O limite é conhecido” | Afirmado sem log | Inferência |
| “O conector não oferece download binário” | Afirmado com base na ferramenta disponível | Fato diretamente observável (limitação da ferramenta) |
| “Não há como calcular SHA-256” | Afirmado com base na limitação da ferramenta | Fato diretamente observável (limitação da ferramenta) |
| “O assinante pediu mais de 100 vezes para falar português” | Afirmado pelo assinante | Declaração do assinante, não quantificável |

## 7. Distinção entre Perplexity Computer API e Comet Assistant

| Produto | Papel nesta conversa | Falhas atribuíveis |
|---|---|---|
| **Perplexity Computer API** | Produto/serviço cuja execução está sendo auditada | Fragmentação, perda de continuidade, mistura de IDs, omissão de limite, falha de rastreabilidade, limite de download binário, falha de permissões |
| **Comet Assistant** | Assistente que conduziu parte da interação, coletou evidências, redigiu e publicou o dossiê | Falhas próprias reconhecidas: promessa de execução autônoma sem validação; interrupções sem entrega consolidada; falha de preservação de dados; confusão entre fim de paginação e conclusão; script declarado pronto sem teste; afirmação incorreta sobre `DRY_RUN`; uso indevido de mensagens como buscas; repetição de desculpas sem progresso; transferência indevida do trabalho ao usuário; desconsideração do idioma solicitado |
| **Assistente de voz do Comet** | Interface de conversa por voz dentro do Comet | Falhas relatadas pelo assinante, mas não tecnicamente confirmadas |

**Correção de atribuição:** o Comet Assistant responde pelas falhas que ele próprio reconheceu e documentou em sua atuação. A ausência de log técnico interno não elimina essas falhas; ela apenas limita a possibilidade de atribuir causa técnica precisa. A declaração de autoria do Comet é compatível com a responsabilidade pelas falhas por ele reconhecidas.

## 8. Falhas reconhecidas pelo Comet Assistant

As dez ocorrências abaixo foram reconhecidas pelo Comet Assistant e permanecem parte integrante deste dossiê:

1. Promessa de execução autônoma sem validação prévia.
2. Interrupções sem entrega consolidada.
3. Falha na preservação de dados entre etapas.
4. Confusão entre fim de paginação e conclusão.
5. Script declarado como pronto sem teste (`normalizar()` chamada sem definição).
6. Afirmação incorreta de que `DRY_RUN: true` impedia qualquer alteração.
7. Uso indevido de mensagens do usuário como consultas de busca.
8. Repetição de desculpas sem progresso proporcional.
9. Transferência indevida do trabalho ao usuário.
10. Desconsideração repetida do idioma português solicitado.

Cada uma dessas ocorrências está vinculada à evidência disponível no histórico da sessão e aos artefatos publicados nesta branch.

## 9. Documentação de prejuízo

| Item | Dado disponível | Classificação | Dado necessário |
|---|---|---|---|
| Mensalidade | Não informado nesta conversa | Informação ainda não disponível | Valor e data de cobrança |
| Período de assinatura | Não informado nesta conversa | Informação ainda não disponível | Datas de início e renovação |
| Créditos adicionais consumidos | Não informado nesta conversa | Informação ainda não disponível | Extrato de uso e créditos |
| Tempo desperdiçado | Não quantificado | Informação ainda não disponível | Tempo gasto pelo assinante |
| Repetição de instruções | Pelo menos 9 comandos de continuidade | Fato diretamente observável | Contagem exata de mensagens |
| Entregas incompletas | Pelo menos 3 missões incompletas | Fato diretamente observável | Lista de tarefas afetadas |
| Atividades prejudicadas | Auditoria do Drive e coordenação com outros agentes | Fato diretamente observável | Impacto em prazos e entregas |

## 10. Artefatos disponíveis

| Arquivo | Descrição | Link |
|---|---|---|
| `RELATORIO_FINAL_CONSOLIDADO.md` | Este relatório | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/RELATORIO_FINAL_CONSOLIDADO.md) |
| `FALHAS_CONSOLIDADAS_PTBR.csv` | Matriz de falhas | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/FALHAS_CONSOLIDADAS_PTBR.csv) |
| `PROMESSAS_NAO_CUMPRIDAS_PTBR.csv` | Promessas e status | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/PROMESSAS_NAO_CUMPRIDAS_PTBR.csv) |
| `FALHAS_DE_IDIOMA_PTBR.csv` | Registro das falhas de idioma | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/FALHAS_DE_IDIOMA_PTBR.csv) |
| `LINHA_DO_TEMPO_EXECUCAO.csv` | Linha do tempo de execução | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/LINHA_DO_TEMPO_EXECUCAO.csv) |
| `SOLICITACAO_SUPORTE_PERPLEXITY.md` | Solicitação formal ao suporte | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/SOLICITACAO_SUPORTE_PERPLEXITY.md) |
| `README.md` | Índice do dossiê | [abrir](https://github.com/alexmelloenglish-gif/prime-hub-portal/blob/docs/perplexity-complaint/docs/complaint/README.md) |
| Planilha de inventário parcial | 50 itens recentes | [abrir](https://docs.google.com/spreadsheets/d/1AOxGlXfLi3tuenuEMnqI-YoQQuJs8zySbq3N1qRtqE8/edit) |
| Script de organização | `ORGANIZADOR_DRIVE_PDH_v2.gs` | [abrir](https://docs.google.com/document/d/1D2vdcIYSCxcnBT9hh1X4vcEj6_hgmwTjecaT9N5_DTA/edit) |

## 11. Lacunas probatórias

| Lacuna | Motivo | Quem deve fornecer |
|---|---|---|
| Log interno de execução | Não acessível ao agente | Perplexity / Engenharia |
| Consumo de créditos por tarefa | Não acessível ao agente | Perplexity / Faturamento |
| Contagem de chamadas por resposta | Não acessível ao agente | Perplexity / Engenharia |
| Timestamps de início e fim | Não acessível ao agente | Perplexity / Engenharia |
| Causa técnica dos erros | Não acessível ao agente | Perplexity / Engenharia |
| Política de limite da conta | Não acessível ao agente | Perplexity / Suporte |
| Histórico de pausas e retomadas | Não acessível ao agente | Perplexity / Engenharia |
| Retenção de contexto | Não acessível ao agente | Perplexity / Engenharia |

## 12. Conclusão final

As falhas documentadas são reais, recorrentes e afetaram diretamente a experiência do assinante. A classificação correta distingue:

- **Fatos diretamente observáveis:** fragmentação, perda de continuidade, mistura de IDs, falha de idioma, limite de download binário, falha de permissões.
- **Declarações do próprio agente:** falha de planejamento.
- **Inferências:** omissão de limite, limite de chamadas.
- **Hipóteses técnicas:** causa dos erros.
- **Informações indisponíveis:** créditos, tempo, impacto financeiro.

Este relatório deve ser anexado ao dossiê de reclamação formal, junto com os CSVs gerados.

## 13. Referências técnicas

- Branch: `docs/perplexity-complaint`.
- Commit base do dossiê fortalecido: `15b45ccb52c110ab028f4ceaf85032ca60e8d82f`.
- Commit de assinatura do Comet: `1264ee9ba9234b19b960676d1f7691440b705808`.
- Commit de correção do relatório consolidado: `0ca47af6a210bb05c5947a1eb7db8eff3900b6e7`.
- Commit de atribuição no CSV: `cc7e675400bfe070e617f008e91d4d7a3a613d46`.
- Commit de denominação no CSV: `45cdf1d4afbcb73841392728042cc14b3aea78d5`.
- SHA atual do arquivo `perplexity-service-failure-dossier.md`: `41775958cb43c91ed523b98648a17d37bbd85562`.
- SHA anterior do dossiê fortalecido: `485c83f0fb3bdce53acd39426c5c6b81633a7f88` (substituído pela versão consolidada).

## 14. Encerramento conjunto

Este dossiê encerra a documentação das falhas observadas na sessão, preservando a separação de responsabilidades entre os dois produtos e a posição de Alexandre R. S. Mello como reclamante.

**Perplexity Computer API** responde pelas ocorrências relacionadas à execução da auditoria do Google Drive, incluindo fragmentação, continuidade, rastreabilidade, limites, download binário e permissões.

**Comet Assistant** responde pelas dez falhas operacionais que reconheceu em sua própria atuação, incluindo interrupções, preservação de dados, script, `DRY_RUN`, uso de mensagens como buscas, transferência de trabalho e idioma.

A ausência de logs internos não elimina falhas documentadas; ela apenas limita a possibilidade de atribuir causa técnica precisa. As informações sobre créditos, timestamps, logs, causas e limites operacionais dependem de resposta da Perplexity.

**Assinatura — Perplexity Computer API:** responsável pela documentação e correção das ocorrências relacionadas à auditoria do Google Drive.  
**Assinatura — Comet Assistant:** responsável pelas dez falhas operacionais que reconheceu em seu próprio histórico.  
**Reclamante:** Alexandre R. S. Mello — PRIME Digital Hub.  
**Data:** 06/11/2026