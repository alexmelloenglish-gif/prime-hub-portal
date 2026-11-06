# Dossiê formal — falhas na prestação do serviço Perplexity

**Data:** 6 de novembro de 2026  
**Solicitante:** Alexandre de Almeida Souza e Mello  
**Objeto:** Registro técnico e consumerista de falhas recorrentes na prestação do serviço Perplexity nesta sessão.

## 1. Objeto e escopo

Este documento consolida falhas verificáveis ocorridas durante a interação do usuário com o Perplexity, especialmente em tarefas de inventário e organização do Google Drive, uso de integrações e manutenção do idioma português nas respostas, inclusive na interface de voz.

O dossiê distingue:

- Fatos observáveis e verificáveis;
- Promessas feitas pelo assistente;
- Falhas de execução e comunicação;
- Danos alegados pelo usuário;
- Limites da prova.

Não afirma sabotagem, má-fé, dolo ou intenção deliberada, por não haver evidência suficiente para sustentar tais conclusões.

## 2. Resumo executivo

O usuário solicitou execução autônoma de tarefas relacionadas ao Google Drive, incluindo inventário, organização, identificação de duplicatas, sugestões de renomeação e movimentação segura de arquivos.

O assistente prometeu concluir o trabalho sem exigir supervisão constante. Na prática, a execução foi interrompida em etapas intermediárias, os dados coletados não foram preservados em um artefato consolidado e o usuário foi repetidamente chamado a retomar, autorizar, corrigir ou supervisionar o processo.

O resultado foi perda de tempo, retrabalho, frustração e ausência de uma entrega final verificável proporcional ao esforço investido.

## 3. Cronologia verificável

1. O usuário solicitou análise e organização do Google Drive.
2. O assistente prometeu execução autônoma e conclusão do lote sem novas interrupções.
3. A execução avançou por consultas parciais, sem persistência adequada dos resultados.
4. O assistente interrompeu o processo sem entregar um relatório consolidado.
5. O usuário questionou se o trabalho já havia sido feito anteriormente.
6. O assistente verificou que existia uma planilha parcial de inventário, criada no mesmo dia, com 50 itens recentes.
7. O assistente reconheceu que havia falhado em localizar e apresentar esse resultado anterior.
8. O assistente apresentou um script de organização como pronto, embora contivesse uma função chamada sem definição.
9. O assistente afirmou que o modo de simulação impedia qualquer alteração, embora o script criasse pastas antes de verificar essa configuração.
10. O usuário relatou falhas repetidas na manutenção do idioma português, inclusive na interface de voz.
11. O assistente reconheceu a falha, mas não apresentou uma correção duradoura ou verificável.

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

## 6. Evidências disponíveis

- Existência da planilha parcial `INVENTARIO_DRIVE_PDH_2026-11-06`, com 50 itens recentes, criada em 6 de novembro de 2026.
- Existência do script `ORGANIZADOR_DRIVE_PDH_v2.gs`, criado em 6 de novembro de 2026.
- Identificação de chamada à função `normalizar()` sem definição correspondente no script.
- Identificação de criação de pastas antes da verificação de `DRY_RUN`.
- Registro de promessas de execução autônoma e de interrupções posteriores.
- Registro de pedidos repetidos de manutenção do idioma português.
- Registro de uso das mensagens do usuário como consultas de busca.

## 7. Enquadramento consumerista

A relação entre usuário e provedor de serviço de inteligência artificial configura relação de consumo, na medida em que há fornecimento de serviço mediante contraprestação.

O usuário tem expectativa legítima de:

- Serviço adequado e contínuo;
- Informação veraz e clara;
- Boa-fé objetiva;
- Cumprimento das promessas feitas;
- Não transferência indevida do ônus da execução;
- Respeito a instruções simples e repetidas.

A falha em manter o idioma, interromper execuções sem entrega e apresentar código não testado como pronto pode caracterizar falha na prestação do serviço, independentemente de haver ou não má-fé.

## 8. Danos alegados

O usuário alega os seguintes prejuízos:

- Perda de tempo;
- Retrabalho;
- Frustração;
- Necessidade de supervisão constante;
- Prejuízo à confiança no serviço;
- Dificuldade em obter resultado verificável.

## 9. Pedidos

O usuário solicita:

- Correção do comportamento de execução e comunicação;
- Prestação de contas sobre limites reais e verificados;
- Garantia de manutenção do idioma português;
- Entrega verificável de artefatos;
- Não repetição de promessas sem validação prévia.

## 10. Limites da prova

Este dossiê não afirma sabotagem, má-fé, dolo ou intenção deliberada.

Limita-se aos fatos observáveis, às promessas registradas e às consequências verificáveis. A atribuição de responsabilidade é feita com base na condução da interação e na ausência de entrega proporcional ao esforço investido.

A correção adequada não é prometer que “agora vai funcionar”. É mudar o critério: só declarar concluído o que tiver evidência verificável — arquivo criado, linhas conferidas, execução registrada ou teste aprovado.

Até lá, o status correto é **incompleto**, não “feito”.