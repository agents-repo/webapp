---
title: Instalar paquetes
description: Fija la CLI como devDependency, inicializa destinos, instala desde el catálogo y reproduce en CI.
order: 60
section: CLI
---

## Fijar la CLI (recomendado)

Para proyectos reales, añade la CLI como **devDependency** para que compañeros y CI usen la misma versión:

```bash
npm install -D agents-repo@<version>
```

Ejemplo de scripts en `package.json` (esta webapp usa el mismo patrón):

```json
{
  "scripts": {
    "agents:install": "agents-repo install",
    "agents:update": "agents-repo update",
    "agents:ci": "agents-repo ci"
  }
}
```

`npx agents-repo@latest` está bien para **pruebas puntuales**; las instalaciones fijadas son mejores para reproducibilidad.

## Inicializar destinos de instalación

```bash
npx agents-repo init --targets cursor github-copilot
```

Consulta [Destinos de instalación](/docs/install-targets) para ids canónicos y disposición en disco.

## Instalar paquetes

Añade ids a `packages` en `agents.json` y ejecuta instalación masiva, o instala directamente:

```bash
npx agents-repo install agents-repo/some-package
```

Haz commit de **`agents.json`** y **`agents-lock.json`** cuando cambien. Detalles: [agents.json y lockfile](/docs/agents-json-lock).

## CI

```bash
npm ci
npm run agents:ci
```

`ci` instala exactamente desde el lockfile (paridad con npm `ci`). Consulta [documentación de `ci` de la CLI](https://github.com/agents-repo/cli/blob/main/docs/commands/ci.md).

## Solución de problemas

Ejecuta [`agents-repo doctor`](/docs/cli-doctor) antes de depurar fallos de instalación. Lista completa de comandos: [Referencia de comandos de la CLI](/docs/cli-commands). Repositorio de la CLI: [/repositories/cli](/repositories/cli).
