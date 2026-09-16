---
title: Contribuir com pacotes
description: Políticas, specs e links para autores de pacotes do registry.
order: 110
section: Contribute
---

O código-fonte dos pacotes está no repositório [registry](https://github.com/agents-repo/registry) em `packages/<namespace>/<package-id>/`.

## Antes de começar

- Pacotes devem ser **mantidos** e prontos para uso direto.
- Declare **install targets** suportados nos metadados.
- Siga as specs normativas em [registry/specs](https://github.com/agents-repo/registry/tree/main/specs)
  (formato de pacote, `package-detail-schema.md`, formato de agent/flow, metadata,
  manifests, versionamento).

## Introdução ao formato de pacote

Esta seção orienta autores antes de abrir as specs normativas. É **ilustrativa**; não substitui [registry/specs](https://github.com/agents-repo/registry/tree/main/specs).

O código-fonte fica em `packages/<namespace>/<package-id>/`. Artefatos gerados (`versions/`, `detail.json`) vêm dos scripts npm do registry — não os escreva à mão. Submissão passo a passo: **[Enviar um pacote](/docs/submitting-a-package)**.

```text
packages/<namespace>/<package-id>/
  metadata.json
  agents/          # definições de agent (conforme specs)
  flows/           # definições de flow opcionais
  README.md        # opcional; copiado para o snapshot de versão no build
  versions/        # gerado por package:build — não editar à mão
```

Regras normativas de formato, metadata, agent/flow, manifests e versionamento permanecem em [registry/specs](https://github.com/agents-repo/registry/tree/main/specs).

### Validar localmente

No clone local do [registry](https://github.com/agents-repo/registry), conclua a configuração de [Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment) (`npm ci`, `npm run env:check`) e execute:

```bash
npm run package:validate -- --package <namespace>/<package-id>
npm run package:build -- --package <namespace>/<package-id>
npm run package:validate-artifacts -- --package <namespace>/<package-id> --version <version>
```

O **`full-package-creation-flow`** sugerido executa este pipeline ao concluir; veja [Enviar um pacote](/docs/submitting-a-package) se você autorar arquivos manualmente.

## Fluxo de submissão

A maioria dos contribuidores faz **fork** do registry, trabalha no fork e abre um pull request para **agents-repo/registry** `main`. Uma issue de acompanhamento no upstream é **recomendada, mas não obrigatória**.

O caminho sugerido de autoria é o **`full-package-creation-flow`** na árvore (`agents-repo/agents-repo-package-creation`) após o draft do pull request. Checklist passo a passo: **[Enviar um pacote](/docs/submitting-a-package)**.

Requisitos e expectativas de revisão para humanos: [registry CONTRIBUTING](https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md).

Títulos de squash-merge (`feat(package):`, `fix(package):`) classificam a intenção do pacote; tags de registry do catálogo são publicadas em batch diário no trem de release, não em cada merge. Veja [Como o registry funciona](/docs/how-the-registry-works) para timing e impacto no consumidor.

## Correções

Correções em pacotes publicados usam o mesmo modelo fork → pull request upstream. O [template de issue de correção de pacote](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) é opcional, mas recomendado. Títulos de squash-merge usam `fix(package):` para a mesma classificação de intenção; tags de catálogo ainda são publicadas no trem diário.

## Ajuda

Dúvidas: [Contato](/contact) ou GitHub Discussions do registry. Ideias de pacotes: explore a [Home](/) para exemplos.

Direção do ecossistema (resultados, sem datas de entrega): [ROADMAP da organização](https://github.com/agents-repo/.github/blob/main/ROADMAP.md).
