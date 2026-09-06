---
title: agents.json e lockfile
description: Configuração do projeto, intervalos semver, ref da URL do registry, slots de lock por destino e o que fazer commit.
order: 70
section: CLI
---

Schemas normativos: [config-schema](https://github.com/agents-repo/cli/blob/main/specs/config-schema.md) e [lock-schema](https://github.com/agents-repo/cli/blob/main/specs/lock-schema.md).

## agents.json

Campos típicos do projeto:

| Campo | Função |
| --- | --- |
| `targets[]` | Ids de destino de instalação (`cursor`, `github-copilot`, …) |
| `packages` | Mapa de package id → intervalo semver |
| URL / ref do registry | Onde obter o catálogo (o default da org usa registry-proxy + `v2.x`) |

A ref `v2.x` segue tags de catálogo publicadas (batch diário para alterações de pacotes), não cada commit em `main`. Veja [Como o registry funciona](/docs/how-the-registry-works).

Use `agents-repo init` e `add-target` para gerir destinos. Inspecione com `agents-repo targets`.

## agents-lock.json

O lock regista **versões resolvidas**, URLs de artefatos, hashes de integridade e slots **`byTarget`** por destino. Projetos multi-destino precisam de um slot para cada par `(package, target)` que `install` ou `ci` vai aplicar.

| Comando | Atualiza lock? | Resolve semver? |
| --- | --- | --- |
| `install` / `update` | Sim (exceto com `--no-save`) | Sim |
| `ci` | Não | Não — só lock |

## O que fazer commit

Faça commit de `agents.json`, `agents-lock.json` e ficheiros extraídos nos caminhos de destino (por exemplo `.cursor/`, `.github/`, `.claude/`, `.agents/`).

## Overrides de ambiente

A CLI respeita variáveis de ambiente como `AGENTS_REPO_REGISTRY_URL` e overrides do caminho de config. Veja a documentação da CLI para a lista completa.

## Guias relacionados

- [Instalar pacotes](/docs/installing-packages)
- [Destinos de instalação](/docs/install-targets)
- [`doctor`](/docs/cli-doctor) — verificações de alinhamento config/lock
