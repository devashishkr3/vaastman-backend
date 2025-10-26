# Vaastman Backend

A professional, production-ready Node.js backend for Vaastman. This repository contains the API server, configuration, and tooling to run and deploy Vaastman’s backend services.

Note: I couldn't access the repository source files from here, so the README below is a complete, practical template tailored for typical Node/Express + JWT backends. Please adapt any routes, env variables, and instructions to match the actual implementation in this repository.

## Table of contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
  - [Setup](#setup)
  - [Environment variables](#environment-variables)
  - [Run locally](#run-locally)
  - [Running tests](#running-tests)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Logging & Monitoring](#logging--monitoring)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview

Vaastman Backend provides the REST API powering vaastman.com (API base: `https://api.vaastman.com`). It is designed as a modular, secure, and scalable backend service exposing authentication, user management, and domain-specific endpoints.

## Features

- JWT-based authentication (access + refresh tokens)
- Role-based authorization (user / admin)
- RESTful resource endpoints with pagination and filtering
- File upload support (multipart/form-data)
- Input validation and centralized error handling
- Logging and request tracing hooks
- Test suite and linting configuration

## Tech Stack

- Node.js (v16+ recommended)
- Express (or similar)
- Database: PostgreSQL / MongoDB (configure via environment variable)
- ORM / ODM: Prisma / Sequelize / Mongoose (project-dependent)
- JWT for authentication
- Testing: Jest / Supertest
- Linting: ESLint, Prettier

## Repository Structure

This is a typical structure — adapt to actual repo layout:

- src/
  - controllers/       # Route handlers
  - routes/            # Express route definitions
  - services/          # Business logic, DB calls
  - models/            # DB models / schemas
  - middlewares/       # Authentication, validation, error handling
  - utils/             # Helpers, logger, email, file upload
  - config/            # Configuration and env loading
  - app.js / server.js # App bootstrap and server start
- tests/               # Unit & integration tests
- scripts/             # Helper scripts
- .env.example         # Example environment variables
- package.json

## Prerequisites

- Node.js 16+ (LTS)
- npm or yarn
- Database server (Postgres or MongoDB)
- Optional: Redis for session/refresh token store, SMTP for emails, S3 for uploads

## Getting started

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/devashishkr3/vaastman-backend.git
   cd vaastman-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create an `.env` file. Copy the example:
   ```bash
   cp .env.example .env
   ```

### Environment variables

A typical `.env` (update values as required):

```
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vaastman_db
# or for Mongo:
# MONGO_URI=mongodb://user:password@localhost:27017/vaastman

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d

# Optional services
REDIS_URL=redis://localhost:6379
S3_BUCKET_NAME=vaastman-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# Optional
SENTRY_DSN=
```

### Run locally

Development:
```bash
npm run dev
# or
yarn dev
```

Production:
```bash
npm run build
npm start
```

### Running tests

```bash
npm test
# or
yarn test
```

Use integration tests with a test database or mock DB.

## API Documentation

Full API documentation is included in API_DOCUMENTATION.md in this repository. It contains endpoints, request/response examples, authentication rules, error formats, and pagination details.

(If you maintain an OpenAPI/Swagger spec, add it to this repo and link it from here.)

## Deployment

Common deployment guidelines:

- Use environment variables (never commit secrets)
- Use a process manager (PM2) or containerization (Docker)
- Run migrations before starting the service
- Use a load balancer and run multiple instances
- Keep database connection pools configured for production
- Use HTTPS and configure TLS termination at a gateway (Cloudflare, ALB, etc.)

Example Dockerfile (very basic):

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY . .
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
```

CI/CD: set up tests, linting, build artifacts, and deployment pipelines (GitHub Actions, GitLab CI, etc.).

## Logging & Monitoring

- Structured logs (JSON) for production
- Integrate Sentry or equivalent for error monitoring
- Use Prometheus / Grafana for metrics
- Configure alerts for high error rates and latency spikes

## Contributing

- Fork the repository
- Create a feature branch: `git checkout -b feat/your-feature`
- Write tests for new features or bug fixes
- Run lint and tests before opening a PR
- Keep commits small and focused
- Follow commit message conventions (Conventional Commits suggested)

## License

Add your license here (e.g., MIT). If the repository contains a LICENSE file, reference it.

## Contact

Repository owner: @devashishkr3
Project homepage: https://api.vaastman.com
