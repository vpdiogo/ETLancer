# ETLancer

A full-stack data extraction service for multiple sources (REST APIs, CSV files, Google Sheets) with pipeline orchestration, built with FastAPI, Next.js, and Prefect.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Backend    │────▶│   PostgreSQL     │
│  (Next.js)   │     │  (FastAPI)   │     │   (Data Store)   │
│  Port 3000   │     │  Port 8000   │     │   Port 5432      │
└──────────────┘     └──────┬───────┘     └──────────────────┘
                            │
                     ┌──────▼───────┐     ┌──────────────────┐
                     │   Prefect    │────▶│  External APIs   │
                     │ Orchestrator │     │  CSV / GSheets   │
                     │  Port 4200   │     └──────────────────┘
                     └──────────────┘
```

## Tech Stack

| Layer           | Technology                                        |
|-----------------|---------------------------------------------------|
| **Backend**     | FastAPI, SQLAlchemy 2.x (async), Pydantic v2      |
| **Frontend**    | Next.js 15, TypeScript, Tailwind CSS, TanStack Query |
| **Database**    | PostgreSQL 13                                     |
| **Orchestration** | Prefect 3                                       |
| **Connectors**  | httpx (REST), pandas (CSV), gspread (Google Sheets) |
| **DevOps**      | Docker, Docker Compose, GitHub Actions             |
| **Package Mgmt** | uv (backend), npm (frontend)                    |

## Features

- **Multi-source connectors**: REST API, CSV (file/URL), Google Sheets
- **Extensible connector system**: Strategy + Registry pattern — add new connectors by creating a single file
- **Pipeline management**: Create, configure, and schedule ETL pipelines via API or UI
- **Transform engine**: Rename columns, filter rows, cast types, drop columns
- **Orchestration**: Prefect-powered scheduling with retries and monitoring
- **Dashboard**: Real-time monitoring of connections, pipelines, and run history
- **Full CRUD API**: RESTful endpoints with automatic Swagger documentation
- **API Key authentication**: Bearer token auth on all API endpoints
- **Credential encryption**: Fernet-encrypted storage for sensitive data
- **Database migrations**: Alembic-managed schema versioning

## Quick Start

```bash
# Clone the repository
git clone https://github.com/vpdiogo/ETLancer.git
cd ETLancer

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build

# Access the services (default API key: dev-api-key-change-me):
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# Prefect:   http://localhost:4200
```

## Project Structure

```
ETLancer/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # REST API endpoints
│   │   ├── connectors/          # Data source connectors (strategy pattern)
│   │   ├── core/                # Config, database setup
│   │   ├── crud/                # Database CRUD operations
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── orchestration/       # Prefect tasks, flows, schedules
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Transform, loader, runner
│   │   └── tests/               # Pytest test suite
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages (App Router)
│   │   ├── components/          # React components
│   │   ├── hooks/               # TanStack Query hooks
│   │   └── lib/                 # API client, types
│   └── Dockerfile
├── docker-compose.yml           # Full stack orchestration
└── .env.example
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `etlancer` |
| `API_KEY` | Bearer token for API auth | `dev-api-key-change-me` |
| `ENCRYPTION_KEY` | Fernet key for credential encryption | (dev key in .env.example) |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_KEY` | API key for frontend | same as `API_KEY` |

## API Endpoints

All endpoints require `Authorization: Bearer <API_KEY>` header (except `GET /`).

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/v1/connections/`            | Create connection        |
| GET    | `/api/v1/connections/`            | List connections         |
| GET    | `/api/v1/connections/{id}`        | Get connection           |
| PUT    | `/api/v1/connections/{id}`        | Update connection        |
| DELETE | `/api/v1/connections/{id}`        | Delete connection        |
| POST   | `/api/v1/connections/{id}/test`   | Test connection          |
| POST   | `/api/v1/pipelines/`             | Create pipeline          |
| GET    | `/api/v1/pipelines/`             | List pipelines           |
| GET    | `/api/v1/pipelines/{id}`         | Get pipeline             |
| PUT    | `/api/v1/pipelines/{id}`         | Update pipeline          |
| DELETE | `/api/v1/pipelines/{id}`         | Delete pipeline          |
| POST   | `/api/v1/pipelines/{id}/run`     | Trigger pipeline run     |
| GET    | `/api/v1/runs/`                  | List runs                |
| GET    | `/api/v1/runs/{id}`              | Get run details          |

## Development

### Backend

```bash
cd backend
uv sync --all-extras
uv run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
uv run pytest
```

## License

MIT
