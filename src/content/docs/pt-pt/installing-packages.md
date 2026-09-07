---
title: Instalar pacotes
description: Fixar a CLI como devDependency, inicializar destinos, instalar do catálogo e reproduzir em CI.
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

## Inicializar destinos de instalação

```bash
npx agents-repo init --targets cursor github-copilot
```

Veja [Destinos de instalação](/docs/install-targets) para ids canónicos e layout no disco.

## Instalar pacotes

Adicione ids a `packages` em `agents.json` e execute instalação em massa, ou instale diretamente:

```bash
npx agents-repo install agents-repo/some-package
```

Faça commit de **`agents.json`** e **`agents-lock.json`** quando mudarem. Detalhes: [agents.json e lockfile](/docs/agents-json-lock).

## CI

```bash
npm ci
npm run agents:ci
```

`ci` instala exatamente a partir do lockfile (paridade com npm `ci`). Veja [documentação do `ci` da CLI](https://github.com/agents-repo/cli/blob/main/docs/commands/ci.md).

## Resolução de problemas

Execute [`agents-repo doctor`](/docs/cli-doctor) antes de depurar falhas de instalação. Lista completa de comandos: [Referência de comandos da CLI](/docs/cli-commands). Repositório da CLI: [/repositories/cli](/repositories/cli).
