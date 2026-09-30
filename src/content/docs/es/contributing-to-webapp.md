---
title: Contribuir a la webapp
description: Flujo de ramas, validación y paquetes de workflow agents-repo en este repositorio.
order: 130
section: Contribute
---

Este sitio se desarrolla en [agents-repo/webapp](https://github.com/agents-repo/webapp).

## Flujo obligatorio

1. Abre un issue de seguimiento (consulta `.github/ISSUE_TEMPLATE/`).
2. Rama: `<prefix>/<issue-number>-<slug>` usando el prefijo que corresponda al trabajo:

   | Tipo de trabajo | Prefijo | Ejemplo |
   | --- | --- | --- |
   | Bug o inconsistencia | `fix/` | `fix/42-related-issues-checklist` |
   | Cambio de spec | `spec/` | `spec/57-pr-policy-clarity` |
   | Propuesta de feature | `feat/` | `feat/89-search-refinement` |
   | Tarea o chore | `chore/` | `chore/31-sync-workflow-docs` |
   | Solo documentación | `docs/` | `docs/88-update-pr-guidance` |

3. Abre un pull request en **borrador** con `Closes #<issue>`.
4. Ejecuta validación antes del handoff; un maintainer humano marca el PR ready for review.

Reglas completas: [webapp CONTRIBUTING](https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md), [Required Workflow de la organización](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow) y la [referencia de prefijos de rama de la organización](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#branch-prefix-reference).

## Validación local

```bash
npm run env:check
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run test:crawl-files
```

Para cambios de UI, ejecuta también `npm run test:a11y` y `npm run test:e2e` cuando aplique.

El CI baseline de PR filtra por rutas Chrome/`slides:check`, extras de Pages/crawl y `check:docs-sync` de la CLI (sin `agents:verify` en este repositorio). Consulta [docs/ci.md](https://github.com/agents-repo/.github/blob/main/docs/ci.md) y la
[política de extras del baseline de PR de la organización](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pr-baseline-extras-path-filters).

## Paquetes de workflow del registry (hub de la organización)

Este repositorio **no** hace commit de `agents.json`. Los paquetes compartidos viven en [agents-repo/.github](https://github.com/agents-repo/.github). Abre [agents-repo.code-workspace](https://github.com/agents-repo/.github/blob/main/agents-repo.code-workspace) — [org-workspace-and-agents.md](https://github.com/agents-repo/.github/blob/main/docs/org-workspace-and-agents.md).

Para **tu** proyecto, consulta [Instalar paquetes](/docs/installing-packages).

## Contenido de guías

La documentación del sitio vive en `src/content/docs/`. Cuando cambien flujos de CLI o registry, actualiza manualmente las páginas doc relevantes (consulta [docs/development.md](https://github.com/agents-repo/webapp/blob/main/docs/development.md)).

Página del repositorio: [/repositories/webapp](/repositories/webapp).
