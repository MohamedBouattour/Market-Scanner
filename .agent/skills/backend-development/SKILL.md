---
name: backend-development
description: Guidelines for NestJS based backend development for Market-Scanner.
---

# Backend Development Skill

This skill outlines backend development practices for the Market-Scanner project, which uses NestJS.

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **API Service**: twelve-data (Requires `TWELVE_DATA_API_KEY` in `.env`)
- **HTTP Client**: `axios`
- **Output Port**: 3000

## Core Logic (Market Module)

- **Controller**: `apps/api/src/market/market.controller.ts`
- **Service**: `apps/api/src/market/market.service.ts`
- **Module**: `apps/api/src/market/market.module.ts`

## API Endpoints

- `GET /market/quotes?symbols=...`
- `GET /market/quote?symbol=...`

## Development Workflow

- When adding new functionality, follow the **Module-Controller-Service** pattern.
- Ensure all API response types are defined in `libs/shared-types`.
- Use `ConfigService` for managing environment variables.
- Add comprehensive error handling for Third-Party API failures (Twelve Data).
