---
title: Como o registry funciona
description: Índice do catálogo, package detail.json, manifests de versão, artefatos ZIP e como webapp e CLI buscam dados.
order: 50
section: Registry
---

O repositório [registry](https://github.com/agents-repo/registry) é a **fonte da verdade** para definições de pacotes. A lógica de runtime fica fora do catálogo; consumidores leem arquivos via HTTP.

## Identidade do pacote

- **Package id**: `namespace/package-id` (segmentos em kebab-case minúsculo).
- **Árvore de origem**: `packages/<namespace>/<package-id>/` no repositório registry.
- **Artefatos de versão**: ZIPs semver em `versions/` com checksums em `versions/manifest.json`. Quando um pacote tem um `README.md` na raiz no release, `package:build` copia para `versions/<version>/README.md`.

## Arquivos do catálogo

| Arquivo | Papel |
| --- | --- |
| `packages/index.json` | Lista pacotes e versões mais recentes para navegação |
| `packages/<namespace>/<package-id>/detail.json` | Agregado gerado do snapshot mais recente para páginas de pacotes no app (opcional `readmeMarkdown` de `versions/<latest>/README.md`) |
| `metadata.json` | Metadados no nível do pacote (descrição, targets, licença) |
| `versions/manifest.json` | URLs de artefatos por versão e checksums SHA-256 |

Consumidores resolvem uma **ref git** (por exemplo `v2.x` ou uma tag de release), depois buscam o índice e arquivos por pacote para essa ref. Contribuidores NÃO DEVEM criar `detail.json`.

## Tags de distribuição do registry vs versões de pacotes

Duas camadas de versionamento se aplicam:

- **Tags Git do registry** (por exemplo `v2.0.1`) versionam o **snapshot do catálogo** consumido via refs como `v2.x`.
- **Versões de pacotes** em `versions/manifest.json` `latest` versionam a compatibilidade individual de cada pacote. Essas camadas são independentes.

Títulos de squash-merge de pacotes (`feat(package):`, `fix(package):`) classificam a intenção do pacote para histórico e CI. Eles **não** publicam uma tag de registry do catálogo imediatamente.

### Trem de release do catálogo

Tags Git do **catálogo** do registry para consumidores `v2.x` são publicadas em agenda diária quando `packages/` tem alterações não lançadas desde a última tag `v*`:

- **Agenda:** diariamente às **00:05 UTC** (`.github/workflows/catalog-release.yml`).
- **Cadência:** no máximo um **PATCH** do registry por execução quando `packages/` mudou.
- **Manual:** mantenedores podem executar `workflow_dispatch` no mesmo workflow para publicações urgentes do catálogo.

Merges de plataforma ou ferramentas (commits sem o escopo `package`) ainda podem ser lançados imediatamente via `semantic-release`.

### Impacto no consumidor

Refs como `v2.x` resolvem para a tag Git do registry publicada mais recente. Depois que um merge de pacote entra em `main`, o catálogo de produção (padrão deste site, ref `agents.json` da CLI) pode ficar até ~24 horas atrás até o próximo release do catálogo.

Para pré-visualizar conteúdo do catálogo mesclado antes da próxima tag, aponte as **configurações do site** para um fork ou ref explícita — veja [Usando o catálogo](/docs/using-the-catalog). Política normativa de release: [registry README — Release Workflow](https://github.com/agents-repo/registry/blob/main/README.md#release-workflow).

## registry-proxy

A webapp de produção e muitas configurações da CLI usam [registry-proxy](https://github.com/agents-repo/registry-proxy) para cachear respostas do GitHub Raw/contents. Você ainda pode linkar para a árvore do registry no GitHub para revisão humana.

## Webapp vs CLI

- **Webapp**: carrega `packages/index.json` para busca/UI, depois `packages/<namespace>/<package-id>/detail.json` para páginas de pacotes no app (snapshot mais recente, incluindo README via `readmeMarkdown`). Oferece Use in chat, downloads e navegação no GitHub ([Usando o catálogo](/docs/using-the-catalog)).
- **CLI**: carrega `packages/index.json`, depois `versions/manifest.json` e `metadata.json` com escopo de versão, verifica integridade do ZIP e extrai `<version>-<target-id>.zip` nos caminhos dos install targets ([Instalar pacotes](/docs/installing-packages)).

Formatos normativos estão em [registry specs](https://github.com/agents-repo/registry/tree/main/specs). Este guia não duplica o texto das specs.
