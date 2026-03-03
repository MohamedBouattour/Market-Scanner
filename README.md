# Market Scanner

An Nx monorepo with a **NestJS** backend and **React + Vite** frontend for real-time market data scanning.

## Structure

```
market-scanner/
  apps/
    api/          # NestJS backend
    web/          # React frontend (Vite)
  libs/
    shared-types/ # DTOs shared between api & web
  package.json
  tsconfig.base.json
  nx.json
```

## Setup

```bash
npm install
cp .env.example .env
# Fill in TWELVE_DATA_API_KEY in .env
```

## Run

```bash
# Start backend (port 3000)
npm run start:api

# Start frontend (port 4200)
npm run start:web
```

## API Endpoints

| Method | Path             | Query Params                 | Description      |
| ------ | ---------------- | ---------------------------- | ---------------- |
| GET    | `/market/quotes` | `symbols=CAPG:XPAR,SOP:XPAR` | Get batch quotes |
| GET    | `/market/quote`  | `symbol=CAPG:XPAR`           | Get single quote |

## Environment Variables

| Variable              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `TWELVE_DATA_API_KEY` | Your [Twelve Data](https://twelvedata.com) API key |
| `PORT`                | Backend port (default: 3000)                       |
