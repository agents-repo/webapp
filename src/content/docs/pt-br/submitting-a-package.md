---
title: Enviar um pacote
description: Fluxo fork-first, issue de acompanhamento opcional, criação de pacote AI-first com full-package-creation-flow, validação e expectativas de squash-merge.
order: 120
section: Contribute
---

Pacotes são contribuídos ao [registry](https://github.com/agents-repo/registry) por meio de um pull request para `main`. A maioria dos contribuidores faz **fork** do repositório registry, trabalha no fork e abre um pull request do fork para **agents-repo/registry**.

Isso é diferente de usar as **configurações do site** para pré-visualizar um fork no navegador — veja [Usando o catálogo](/docs/using-the-catalog).

## 1. Fork e clone

1. No GitHub, faça fork de [agents-repo/registry](https://github.com/agents-repo/registry) para sua conta ou organização.
2. Clone **seu fork** (substitua `YOUR_GITHUB_USER`):

   ```bash
   git clone https://github.com/YOUR_GITHUB_USER/registry.git
   cd registry
   ```

3. Adicione o remote upstream e busque:

   ```bash
   git remote add upstream https://github.com/agents-repo/registry.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

Antes de iniciar uma branch de longa duração, sincronize `main` do `upstream` novamente para manter o fork atualizado.

## 2. Issue de acompanhamento opcional

Abrir uma issue de acompanhamento no **upstream** (`agents-repo/registry`, não no seu fork) é **recomendado, mas não obrigatório**.

Use o [formulário de issue de submissão de pacote](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-submission.yml) quando quiser feedback de mantenedores antes de trabalho pesado, quando o escopo está incerto ou quando prefere uma thread de discussão vinculada.

Você pode pular a issue para pull requests pequenos e autocontidos. Quando abrir uma, anote o número da issue para nomear a branch e inclua `Closes #<issue-number>` na seção `## Related Issues` do pull request.

## 3. Branch no seu fork

Crie uma branch a partir de `main` atualizado:

| Situação | Padrão de branch | Exemplo |
| --- | --- | --- |
| Com issue de acompanhamento | `package/<issue-number>-<slug>` | `package/56-my-package` |
| Sem issue de acompanhamento | `package/<slug>` | `package/my-package` |

`<slug>` é um package id curto em kebab-case minúsculo ou descritor.

```bash
git checkout -b package/my-package
```

Membros da org com acesso de escrita em **agents-repo/registry** podem criar branch diretamente no repositório upstream; o fluxo de fork ainda é recomendado para isolamento.

## 4. Abrir um draft pull request (cedo)

Abra um pull request em **draft** do seu fork **antes** de commits de implementação substancial. Um commit scaffold vazio é suficiente para abrir o PR se ainda não houver mudanças de arquivo.

- **Repositório base:** `agents-repo/registry`
- **Branch base:** `main`
- **Repositório head:** seu fork
- **Branch compare:** sua branch de tarefa

Na UI do GitHub: escolha **compare across forks**, defina a base como `agents-repo/registry` `main` e o head como `YOUR_GITHUB_USER:package/my-package`.

Com o GitHub CLI, envie um commit scaffold para que o head da branch difira de
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

Quando existir issue de acompanhamento, inclua `Closes #<issue-number>` em `## Related Issues`. Caso contrário, descreva o pacote nessa seção.

## 5. Criar o pacote

A criação de pacotes é **AI-first**. Depois que o draft pull request estiver aberto, crie
o código-fonte do pacote na branch de tarefa. O clone do registry já inclui
[`agents-repo/agents-repo-package-creation`](https://github.com/agents-repo/registry/tree/main/packages/agents-repo/agents-repo-package-creation)
(skills e agents extraídos para GitHub Copilot, Cursor, Claude Code e OpenAI
Codex). Você não precisa de uma instalação separada da CLI. Veja
[registry README — IDE Setup](https://github.com/agents-repo/registry/blob/main/README.md#ide-setup)
para onde esses arquivos ficam.

### Sugerido: invocar `full-package-creation-flow`

O fluxo executa scripts npm do registry. Complete primeiro a configuração de
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` e `npm run env:check` com Node/npm fixados).

Na sua IDE, invoque o fluxo **`full-package-creation-flow`** (skill ou agent,
dependendo do install target). Descreva o pacote que deseja. O fluxo
faz scaffold com `package:create`, cria agents/flows e metadata, revisa para
prontidão de submissão e executa `package:validate`, `package:build` e
`package:validate-artifacts` ao concluir. Se você sair do fluxo depois da
autoria e revisão, mas antes desses scripts de validação, finalize o
pipeline na próxima seção.

Não edite arquivos em `versions/` manualmente e não crie `detail.json`. O fluxo usa `package:build` para snapshots de versão e detail de pacote gerado. Se o pacote tem `README.md` na raiz, o build copia para o novo snapshot.

Envie commits para a branch do seu fork; o draft pull request atualiza automaticamente.

### Alternativa: criar arquivos você mesmo

Adicione ou atualize `packages/<namespace>/<package-id>/` com agents/flows e
`metadata.json` conforme [registry specs](https://github.com/agents-repo/registry/tree/main/specs).
Nunca crie ou modifique arquivos em `versions/` manualmente e não crie
`detail.json`; `package:build` gera esses artefatos. `README.md` opcional na raiz do pacote
é copiado para o snapshot no build.

Depois execute os comandos da próxima seção.

## 6. Validar localmente

No seu clone local, use o Node/npm fixados em
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` e `npm run env:check`).

Se o fluxo sugerido terminou até a validação de artefatos, confirme o CI no
draft pull request. Se você criou os arquivos manualmente ou o fluxo parou cedo,
execute este pipeline:

```bash
npm run package:validate -- --package <namespace>/<package-id>
npm run package:build -- --package <namespace>/<package-id>
npm run package:validate-artifacts -- --package <namespace>/<package-id> --version <version>
```

## 7. Pronto para revisão e merge

Marque o pull request como **ready for review** somente depois que validação local e CI passarem. Mantenedores fazem squash-merge com **`feat(package): …`** para pacotes ou versões novos, ou **`fix(package): …`** para correções. Títulos classificam a intenção do pacote para histórico e CI; não publicam uma tag de registry do catálogo imediatamente.

### Depois do merge

Merges de pacotes entram em `main` imediatamente. Tags de registry do catálogo para consumidores `v2.x` são publicadas no **trem diário de release do catálogo** (~00:05 UTC) quando `packages/` tem alterações não lançadas. Pacotes novos aparecem em [agents-repo.org](https://agents-repo.org) após a próxima tag de catálogo, a menos que você pré-visualize seu fork via **configurações do site** — veja [Usando o catálogo](/docs/using-the-catalog).

## Manter seu fork atualizado

Enquanto o trabalho estiver em andamento, sincronize periodicamente do upstream:

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

Para correções em entradas existentes do catálogo, use o mesmo modelo fork → pull request upstream. O [template de correção de pacote](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) é opcional, mas recomendado.

## Relacionados

- [Contribuir com pacotes](/docs/contributing-packages) — índice de políticas e specs
- [Como o registry funciona](/docs/how-the-registry-works) — layout do catálogo
