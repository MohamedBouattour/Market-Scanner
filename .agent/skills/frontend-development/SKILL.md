---
name: frontend-development
description: Guidelines for React and Vite based frontend development for Market-Scanner.
---

# Frontend Development Skill

This skill provides directions for developing the React frontend using Vite in this NX monorepo.

## Technology Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Styling**: Vanilla CSS (global `styles.css`)
- **API Communication**: `axios` to `/api` (Proxied in Vite)

## Key Components

- **Main Entry**: `apps/web/src/main.tsx`
- **Main App Container**: `apps/web/src/App.tsx`
- **Hooks**: `apps/web/src/hooks/useMarketData.ts` (Example for data fetching)

## Development Workflow

- **Adding new Components**: Place them in `apps/web/src/components/` after creating the directory.
- **Styling Guidelines**:
  - Prefer using existing CSS classes from `styles.css`.
  - For new styles, create localized `.module.css` files if needed or append to `styles.css`.
  - Maintain the dark theme aesthetic (#0f1117 background).
- **Responsive Design**: Ensure tables and containers scale down for smaller screens.
- **Error Handling**: Always provide visual feedback for failed API calls or empty states.
