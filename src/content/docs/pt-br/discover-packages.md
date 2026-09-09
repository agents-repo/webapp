---
title: Descobrir pacotes
description: Encontre pacotes no catálogo do site, busca CLI e pontuação suggest-agents.
order: 40
section: Catalog
---

## No site

1. Abra a [Home](/) para ler o que é o Agents Repo, copiar comandos CLI, buscar
   (a busca navega para [Pacotes](/packages)) ou explorar a fatia mais baixada.
2. Abra [Pacotes](/packages) para buscar, ordenar por janela de downloads e filtrar.
3. Abra um card (**View** ou o título) para ler a página do pacote no app.
4. Copie um comando CLI de instalação, use **Use in chat** quando disponível, ou anote o id do pacote.

Veja [Usando o catálogo](/docs/using-the-catalog) para detalhes da UI.

## Com a CLI

| Comando | Propósito |
| --- | --- |
| `agents-repo search <query>` | Buscar no índice do registry |
| `agents-repo suggest-agents` | Classificar pacotes a partir do projeto local |

## Caminho recomendado

Descobrir → avaliar na página do pacote → `agents-repo install <id>` → confirmar [agents.json e lockfile](/docs/agents-json-lock).
