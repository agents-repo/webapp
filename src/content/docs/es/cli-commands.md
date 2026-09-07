---
title: Referencia de comandos de la CLI
description: Subcomandos, paridad con npm, alias y enlaces a la documentación canónica de la CLI.
order: 80
section: CLI
---

El comportamiento está definido en el repositorio [agents-repo/cli](https://github.com/agents-repo/cli). Esta página es un **resumen**; consulta `docs/commands/` para tablas completas de flags y códigos de salida.

## Matriz de comandos

| Comando | Análogo npm | Alias | Notas |
| --- | --- | --- | --- |
| `init` | `npm init` (aprox.) | — | Crear/actualizar `agents.json`; `--targets` |
| `add-target` | — | — | Añadir ids de destino |
| `install` | `npm install` | `i`, `add`, `inst` | Variádico; actualiza el lock |
| `ci` | `npm ci` | — | Instalación solo desde lock |
| `doctor` | `npm doctor` (aprox.) | — | Diagnósticos de solo lectura — [doc de doctor](/docs/cli-doctor) |
| `update` | `npm update` | `up`, `upgrade` | Actualizar dentro de rangos |
| `search` | `npm search` | `find`, `s`, `se` | Búsqueda en el registry |
| `suggest-agents` | — | `suggest` | Señales locales del proyecto |
| `list` | `npm list` | `ls` | Vista de instalados / lock |
| `remove` | `npm uninstall` | `rm`, `uninstall`, `unlink` | Eliminar paquetes |
| `targets` | — | — | Mostrar destinos configurados |

Fuente: [npm-cli-parity.md](https://github.com/agents-repo/cli/blob/main/docs/npm-cli-parity.md).

## Flags globales (abreviados)

| Flag | Notas |
| --- | --- |
| `-h` / `--help` | Ayuda |
| `-V` / `--version` | Versión de la CLI |
| `--json` | Salida legible por máquina |
| `--verbose` | Más detalle en instalaciones multi-destino |
| `-y` / `--yes` | Renunciar a conflictos de definición dual con advertencias |
| `--dry-run` | Resolver sin escribir |
| `--no-save` | Omitir escrituras en config/lock |
| `--prefer-online` | Omitir caché local de artefactos |

### `-g` / `--global`

Soportado en `init`, `install`, `update`, `remove`, `list`, `targets`. **No** en `ci` ni `doctor` (alcance de proyecto).

## Documentación por comando

| Comando | Documentación |
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

## Guías de configuración del proyecto

- [Instalar paquetes](/docs/installing-packages)
- [Destinos de instalación](/docs/install-targets)
- [agents.json y lockfile](/docs/agents-json-lock)
