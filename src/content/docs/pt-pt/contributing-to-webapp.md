---
title: Contribuir para a webapp
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
   | Alteração de spec | `spec/` | `spec/57-pr-policy-clarity` |
   | Proposta de funcionalidade | `feat/` | `feat/89-search-refinement` |
   | Tarefa ou chore | `chore/` | `chore/31-sync-workflow-docs` |
   | Trabalho só de documentação | `docs/` | `docs/88-update-pr-guidance` |

3. Abra um **draft** pull request com `Closes #<issue>`.
4. Execute validação antes do handoff; um maintainer humano marca o PR ready for review.

Regras completas: [webapp CONTRIBUTING](https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md), [Required Workflow da organização](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow), e a [referência de prefixos de branch da organização](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#branch-prefix-reference).

## Validação local

```bash
npm run env:check
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run test:crawl-files
```

Para alterações de UI, execute também `npm run test:a11y` e `npm run test:e2e` quando aplicável.

O PR baseline CI filtra por caminho Chrome/`slides:check`, `agents:ci` e extras
Pages/crawl. A validação local ainda usa a lista completa. Veja a
[política de extras do PR baseline da organização](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pr-baseline-extras-path-filters).

## Pacotes de workflow do registry neste repo

A webapp fixa `agents-repo` em **devDependencies** e usa:

```bash
npm run agents:install
npm run agents:update
npm run agents:ci
```

Faça commit de `agents.json`, `agents-lock.json` e caminhos de agents extraídos. Veja [Instalar pacotes](/docs/installing-packages).

## Conteúdo dos guias

Os docs do site vivem em `src/content/docs/`. Quando fluxos da CLI ou registry mudam, atualize manualmente as páginas de doc relevantes (veja [docs/development.md](https://github.com/agents-repo/webapp/blob/main/docs/development.md)).

Página do repositório: [/repositories/webapp](/repositories/webapp).
