---
name: data-modeling
description: Guidelines for managing shared types and DTOs in Market-Scanner.
---

# Data Modeling Skill

This skill outlines how to manage and synchronize types between the NestJS backend and React frontend using the `shared-types` library.

## Directory Structure

- **Library Root**: `libs/shared-types/`
- **Type Definitions**: `libs/shared-types/src/lib/`
- **Main Export**: `libs/shared-types/src/index.ts`

## Creating New Types

- All DTOs and interfaces used by both `api` and `web` projects **MUST** reside in `libs/shared-types`.
- Use the following command to generate new library files:
  `npx nx g @nx/js:library --name=my-new-dto --directory=libs/`
- Ensure the types are exported in `index.ts`.

## Consuming Types

### In NestJS (`apps/api/`)

```typescript
import { MyDto } from "@market-scanner/shared-types";
```

### In React (`apps/web/`)

```typescript
import { MyDto } from "@market-scanner/shared-types";
```

## Best Practices

- Use `interface` for data transfer objects.
- Prefer explicit typing (avoid `any`).
- Add comments explaining what each field represents for better IDE intellisense.
- Ensure timestamps are standardized (ISO 8601).
