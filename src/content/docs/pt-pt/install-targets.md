---
title: Destinos de instalação
description: Ids canónicos de destino, caminhos típicos no disco e fluxos init/add-target.
order: 90
section: CLI
---

Destinos de instalação descrevem **onde** os ZIPs de pacotes são extraídos num projeto consumidor (ou no home global com `-g`).

## Matriz de destinos

| Target id | Etiqueta | Caminhos típicos no projeto (alto nível) |
| --- | --- | --- |
| `github-copilot` | GitHub Copilot | Agentes e instruções em `.github/` |
| `cursor` | Cursor | `.cursor/rules/`, `.cursor/skills/`, … |
| `claude-code` | Claude Code | `.claude/agents/`, … |
| `openai-codex` | OpenAI Codex | `.agents/skills/`, … |

Os caminhos exatos dependem do conteúdo do pacote e dos adaptadores de destino. Os metadados do catálogo listam quais destinos um pacote suporta.

## Configurar destinos

```bash
agents-repo init --targets cursor github-copilot claude-code openai-codex
agents-repo add-target openai-codex
agents-repo targets
```

`--target` é alias de `--targets` em `init`. Use saída JSON com `agents-repo --json targets`.

## Locks multi-destino

Com vários destinos configurados, cada pacote instalado precisa de entradas `byTarget` correspondentes em `agents-lock.json`. Depois de mudar destinos ou pacotes, execute `install` ou `update` localmente antes de ativar `agents:ci` em CI.

## Alinhamento com o catálogo

A webapp mostra destinos suportados nos cartões de pacotes. O `targets[]` do seu projeto deve sobrepor-se ao suporte do pacote para uma instalação bem-sucedida.

Veja [agents.json e lockfile](/docs/agents-json-lock) e [Instalar pacotes](/docs/installing-packages).
