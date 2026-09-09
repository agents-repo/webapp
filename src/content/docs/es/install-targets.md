---
title: Destinos de instalación
description: Ids canónicos de destino, rutas típicas en disco y flujos init/add-target.
order: 90
section: CLI
---

Los destinos de instalación describen **dónde** se extraen los ZIP de paquetes en un proyecto consumidor (o en el home global con `-g`).

## Matriz de destinos

| Id de destino | Etiqueta | Rutas típicas del proyecto (alto nivel) |
| --- | --- | --- |
| `github-copilot` | GitHub Copilot | agentes e instrucciones en `.github/` |
| `cursor` | Cursor | `.cursor/rules/`, `.cursor/skills/`, … |
| `claude-code` | Claude Code | `.claude/agents/`, … |
| `openai-codex` | OpenAI Codex | `.agents/skills/`, … |

Las rutas exactas dependen del contenido del paquete y de los adaptadores de destino. Los metadatos del catálogo listan qué destinos admite un paquete.

## Configurar destinos

```bash
agents-repo init --targets cursor github-copilot claude-code openai-codex
agents-repo add-target openai-codex
agents-repo targets
```

`--target` es un alias de `--targets` en `init`. Usa salida JSON con `agents-repo --json targets`.

## Locks multi-destino

Cuando hay varios destinos configurados, cada paquete instalado necesita entradas `byTarget` coincidentes en `agents-lock.json`. Tras cambiar destinos o paquetes, ejecuta `install` o `update` localmente antes de habilitar `agents:ci` en CI.

## Alineación con el catálogo

La webapp muestra destinos soportados en las tarjetas de paquetes. Tu `targets[]` del proyecto debe solaparse con el soporte del paquete para una instalación exitosa.

Consulta [agents.json y lockfile](/docs/agents-json-lock) e [Instalar paquetes](/docs/installing-packages).
