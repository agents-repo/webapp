# Webapp

Web interface for browsing, searching, and downloading agents and flows from
the registry.

## Purpose

This repository contains the frontend application for the agents registry.
It is a Vite + React + TypeScript project with Bootstrap-based styling and an
AI-first contributor workflow.

## Stack

- React 19
- TypeScript
- Vite
- Bootstrap and React Bootstrap
- ESLint for code linting
- markdownlint for Markdown quality checks

## Getting Started

Use the pinned toolchain where possible:

- Node.js 24.x, with `.nvmrc` pinned to `24.15.0`
- npm 11.x, with `packageManager` pinned to `npm@11.12.1`

Install dependencies and start the app:

```bash
npm install
npm run dev
```

## Common Commands

```bash
npm run env:check
npm run lint:all
npm run typecheck
npm run build
```

## Project Docs

- Development workflow: [docs/development.md](docs/development.md)
- AI collaboration guidance: [docs/ai-collaboration.md](docs/ai-collaboration.md)
- Contributor guide: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
- Copilot project instructions:
  [.github/copilot-instructions.md](.github/copilot-instructions.md)

## Automation

This repo intentionally includes baseline CI and AI-environment workflows, but
does not include release automation yet.
