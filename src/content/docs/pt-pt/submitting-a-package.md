---
title: Enviar um pacote
description: Fluxo fork-first, issue de acompanhamento opcional, criação de pacotes AI-first com full-package-creation-flow, validação e expectativas de squash-merge.
order: 120
section: Contribute
---

Os pacotes são contribuídos para o [registry](https://github.com/agents-repo/registry) através de um pull request para `main`. A maioria dos contribuidores faz **fork** do repositório registry, trabalha no fork e abre um pull request do fork para **agents-repo/registry**.

Isto é diferente de usar as **definições do site** para pré-visualizar um fork no browser — veja [Usar o catálogo](/docs/using-the-catalog).

## 1. Fork e clone

1. No GitHub, faça fork de [agents-repo/registry](https://github.com/agents-repo/registry) para a sua conta ou organização.
2. Clone **o seu fork** (substitua `YOUR_GITHUB_USER`):

   ```bash
   git clone https://github.com/YOUR_GITHUB_USER/registry.git
   cd registry
   ```

3. Adicione o remote upstream e faça fetch:

   ```bash
   git remote add upstream https://github.com/agents-repo/registry.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

Antes de iniciar um branch de longa duração, sincronize `main` a partir de `upstream` outra vez para manter o fork atualizado.

## 2. Issue de acompanhamento opcional

Abrir uma issue de acompanhamento no **upstream** (`agents-repo/registry`, não no seu fork) é **recomendado mas não obrigatório**.

Use o [formulário de issue de submissão de pacote](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-submission.yml) quando quer feedback de maintainers antes de trabalho pesado, quando o scope é incerto, ou quando prefere um thread de discussão ligado.

Pode ignorar a issue para pull requests pequenos e autocontidos. Quando abrir uma, anote o número da issue para nomear o branch e inclua `Closes #<issue-number>` na secção `## Related Issues` do pull request.

## 3. Branch no seu fork

Crie um branch a partir de `main` atualizado:

| Situação | Padrão de branch | Exemplo |
| --- | --- | --- |
| Com issue de acompanhamento | `package/<issue-number>-<slug>` | `package/56-my-package` |
| Sem issue de acompanhamento | `package/<slug>` | `package/my-package` |

`<slug>` é um package id ou descritor curto em kebab-case minúsculo.

```bash
git checkout -b package/my-package
```

Membros da org com acesso de escrita a **agents-repo/registry** podem fazer branch diretamente no repositório upstream; o fluxo de fork continua recomendado para isolamento.

## 4. Abrir um draft pull request (cedo)

Abra um **draft** pull request do seu fork **antes** de commits de implementação substantivos. Um commit scaffold vazio chega para abrir o PR se ainda não tem alterações de ficheiros.

- **Repositório base:** `agents-repo/registry`
- **Branch base:** `main`
- **Repositório head:** seu fork
- **Branch compare:** seu branch de tarefa

Na UI do GitHub: escolha **compare across forks**, defina a base como `agents-repo/registry` `main`, e o head como `YOUR_GITHUB_USER:package/my-package`.

Com a GitHub CLI, faça push de um commit scaffold para o head do branch diferir de
`main`, depois abra o draft pull request:

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

Quando existe issue de acompanhamento, inclua `Closes #<issue-number>` em `## Related Issues`. Caso contrário, descreva o pacote nessa secção.

## 5. Criar o pacote

A criação de pacotes é **AI-first**. Depois do draft pull request aberto, crie
código-fonte do pacote no branch de tarefa. O clone do registry já inclui
[`agents-repo/agents-repo-package-creation`](https://github.com/agents-repo/registry/tree/main/packages/agents-repo/agents-repo-package-creation)
(skills e agents extraídos para GitHub Copilot, Cursor, Claude Code e OpenAI
Codex). Não precisa de uma instalação CLI separada. Veja
[registry README — IDE Setup](https://github.com/agents-repo/registry/blob/main/README.md#ide-setup)
para onde esses ficheiros ficam.

### Sugerido: invocar `full-package-creation-flow`

O fluxo executa scripts npm do registry. Complete primeiro a configuração de
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` e `npm run env:check` com Node/npm fixados).

No seu IDE, invoque o fluxo **`full-package-creation-flow`** (skill ou agent,
dependendo do destino de instalação). Descreva o pacote que quer. O fluxo
faz scaffold com `package:create`, cria agents/flows e metadados, revê prontidão
para submissão, depois executa `package:validate`, `package:build` e
`package:validate-artifacts` quando termina. Se sair do fluxo depois de
autoria e revisão mas antes desses scripts de validação, termine o
pipeline na secção seguinte.

Não edite ficheiros em `versions/` manualmente, e não crie `detail.json`. O fluxo usa `package:build` para snapshots de versão e detail de pacote gerado. Se o pacote tem `README.md` na raiz, o build copia-o para o novo snapshot.

Faça push de commits para o branch do seu fork; o draft pull request atualiza automaticamente.

### Alternativa: criar ficheiros manualmente

Adicione ou atualize `packages/<namespace>/<package-id>/` com agents/flows e
`metadata.json` conforme [registry specs](https://github.com/agents-repo/registry/tree/main/specs).
Nunca crie ou modifique ficheiros em `versions/` manualmente, e não crie
`detail.json`; `package:build` gera esses artefatos. `README.md` opcional na raiz do pacote
é copiado para o snapshot no build.

Depois execute os comandos na secção seguinte.

## 6. Validar localmente

No seu clone local, use o Node/npm fixados em
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` e `npm run env:check`).

Se o fluxo sugerido terminou até validação de artefatos, confirme CI no
draft pull request. Se criou ficheiros manualmente ou o fluxo parou cedo,
execute este pipeline:

```bash
npm run package:validate -- --package <namespace>/<package-id>
npm run package:build -- --package <namespace>/<package-id>
npm run package:validate-artifacts -- --package <namespace>/<package-id> --version <version>
```

## 7. Pronto para revisão e merge

Marque o pull request **ready for review** só depois de validação local e CI passarem. Os maintainers fazem squash-merge com **`feat(package): …`** para pacotes ou versões novos, ou **`fix(package): …`** para correções. Os títulos classificam a intenção do pacote para histórico e CI; não publicam imediatamente uma tag de registry do catálogo.

### Depois do merge

Merges de pacotes chegam a `main` imediatamente. Tags de registry do catálogo para consumidores `v2.x` publicam no **comboio diário de release do catálogo** (~00:05 UTC) quando `packages/` tem alterações não lançadas. Pacotes novos aparecem em [agents-repo.org](https://agents-repo.org) depois da próxima tag de catálogo, exceto se pré-visualizar o seu fork via **definições do site** — veja [Usar o catálogo](/docs/using-the-catalog).

## Manter o fork atualizado

Enquanto o trabalho está em curso, sincronize periodicamente a partir do upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git checkout package/my-package
git merge main
```

Resolva conflitos antes do push final.

## Correções de pacotes

Para correções a entradas existentes no catálogo, use o mesmo modelo fork → pull request upstream. O [template de correção de pacote](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) é opcional mas recomendado.

## Relacionado

- [Contribuir com pacotes](/docs/contributing-packages) — índice de políticas e specs
- [Como o registry funciona](/docs/how-the-registry-works) — layout do catálogo
