---
title: Visión general del ecosistema
description: Cómo encajan registry, registry-proxy, webapp, CLI y las políticas de la organización.
order: 20
section: Start
---

La organización **agents-repo** ofrece una plataforma pequeña:

| Pieza | Rol |
| --- | --- |
| [Registry](https://github.com/agents-repo/registry) | Especificaciones, fuente de paquetes, validación y artefactos ZIP versionados |
| [Registry proxy](https://github.com/agents-repo/registry-proxy) | Acceso de solo lectura en caché a archivos del registry en GitHub |
| [Webapp](https://github.com/agents-repo/webapp) | Este sitio — explorar, buscar y descargar |
| [CLI](https://github.com/agents-repo/cli) | Instalar y gestionar paquetes en tu proyecto (`agents.json`, lockfile) |
| [.github](https://github.com/agents-repo/.github) | Flujo de contribución y políticas compartidas |

## URLs públicas

- Sitio: [agents-repo.org](https://agents-repo.org/)
- Páginas por repositorio: [Repositorios](/repositories)
- Diagramas más profundos: [documento de ecosistema de la organización](https://github.com/agents-repo/.github/blob/main/docs/ecosystem.md)

## Datos vs herramientas

El registry es **data-first** (sin runtime en el catálogo). Webapp y CLI resuelven una ref del catálogo y cargan `packages/index.json`. La webapp luego carga `packages/<namespace>/<package-id>/detail.json` para páginas de paquetes en la app. La ruta de instalación de la CLI usa `versions/manifest.json`, `metadata.json` por versión y ZIPs por destino. Consulta [Cómo funciona el registry](/docs/how-the-registry-works) para la ruta de lectura.
