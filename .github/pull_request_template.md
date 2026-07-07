# Pull Request

## Summary

Describe the change and why it is needed.

## Related Issues

Closes #

For standard tasks, use `Closes #<issue-number>`. For security vulnerabilities
without a public tracking issue, reference the advisory identifier (for example
`GHSA-...`) and coordinate linkage with maintainers per
`.github/CONTRIBUTING.md` **Workflow exceptions**.

Every PR targeting `main` must include a tracking reference.

## Change Type

- [ ] Spec change
- [ ] Feature proposal
- [ ] Bug or inconsistency
- [ ] Task or chore

## Scope

List affected paths or areas:

- [ ] Root config files
- [ ] `src/`
- [ ] `public/`
- [ ] `docs/`
- [ ] `.github/`
- [ ] `.vscode/`

## Validation Checklist

- [ ] `npm run env:check`
- [ ] `npm run lint:all`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] A tracking issue was opened before implementation.
- [ ] The branch name follows `<prefix>/<issue-number>-<slug>`.
- [ ] This pull request was created as a draft (`gh pr create --draft` or UI
  draft option).
- [ ] This draft PR was opened before implementation commits (or it documents
  why not).
- [ ] `## Related Issues` includes a tracking reference (`Closes #<issue-number>`
  or a security-advisory identifier per `.github/CONTRIBUTING.md`).
- [ ] Docs were updated where behavior or workflow changed.
- [ ] This PR follows the repository contributor guidance.
- [ ] Merge to `main` is for human maintainers only; agents and automation
  must not merge this PR or push directly to `main`.
- [ ] A human developer marked this PR ready for review after validation (not
  agents or automation).

## Risk and Rollback

- Risk level: low / medium / high
- Rollback plan:

## Related Context

Include issue links, related tasks, or follow-up notes.
