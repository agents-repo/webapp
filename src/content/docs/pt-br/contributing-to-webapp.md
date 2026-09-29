---
title: Contribuir com a webapp
description: Fluxo de branch, validação e pacotes de workflow agents-repo neste repositório.
order: 130
section: Contribute
---

Este site é desenvolvido em [agents-repo/webapp](https://github.com/agents-repo/webapp).

## Fluxo obrigatório

1. Abra uma issue de acompanhamento (veja `.github/ISSUE_TEMPLATE/`).
2. Branch: `<prefix>/<issue-number>-<slug>` usando o prefixo que corresponde ao trabalho:

   | Tipo de trabalho | Prefixo | Exemplo |
   | --- | --- | --- |
   | Bug ou inconsistência | `fix/` | `fix/42-related-issues-checklist` |
   | Mudança de spec | `spec/` | `spec/57-pr-policy-clarity` |
   | Proposta de feature | `feat/` | `feat/89-search-refinement` |
   | Tarefa ou chore | `chore/` | `chore/31-sync-workflow-docs` |
   | Trabalho só de documentação | `docs/` | `docs/88-update-pr-guidance` |

3. Abra um pull request em **draft** com `Closes #<issue>`.
4. Execute validação antes do handoff; um mantenedor humano marca o PR como pronto para revisão.

Regras completas: [webapp CONTRIBUTING](https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md), [Required Workflow da organização](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow) e a [referência de prefixos de branch da organização](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#branch-prefix-reference).

## Validação local

```bash
npm run env:check
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run test:crawl-files
```

Para mudanças de UI, execute também `npm run test:a11y` e `npm run test:e2e` quando aplicável.

O CI baseline de PR filtra por caminho Chrome/`slides:check`, extras de Pages/crawl e `check:docs-sync` da CLI (sem `agents:verify` neste repositório). Veja [docs/ci.md](https://github.com/agents-repo/.github/blob/main/docs/ci.md) e a política da organização
[PR baseline extras](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pr-baseline-extras-path-filters).

## Pacotes de workflow do registry (hub da organização)

Este repositório **não** faz commit de `agents.json`. Pacotes compartilhados de planejamento/review ficam em [agents-repo/.github](https://github.com/agents-repo/.github). Abra [agents-repo.code-workspace](https://github.com/agents-repo/.github/blob/main/agents-repo.code-workspace) no clone `.github` — veja [org-workspace-and-agents.md](https://github.com/agents-repo/.github/blob/main/docs/org-workspace-and-agents.md).

Para instalar em **seu** projeto, veja [Instalar pacotes](/docs/installing-packages).

## Conteúdo dos guias

Os docs do site estão em `src/content/docs/`. Quando fluxos da CLI ou do registry mudarem, atualize manualmente as páginas relevantes (veja [docs/development.md](https://github.com/agents-repo/webapp/blob/main/docs/development.md)).

Página do repositório: [/repositories/webapp](/repositories/webapp).
