---
title: Instalar pacotes
description: Fixe a CLI como devDependency, inicialize targets, instale do catálogo e reproduza em CI.
order: 60
section: CLI
---

## Fixar a CLI (recomendado)

Para projetos reais, adicione a CLI como **devDependency** para que colegas e CI usem a mesma versão:

```bash
npm install -D agents-repo@<version>
```

Exemplo de scripts em `package.json` (esta webapp usa o mesmo padrão):

```json
{
  "scripts": {
    "agents:install": "agents-repo install",
    "agents:update": "agents-repo update",
    "agents:ci": "agents-repo ci"
  }
}
```

`npx agents-repo@latest` serve para **testes pontuais**; instalações fixadas são melhores para reprodutibilidade.

## Inicializar install targets

```bash
npx agents-repo init --targets cursor github-copilot
```

Veja [Destinos de instalação](/docs/install-targets) para ids canônicos e layout no disco.

## Instalar pacotes

Adicione ids em `packages` do `agents.json` e execute instalação em massa, ou instale diretamente:

```bash
npx agents-repo install agents-repo/some-package
```

Faça commit de **`agents.json`** e **`agents-lock.json`** quando mudarem. Detalhes: [agents.json e lockfile](/docs/agents-json-lock).

## CI

```bash
npm ci
npm run agents:ci
```

`ci` instala exatamente a partir do lockfile (paridade com `npm ci`). Veja [documentação do `ci` da CLI](https://github.com/agents-repo/cli/blob/main/docs/commands/ci.md).

## Solução de problemas

Execute [`agents-repo doctor`](/docs/cli-doctor) antes de depurar falhas de instalação. Lista completa de comandos: [Referência de comandos da CLI](/docs/cli-commands). Repositório da CLI: [/repositories/cli](/repositories/cli).
