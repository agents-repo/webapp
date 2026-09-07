---
title: agents.json y lockfile
description: Configuración del proyecto, rangos semver, ref de URL del registry, slots del lock por destino y qué hacer commit.
order: 70
section: CLI
---

Schemas normativos: [config-schema](https://github.com/agents-repo/cli/blob/main/specs/config-schema.md) y [lock-schema](https://github.com/agents-repo/cli/blob/main/specs/lock-schema.md).

## agents.json

Campos típicos del proyecto:

| Campo | Propósito |
| --- | --- |
| `targets[]` | Ids de destino de instalación (`cursor`, `github-copilot`, …) |
| `packages` | Mapa de id de paquete → rango semver |
| URL / ref del registry | Dónde obtener el catálogo (el valor por defecto de la org usa registry-proxy + `v2.x`) |

La ref `v2.x` sigue las etiquetas del catálogo publicadas (lote diario para cambios de paquetes), no cada commit de `main`. Consulta [Cómo funciona el registry](/docs/how-the-registry-works).

Usa `agents-repo init` y `add-target` para gestionar destinos. Inspecciona con `agents-repo targets`.

## agents-lock.json

El lock registra **versiones resueltas**, URLs de artefactos, hashes de integridad y slots **`byTarget`** por destino. Los proyectos multi-destino necesitan un slot para cada par `(package, target)` que `install` o `ci` aplicará.

| Comando | ¿Actualiza el lock? | ¿Resuelve semver? |
| --- | --- | --- |
| `install` / `update` | Sí (salvo `--no-save`) | Sí |
| `ci` | No | No — solo lock |

## Qué hacer commit

Haz commit de `agents.json`, `agents-lock.json` y archivos extraídos bajo rutas de destino (por ejemplo `.cursor/`, `.github/`, `.claude/`, `.agents/`).

## Overrides de entorno

La CLI respeta variables de entorno como `AGENTS_REPO_REGISTRY_URL` y overrides de ruta de config. Consulta la documentación de la CLI para la lista completa.

## Guías relacionadas

- [Instalar paquetes](/docs/installing-packages)
- [Destinos de instalación](/docs/install-targets)
- [`doctor`](/docs/cli-doctor) — comprobaciones de alineación config/lock
