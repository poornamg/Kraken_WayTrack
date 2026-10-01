# WayLink Backend

This is the backend API for the WayLink platform. It uses Fastify 5, Mongoose 8, and MongoDB.

## Architecture

The backend follows a domain-driven structure under `src/modules/`:
- **Auth**: User authentication and AuthHandoff logic
- **Orders**: Native order lifecycle
- **Planning**: Dispatcher trip creation and planning
- **Loading**: Load jobs and scanning
- **Driver**: Driver route execution
- **Operations**: Store manager deliveries and receipts
- **Files**: Signature / file handling
- **Reference**: Reference data (outlets, vehicles, drivers, catalog)
- **Unified Orders**: Integration points for Unified Orders (e.g., from an external system)

Shared logic, constants, and utilities are located under `src/common/`.
Mongoose schemas and models remain in `src/models/`.

## Running the Application

Using Docker Compose (recommended):
\`\`\`bash
docker compose up -d api
\`\`\`

## Testing

A comprehensive contract test suite ensures the API shape remains stable:
\`\`\`bash
npm run test:contract
\`\`\`
*(Note: Requires the database to be seeded properly, which the test suite handles locally if using Docker, or run `docker compose up seed`)*

## Documentation
- **BACKEND_REFACTOR_REPORT.md**: Outlines the recent refactoring into a domain-based structure.
- **OpenAPI / Swagger**: The live API docs are available at `GET /docs/openapi.json`.
