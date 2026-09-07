---
title: Contribuir paquetes
description: Políticas, specs y enlaces para autores de paquetes del registry.
order: 110
section: Contribute
---

El código fuente de los paquetes vive en el repositorio [registry](https://github.com/agents-repo/registry) bajo `packages/<namespace>/<package-id>/`.

## Antes de empezar

- Los paquetes deben estar **mantenidos** y listos para uso directo.
- Declara **destinos de instalación** soportados en los metadatos.
- Sigue las specs normativas en [registry/specs](https://github.com/agents-repo/registry/tree/main/specs)
  (formato de paquete, `package-detail-schema.md`, formato agent/flow, metadatos,
  manifiestos, versionado).

## Flujo de envío

La mayoría de contribuidores **hace fork** del registry, trabaja en el fork y abre un pull request a **agents-repo/registry** `main`. Un issue de seguimiento en upstream es **recomendado pero no obligatorio**.

La ruta de autoría sugerida es **`full-package-creation-flow`** en el árbol (`agents-repo/agents-repo-package-creation`) tras el pull request en borrador. Checklist paso a paso: **[Enviar un paquete](/docs/submitting-a-package)**.

Requisitos y expectativas de revisión para humanos: [registry CONTRIBUTING](https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md).

Los títulos de squash-merge (`feat(package):`, `fix(package):`) clasifican la intención del paquete; las etiquetas del registry del catálogo se publican en lote diario en el tren de releases, no en cada merge. Consulta [Cómo funciona el registry](/docs/how-the-registry-works) para tiempos e impacto en consumidores.

## Correcciones

Las correcciones a paquetes publicados usan el mismo modelo fork → pull request upstream. La [plantilla de issue de corrección de paquete](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) es opcional pero recomendada. Los títulos de squash-merge usan `fix(package):` para la misma clasificación de intención; las etiquetas del catálogo siguen publicándose en el tren diario.

## Ayuda

Preguntas: [Contacto](/contact) o GitHub Discussions del registry. Ideas de paquetes: explora [Inicio](/) para ejemplos.
