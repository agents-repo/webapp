---
title: Visão geral do ecossistema
description: Como registry, registry-proxy, webapp, CLI e políticas da organização se encaixam.
order: 20
section: Start
---

A organização **agents-repo** disponibiliza uma plataforma pequena:

| Peça | Papel |
| --- | --- |
| [Registry](https://github.com/agents-repo/registry) | Especificações, fonte de pacotes, validação e artefatos ZIP versionados |
| [Registry proxy](https://github.com/agents-repo/registry-proxy) | Acesso só de leitura em cache a ficheiros do registry no GitHub |
| [Webapp](https://github.com/agents-repo/webapp) | Este site — explorar, pesquisar e descarregar |
| [CLI](https://github.com/agents-repo/cli) | Instalar e gerir pacotes no seu projeto |
| [.github](https://github.com/agents-repo/.github) | Fluxo de contribuição e políticas partilhadas |

## URLs públicas

- Site: [agents-repo.org](https://agents-repo.org/)
- Páginas por repositório: [Repositórios](/repositories)

## Dados vs ferramentas

O registry é **data-first**. Webapp e CLI resolvem uma ref do catálogo e carregam `packages/index.json`.
