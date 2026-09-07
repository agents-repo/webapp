---
title: Cómo funciona el registry
description: Índice del catálogo, package detail.json, manifiestos de versión, artefactos ZIP y cómo webapp y CLI obtienen datos.
order: 50
section: Registry
---

El repositorio [registry](https://github.com/agents-repo/registry) es la **fuente de verdad** de las definiciones de paquetes. La lógica de runtime queda fuera del catálogo; los consumidores leen archivos por HTTP.

## Identidad del paquete

- **Id del paquete**: `namespace/package-id` (segmentos en kebab-case minúsculas).
- **Árbol de fuentes**: `packages/<namespace>/<package-id>/` en el repositorio registry.
- **Artefactos de versión**: ZIPs semver bajo `versions/` con checksums en `versions/manifest.json`. Cuando un paquete tiene un `README.md` en la raíz al publicar, `package:build` lo copia a `versions/<version>/README.md`.

## Archivos del catálogo

| Archivo | Rol |
| --- | --- |
| `packages/index.json` | Lista paquetes y últimas versiones para explorar |
| `packages/<namespace>/<package-id>/detail.json` | Agregado generado del último snapshot para páginas de paquetes en la app (opcional `readmeMarkdown` desde `versions/<latest>/README.md`) |
| `metadata.json` | Metadatos a nivel de paquete (descripción, destinos, licencia) |
| `versions/manifest.json` | URLs de artefactos por versión y checksums SHA-256 |

Los consumidores resuelven una **ref de git** (por ejemplo `v2.x` o una etiqueta de release), luego obtienen el índice y los archivos por paquete para esa ref. Los contribuidores NO deben crear `detail.json`.

## Etiquetas de distribución del registry vs versiones de paquetes

Aplican dos capas de versionado:

- **Etiquetas Git del registry** (por ejemplo `v2.0.1`) versionan el **snapshot del catálogo** consumido vía refs como `v2.x`.
- **Versiones de paquetes** en `versions/manifest.json` `latest` versionan la compatibilidad individual de cada paquete. Estas capas son independientes.

Los títulos de squash-merge de paquetes (`feat(package):`, `fix(package):`) clasifican la intención del paquete para historial y CI. **No** publican una etiqueta de registry del catálogo de inmediato.

### Tren de releases del catálogo

Las etiquetas Git del **catálogo** del registry para consumidores `v2.x` se publican en un horario diario cuando `packages/` tiene cambios sin publicar desde la última etiqueta `v*`:

- **Horario:** diario a las **00:05 UTC** (`.github/workflows/catalog-release.yml`).
- **Cadencia:** como máximo un **PATCH** del registry por ejecución cuando `packages/` cambió.
- **Manual:** los maintainers pueden ejecutar `workflow_dispatch` en el mismo workflow para publicaciones urgentes del catálogo.

Los merges de plataforma o herramientas (commits sin el scope `package`) pueden seguir publicándose de inmediato vía `semantic-release`.

### Impacto en consumidores

Refs como `v2.x` resuelven a la última etiqueta Git del registry publicada. Tras un merge de paquete en `main`, el catálogo de producción (ref por defecto de este sitio, ref de `agents.json` de la CLI) puede retrasarse hasta ~24 horas hasta el próximo release del catálogo.

Para previsualizar contenido del catálogo fusionado antes de la próxima etiqueta, apunta **Website settings** a un fork o ref explícita — consulta [Usar el catálogo](/docs/using-the-catalog). Política normativa de releases: [registry README — Release Workflow](https://github.com/agents-repo/registry/blob/main/README.md#release-workflow).

## registry-proxy

La webapp de producción y muchas configuraciones de CLI usan [registry-proxy](https://github.com/agents-repo/registry-proxy) para cachear respuestas de GitHub Raw/contents. Aún puedes enlazar al árbol del registry en GitHub para revisión humana.

## Webapp vs CLI

- **Webapp**: carga `packages/index.json` para búsqueda/UI, luego `packages/<namespace>/<package-id>/detail.json` para páginas de paquetes en la app (último snapshot, incluyendo README vía `readmeMarkdown`). Ofrece Use in chat, descargas y exploración en GitHub ([Usar el catálogo](/docs/using-the-catalog)).
- **CLI**: carga `packages/index.json`, luego `versions/manifest.json` y `metadata.json` por versión, verifica la integridad del ZIP y extrae `<version>-<target-id>.zip` en rutas de destino de instalación ([Instalar paquetes](/docs/installing-packages)).

Los formatos normativos están en [registry specs](https://github.com/agents-repo/registry/tree/main/specs). Esta guía no duplica el texto de las specs.
