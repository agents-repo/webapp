---
title: Como o registry funciona
description: Índice do catálogo, package detail.json, manifests de versão, artefatos ZIP e como webapp e CLI obtêm dados.
order: 50
section: Registry
---

O repositório [registry](https://github.com/agents-repo/registry) é a **fonte de verdade** para definições de pacotes. A lógica de runtime fica fora do catálogo; os consumidores leem ficheiros via HTTP.

## Identidade do pacote

- **Package id**: `namespace/package-id` (segmentos em kebab-case minúsculo).
- **Árvore de origem**: `packages/<namespace>/<package-id>/` no repositório registry.
- **Artefatos de versão**: ZIPs semver em `versions/` com checksums em `versions/manifest.json`. Quando um pacote tem um `README.md` na raiz no release, `package:build` copia-o para `versions/<version>/README.md`.

## Ficheiros do catálogo

| Ficheiro | Função |
| --- | --- |
| `packages/index.json` | Lista pacotes e versões mais recentes para navegação |
| `packages/<namespace>/<package-id>/detail.json` | Agregado gerado do snapshot mais recente para páginas de pacotes na app (opcional `readmeMarkdown` de `versions/<latest>/README.md`) |
| `metadata.json` | Metadados ao nível do pacote (descrição, destinos, licença) |
| `versions/manifest.json` | URLs de artefatos por versão e checksums SHA-256 |

Os consumidores resolvem uma **git ref** (por exemplo `v2.x` ou uma tag de release), depois obtêm o índice e ficheiros por pacote para essa ref. Os contribuidores NÃO devem criar `detail.json`.

## Tags de distribuição do registry vs versões de pacotes

Aplicam-se duas camadas de versionamento:

- **Tags Git do registry** (por exemplo `v2.0.1`) versionam o **snapshot do catálogo** consumido via refs como `v2.x`.
- **Versões de pacotes** em `versions/manifest.json` `latest` versionam a compatibilidade de cada pacote individualmente. Estas camadas são independentes.

Títulos de squash-merge (`feat(package):`, `fix(package):`) classificam a intenção do pacote para histórico e CI. **Não** publicam imediatamente uma tag de registry do catálogo.

### Comboio de release do catálogo

Tags Git do **catálogo** do registry para consumidores `v2.x` publicam num horário diário quando `packages/` tem alterações não lançadas desde a última tag `v*`:

- **Horário:** diariamente às **00:05 UTC** (`.github/workflows/catalog-release.yml`).
- **Cadência:** no máximo um **PATCH** do registry por execução quando `packages/` mudou.
- **Manual:** os maintainers podem executar `workflow_dispatch` no mesmo workflow para publicações urgentes do catálogo.

Merges de plataforma ou tooling (commits sem o scope `package`) podem ainda assim lançar imediatamente via `semantic-release`.

### Impacto para consumidores

Refs como `v2.x` resolvem para a última tag Git do registry publicada. Depois de um merge de pacote chegar a `main`, o catálogo de produção (o default deste site, ref `agents.json` da CLI) pode ficar até ~24 horas atrás até ao próximo release do catálogo.

Para pré-visualizar conteúdo do catálogo fundido antes da próxima tag, aponte as **definições do site** a um fork ou ref explícita — veja [Usar o catálogo](/docs/using-the-catalog). Política normativa de release: [registry README — Release Workflow](https://github.com/agents-repo/registry/blob/main/README.md#release-workflow).

## registry-proxy

A webapp de produção e muitas configurações da CLI usam [registry-proxy](https://github.com/agents-repo/registry-proxy) para fazer cache de respostas GitHub Raw/contents. Pode ainda assim ligar à árvore do registry no GitHub para revisão humana.

## Webapp vs CLI

- **Webapp**: carrega `packages/index.json` para pesquisa/UI, depois `packages/<namespace>/<package-id>/detail.json` para páginas de pacotes na app (snapshot mais recente, incluindo README via `readmeMarkdown`). Oferece Use in chat, downloads e navegação no GitHub ([Usar o catálogo](/docs/using-the-catalog)).
- **CLI**: carrega `packages/index.json`, depois `versions/manifest.json` e `metadata.json` com scope de versão, verifica integridade do ZIP e extrai `<version>-<target-id>.zip` para caminhos de destino de instalação ([Instalar pacotes](/docs/installing-packages)).

Os formatos normativos estão em [registry specs](https://github.com/agents-repo/registry/tree/main/specs). Este guia não duplica o texto das specs.
