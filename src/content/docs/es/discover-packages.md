---
title: Descubrir paquetes
description: Encuentra paquetes desde el catálogo del sitio, búsqueda CLI y puntuación suggest-agents.
order: 40
section: Catalog
---

## En el sitio web

1. Abre [Inicio](/) para leer qué es Agents Repo, copiar comandos CLI de instalación, buscar
   (la búsqueda navega a [Paquetes](/packages)) o explorar la selección más descargada.
2. Abre [Paquetes](/packages) para buscar, ordenar por ventana de descargas y filtrar por categoría, etiquetas, destinos
   de instalación, estado, banda de coste o Use in chat.
3. Abre una tarjeta de paquete (**View** o el título) para leer la página del paquete en la app.
4. Copia un comando CLI de instalación desde la tarjeta, usa **Use in chat** cuando esté disponible, o anota el id del paquete (`namespace/package-id`).

Consulta [Usar el catálogo](/docs/using-the-catalog) para detalles de la UI.

## Con la CLI

| Comando | Propósito |
| --- | --- |
| `agents-repo search <query>` | Buscar en el índice del registry (alias: `find`, `s`) |
| `agents-repo suggest-agents` | Clasificar paquetes desde `package.json` local, tokens README e ids instalados (sin LLM) |

## Ruta recomendada

Descubrir → evaluar en la página del paquete en la app → `agents-repo install <id>` → confirmar [agents.json y lockfile](/docs/agents-json-lock).
