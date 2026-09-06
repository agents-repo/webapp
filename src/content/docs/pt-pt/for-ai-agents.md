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
