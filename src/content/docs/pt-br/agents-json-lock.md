---
title: agents.json e lockfile
description: Configuração do projeto, intervalos semver, ref da URL do registry, slots do lock por target e o que commitar.
order: 70
section: CLI
---

Schemas normativos: [config-schema](https://github.com/agents-repo/cli/blob/main/specs/config-schema.md) e [lock-schema](https://github.com/agents-repo/cli/blob/main/specs/lock-schema.md).

## agents.json

Campos típicos do projeto:

| Campo | Propósito |
| --- | --- |
| `targets[]` | Ids de install target (`cursor`, `github-copilot`, …) |
| `packages` | Mapa de package id → intervalo semver |
| URL / ref do registry | Onde buscar o catálogo (padrão da org usa registry-proxy + `v2.x`) |

A ref `v2.x` acompanha tags de catálogo publicadas (batch diário para mudanças de pacotes), não cada commit em `main`. Veja [Como o registry funciona](/docs/how-the-registry-works).

Use `agents-repo init` e `add-target` para gerenciar targets. Inspecione com `agents-repo targets`.

## agents-lock.json

O lock registra **versões resolvidas**, URLs de artefatos, hashes de integridade e slots **`byTarget`** por target. Projetos multi-target precisam de um slot para cada par `(package, target)` que `install` ou `ci` vai aplicar.

| Comando | Atualiza lock? | Resolve semver? |
| --- | --- | --- |
| `install` / `update` | Sim (exceto com `--no-save`) | Sim |
| `ci` | Não | Não — apenas lock |

## O que commitar

Faça commit de `agents.json`, `agents-lock.json` e arquivos extraídos nos caminhos dos targets (por exemplo `.cursor/`, `.github/`, `.claude/`, `.agents/`).

## Overrides de ambiente

A CLI respeita variáveis de ambiente como `AGENTS_REPO_REGISTRY_URL` e overrides de caminho de config. Veja a documentação da CLI para a lista completa.

## Guias relacionados

- [Instalar pacotes](/docs/installing-packages)
- [Destinos de instalação](/docs/install-targets)
- [`doctor`](/docs/cli-doctor) — verificações de alinhamento config/lock
