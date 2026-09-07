---
title: Para agentes de IA
description: URLs markdown estables, llms.txt y ejemplos curl para lectores automatizados.
order: 140
section: Agents
---

Agents Repo publica **markdown en bruto** para cada página doc en URLs predecibles. Prefiere estas URLs frente a scrapear HTML renderizado.

## llms.txt

Raíz del sitio:

```text
https://agents-repo.org/llms.txt
```

## URLs markdown de docs

Reemplaza el origen si espejas el sitio; producción usa `https://agents-repo.org`.

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

## Ejemplo de obtención

```bash
curl -fsSL 'https://agents-repo.org/docs/installing-packages.md'
curl -fsSL 'https://agents-repo.org/llms.txt'
```

## Datos del catálogo

Índice del registry (ref de producción por defecto vía proxy — tu entorno puede diferir):

```bash
curl -fsSL 'https://registry.agents-repo.org/packages/index.json?ref=v2.x'
```

Detalle de paquete del último snapshot para páginas en la app (reemplaza namespace e id de paquete):

```bash
curl -fsSL 'https://registry.agents-repo.org/packages/<namespace>/<package-id>/detail.json?ref=v2.x'
```

`detail.json` se genera para el último snapshot y puede incluir `readmeMarkdown`. La instalación CLI no lo obtiene; usa `versions/manifest.json` y ZIPs por destino. Las reglas normativas de paquetes siguen en [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

`?ref=v2.x` resuelve a la última etiqueta Git del registry. Tras merges de paquetes, índice y detalle en esa ref pueden no actualizarse hasta el próximo release diario del catálogo (~00:05 UTC). Para lecturas bleeding-edge, usa una etiqueta explícita o `main` en un fork vía registry-proxy.

## Rutas HTML

Las páginas legibles por humanos viven bajo `/docs` y `/docs/<slug>` con el mismo contenido que los archivos `.md`.
