---
title: Diagnósticos doctor
description: Comprobaciones de salud de solo lectura de la CLI para config, lock, accesibilidad del registry y rutas de instalación.
order: 100
section: CLI
---

`agents-repo doctor` ejecuta diagnósticos de **solo lectura** sobre la configuración del proyecto. Comportamiento normativo: [documentación del comando doctor](https://github.com/agents-repo/cli/blob/main/docs/commands/doctor.md).

## Cuándo ejecutarlo

- Antes de depurar `install` fallido o `agents:ci` en CI
- Tras cambiar `targets[]` o la configuración de URL del registry
- Cuando el lock y los archivos en disco pueden haberse desalineado

## Comprobaciones (resumen)

| Id de comprobación | Significado |
| --- | --- |
| `config_schema` | `agents.json` pasa la validación del schema |
| `targets_configured` | `targets[]` no vacío |
| `lock_present` | `agents-lock.json` válido |
| `lock_config_sync` | Conjuntos de paquetes y rangos config/lock alineados (como `ci`, sin `--force`) |
| `registry_reachable` | La obtención del índice del catálogo tiene éxito |
| `install_paths` | Los artefactos bloqueados corresponden a rutas que existen en disco |

Las comprobaciones omitidas aparecen cuando fallan prerrequisitos (por ejemplo sync del lock cuando falta el lock).

## Uso

```bash
agents-repo doctor
agents-repo --json doctor
```

Solo alcance de proyecto; `doctor -g` global está reservado en la CLI.

## Si algo falla

| Síntoma | Prueba |
| --- | --- |
| Destinos faltantes | `agents-repo init --targets …` |
| Deriva del lock | `agents-repo install` o `update` |
| Fallos en CI | Compara advertencias de `agents-repo list` vs errores fatales de `ci` |
| Errores del registry | Verifica URL/ref del registry en config o entorno |

Resumen de comandos: [Referencia de comandos de la CLI](/docs/cli-commands).
