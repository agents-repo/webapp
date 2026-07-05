# Pull Request

## Summary

Describe the change and why it is needed.

## Related Issues

Include `Closes #<issue-number>` for the issue this PR closes.
Every PR targeting `main` must close a tracking issue.

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
- [ ] This draft PR was opened before implementation commits (or documents
  why not).
- [ ] `Related Issues` includes `Closes #<issue-number>` for the issue this PR closes.
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
