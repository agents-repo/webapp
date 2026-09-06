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

O CI baseline de PR filtra por caminho Chrome/`slides:check`, `agents:ci` e extras de Pages/crawl.
A validação local ainda usa a lista completa. Veja a política da organização
[PR baseline extras](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pr-baseline-extras-path-filters).

## Pacotes de workflow do registry neste repo

A webapp fixa `agents-repo` em **devDependencies** e usa:

```bash
npm run agents:install
npm run agents:update
npm run agents:ci
```

Faça commit de `agents.json`, `agents-lock.json` e caminhos de agentes extraídos. Veja [Instalar pacotes](/docs/installing-packages).

## Conteúdo dos guias

Os docs do site estão em `src/content/docs/`. Quando fluxos da CLI ou do registry mudarem, atualize manualmente as páginas relevantes (veja [docs/development.md](https://github.com/agents-repo/webapp/blob/main/docs/development.md)).

Página do repositório: [/repositories/webapp](/repositories/webapp).
