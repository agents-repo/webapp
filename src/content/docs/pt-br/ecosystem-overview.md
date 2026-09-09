---
title: Visão geral do ecossistema
description: Como registry, registry-proxy, webapp, CLI e políticas da organização se encaixam.
order: 20
section: Start
---

A organização **agents-repo** entrega uma plataforma pequena:

| Peça | Papel |
| --- | --- |
| [Registry](https://github.com/agents-repo/registry) | Especificações, fonte de pacotes, validação e artefatos ZIP versionados |
| [Registry proxy](https://github.com/agents-repo/registry-proxy) | Acesso somente leitura em cache a arquivos do registry no GitHub |
| [Webapp](https://github.com/agents-repo/webapp) | Este site — explorar, buscar e baixar |
| [CLI](https://github.com/agents-repo/cli) | Instalar e gerenciar pacotes no seu projeto (`agents.json`, lockfile) |
| [.github](https://github.com/agents-repo/.github) | Fluxo de contribuição e políticas compartilhadas |

## URLs públicas

- Site: [agents-repo.org](https://agents-repo.org/)
- Páginas por repositório: [Repositórios](/repositories)
- Diagramas mais profundos: [documento de ecossistema da organização](https://github.com/agents-repo/.github/blob/main/docs/ecosystem.md)

## Dados vs ferramentas

O registry é **data-first** (sem runtime no catálogo). Webapp e CLI resolvem uma ref do catálogo e carregam `packages/index.json`. Veja [Como o registry funciona](/docs/how-the-registry-works) para o caminho de leitura.
