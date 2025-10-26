# Vaastman Backend — Auth Module API Documentation

I examined the Auth-related files in this repository (auth controller, route, and Joi validation) and produced this complete, professional reference for all Auth endpoints implemented under /auth. The documentation describes the implemented behavior (what the code currently does), expected request/response shapes, validation rules (from Joi schemas), and important implementation notes (including non-blocking bugs and recommended improvements). Use this as the authoritative API reference for clients and as a checklist for improving the implementation.

Contents
- General overview
- Routes summary
- Endpoint reference (each route with details, request/response examples, errors)
- Common headers & auth rules
- Token lifetime & security notes
- Implementation caveats & recommended fixes
- Example curl snippets

---

## General overview

The Auth module implements user authentication flows for the Vaastman backend:

- Register (signup) new users
- Login to obtain access and refresh tokens
- Refresh an access token using a refresh token
- Logout (blacklist a refresh token)

Authentication is JWT-based. Access tokens are used for API authorization while refresh tokens are used to obtain new access tokens and are stored/blacklisted in the database.

Routes (all prefixed with /api/v1 in main router)
- POST /auth/register
- POST /auth/login
- POST /auth/refresh-token
- POST /auth/logout

---

## Common headers, response envelope & error format

- Content-Type: application/json (for JSON requests)
- Authorization: Bearer <token> for endpoints that require a token (refresh and logout expect a refresh token in the Authorization header)

Success responses (typical envelope used by controller):
```json
{
  "success": true,
  "message": "A human readable message",
  "data": { /* resource or object */ }
}
```

Error responses (AppError / global handlers return):
- JSON with `success: false` or using the global error handler may return:
```json
{
  "success": false,
  "message": "Error message"
}
```
or, in development mode, additional details and stack trace may be present.

HTTP status codes used in the module:
- 201 Created — for successful registration
- 200 OK — for successful login, refresh, logout
- 400 Bad Request — validation or missing/invalid headers/token
- 401 Unauthorized — (middleware elsewhere uses this; controllers sometimes use 400 for missing auth header)
- 403 Forbidden — not used here but possible elsewhere
- 404 Not Found / 500 Internal Server Error — for other errors

---

## Validation rules (from src/validators/authVaidation.js)

<!-- Register payload (registerUserSchema):
- name: string, min 3, max 50, required
- email: string, email format, required
- password: string, min 6, max 50, required
- mobile: optional, 10 digit numeric string
- role: optional, must be one of "ADMIN" or "EMPLOYEE" -->

Login payload (loginUserSchema):
- email: string, email format, required
- password: string, required

Refresh / Logout header validation schemas:
- Expects `authorization` string matching regex: `^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$` — i.e., a Bearer token with JWT-like structure.

<!-- Important: the controller currently expects an additional field `securedPass` in the registration body. This field is not present in the register Joi schema — see "Implementation caveats" below. -->

---

# Endpoints

Note: All paths below are defined in the repository's router as `/auth/<path>`. In the server this router is mounted at `/api/v1`, so the full path seen by clients is `/api/v1/auth/<path>`.

---

<!-- ## POST /auth/register

- Full route (server): POST /api/v1/auth/register
- Code route: router.post("/register", ...)
- Description: Create a new user account.
- Authentication: none (public) — but the controller requires a "securedPass" secret value in the body (see notes).
- Validation: `registerUserSchema` is applied (name, email, password, optional mobile, optional role).

Request body (fields, types & requirements)

| Field        | Type   | Required | Notes |
|--------------|--------|----------|-------|
| name         | string | Yes      | min 3, max 50 (Joi) |
| email        | string | Yes      | valid email |
| password     | string | Yes      | min 6, max 50 |
| mobile       | string | No       | Must be 10 digits if provided |
| role         | string | No       | "ADMIN" or "EMPLOYEE" (defaults to EMPLOYEE) |
| securedPass* | string | Yes (controller) | Controller enforces this. Must match process.env.SECURED_PASSWORD |

*securedPass is currently required by the controller implementation but missing from the Joi schema. See "Implementation caveats".

Example request body:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "P@ssw0rd!",
  "mobile": "9876543210",
  "role": "EMPLOYEE",
  "securedPass": "my-super-secret"
}
```

Success response (actual implementation)
- Status: 201 Created
- Body:
```json
{
  "success": true,
  "message": "User Registered Successfully"
}
```
Notes:
- The controller intentionally does not return the created user object in the response body (the commented `// data: user` indicates it was considered). Consider returning an ID and non-sensitive fields in a future revision.

Error responses (examples)
- 400 Bad Request — "Secured Password is required"
- 400 Bad Request — "Invalid Secured Password"
- 400 Bad Request — "user already exist, please login" (when email already exists; thrown by controller)
- 400 Validation errors from Joi — e.g., "Name is required", "Please provide a valid email", etc.

Notes & recommendations
- The controller requires `securedPass` but the Joi schema does not validate it. Add `securedPass` to the Joi schema or remove the controller check.
- Passwords are hashed (bcrypt) before storage — good.
- Do not return password or other sensitive fields in responses.
- Consider returning a minimal user DTO (id, name, email, role) on success. -->

---

## POST /auth/login

- Full route (server): POST /api/v1/auth/login
- Code route: router.post("/login", ...)
- Description: Authenticate a user using email + password and return access and refresh tokens.
- Authentication: none (public)
- Validation: `loginUserSchema` is applied (email and password required).

Request body

| Field    | Type   | Required | Notes |
|----------|--------|----------|-------|
| email    | string | Yes      | Must be a valid email |
| password | string | Yes      | Plain text password |

Example request body:
```json
{
  "email": "jane.doe@example.com",
  "password": "P@ssw0rd!"
}
```

Success response (actual implementation)
- Status: 200 OK
- Body (as returned by current controller):
```json
{
  "success": true,
  "message": "Login Successfull",
  "data": {
    /* full existUser object from database is spread here */
  },
  "resreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Important implementation notes (observed issues)
- The controller returns the entire `existUser` object in `data` via `{ ...existUser }`. That object includes `password` (hashed). Returning the password hash to clients is a **security issue** — do not return the `password` field. Ideally return a sanitized user DTO: { id, name, email, role, mobile, isActive, createdAt }.
- The response property for the refresh token is misspelled as `resreshToken` in the code. Clients may be surprised by the typo. Recommend renaming to `refreshToken`.
- Tokens: `accessToken` and `refreshToken` are both returned in the JSON body. Consider returning the refresh token as an httpOnly secure cookie for better security.

Error responses (examples)
- 400 Bad Request — "Your are not registered with us." (user not found)
- 400 Bad Request — "Invalid Password" (wrong password)
- 500 Internal Server Error — other errors

Notes
- Access token TTL: 30 minutes (see src/utils/jwt.js).
- Refresh token TTL: 3 days (see src/utils/jwt.js).
- Tokens are generated with secrets in environment variables JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.

Recommended response (suggestion)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "EMPLOYEE",
      "mobile": "9876543210",
      "isActive": true,
      "createdAt": "2025-10-26T07:00:00Z"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

## POST /auth/refresh-token

- Full route (server): POST /api/v1/auth/refresh-token
- Code route: router.post("/refresh-token", authController.refreshToken)
- Description: Exchange a refresh token for a new access token.
- Authentication: yes — expects the refresh token sent in the `Authorization` header as `Bearer <refreshToken>`.
- Validation: A Joi schema (`refreshTokenSchema`) exists which requires an `authorization` header matching the JWT pattern.

Headers
| Header | Required | Pattern / Notes |
|--------|----------|-----------------|
| Authorization | Yes | `Bearer <refreshToken>` — token should match regex in validation schema |

Example request (curl style)
```
POST /api/v1/auth/refresh-token
Authorization: Bearer <refresh-token>
```

Example request (no JSON body required)

Success response (actual implementation)
- Status: 200 OK
- Body:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Behavior details
- The controller extracts the refresh token from the Authorization header.
- It checks the `blacklistedToken` table (Prisma model `blacklistedToken`) for an existing blocklisted token; if found, it rejects the refresh.
- The token is verified via `verifyRefreshToken` (uses JWT_REFRESH_SECRET).
- On success, a new access token is generated with `generateAccessToken` (expires in 30m per current utils).

Error responses (examples)
- 400 Bad Request — "AuthHeader is required" (controller checks and uses 400 for missing/invalid header)
- 400 Bad Request — "Refresh Token is required"
- 400 Bad Request — "Refresh token is already blocklisted"
- 401 Unauthorized — if token verification fails (thrown from jwt.verify) — global error handler may convert to 500/401 depending on environment and error type
- 500 Internal Server Error — on unexpected errors

Notes & recommendations
- The endpoint expects the refresh token in the Authorization header (instead of the body or cookie). Either approach is valid but document clearly for clients. Using an httpOnly cookie for the refresh token is recommended to mitigate XSS.
- Blacklisting prevents reuse after logout. Consider rotating refresh tokens and storing token identifiers (jti) so you can efficiently revoke/rotate without storing full token string.

---

## POST /auth/logout

- Full route (server): POST /api/v1/auth/logout
- Code route: router.post("/logout", authController.logout)
- Description: Blacklist a refresh token (log out) so it can no longer be used to obtain access tokens.
- Authentication: yes — expects the refresh token sent in the `Authorization` header as `Bearer <refreshToken>`.
- Validation: Joi schema (`logoutSchema`) expects an `authorization` header with a JWT-like token.

Request
- Authorization header: `Bearer <refreshToken>`

Example request:
```
POST /api/v1/auth/logout
Authorization: Bearer <refresh-token>
```

Success responses (actual implementation)
- If token was not previously blacklisted:
  - Status 200 OK
  - Body:
  ```json
  {
    "success": true,
    "message": "Logout Successfull"
  }
  ```
- If token was previously blacklisted:
  - Status 200 OK
  - Body:
  ```json
  {
    "success": true,
    "message": "You are already Logged out"
  }
  ```

Behavior details
- The controller checks the `blacklistedToken` table for the token; if exists it returns a message that user is already logged out.
- If not found, it creates a `blacklistedToken` record with the token string and returns success.

Error responses
- 400 Bad Request — "AuthHeader is required" (if Authorization header missing)
- 400 Bad Request — "Refresh Token is required"
- 500 Internal Server Error — other errors when accessing DB

Notes
- The token is simply stored in the `blacklistedToken` model in the database (schema.prisma shows model `blacklistedToken` with unique `token`).
- Consider storing token metadata (expiry) to prune blacklisted tokens when they naturally expire.

---

# Token lifetimes (from src/utils/jwt.js)

- Refresh token: expiresIn "3d" (3 days)
- Access token: expiresIn "30m" (30 minutes)

These are the current values used in the repository. They are configurable by changing the code or switching to environment-based TTLs.

---

# Security & implementation caveats (observations from code)

1. securedPass inconsistency
   - The register controller requires `securedPass` in request body and checks it against `process.env.SECURED_PASSWORD`. However, `securedPass` is not included in the Joi `registerUserSchema`. This causes the request to pass Joi validation but fail in the controller (400 "Secured Password is required").
   - Recommendation: Add `securedPass` to the Joi schema or change controller to use a different protection approach (e.g., invite tokens or admin-only registration).

2. Returning user object on login
   - The login controller spreads `existUser` into the `data` response. `existUser` includes the `password` hashed field. This leaks password hashes to client responses which is a security risk.
   - Recommendation: Sanitize the user object before returning (exclude `password`) or return a specific DTO.

3. Typo in response key
   - The login controller returns `resreshToken` (misspelled). Rename to `refreshToken` to avoid client confusion.

4. Refresh and Logout header handling
   - Both endpoints expect the refresh token in `Authorization: Bearer <token>`. This is acceptable but many systems store refresh tokens in httpOnly cookies. Document clearly and consider cookie-based refresh tokens.

5. Error status codes
   - In some controller flows missing authorization header returns 400 (Bad Request). The protect middleware (used elsewhere) uses 401 Unauthorized for authorization errors. Consider standardizing to 401 for missing/invalid credentials.

6. Blacklist storage
   - The system stores full refresh token strings in `blacklistedToken`. Consider storing a hashed token or token `jti` to avoid storing tokens in plaintext and to enable efficient revocation.

7. Tests & docs
   - Add unit/integration tests for the auth flows and include an OpenAPI/Swagger spec to provide machine-readable documentation.

---

# Example curl commands

Login:
```bash
curl -X POST https://api.vaastman.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"P@ssw0rd!"}'
```

Register:
```bash
curl -X POST https://api.vaastman.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Jane Doe",
    "email":"jane.doe@example.com",
    "password":"P@ssw0rd!",
    "mobile":"9876543210",
    "role":"EMPLOYEE",
    "securedPass":"my-super-secret"
  }'
```

Refresh token (Authorization header carries refresh token):
```bash
curl -X POST https://api.vaastman.com/api/v1/auth/refresh-token \
  -H "Authorization: Bearer <refresh-token>"
```

Logout:
```bash
curl -X POST https://api.vaastman.com/api/v1/auth/logout \
  -H "Authorization: Bearer <refresh-token>"
```

---