---
title: Destinos de instalação
description: Ids canônicos de target, caminhos típicos no disco e fluxos init/add-target.
order: 90
section: CLI
---

Install targets descrevem **onde** os ZIPs de pacotes são extraídos em um projeto consumidor (ou no home global com `-g`).

## Matriz de targets

| Target id | Label | Caminhos típicos no projeto (alto nível) |
| --- | --- | --- |
| `github-copilot` | GitHub Copilot | agentes e instruções em `.github/` |
| `cursor` | Cursor | `.cursor/rules/`, `.cursor/skills/`, … |
| `claude-code` | Claude Code | `.claude/agents/`, … |
| `openai-codex` | OpenAI Codex | `.agents/skills/`, … |

Caminhos exatos dependem do conteúdo do pacote e dos adapters de target. Metadados do catálogo listam quais targets um pacote suporta.

## Configurar targets

```bash
agents-repo init --targets cursor github-copilot claude-code openai-codex
agents-repo add-target openai-codex
agents-repo targets
```

`--target` é alias de `--targets` no `init`. Use saída JSON com `agents-repo --json targets`.

## Locks multi-target

Com vários targets configurados, cada pacote instalado precisa de entradas `byTarget` correspondentes em `agents-lock.json`. Depois de mudar targets ou pacotes, execute `install` ou `update` localmente antes de habilitar `agents:ci` em CI.

## Alinhamento com o catálogo

A webapp mostra targets suportados nos cards de pacotes. O `targets[]` do seu projeto deve ter interseção com o suporte do pacote para uma instalação bem-sucedida.

Veja [agents.json e lockfile](/docs/agents-json-lock) e [Instalar pacotes](/docs/installing-packages).
