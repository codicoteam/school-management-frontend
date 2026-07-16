# School Management App v2

A React + TypeScript front-end with admin, student, parent, and teacher portals. This repository also includes a small backend server folder for database migrations and local API helpers.

## Project Overview

- Frontend built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui.
- Authentication using Firebase.
- Local backend scripts and SQLite support in `server/`.
- Admin and portal dashboards for parents, teachers, students, and administrators.

## Swagger / OpenAPI Documentation

- This repository does not currently include a generated Swagger/OpenAPI specification file.
- If you want Swagger docs in this project, add an OpenAPI spec file such as `openapi.yaml` or `swagger.yaml` at the repository root or in the `server/` directory.
- For a Node/Express backend, a common setup is:
  - `swagger-jsdoc` to generate OpenAPI schemas from JSDoc comments
  - `swagger-ui-express` to serve the Swagger UI
- Example Swagger route setup:

```js
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
    },
  },
  apis: ['./server/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## How to Add Swagger Docs

1. Create `server/openapi.yaml` or `openapi.yaml`.
2. Define your API endpoints, request/response schemas, and security rules.
3. Optionally wire Swagger UI into the backend server.
4. Document the final docs link in this README.

## Environment Setup

For the backend, copy the example environment file and fill in your own values:

```bash
cp server/.env.example server/.env
```

Use the following values:

- `PORT`: usually `3001`
- `JWT_SECRET`: a strong random secret string
- `DB_HOST`: use `localhost` for local development, or the shared/staging database host for integration testing
- `DB_PORT`: usually `5432`
- `DB_USER`: your PostgreSQL username
- `DB_PASSWORD`: your PostgreSQL password
- `DB_NAME`: usually `school_management`

Do not commit your real `.env` file. Keep it local to each machine or deployment environment.

## Notes

- Since this repo currently has only a placeholder README, this section is intentionally explicit about Swagger availability.
- If you want, I can also add a starter OpenAPI spec file for the existing backend routes.
