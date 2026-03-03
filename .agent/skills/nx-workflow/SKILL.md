---
name: nx-workflow
description: Working with Nx Monorepo tasks for Market Scanner project.
---

# Nx Workflow Skill

This skill provides guidelines and commands for interacting with the Nx workspace used in this project.

## Core Commands

- **Serve API**: `npm run start:api` (Backend on port 3000)
- **Serve Web**: `npm run start:web` (Frontend on port 4200)
- **Build All**: `npx nx run-many --target=build --all`
- **Lint All**: `npx nx run-many --target=lint --all`
- **Test All**: `npx nx run-many --target=test --all`

## Generating New Components/Libraries

- **Add a new library**: `npx nx g @nx/js:library --name=my-lib --directory=libs/`
- **Add a React component to Web**: `npx nx g @nx/react:component --name=MyComponent --project=web`
- **Add a NestJS service to API**: `npx nx g @nx/nest:service --name=MyService --project=api --directory=app`

## Code Standards

- All shared types should go into `libs/shared-types`.
- Use `axios` for HTTP requests.
- Follow NestJS module-service-controller pattern for backend.
