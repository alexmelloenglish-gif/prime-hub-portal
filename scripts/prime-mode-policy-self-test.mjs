import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const agent = readFileSync(new URL("../PRIME_Agent.ps1", import.meta.url), "utf8");
const policyDoc = readFileSync(new URL("../docs/PRIME_MODE_POLICY_2026-09-25.md", import.meta.url), "utf8");

assert.match(agent, /\$AgentVersion = "vNEXT-1\.1"/);
assert.match(agent, /policyVersion="v3-aula-balanced"/);
assert.match(agent, /Set-PolicyPriority @\("ChatGPT", "GPTClassic", "ChatGPT Classic", "Manus", "Perplexity"\) "BelowNormal"/);
assert.match(agent, /# Google Meet\/apresentacoes: Chrome e camera recebem prioridade moderada; IA permanece acessivel\./);
assert.match(agent, /Stop-PolicyProcesses @\("msedge"\)/);
assert.match(agent, /ModeRestore/);
assert.match(agent, /Processo nao esta mais em execucao/);
assert.equal((agent.match(/^function Handle-Mode/gm) ?? []).length, 1);
assert.equal((agent.match(/^function Handle-Audit/gm) ?? []).length, 1);
assert.doesNotMatch(agent, /# Ler body da requisicao/);
assert.doesNotMatch(agent, /Spooler -> Desativado/);

assert.match(policyDoc, /prioridade baixa para assistentes, sem encerramento automático/i);
assert.match(policyDoc, /Agente online e nenhuma ação falhou/i);
assert.match(policyDoc, /não força a NVIDIA MX330 para todos os aplicativos/i);

console.log("PRIME mode policy self-test: PASS");
