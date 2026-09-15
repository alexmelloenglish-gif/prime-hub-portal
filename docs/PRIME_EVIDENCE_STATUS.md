# PRIME — Estado das evidências

**Atualizado:** 15/09/2026  
**Finalidade:** ponto de entrada para consultar o que cada piloto acrescenta, quais claims são defensáveis e o que ainda falta verificar. Os casos usam rótulos anonimizados.

## O que já temos

| Caso | Contribuição | Nível de verificação |
| --- | --- | --- |
| Piloto G | Memória de quatro aulas preservada, conectada ao estado atual, às prioridades e a uma próxima ação registrada | Portfólio, fontes de aula e snapshots antes/depois inspecionados; texto do dashboard fornecido corrobora a apresentação |
| Piloto R | Histórico ligado a prioridades, atividade específica e entradas exibidas como memória pessoal | Texto do dashboard fornecido pelo usuário; leitura direta do navegador não realizada |
| Piloto V | Captura de fonte real e Candidate assistido persistido em Preview | Código e logs de execução inspecionados; conteúdo do Candidate predefinido |

## Novos dashboards incorporados

| Caso | O que acrescenta | Limite |
| --- | --- | --- |
| Piloto I | Uma aula gera objetivo contextualizado, prioridades e tarefa estruturada | Personalização inicial; não demonstra acúmulo entre aulas nem envio da tarefa |
| Piloto D | Contexto de várias aulas, vocabulário e feedback, com lacunas explícitas nos campos validados | Projeção parcial; orientação no feedback não equivale a prioridade/ação autorizada |
| Piloto G | Texto da interface exibe as quatro aulas, a prioridade de reduzir apoio e a ação pós-avaliação | Corrobora os artefatos já auditados; não demonstra execução do acompanhamento |

Os três textos foram fornecidos pelo usuário em Admin preview. Não equivalem a observação direta do navegador ou ação autenticada do aluno.

**Pendência concreta do Piloto D:** reconciliar feedback com as seções que informam ausência de prioridade e ação validadas. Não preencher por inferência. O texto copiado não mostra a seção completa de relatórios; verificar antes de concluir que o histórico está ausente.

## O que o Piloto R acrescentou

A projeção apresenta **STATE → PRIORITY → EVIDENCE → ACTION → HISTORY**, com relações pedagógicas concretas:

1. Relatórios anteriores sustentam a interpretação do estado atual.
2. Evidências específicas fundamentam prioridades de precisão e reutilização.
3. A prioridade de reutilização vira uma atividade delimitada de frases pessoais.
4. O texto fornecido mostra entradas em “Your locked sentences”.

Isso acrescenta evidência de continuidade apresentada na interface e de uma atividade conectada à memória. As entradas aparecem em contexto de **Admin preview**: autoria do aluno, persistência durável e revisão posterior não foram verificadas. O histórico preserva os relatórios disponíveis e explicita a lacuna entre presença e relatório; não se deve afirmar que cada presença possui relatório detalhado.

## Claims defensáveis agora

- **Piloto G:** “O PRIME demonstra personalização cumulativa documentada em um caso controlado, mediado pelo professor.”
- **Piloto R:** “O dashboard apresentado conecta evidências longitudinais, prioridades e uma atividade de prática, com entradas de memória exibidas.”
- **Piloto V:** “Um teste assistido em Preview demonstrou captura de fonte real e persistência de Candidate.”

Esses resultados não comprovam capacidade universal, execução completa do Engine ou impacto causal em motivação, retenção, proficiência ou resultados institucionais.

## O que falta para demonstrar o ciclo completo

**Primeiro percurso:** fonte → Candidate → revisão docente → decisão docente → canonicalização → autorização de projeção → projeção ao aluno.

**Percurso subsequente:** ação autorizada → tentativa real com autoria e data → novo Candidate → segunda revisão e decisão → estado/próxima ação mantidos ou atualizados com justificativa.

Cada transição precisa de registros vinculados. Trabalho manual é compatível com end-to-end; uma etapa não pode ser inferida apenas pela existência da anterior.

## Onde consultar e como atualizar

- [Auditoria detalhada e fontes públicas](audits/PRIME_CLAIM_EVIDENCE_STATUS_2026-09-15.md)
- [Tese de produto](product/PRIME-LEARNING-OS-PRODUCT-THESIS.md)
- [Checkpoint de autoridade](PRIME_CANONICAL_MIGRATION_ARCHITECTURE_CHECKPOINT_2026-09-11.md)
- [PR de documentação #20](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/20)

Ao receber nova evidência, atualizar este resumo e acrescentar a evidência datada à auditoria. Preservar a distinção entre fonte primária, texto fornecido, implementação, execução e impacto. Não reiniciar a investigação nem reduzir um achado verificado a “relato” por falta de contexto. Não publicar contatos, transcrições, frases pessoais ou links privados de alunos.

**Integração:** consulte o estado do PR #20; a existência deste documento na branch não equivale a merge em main.
