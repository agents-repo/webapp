---
title: Diagnósticos do doctor
description: Verificações de saúde somente leitura da CLI para config, lock, alcance do registry e caminhos de instalação.
order: 100
section: CLI
---

`agents-repo doctor` executa diagnósticos **somente leitura** na configuração do projeto. Comportamento normativo: [documentação do comando doctor](https://github.com/agents-repo/cli/blob/main/docs/commands/doctor.md).

## Quando executar

- Antes de depurar `install` ou `agents:ci` com falha em CI
- Depois de mudar `targets[]` ou configurações de URL do registry
- Quando lock e arquivos no disco podem ter divergido

## Verificações (resumo)

| Check id | Significado |
| --- | --- |
| `config_schema` | `agents.json` passa na validação do schema |
| `targets_configured` | `targets[]` não vazio |
| `lock_present` | `agents-lock.json` válido |
| `lock_config_sync` | Conjuntos de pacotes e intervalos de config/lock alinhados (como `ci`, sem `--force`) |
| `registry_reachable` | Busca do índice do catálogo bem-sucedida |
| `install_paths` | Artefatos travados mapeiam para caminhos que existem no disco |

Verificações ignoradas aparecem quando pré-requisitos falham (por exemplo sync do lock quando o lock está ausente).

## Uso

```bash
agents-repo doctor
agents-repo --json doctor
```

Somente escopo de projeto; `doctor -g` global está reservado na CLI.

## Se algo falhar

| Sintoma | Tente |
| --- | --- |
| Targets ausentes | `agents-repo init --targets …` |
| Drift do lock | `agents-repo install` ou `update` |
| Falhas em CI | Compare avisos de `agents-repo list` com erros fatais de `ci` |
| Erros de registry | Verifique URL/ref do registry na config ou env |

Visão geral de comandos: [Referência de comandos da CLI](/docs/cli-commands).
