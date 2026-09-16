---
title: Para agentes de IA
description: URLs markdown estáveis, llms.txt e exemplos curl para leitores automatizados.
order: 140
section: Agents
---

O Agents Repo publica **markdown bruto** para cada página de doc em URLs previsíveis. Prefira estes em vez de fazer scraping de HTML renderizado.

## llms.txt

Raiz do site:

```text
https://agents-repo.org/llms.txt
```

## URLs markdown de docs

Substitua a origem se fizer mirror do site; produção usa `https://agents-repo.org`.

```text
https://agents-repo.org/docs/getting-started.md
https://agents-repo.org/docs/ecosystem-overview.md
https://agents-repo.org/docs/using-the-catalog.md
https://agents-repo.org/docs/discover-packages.md
https://agents-repo.org/docs/how-the-registry-works.md
https://agents-repo.org/docs/installing-packages.md
https://agents-repo.org/docs/agents-json-lock.md
https://agents-repo.org/docs/cli-commands.md
https://agents-repo.org/docs/install-targets.md
https://agents-repo.org/docs/cli-doctor.md
https://agents-repo.org/docs/contributing-packages.md
https://agents-repo.org/docs/submitting-a-package.md
https://agents-repo.org/docs/contributing-to-webapp.md
https://agents-repo.org/docs/for-ai-agents.md
```

## Exemplo de fetch

```bash
curl -fsSL 'https://agents-repo.org/docs/installing-packages.md'
curl -fsSL 'https://agents-repo.org/llms.txt'
```

Após `npm run build:pages`, **`llms.txt` é a lista autoritativa** de cada URL `.md` de doc e pacote do site (a lista de URLs acima é um snapshot; prefira obter `llms.txt`).

## Publicar pacotes

Fluxo de autor (humano ou agente a assistir um autor):

1. Faça fork de [agents-repo/registry](https://github.com/agents-repo/registry), abra um pull request **draft** para `main` — veja [Enviar um pacote](/docs/submitting-a-package).
2. Crie o código do pacote em `packages/<namespace>/<package-id>/` (sugerido: **`full-package-creation-flow`** no clone do registry).
3. Execute validação local (`package:validate`, `package:build`, `package:validate-artifacts`) — comandos em [Contribuir com pacotes](/docs/contributing-packages).
4. Marque o pull request pronto para revisão depois de CI passar.

Políticas e intro ao formato: [Contribuir com pacotes](/docs/contributing-packages). Prioridades do ecossistema: [ROADMAP da organização](https://github.com/agents-repo/.github/blob/main/ROADMAP.md).

Espelhos markdown: `/docs/submitting-a-package.md`, `/docs/contributing-packages.md`.

## Instalação CLI

Docs de instalação para consumidores (agentes a ajudar utilizadores a instalar pacotes do catálogo):

```bash
npm install -D agents-repo@<version>
npx agents-repo init --targets cursor github-copilot
npx agents-repo install <namespace>/<package-id>
```

Guia completa: [Instalar pacotes](/docs/installing-packages) (`/docs/installing-packages.md`).

## Padrões de URL de pacotes

| Superfície | Padrão de URL |
| --- | --- |
| Catálogo do site (HTML) | `https://agents-repo.org/packages/<namespace>/<package-id>/` |
| Markdown de pacote no site | `https://agents-repo.org/packages/<namespace>/<package-id>.md` |
| Índice JSON do registry | `https://registry.agents-repo.org/packages/index.json?ref=v2.x` |
| Detail JSON do registry | `https://registry.agents-repo.org/packages/<namespace>/<package-id>/detail.json?ref=v2.x` |
| Markdown de doc do site | `https://agents-repo.org/docs/<slug>.md` |

Fallbacks `.md` de pacotes e todas as URLs `.md` de docs listam-se em **`llms.txt`** após cada build de produção.

## Dados do catálogo

Índice do registry (ref de produção default via proxy — o seu ambiente pode diferir):

```bash
curl -fsSL 'https://registry.agents-repo.org/packages/index.json?ref=v2.x'
```

Detail de pacote do snapshot mais recente para páginas na app (substitua namespace e package id):

```bash
curl -fsSL 'https://registry.agents-repo.org/packages/<namespace>/<package-id>/detail.json?ref=v2.x'
```

`detail.json` é gerado para o snapshot mais recente e pode incluir `readmeMarkdown`. A instalação pela CLI não o obtém; usa `versions/manifest.json` e ZIPs de destino. Regras normativas de pacotes permanecem em [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

`?ref=v2.x` resolve para a última tag Git do registry. Depois de merges de pacotes, índice e detail nessa ref podem não atualizar até ao próximo release diário do catálogo (~00:05 UTC). Para leituras bleeding-edge, use uma tag explícita ou `main` num fork via registry-proxy.

## Rotas HTML

Páginas legíveis por humanos vivem em `/docs` e `/docs/<slug>` com o mesmo conteúdo dos ficheiros `.md`.
