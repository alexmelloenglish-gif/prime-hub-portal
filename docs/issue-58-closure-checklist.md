# Issue 58 — Closure Execution Checklist

Status inicial: OPEN para todos os blocos.

## 1. Engine compartilhada e retry
- [ ] Retry legado: failed, completed, processing e transcript sem run
- [ ] Retry compartilhado: mesma PipelineRun, resumePoint e identidade preservada
- [ ] Concorrência e idempotência
- [ ] Contrato de retry documentado

## 2. Teacher Authority e GL-003
- [ ] Critérios objetivos de GL-003 em documento único
- [ ] Fluxo mínimo de aula real até decisão docente
- [ ] Read-back e auditoria pedagógica

## 3. Providers e integrações
- [ ] Health check Gemini
- [ ] Health check Meet
- [ ] Alertas e fallback supervisionado

## 4. Autenticação e isolamento
- [ ] Login e isolamento por aluno
- [ ] Perfis aluno, professor, responsável e administrador
- [ ] Testes de rota por permissão

## 5. Dependências e vulnerabilidades
- [ ] Auditoria executada e registrada
- [ ] Atualização seletiva com regressão
- [ ] Política de vulnerabilidades

## 6. Documentação canônica
- [ ] Especificação da Engine, handoff e ledger alinhados
- [ ] Registro por release

## 7. Encerramento
- [ ] Todos os itens DONE com evidência
- [ ] Pendências remanescentes com owner e prazo
- [ ] Comentário final de closure

Regra: nenhum item pode ser marcado DONE sem commit/PR, teste executado, log, artefato ou decisão docente vinculada.