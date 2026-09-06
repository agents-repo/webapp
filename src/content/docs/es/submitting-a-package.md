---
title: Enviar un paquete
description: Flujo fork-first, issue de seguimiento opcional, creación de paquetes AI-first con full-package-creation-flow, validación y expectativas de squash-merge.
order: 120
section: Contribute
---

Los paquetes se contribuyen al [registry](https://github.com/agents-repo/registry) mediante un pull request a `main`. La mayoría de contribuidores **hace fork** del repositorio registry, trabaja en el fork y abre un pull request desde el fork hacia **agents-repo/registry**.

Esto es distinto de usar **Website settings** para previsualizar un fork en el navegador — consulta [Usar el catálogo](/docs/using-the-catalog).

## 1. Fork y clonado

1. En GitHub, haz fork de [agents-repo/registry](https://github.com/agents-repo/registry) a tu cuenta u organización.
2. Clona **tu fork** (reemplaza `YOUR_GITHUB_USER`):

   ```bash
   git clone https://github.com/YOUR_GITHUB_USER/registry.git
   cd registry
   ```

3. Añade el remoto upstream y obtén cambios:

   ```bash
   git remote add upstream https://github.com/agents-repo/registry.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

Antes de empezar una rama de larga duración, sincroniza `main` desde `upstream` de nuevo para mantener tu fork actualizado.

## 2. Issue de seguimiento opcional

Abrir un issue de seguimiento en **upstream** (`agents-repo/registry`, no tu fork) es **recomendado pero no obligatorio**.

Usa el [formulario de issue de envío de paquete](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-submission.yml) cuando quieras feedback de maintainers antes de mucho trabajo, cuando el alcance no esté claro o cuando prefieras un hilo de discusión vinculado.

Puedes omitir el issue para pull requests pequeños y autocontenidos. Cuando abras uno, anota el número del issue para nombrar la rama e incluye `Closes #<issue-number>` en la sección `## Related Issues` del pull request.

## 3. Rama en tu fork

Crea una rama desde `main` actualizado:

| Situación | Patrón de rama | Ejemplo |
| --- | --- | --- |
| Con issue de seguimiento | `package/<issue-number>-<slug>` | `package/56-my-package` |
| Sin issue de seguimiento | `package/<slug>` | `package/my-package` |

`<slug>` es un id de paquete o descriptor corto en kebab-case minúsculas.

```bash
git checkout -b package/my-package
```

Los miembros de la org con acceso de escritura a **agents-repo/registry** pueden ramificar directamente en el repositorio upstream; el flujo con fork sigue siendo recomendado por aislamiento.

## 4. Abrir un pull request en borrador (pronto)

Abre un pull request en **borrador** desde tu fork **antes** de commits de implementación sustantivos. Un commit scaffold vacío basta para abrir el PR si aún no tienes cambios de archivos.

- **Repositorio base:** `agents-repo/registry`
- **Rama base:** `main`
- **Repositorio head:** tu fork
- **Rama compare:** tu rama de tarea

En la UI de GitHub: elige **compare across forks**, establece la base en `agents-repo/registry` `main` y el head en `YOUR_GITHUB_USER:package/my-package`.

Con la GitHub CLI, sube un commit scaffold para que la cabeza de la rama difiera de
`main`, luego abre el pull request en borrador:

```bash
git commit --allow-empty -m "chore: scaffold draft package PR"
git push -u origin package/my-package

cat > pr-body.md <<'EOF'
## Summary

Draft package submission scaffold.

## Related Issues

Describe the package (namespace/package-id and intent). When a tracking issue
exists, replace this section with `Closes #<issue-number>`.
EOF

gh pr create --repo agents-repo/registry --draft \
  --head YOUR_GITHUB_USER:package/my-package \
  --base main \
  --title "feat(package): add my-package" \
  --body-file pr-body.md
```

Cuando exista un issue de seguimiento, incluye `Closes #<issue-number>` en `## Related Issues`. Si no, describe el paquete en esa sección.

## 5. Crear el paquete

La creación de paquetes es **AI-first**. Tras abrir el pull request en borrador, crea
el código fuente del paquete en la rama de tarea. El clon del registry ya incluye
[`agents-repo/agents-repo-package-creation`](https://github.com/agents-repo/registry/tree/main/packages/agents-repo/agents-repo-package-creation)
(skills y agentes extraídos para GitHub Copilot, Cursor, Claude Code y OpenAI
Codex). No necesitas una instalación CLI aparte. Consulta
[registry README — IDE Setup](https://github.com/agents-repo/registry/blob/main/README.md#ide-setup)
para dónde viven esos archivos.

### Sugerido: invocar `full-package-creation-flow`

El flujo ejecuta scripts npm del registry. Completa primero la configuración de
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` y `npm run env:check` con Node/npm fijados).

En tu IDE, invoca el flujo **`full-package-creation-flow`** (skill o agent,
según el destino de instalación). Describe el paquete que quieres. El flujo
genera scaffold con `package:create`, crea agents/flows y metadatos, revisa la
preparación para envío y luego ejecuta `package:validate`, `package:build` y
`package:validate-artifacts` al completarse. Si abandonas el flujo tras
autoría y revisión pero antes de esos scripts de validación, termina el
pipeline en la siguiente sección.

No edites archivos bajo `versions/` a mano y no crees `detail.json`. El flujo usa `package:build` para snapshots de versión y detalle de paquete generado. Si el paquete tiene un `README.md` en la raíz, el build lo copia al nuevo snapshot.

Sube commits a la rama de tu fork; el pull request en borrador se actualiza automáticamente.

### Alternativa: crear archivos tú mismo

Añade o actualiza `packages/<namespace>/<package-id>/` con agents/flows y
`metadata.json` según [registry specs](https://github.com/agents-repo/registry/tree/main/specs).
Nunca crees ni modifiques archivos bajo `versions/` a mano y no crees
`detail.json`; `package:build` genera esos artefactos. Un `README.md` opcional en la raíz del paquete se copia al snapshot en tiempo de build.

Luego ejecuta los comandos de la siguiente sección.

## 6. Validar localmente

Desde tu clon local, usa Node/npm fijados en
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` y `npm run env:check`).

Si el flujo sugerido terminó hasta la validación de artefactos, confirma CI en el
pull request en borrador. Si creaste archivos tú mismo o el flujo se detuvo antes,
ejecuta este pipeline:

```bash
npm run package:validate -- --package <namespace>/<package-id>
npm run package:build -- --package <namespace>/<package-id>
npm run package:validate-artifacts -- --package <namespace>/<package-id> --version <version>
```

## 7. Listo para revisión y merge

Marca el pull request **ready for review** solo tras validación local y CI correctos. Los maintainers hacen squash-merge con **`feat(package): …`** para paquetes o versiones nuevos, o **`fix(package): …`** para correcciones. Los títulos clasifican la intención del paquete para historial y CI; no publican una etiqueta de registry del catálogo de inmediato.

### Tras el merge

Los merges de paquetes llegan a `main` de inmediato. Las etiquetas del registry del catálogo para consumidores `v2.x` se publican en el **tren diario de releases del catálogo** (~00:05 UTC) cuando `packages/` tiene cambios sin publicar. Los paquetes nuevos aparecen en [agents-repo.org](https://agents-repo.org) tras la próxima etiqueta del catálogo, salvo que previsualices tu fork vía **Website settings** — consulta [Usar el catálogo](/docs/using-the-catalog).

## Mantener tu fork actualizado

Mientras el trabajo está en curso, sincroniza periódicamente desde upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git checkout package/my-package
git merge main
```

Resuelve conflictos antes del push final.

## Correcciones de paquetes

Para correcciones a entradas existentes del catálogo, usa el mismo modelo fork → pull request upstream. La [plantilla de corrección de paquete](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) es opcional pero recomendada.

## Relacionado

- [Contribuir paquetes](/docs/contributing-packages) — índice de políticas y specs
- [Cómo funciona el registry](/docs/how-the-registry-works) — disposición del catálogo
