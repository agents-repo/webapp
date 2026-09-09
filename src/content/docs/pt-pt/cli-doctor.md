---
title: Diagnósticos doctor
description: Verificações de saúde só de leitura da CLI para config, lock, acessibilidade do registry e caminhos de instalação.
order: 100
section: CLI
---

`agents-repo doctor` executa diagnósticos **só de leitura** na configuração do projeto. Comportamento normativo: [documentação do comando doctor](https://github.com/agents-repo/cli/blob/main/docs/commands/doctor.md).

## Quando executar

- Antes de depurar `install` ou `agents:ci` falhados em CI
- Depois de mudar `targets[]` ou definições de URL do registry
- Quando lock e ficheiros no disco podem ter divergido

## Verificações (resumo)

| Check id | Significado |
| --- | --- |
| `config_schema` | `agents.json` passa validação de schema |
| `targets_configured` | `targets[]` não vazio |
| `lock_present` | `agents-lock.json` válido |
| `lock_config_sync` | Conjuntos de pacotes e intervalos config/lock alinhados (como `ci`, sem `--force`) |
| `registry_reachable` | Obtenção do índice do catálogo com sucesso |
| `install_paths` | Artefatos bloqueados mapeiam para caminhos que existem no disco |

Verificações ignoradas aparecem quando pré-requisitos falham (por exemplo sync de lock quando o lock está em falta).

## Utilização

```bash
agents-repo doctor
agents-repo --json doctor
```

Só scope de projeto; `doctor -g` global está reservado na CLI.

## Se algo falhar

| Sintoma | Tentar |
| --- | --- |
| Destinos em falta | `agents-repo init --targets …` |
| Deriva do lock | `agents-repo install` ou `update` |
| Falhas em CI | Comparar avisos de `agents-repo list` vs erros fatais de `ci` |
| Erros de registry | Verificar URL/ref do registry na config ou env |

Visão geral de comandos: [Referência de comandos da CLI](/docs/cli-commands).
