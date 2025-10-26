# Vaastman Backend — API Documentation

This document describes the API endpoints, request/response formats, authentication, error handling, and examples. Adapt routes and payloads to the actual implementation in the codebase.

Base URL
- Production: https://api.vaastman.com/api/v1
- Development: http://localhost:8080/api/v1

Authentication
- The API uses JWT tokens.
- Access tokens: Bearer tokens sent in `Authorization` header: `Authorization: Bearer <access_token>`
- Refresh tokens: stored client-side (httpOnly cookie or secure storage) and sent to the refresh endpoint to obtain new access tokens.
- Example scopes/roles: `user`, `admin`.

Common headers
- Content-Type: application/json
- Authorization: Bearer <token> (for protected endpoints)

Response envelope
- Success:
```json
{
  "data": { /* resource */ },
  "meta": { /* pagination, tracing info */ }
}
```

- Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive message",
    "details": {...} // optional
  }
}
```

Status codes:
- 200 OK — Successful GET, PUT
- 201 Created — Resource created
- 204 No Content — Successful delete with no body
- 400 Bad Request — Validation or client error
- 401 Unauthorized — Missing or invalid token
- 403 Forbidden — Insufficient permissions
- 404 Not Found — Resource not found
- 500 Internal Server Error — Server error

Pagination
- Query params:
  - page (default 1)
  - limit (default 10)
  - sort (e.g., `-createdAt` for desc)
  - q (search)
- Response meta:
```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 126,
    "pages": 13
  }
}
```

Endpoints
- The following endpoints are a comprehensive, well-structured set typically present in this kind of backend. Update paths/parameters to match your implementation.

1) Health
- Method: GET
- Route: /health
- Description: Basic health check for load balancers and uptime monitoring.
- Authentication: none
- Request: none
- Response (200):
```json
{
  "data": {
    "status": "ok",
    "uptime": 12345,
    "timestamp": "2025-10-26T07:09:40Z"
  }
}
```

2) Auth — Register
- Method: POST
- Route: /auth/register
- Description: Create a new user account.
- Authentication: none
- Request body (application/json):
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "name": "Jane Doe"
}
```
- Response (201 Created):
```json
{
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "Jane Doe",
    "createdAt": "2025-10-26T07:00:00Z"
  }
}
```
- Errors:
  - 400: validation errors (invalid email, weak password)
  - 409: email already in use

3) Auth — Login
- Method: POST
- Route: /auth/login
- Description: Authenticate user and return access & refresh tokens.
- Authentication: none
- Request body:
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```
- Response (200):
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJI...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "refreshToken": "def50200..."
  },
  "meta": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "Jane Doe",
      "roles": ["user"]
    }
  }
}
```
- Notes:
  - Access token TTL configured via env (e.g., 15m).
  - Refresh token TTL long-lived (e.g., 30d) and stored securely.

4) Auth — Refresh Token
- Method: POST
- Route: /auth/refresh
- Description: Exchange refresh token for a new access token.
- Authentication: requires refresh token (cookie or in body)
- Request body (if token in body):
```json
{
  "refreshToken": "def50200..."
}
```
- Response (200):
```json
{
  "data": {
    "accessToken": "newAccessToken...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```
- Errors:
  - 401: invalid / expired refresh token

5) Auth — Logout
- Method: POST
- Route: /auth/logout
- Description: Revoke refresh token and log out user.
- Authentication: refresh token required (or Authorization + server-side session store)
- Request body (optional):
```json
{
  "refreshToken": "def50200..."
}
```
- Response (204 No Content)

6) Users — Get current user
- Method: GET
- Route: /users/me
- Description: Get profile information for the authenticated user.
- Authentication: Bearer token required
- Response (200):
```json
{
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "Jane Doe",
    "roles": ["user"],
    "createdAt": "2025-10-26T07:00:00Z"
  }
}
```

7) Users — Update current user
- Method: PATCH
- Route: /users/me
- Description: Update profile fields for the authenticated user.
- Authentication: Bearer token
- Request body (application/json):
```json
{
  "name": "Jane D.",
  "bio": "Full-stack developer"
}
```
- Response (200):
```json
{
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "Jane D.",
    "bio": "Full-stack developer",
    "updatedAt": "2025-10-26T07:05:00Z"
  }
}
```
- Errors:
  - 400: validation errors
  - 401: not authenticated

8) Users — Admin: List users
- Method: GET
- Route: /users
- Description: List users (admin only).
- Authentication: Bearer token, role `admin`
- Query params: page, limit, q, sort
- Response (200):
```json
{
  "data": [
    { "id": "...", "email": "...", "name": "..." }
  ],
  "meta": { "page": 1, "limit": 10, "total": 42, "pages": 5 }
}
```
- Errors:
  - 403: insufficient permissions

9) Users — Admin: Get user by id
- Method: GET
- Route: /users/:id
- Description: Get a user's profile by id (admin).
- Authentication: Bearer token, role `admin`
- Response (200) / 404

10) Files — Upload
- Method: POST
- Route: /uploads
- Description: Upload files (images, documents). Returns URL(s).
- Authentication: Bearer token (or public for some endpoints)
- Content-Type: multipart/form-data
- Request: form field `file` (or multiple `files`)
- Response (201):
```json
{
  "data": {
    "files": [
      {
        "id": "file_123",
        "url": "https://s3.amazonaws.com/vaastman-uploads/...",
        "filename": "photo.png",
        "size": 12345
      }
    ]
  }
}
```

11) Resource Collection — Example: /items
- Method: GET
- Route: /items
- Description: Retrieve items with pagination and filters.
- Authentication: optional (depends on resource)
- Query params:
  - page, limit, q, category, sort, fromDate, toDate
- Response (200):
```json
{
  "data": [
    { "id": "item1", "title": "Example", "summary": "...", "createdAt": "..." }
  ],
  "meta": { "page": 1, "limit": 10, "total": 120, "pages": 12 }
}
```

- Method: POST
- Route: /items
- Description: Create a new item.
- Authentication: Bearer token
- Request body:
```json
{
  "title": "New Item",
  "description": "Detailed content",
  "tags": ["tag1", "tag2"]
}
```
- Response (201):
```json
{
  "data": {
    "id": "item123",
    "title": "New Item",
    "description": "Detailed content",
    "createdBy": "user_abc123",
    "createdAt": "2025-10-26T07:07:00Z"
  }
}
```

12) Resource single — /items/:id
- Method: GET
- Route: /items/:id
- Description: Get item details.
- Authentication: optional
- Response (200) / 404

- Method: PATCH
- Route: /items/:id
- Description: Update item (owner or admin).
- Authentication: Bearer token
- Request:
```json
{ "title": "Updated title" }
```
- Response (200)

- Method: DELETE
- Route: /items/:id
- Description: Delete item (owner or admin).
- Authentication: Bearer token
- Response (204 No Content)

13) Admin / Management endpoints
- Examples: /admin/metrics, /admin/jobs, /admin/users/:id/impersonate
- Authentication: Bearer token with admin role

Error details and validation
- Use consistent validation (e.g., Joi or Zod)
- Return field-level validation errors as:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

Security recommendations
- Always validate and sanitize inputs.
- Use HTTPS in production.
- Use short-lived access tokens and rotate refresh tokens.
- Protect refresh token endpoints and store refresh tokens in a secure store (DB/Redis).
- Rate-limit auth endpoints to mitigate brute force.
- Use CORS and CSP according to your frontend needs.

Rate limiting & caching
- Consider rate limiting via middleware for sensitive endpoints (login, register).
- Use HTTP caching headers where appropriate for public resources.

Examples

- Login (curl)
```bash
curl -X POST https://api.vaastman.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"P@ssw0rd!"}'
```

- Get items with pagination (curl)
```bash
curl "https://api.vaastman.com/items?page=2&limit=20&sort=-createdAt&q=searchTerm"
```

- Get profile (curl)
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  https://api.vaastman.com/users/me
```

SDK & OpenAPI
- It's recommended to provide an OpenAPI (Swagger) specification (`openapi.yaml` or `openapi.json`) in the repo so clients can generate SDKs and interactive docs.
- Example minimal OpenAPI tip:
  - Document `components/securitySchemes` to describe the Bearer token schema.
  - Tag endpoints and provide examples under `responses`.

Change log & versioning
- Use semantic versioning for API releases (v1, v2).
- Support backward compatibility when possible; use header-based or URL-based versioning like `/v1/items`.

Contact & Support
- For issues with the API, open an issue in the repository or contact the maintainer: @devashishkr3

---

This is a comprehensive template — please update route names, request/response fields, and authentication details to match your implementation. If you provide the repository source or the OpenAPI spec, I can generate exact documentation and examples that match the code.