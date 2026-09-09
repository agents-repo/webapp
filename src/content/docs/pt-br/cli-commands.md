---
title: Referência de comandos da CLI
description: Subcomandos, paridade com npm, aliases e links para documentação canônica da CLI.
order: 80
section: CLI
---

O comportamento é definido no repositório [agents-repo/cli](https://github.com/agents-repo/cli). Esta página é um **resumo**; veja `docs/commands/` para tabelas completas de flags e códigos de saída.

## Matriz de comandos

| Comando | Análogo npm | Aliases | Notas |
| --- | --- | --- | --- |
| `init` | `npm init` (aproximado) | — | Criar/atualizar `agents.json`; `--targets` |
| `add-target` | — | — | Adicionar ids de target |
| `install` | `npm install` | `i`, `add`, `inst` | Variádico; atualiza lock |
| `ci` | `npm ci` | — | Instalação apenas do lock |
| `doctor` | `npm doctor` (aproximado) | — | Diagnósticos somente leitura — [doc do doctor](/docs/cli-doctor) |
| `update` | `npm update` | `up`, `upgrade` | Atualizar dentro dos intervalos |
| `search` | `npm search` | `find`, `s`, `se` | Busca no registry |
| `suggest-agents` | — | `suggest` | Sinais do projeto local |
| `list` | `npm list` | `ls` | Visão instalados / lock |
| `remove` | `npm uninstall` | `rm`, `uninstall`, `unlink` | Remover pacotes |
| `targets` | — | — | Mostrar targets configurados |

Fonte: [npm-cli-parity.md](https://github.com/agents-repo/cli/blob/main/docs/npm-cli-parity.md).

## Flags globais (resumido)

| Flag | Notas |
| --- | --- |
| `-h` / `--help` | Ajuda |
| `-V` / `--version` | Versão da CLI |
| `--json` | Saída legível por máquina |
| `--verbose` | Mais detalhes em instalações multi-target |
| `-y` / `--yes` | Dispensa conflitos de definição dupla com avisos |
| `--dry-run` | Resolve sem gravar |
| `--no-save` | Pula gravação em config/lock |
| `--prefer-online` | Ignora cache local de artefatos |

### `-g` / `--global`

Suportado em `init`, `install`, `update`, `remove`, `list`, `targets`. **Não** em `ci` ou `doctor` (escopo de projeto).

## Documentação por comando

| Comando | Documentação |
| --- | --- |
| `init` | [init.md](https://github.com/agents-repo/cli/blob/main/docs/commands/init.md) |
| `add-target` | [add-target.md](https://github.com/agents-repo/cli/blob/main/docs/commands/add-target.md) |
| `install` | [install.md](https://github.com/agents-repo/cli/blob/main/docs/commands/install.md) |
| `ci` | [ci.md](https://github.com/agents-repo/cli/blob/main/docs/commands/ci.md) |
| `update` | [update.md](https://github.com/agents-repo/cli/blob/main/docs/commands/update.md) |
| `remove` | [remove.md](https://github.com/agents-repo/cli/blob/main/docs/commands/remove.md) |
| `search` | [search.md](https://github.com/agents-repo/cli/blob/main/docs/commands/search.md) |
| `suggest-agents` | [suggest-agents.md](https://github.com/agents-repo/cli/blob/main/docs/commands/suggest-agents.md) |
| `list` | [list.md](https://github.com/agents-repo/cli/blob/main/docs/commands/list.md) |
| `targets` | [targets.md](https://github.com/agents-repo/cli/blob/main/docs/commands/targets.md) |
| `doctor` | [doctor.md](https://github.com/agents-repo/cli/blob/main/docs/commands/doctor.md) |

## Guias de configuração do projeto

- [Instalar pacotes](/docs/installing-packages)
- [Destinos de instalação](/docs/install-targets)
- [agents.json e lockfile](/docs/agents-json-lock)
