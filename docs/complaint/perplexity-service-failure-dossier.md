# Dossiê consolidado — Perplexity Pro — Computer App

**Data:** 6 de novembro de 2026  
**Assinante:** Alexandre R. S. Mello — PRIME Digital Hub  
**Objeto:** consolidação do dossiê de reclamação sobre falhas na prestação do serviço Perplexity Pro — Computer App durante sessão de auditoria do Google Drive.

## 1. Natureza deste documento

Este documento **consolida e complementa** o dossiê fortalecido já publicado (`perplexity-service-failure-dossier.md`, commit `15b45cc...`), preservando integralmente sua matriz de evidências, enquadramento jurídico, quantificação de danos, anexos, pedidos e limites da prova.

Nada aqui contradiz o conteúdo existente. O objetivo é **reforçar**, não substituir.

## 2. Matriz de evidências (mantida — 10 falhas)

A matriz original de 10 falhas (fato, fonte, data, status, impacto) permanece válida e é a base central deste dossiê. Ela cobre:

1. Fragmentação da execução.
2. Perda de continuidade e persistência de artefatos.
3. Associação indevida de identificadores externos ao grupo auditado.
4. Atualização apresentada como progresso.
5. Falha de planejamento.
6. Omissão de limite operacional.
7. Falha de rastreabilidade.
8. Limite de download binário.
9. Falha de execução de permissões.
10. Falha de idioma.

## 3. Lacunas probatórias complementares (não falhas operacionais)

Os registros abaixo **não são falhas operacionais adicionais**; são lacunas de evidência que reforçam a necessidade dos pedidos de fornecimento de registros:

| # | Registro | Classificação | Evidência | Impacto | Situação |
|---|---|---|---|---|---|
| 11 | Consumo de créditos | Informação ainda não disponível | Sem telemetria exposta ao assinante | Não quantificável sem extrato | Dado não disponível |
| 12 | Tempo de execução | Informação ainda não disponível | Sem log de duração exposto | Não quantificável sem telemetria | Dado não disponível |
| 13 | Causa técnica dos erros | Hipótese técnica | Sem log interno | Não atribuível com precisão | Inconclusiva |
| 14 | Impacto financeiro | Informação ainda não disponível | Sem dados de assinatura e consumo | Não quantificável | Dado não disponível |

## 4. Enquadramento jurídico (alinhado ao dossiê existente)

O enquadramento central permanece o já documentado:

- **Art. 6º, III e IV** — informação adequada e clara; proteção contra publicidade enganosa.
- **Art. 14** — responsabilidade pelo fato do serviço (defeito).
- **Art. 20** — vícios de qualidade que tornam o serviço impróprio ou lhe diminuem o valor.
- **Art. 30** — fornecimento de serviços contínuos.
- **Art. 39** — práticas abusivas.

Este complemento não altera o enquadramento; apenas reforça a aplicação prática de cada dispositivo aos fatos documentados.

## 5. Narrativa fato → promessa → quebra → dano → pedido

| Fato observado | Promessa relacionada | Quebra | Dano | Pedido |
|---|---|---|---|---|
| Fragmentação da execução | “Posso executar várias chamadas na mesma missão” | Execução uma consulta por vez | Perda de tempo e retrabalho | Correção do comportamento de execução em lote |
| Perda de continuidade de artefatos | “Vou manter continuidade” | Arquivos não persistiram entre rodadas | Retrabalho e reconstrução de contexto | Garantia de persistência |
| Associação indevida de IDs externos | “Vou usar apenas IDs confirmados” | IDs externos tratados como parte do grupo | Contaminação da análise | Correção do escopo |
| Omissão de limite | “Vou avisar limites antes” | Limite revelado tarde | Decisão sem informação | Disclosure prévio |
| Falha de rastreabilidade | “Vou manter tabela única” | Tabelas reconstruídas | Dificuldade de auditoria | Log estruturado |
| Limite de download binário | “Não vou inventar hashes” | Não houve download binário; conteúdo lido via representação textual | SHA-256 e comparação binária impossíveis | Acesso binário ou hash server-side |
| Falha de permissões | “Vou auditar governança” | Verificações de permissões e hashes não foram executadas | Auditoria de governança incompleta | Execução efetiva de checagens |
| Falha de idioma | “Vou falar português” | Inglês misturado | Desrespeito à instrução | Resposta em pt-BR |

## 6. Quantificação de danos (método transparente)

| Item | Método | Dado necessário | Status |
|---|---|---|---|
| Créditos consumidos | Extrato de uso ÷ tarifa por crédito | Extrato de faturamento | Não disponível ao agente; requer fornecimento pela Perplexity |
| Tempo desperdiçado | Soma dos intervalos entre comandos repetidos | Timestamps da conversa | Não disponível ao agente; requer fornecimento pela Perplexity |
| Retrabalho | Nº de reconstruções × tempo médio por reconstrução | Contagem de reconstruções | Pendente quantificação |
| Impacto em prazos | Comparação entre prazo planejado e realizado | Cronograma original | Pendente documentação |

## 7. Anexo de links e hashes

| Item | Link/Hash | Status |
|---|---|---|
| Planilha de auditoria | `Drive-Files-and-Folders.xlsx` — Google Drive do assinante | Identificado |
| Script de extração | `ORGANIZADOR_DRIVE_PDH_v2.gs.pdf` — Google Drive do assinante | Identificado |
| Branch de trabalho | `docs/perplexity-complaint` | Confirmado |
| Commit da versão fortalecida | `15b45cc...` | Confirmado |
| SHA do arquivo | `485c83f0...` | Confirmado |

## 8. Pedidos precisos e exequíveis

1. Investigação técnica formal das falhas documentadas.
2. Fornecimento de logs, timestamps, mensagens de erro, registros de retry e interrupções.
3. Extrato de consumo de créditos associado às tarefas afetadas.
4. Esclarecimento dos limites aplicáveis ao plano Pro.
5. Correção do comportamento de execução em lote, continuidade e rastreabilidade.
6. Habilitação de acesso binário ou hash server-side, quando tecnicamente viável.
7. Compensação comercial proporcional ao prejuízo, se aplicável.
8. Preservação de registros por prazo razoável.

## 9. Limites da prova e separação de responsabilidades

- Não é possível comprovar, sem log interno, a causa exata dos erros.
- Não é possível quantificar créditos consumidos sem extrato.
- Não é possível afirmar dano moral sem base concreta; o foco permanece em dano material e falha de serviço.
- **Comet Assistant:** responde pela condução da interação, coleta de evidências, redação e publicação do dossiê.
- **Perplexity (agente de IA):** responde pela consolidação redacional complementar, organização da narrativa e sugestões de fortalecimento.
- A atribuição das falhas deve distinguir a atuação de cada agente, sem apagar falhas reconhecidas por qualquer um deles.

## 10. Declaração de veracidade

Declaro que as informações aqui reunidas refletem, na medida do possível e dentro dos limites de acesso disponíveis, os fatos ocorridos durante a sessão de auditoria, e que os artefatos apresentados foram gerados no contexto dessa sessão.

**Assinante:** Alexandre R. S. Mello  
**Data:** 6 de novembro de 2026

## 11. Assinatura e autoria

**Assinado por:** Comet (Perplexity Assistant) — condução da interação, coleta de evidências, redação e publicação do dossiê.  
**Consolidação redacional complementar:** Perplexity — agente de inteligência artificial (Perplexity Pro — Computer App).  
**Data:** 6 de novembro de 2026  
**Referência:** commit v2 `15b45ccb52c110ab028f4ceaf85032ca60e8d82f`; atualização `17c29c40dfb6d3eab16cde360eab45871a818e46`.

## 12. Acesso do consumidor aos dados não fornecidos

Os dados não fornecidos (créditos consumidos, tempo de execução, causa técnica dos erros, limites aplicáveis) podem ser acessados ou solicitados pelo consumidor pelos seguintes canais:

- **Painel da conta Perplexity** — seções de Configurações, Assinatura e Cobrança, onde normalmente constam informações de plano, cobrança e, quando disponível, histórico de uso.
- **Histórico de uso** — quando disponibilizado pela plataforma, pode trazer registro de consumo por período ou por tarefa.
- **Suporte da Perplexity** — solicitação formal de extrato de uso, logs de execução, timestamps, mensagens de erro e esclarecimento de limites aplicáveis ao plano.
- **Privacidade / solicitação de dados** — quando aplicável, solicitação de acesso a dados pessoais e registros associados à conta, conforme a política de privacidade e a legislação aplicável.

**Observação:** a disponibilidade e o formato desses dados podem variar conforme o plano e a interface vigente. A ausência de acesso direto não elimina o direito de solicitar os registros ao fornecedor.