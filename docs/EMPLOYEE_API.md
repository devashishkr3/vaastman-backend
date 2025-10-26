# Vaastman Backend — Employee Module API Documentation

I reviewed the Employee-related code in the repository (router, controller, and validation schema) and produced this complete, professional API reference for the Employee module. The documentation reflects the current implementation (including a few minor mismatches between router and controller) and provides clear examples, parameter tables, responses, and security notes.

What I did: I inspected
- src/routers/employeeRoute.js
- src/controllers/employeeController.js
- src/validators/employeeValidation.js

I documented every route referenced by the router and all validation schemas related to employees. Where an endpoint or behavior is defined in the controller but not wired in the router (or vice-versa), I explicitly note that and provide recommended/expected behavior.

---

Base URL (server)
- Production: https://api.vaastman.com
- Development: http://localhost:8080 (default port from src/index.js)
- API prefix: /api/v1
- Employee router mount: /api/v1/employee

Therefore the full route paths shown below are prefixed with `/api/v1`.

Summary — Module overview
- Purpose: The Employee module provides endpoints intended for employees of Vaastman Solutions. It currently exposes an employee dashboard endpoint and validation schemas that are used elsewhere for employee creation and updates (admin-managed). Typical responsibilities:
  - Employee-facing dashboard and actions (intended)
  - Employee profile management (validator schemas exist)
  - Authentication and role-based access control is enforced via middleware (protect + restrictTo("EMPLOYEE")).

Routes implemented/mentioned
- GET /employee/dashboard
  - Controller method: employeeController.dashboard
  - Router: employeeRoute.js (controller exported, route currently commented in router)
- Note: The router applies protection at the router level:
  - router.use("/", protect, restrictTo("EMPLOYEE"));
  - This means all employee routes should require authenticated users with role EMPLOYEE.

Files reviewed
- src/routers/employeeRoute.js
- src/controllers/employeeController.js
- src/validators/employeeValidation.js

Important implementation note (observed)
- The router currently contains no active route handlers except for the middleware application. The example dashboard route is commented out. The controller contains a `dashboard` handler that returns `res.send("Dashboard")`, but the router does not wire it up. I document the intended GET /employee/dashboard endpoint below and call out the mismatch.

---

Authentication & authorization (applies to all Employee routes)
- Authentication: JWT access token (issued by Auth module)
- Authorization: role-based — restrictTo("EMPLOYEE") is used at router level; endpoints require role EMPLOYEE
- Header example:
  - Authorization: Bearer <access_token>
- Token format: standard JWT (three-part base64 segments). Use secure storage / short-lived access tokens + refresh tokens per Auth module design.

Common response envelope (used elsewhere in codebase)
- Success:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { /* resource or array */ }
}
```
- Error: AppError or global handler returns:
```json
{
  "success": false,
  "message": "Error message"
}
```

---

Endpoints

Note: Each endpoint shows the "implemented behavior" (what the controller currently does) and the "recommended/expected behavior" (a more API-friendly form) when the controller currently returns a bare or minimal response.

## GET /employee/dashboard

- Full path (server): GET /api/v1/employee/dashboard
- Router code location: src/routers/employeeRoute.js (intended but currently commented)
- Controller: src/controllers/employeeController.js -> exports.dashboard
- Description: Returns employee-specific dashboard data (intended). The controller currently returns a simple text response.

Authentication
- Required: Yes
- Mechanism: protect middleware + restrictTo("EMPLOYEE") applied at router level
- Header example:
  - Authorization: Bearer <ACCESS_TOKEN>

Path / Query / Body
- None.

Implemented behavior (current code)
- Controller implementation:
```js
exports.dashboard = async (req, res, next) => {
  res.send("Dashboard");
};
```
- Actual response: 200 OK with plain text body "Dashboard"

Recommended success response (example — more useful JSON)
- Status: 200 OK
- Body:
```json
{
  "success": true,
  "message": "Employee dashboard fetched successfully",
  "data": {
    "upcomingTasks": 3,
    "pendingApprovals": 1,
    "recentCertificates": [
      {
        "id": "uuid",
        "certNumber": "CERT-2025-0001",
        "issuedAt": "2025-10-01T00:00:00.000Z"
      }
    ]
  }
}
```

Response field descriptions (recommended)
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Indicates request success |
| message | string | Human readable message |
| data | object | Dashboard payload (custom per product) |

Possible error responses
- 401 Unauthorized — token missing or invalid (if protect middleware active)
- 403 Forbidden — role is not EMPLOYEE (if restrictTo is active and user not an employee)
- 500 Internal Server Error — unexpected errors

Notes
- Action required: The router currently doesn't register the `GET /dashboard` endpoint (the line is commented). To activate the endpoint, add the route in src/routers/employeeRoute.js:
```js
router.get("/dashboard", employeeController.dashboard);
```
- Consider returning a JSON payload as shown in "Recommended success response" rather than plain text. Use `req.user` (set by protect middleware) to scope the dashboard to the authenticated employee.

---

Validation schemas (src/validators/employeeValidation.js)

Although the employee router currently contains only the dashboard endpoint, the repository includes Joi validation schemas used for employee creation and updates (these are used by admin routes — documented here for completeness and for any future employee self-service endpoints).

1) createEmployeeSchema
- Purpose: Validate body when creating an employee (admin creates).
- Schema fields:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | min 3, max 50 |
| email | string | Yes | must be a valid email |
| password | string | Yes | min 6, max 50 |
| mobile | string | No | 10-digit number if provided; optional & allow null/"" |

Example request body (create employee)
```json
{
  "name": "Alice Employee",
  "email": "alice@example.com",
  "password": "StrongPass123",
  "mobile": "9876543210"
}
```

Validation error examples (from Joi messages)
- "Name is required" — if name missing or empty
- "Please provide a valid email" — invalid email
- "Password must be at least 6 characters long" — too short password
- "Mobile number must be 10 digits" — invalid mobile

2) updateEmployeeSchema
- Purpose: Validate fields when updating an employee.
- Schema fields (all optional):
  - name (string, min 3, max 50)
  - email (string, must be valid email)
  - mobile (string, 10 digits or null/"")

Example request body (update employee)
```json
{
  "name": "Alice Updated",
  "email": "alice.updated@example.com",
  "mobile": "9123456789"
}
```

3) employeeIdParamSchema
- Purpose: Validate `:id` path parameter for employee endpoints.
- Param: id — required, must be uuid v4

Example params (URL)
- GET /employee/4a2f3b2c-1111-2222-3333-abcdef123456

---

Potential employee endpoints (recommended) — derived from validation schemas and admin routes

The repository currently exposes admin-managed employee endpoints under /admin. For employee self-service, the following routes are natural extensions (not implemented in employeeRoute.js yet). These are suggestions for future implementation and documented here for completeness.

1. GET /employee/me — Get current employee profile
2. PATCH /employee/me — Update current employee profile (uses updateEmployeeSchema)
3. PUT /employee/me/password — Change password (requires oldPassword + newPassword)
4. GET /employee/dashboard — (already in controller) — Dashboard

Example: PATCH /employee/me
- Request body (validation similar to updateEmployeeSchema)
```json
{
  "name": "Alice Employee",
  "mobile": "9876543210"
}
```
- Authentication: Bearer token (EMPLOYEE)
- Success:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "Alice Employee",
    "email": "alice@example.com",
    "mobile": "9876543210",
    "updatedAt": "2025-10-25T09:00:00.000Z"
  }
}
```

---

Errors and status conventions (observations & recommendations)
- The project uses AppError and middleware to standardize errors. Use 401 for missing/invalid auth, 403 for insufficient role, 400 for validation errors, 404 for not found, and 500 for server errors.
- The employee router already applies protect + restrictTo("EMPLOYEE") at router level; ensure these middlewares are enabled in production (they currently are active in employeeRoute.js).
- Ensure any profile/employee endpoints never return the password hash. Admin controllers create users and must sanitize responses (do not include `password` field).

---

Examples — curl & usage

1) Example: Get dashboard (after wiring route)
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  https://api.vaastman.com/api/v1/employee/dashboard
```

2) Example: Update profile (suggested endpoint)
```bash
curl -X PATCH https://api.vaastman.com/api/v1/employee/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "name": "Alice Employee",
    "mobile": "9876543210"
  }'
```

---
