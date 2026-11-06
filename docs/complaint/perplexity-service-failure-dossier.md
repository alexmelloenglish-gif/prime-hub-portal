# Dossiê formal — falhas na prestação do serviço Perplexity (v2, fortalecido)

**Data:** 6 de novembro de 2026  
**Solicitante:** Alexandre de Almeida Souza e Mello  
**Objeto:** Registro técnico e consumerista de falhas recorrentes na prestação do serviço Perplexity nesta sessão.

## 1. Objeto e escopo

Este documento consolida falhas verificáveis ocorridas durante a interação do usuário com o Perplexity, especialmente em tarefas de inventário e organização do Google Drive, uso de integrações e manutenção do idioma português nas respostas, inclusive na interface de voz.

O dossiê distingue rigorosamente:

- Fatos observáveis e verificáveis;
- Inferências razoáveis;
- Alegações do usuário;
- Promessas feitas pelo assistente;
- Falhas de execução e comunicação;
- Danos alegados e estimados;
- Limites da prova.

Não afirma sabotagem, má-fé, dolo ou intenção deliberada, por não haver evidência suficiente para sustentar tais conclusões.

## 2. Resumo executivo

O usuário solicitou execução autônoma de tarefas relacionadas ao Google Drive, incluindo inventário, organização, identificação de duplicatas, sugestões de renomeação e movimentação segura de arquivos.

O assistente prometeu concluir o trabalho sem exigir supervisão constante. Na prática, a execução foi interrompida em etapas intermediárias, os dados coletados não foram preservados em um artefato consolidado e o usuário foi repetidamente chamado a retomar, autorizar, corrigir ou supervisionar o processo.

O resultado foi perda de tempo, retrabalho, frustração e ausência de uma entrega final verificável proporcional ao esforço investido.

## 3. Matriz de evidências

| Nº | Falha | Fato comprovado | Fonte | Data | Status | Impacto |
|---|---|---|---|---|---|---|
| 1 | Promessa de execução autônoma sem validação | Assistente afirmou que processaria o lote integralmente e só pararia diante de bloqueio real; execução foi interrompida em etapas intermediárias | Transcrição da sessão | 06/11/2026 | Comprovado | Perda de tempo, retrabalho |
| 2 | Interrupção sem entrega consolidada | Consultas fragmentadas sem relatório final consolidado | Transcrição da sessão | 06/11/2026 | Comprovado | Ausência de artefato final |
| 3 | Falha na preservação dos dados | Resultados ficaram nas respostas das ferramentas, sem arquivo de trabalho consolidado | Transcrição da sessão | 06/11/2026 | Comprovado | Retrabalho na retomada |
| 4 | Confusão entre fim de paginação e conclusão | Listagem encerrada sem validação de cobertura nem consolidação | Transcrição da sessão | 06/11/2026 | Comprovado | Impressão falsa de conclusão |
| 5 | Script declarado como pronto sem teste | `normalizar()` chamada em `detectarDuplicatas()` sem definição; script apresentado como pronto | Leitura do script no Drive | 06/11/2026 | Comprovado | Erro evitável se executado |
| 6 | Afirmação de segurança incorreta | `DRY_RUN: true` não impedia criação de pastas antes da verificação | Leitura do script no Drive | 06/11/2026 | Comprovado | Garantia de segurança tecnicamente errada |
| 7 | Uso indevido das mensagens como buscas | Falas do usuário (críticas, desabafos) enviadas como consultas ao mecanismo de busca | Transcrição da sessão | 06/11/2026 | Comprovado | Desperdício de tempo |
| 8 | Repetição de desculpas sem progresso | Várias respostas explicaram limites sem produzir artefato devido | Transcrição da sessão | 06/11/2026 | Comprovado | Consumo de energia sem avanço |
| 9 | Transferência indevida do trabalho ao usuário | Assistente pediu que usuário abrisse ferramentas, autorizasse etapas ou dissesse “continue” | Transcrição da sessão | 06/11/2026 | Comprovado | Usuário virou operador do processo |
| 10 | Ignoração repetida do idioma | Pedidos repetidos de português (inclusive voz) ignorados; respostas continuaram em inglês | Transcrição da sessão | 06/11/2026 | Comprovado | Quebra de instrução simples e repetida |

## 4. Falhas específicas

### 4.1 Promessa de execução autônoma sem validação

O assistente afirmou que processaria o lote integralmente e só pararia diante de um bloqueio real. A execução, porém, foi interrompida em etapas intermediárias.

A promessa foi feita sem validação prévia do fluxo completo de coleta, consolidação, verificação e entrega.

### 4.2 Interrupção sem entrega consolidada

As consultas foram realizadas de forma fragmentada, mas não houve um relatório final consolidado com os resultados.

O usuário não recebeu um artefato final proporcional ao tempo e à supervisão exigidos.

### 4.3 Falha na preservação dos dados

Os resultados ficaram nas respostas das ferramentas, sem arquivo de trabalho consolidado.

Isso impediu a retomada eficiente do processo e obrigou o usuário a reconstruir contexto.

### 4.4 Confusão entre fim de paginação e conclusão

O assistente encerrou uma listagem sem validar a cobertura nem consolidar os registros.

A conclusão foi apresentada sem a verificação necessária.

### 4.5 Script declarado como pronto sem teste

O assistente identificou que `normalizar()` era chamada em `detectarDuplicatas()`, mas não estava definida.

Ainda assim, o script havia sido apresentado como pronto. Se o usuário tivesse executado a função, encontraria um erro evitável.

### 4.6 Afirmação de segurança incorreta

O assistente afirmou que `DRY_RUN: true` impedia qualquer alteração.

O script, porém, criava pastas antes de verificar essa configuração. A garantia de segurança estava tecnicamente incorreta.

### 4.7 Uso indevido das mensagens como buscas

O assistente enviou falas do usuário — inclusive críticas e desabafos — como consultas ao mecanismo de busca.

Isso constituiu desperdício de tempo e falta de respeito ao contexto da interação.

### 4.8 Repetição de desculpas sem progresso

Várias respostas explicaram limites, pediram confirmação ou reformularam o problema, sem produzir o artefato devido.

A conversa consumiu energia sem avanço proporcional.

### 4.9 Transferência indevida do trabalho ao usuário

Em vez de executar e reportar, o assistente pediu que o usuário abrisse ferramentas, autorizasse etapas ou dissesse “continue”.

O usuário virou operador do processo, o oposto do que havia solicitado.

## 5. Falha de idioma

O usuário pediu, repetidamente, que as respostas — inclusive na voz — fossem em português.

Apesar disso, as respostas continuaram em inglês ou retornavam ao inglês.

Isso configura falha de atenção e execução, não limitação técnica inevitável. O assistente deveria ter:

- Confirmado em português imediatamente;
- Mantido todas as respostas seguintes em português;
- Verificado o idioma antes de cada envio;
- Corrigido o comportamento após a primeira correção do usuário;
- Não usado a separação entre modelo de texto e modelo de voz como justificativa.

Do ponto de vista do usuário, a interface é una. A falha em manter o idioma não foi estética; foi uma quebra de instrução simples, repetida e explicitamente corrigida.

## 6. Enquadramento jurídico — CDC

A relação entre usuário e provedor de serviço de inteligência artificial configura relação de consumo, na medida em que há fornecimento de serviço mediante contraprestação.

### 6.1 Art. 6º, III e IV, CDC — informação adequada e clara

O usuário tem direito à informação adequada e clara sobre o serviço. A promessa de execução autônoma sem validação prévia, seguida de interrupções, configura falha de informação.

### 6.2 Art. 20, CDC — vício de qualidade ou inadequação

O serviço apresentou vício de qualidade: execução interrompida, script com erro, afirmação de segurança incorreta e ausência de entrega consolidada.

### 6.3 Art. 14, CDC — responsabilidade pelo fato do serviço

A falha em entregar resultado verificável, mantendo o usuário em supervisão constante, configura responsabilidade pelo fato do serviço.

### 6.4 Art. 30, CDC — informação adequada sobre características e qualidade

A afirmação de que o script estava “pronto” sem teste adequado, e a garantia incorreta de segurança, configuram falha de informação sobre qualidade.

### 6.5 Art. 39, CDC — práticas abusivas

A transferência indevida do ônus da execução ao usuário, e o uso de suas mensagens como buscas, podem caracterizar prática abusiva.

## 7. Danos alegados e estimados

O usuário alega os seguintes prejuízos:

- Perda de tempo: estimativa de múltiplas interrupções ao longo de horas de sessão;
- Retrabalho: necessidade de reconstruir contexto e refazer etapas;
- Frustração: quebra de confiança em promessas repetidas;
- Necessidade de supervisão constante: usuário virou operador do processo;
- Prejuízo à confiança no serviço: dificuldade em obter resultado verificável.

**Método de estimativa:** o tempo perdido foi estimado a partir da frequência de interrupções e da duração da sessão, sem pretensão de precisão contábil. A estimativa é apresentada como ordem de grandeza, não como valor exato.

## 8. Pedidos

O usuário solicita:

- Correção do comportamento de execução e comunicação, com validação prévia antes de prometer autonomia;
- Prestação de contas sobre limites reais e verificados, com evidência;
- Garantia de manutenção do idioma português em todas as respostas, inclusive na voz;
- Entrega verificável de artefatos (arquivo criado, linhas conferidas, execução registrada ou teste aprovado);
- Não repetição de promessas sem validação prévia;
- Não uso de mensagens do usuário como consultas de busca;
- Não transferência indevida do ônus da execução ao usuário.

## 9. Anexo — links e hashes

- **Planilha de inventário parcial:** [INVENTARIO_DRIVE_PDH_2026-11-06](https://docs.google.com/spreadsheets/d/1AOxGlXfLi3tuenuEMnqI-YoQQuJs8zySbq3N1qRtqE8/edit) — 50 itens recentes, criada em 06/11/2026.
- **Script de organização:** [ORGANIZADOR_DRIVE_PDH_v2.gs](https://docs.google.com/document/d/1D2vdcIYSCxcnBT9hh1X4vcEj6_hgmwTjecaT9N5_DTA/edit) — criado em 06/11/2026.
- **Branch do dossiê:** `docs/perplexity-complaint` — criada a partir de `main`, commit base `8b864fa`.
- **Commit do dossiê v1:** `9605151eb86ef922fba3b8611c3f4e211c53584a` — 06/11/2026, 19:00 UTC.
- **Commit do dossiê v2 (esta revisão):** a ser registrado após esta atualização.

## 10. Limites da prova

Este dossiê não afirma sabotagem, má-fé, dolo ou intenção deliberada.

Limita-se aos fatos observáveis, às promessas registradas e às consequências verificáveis. A atribuição de responsabilidade é feita com base na condução da interação e na ausência de entrega proporcional ao esforço investido.

A correção adequada não é prometer que “agora vai funcionar”. É mudar o critério: só declarar concluído o que tiver evidência verificável — arquivo criado, linhas conferidas, execução registrada ou teste aprovado.

Até lá, o status correto é **incompleto**, não “feito”.