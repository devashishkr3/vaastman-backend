<!-- # Vaastman Backend — Public (Unauthenticated) API Documentation

This document describes all publicly accessible endpoints in the Vaastman Backend Public module (no authentication required). It covers routes, request validation rules, example requests/responses, error cases, and operational notes.

Base URL
- Production: https://api.vaastman.com
- Development: http://localhost:8080 (default)
- API prefix: /api/v1
- Public router mount: /api/v1/public

All endpoints in this module are public — no JWT or Authorization header required.

Summary of public routes
| Method | Route (full) | Description |
|--------|--------------|-------------|
| POST | /api/v1/public/contact | Submit a contact / "Contact Us" form (sends confirmation to user and notification to admin email) |
| POST | /api/v1/public/career | Submit a career application (sends confirmation to applicant and notification to admin email) |

Global behavior and notes
- Validation middleware: joiValidator is used to validate incoming requests against Joi schemas. Validation failures return HTTP 400 with a descriptive message.
- Rate limiting: The app applies a rate limiter globally at the /api/v1 prefix (default settings in src/index.js: 1000 requests per 15 minutes). Adjust as needed.
- Email sending: public endpoints use the sendEmail utility (src/utils/nodemailer.js). Ensure SMTP env vars are set:
  - SMTP_USER, SMTP_PASS
  - ADMIN_EMAIL (used as recipient for admin notifications)
- Error handling: AppError is used for operational errors. Global error handler returns `{ success: false, message: "..." }` for known (operational) errors and detailed info in development.

---

## POST /api/v1/public/contact

Description
- Accepts a contact form submission. The server sends:
  - A thank-you email to the submitter (to the email provided in the request)
  - A notification email to the configured ADMIN_EMAIL with submission details

Authentication
- None. Public endpoint.

Request
- Content-Type: application/json

Request body schema (validation from src/validators/contactValidaton.js):

| Field   | Type   | Required | Validation / Notes |
|---------|--------|----------|--------------------|
| name    | string | Yes      | trimmed, 3–100 chars |
| email   | string | Yes      | valid email format |
| message | string | Yes      | trimmed, 10–1000 chars |

Example request body
```json
{
  "name": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "message": "I would like to learn more about your certificate issuance service for my university."
}
```

Success response
- Status: 200 OK
- Body (as implemented in src/controllers/publicController.js):
```json
{
  "success": true,
  "message": "Contact email sent successfully"
}
```

Response fields
| Field   | Type    | Description |
|---------|---------|-------------|
| success | boolean | true on success |
| message | string  | Human-readable status message |

Validation error responses
- Status: 400 Bad Request
- Example (when Joi fails; message content uses Joi messages joined by commas):
```json
{
  "success": false,
  "message": "Name must be at least 3 characters, Please provide a valid email, Message must be at least 10 characters"
}
```
(Actual message text depends on which validations failed; joiValidator joins details into one message.)

Other possible errors
- 500 Internal Server Error — e.g., SMTP failure, sendEmail throws. Example returned by global handler:
```json
{
  "success": false,
  "message": "Something went wrong",
  "error": "Email sending failed"
}
```
(When AppError is thrown, the response format will be `{ success: false, message: '...' }`.)

Notes & operational considerations
- The endpoint sends two emails: one to the submitter and one to ADMIN_EMAIL. Ensure ADMIN_EMAIL and SMTP credentials are correct.
- Avoid exposing spammy or abusive content; consider rate-limiting and CAPTCHA on the frontend.
- Keep the message content sanitized before including in emails (the current implementation interpolates values into HTML emails—ensure values are safe).

Example curl
```bash
curl -X POST "http://localhost:8080/api/v1/public/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya.sharma@example.com",
    "message": "I would like to learn more about your certificate issuance service for my university."
  }'
```

---

## POST /api/v1/public/career

Description
- Accepts a career application. The server sends:
  - A thank-you email to the applicant
  - A notification email to the configured ADMIN_EMAIL including applicant details

Authentication
- None. Public endpoint.

Request
- Content-Type: application/json

Request body schema (validation from src/validators/careerValidaton.js):

| Field     | Type   | Required | Validation / Notes |
|-----------|--------|----------|--------------------|
| name      | string | Yes      | trimmed, 3–100 chars |
| email     | string | Yes      | valid email format |
| phone     | string | Yes      | exactly 10 digits (pattern /^[0-9]{10}$/) |
| domain    | string | Yes      | trimmed, 2–100 chars |
| motiveType| string | Yes      | trimmed, 3–100 chars; applicant's motive / motivation type |

Example request body
```json
{
  "name": "Rajat Kumar",
  "email": "rajat.kumar@example.com",
  "phone": "9876543210",
  "domain": "Frontend Development",
  "motiveType": "Internship - Summer 2026"
}
```

Success response
- Status: 201 Created
- Body (as implemented in src/controllers/publicController.js):
```json
{
  "success": true,
  "message": "Thankyou for your application"
}
```
Note: The controller returns "Thankyou" (no space) — preserve exact message when integrating clients or consider normalizing it in a later patch.

Response fields
| Field   | Type    | Description |
|---------|---------|-------------|
| success | boolean | true on success |
| message | string  | Human-readable status message (as implemented) |

Validation error responses
- Status: 400 Bad Request
- Example:
```json
{
  "success": false,
  "message": "Phone number must be exactly 10 digits, Email is required"
}
```
(Actual message depends on which Joi validations failed.)

Other possible errors
- 500 Internal Server Error — e.g., SMTP failure; example:
```json
{
  "success": false,
  "message": "Something went wrong",
  "error": "Email sending failed"
}
```

Notes & operational considerations
- The endpoint does not persist career applications to the database; it sends emails only. If persistence is required, add a datastore/DB model and update the controller.
- Ensure resume attachments workflow if you plan to accept files (current schema expects JSON only).
- Validate and sanitize user-provided values before including them in HTML emails (to avoid injection).
- Rate limiting is applied globally (see global rate limiter).

Example curl
```bash
curl -X POST "http://localhost:8080/api/v1/public/career" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajat Kumar",
    "email": "rajat.kumar@example.com",
    "phone": "9876543210",
    "domain": "Frontend Development",
    "motiveType": "Internship - Summer 2026"
  }'
```

---

## Validation error message reference

The validators provide specific messages; the joiValidator middleware aggregates Joi errors and returns them joined. Here are the key messages you may see:

Contact validation messages (contactValidaton.js)
- Name:
  - "Name is required"
  - "Name cannot be empty"
  - "Name must be at least 3 characters"
  - "Name must be at most 100 characters"
- Email:
  - "Email is required"
  - "Please provide a valid email"
- Message:
  - "Message is required"
  - "Message cannot be empty"
  - "Message must be at least 10 characters"
  - "Message must be at most 1000 characters"

Career validation messages (careerValidaton.js)
- Name:
  - "Name is required", "Name cannot be empty", "Name must be at least 3 characters", "Name must be at most 100 characters"
- Email:
  - "Email is required", "Please provide a valid email"
- Phone:
  - "Phone number is required", "Phone number must be exactly 10 digits"
- Domain:
  - "Domain is required", etc.
- MotiveType:
  - "Motive is required", etc.

When Joi validation fails, the middleware sends a single 400 response with a concatenated message string.

---

## Security & anti-abuse recommendations

- Add CAPTCHA or other bot protections on the frontend for contact/career forms.
- Consider:
  - limiting submissions per IP / per email,
  - storing recent submissions to prevent spamming,
  - sanitizing content before emailing,
  - sending emails asynchronously (queue) to improve responsiveness,
  - logging submissions (with rate-limited retention) for audit and support.

---

## Implementation notes (from code review)

- The controller uses `sendEmail` (src/utils/nodemailer.js). That utility throws a generic "Email sending failed" error if send fails; controllers catch and forward the error to global handler.
- The public routes are validated using joiValidator middleware in src/routers/publicRoute.js — the router maps:
  - POST /contact -> joiValidator(contactValidator.createContactSchema) -> publicController.submitContact
  - POST /career -> joiValidator(careerValidator.createCareerSchema) -> publicController.submitCareer
- Responses use a consistent `{ success: true, message: "..." }` shape for success and `{ success:false, message:"..." }` for AppError. In development, the error handler may include additional debug fields.
- The global rate limiter is applied to /api/v1 in src/index.js.

--- -->


# Vaastman Backend — Public (Unauthenticated) API Documentation

This document describes all publicly accessible endpoints in the Vaastman Backend Public module (no authentication required). It covers routes, request validation rules, example requests/responses, error behaviors, and operational notes.

Base URL
- Production: https://api.vaastman.com
- Development: http://localhost:8080 (default)
- API prefix: /api/v1
- Public router mount: /api/v1/public

All endpoints in this module are public — no JWT or Authorization header required.

Summary of public routes
| Method | Route (full)                      | Description                                                                |
|--------|-----------------------------------|----------------------------------------------------------------------------|
| POST   | /api/v1/public/contact            | Submit a contact / "Contact Us" form (sends confirmation & notification)   |
| POST   | /api/v1/public/career             | Submit a career application (sends confirmation & notification)            |
| GET    | /api/v1/public/certificates/search| Global certificate search by cert no, student info, etc.                   |
| GET    | /api/v1/public/certificates/verify/:hash | Verify a certificate using its verification hash                    |

Global behavior and notes
- Validation middleware: joiValidator is used to validate incoming requests against Joi schemas. Validation failures return HTTP 400 with a descriptive message.
- Rate limiting: The app applies a rate limiter globally at the /api/v1 prefix (default settings in src/index.js: 1000 requests per 15 minutes). Adjust as needed.
- Email sending: public endpoints use the sendEmail utility (src/utils/nodemailer.js). Ensure SMTP env vars are set:
  - SMTP_USER, SMTP_PASS
  - ADMIN_EMAIL (used as recipient for admin notifications)
- Error handling: AppError is used for operational errors. Global error handler returns `{ success: false, message: "..." }` for known (operational) errors and detailed info in development.

---

## POST /api/v1/public/contact

**Description:**  
Accepts a contact form submission. The server sends:
- A thank-you email to the submitter (to the email provided in the request)
- A notification email to the configured ADMIN_EMAIL with submission details

**Authentication:** None. Public endpoint.

**Request**
- Content-Type: application/json

**Request body schema (validation from src/validators/contactValidaton.js):**

| Field   | Type   | Required | Validation / Notes         |
|---------|--------|----------|---------------------------|
| name    | string | Yes      | trimmed, 3–100 chars      |
| email   | string | Yes      | valid email format        |
| message | string | Yes      | trimmed, 10–1000 chars    |

Example request body
```json
{
  "name": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "message": "I would like to learn more about your certificate issuance service for my university."
}
```

**Success response**
- Status: 200 OK
```json
{
  "success": true,
  "message": "Contact email sent successfully"
}
```

**Validation error responses**
- Status: 400 Bad Request
```json
{
  "success": false,
  "message": "Name must be at least 3 characters, Please provide a valid email, Message must be at least 10 characters"
}
```
(Actual message depends on validation.)

**Other possible errors**
- 500 Internal Server Error — e.g., SMTP failure, sendEmail throws:
```json
{
  "success": false,
  "message": "Something went wrong",
  "error": "Email sending failed"
}
```

---

## POST /api/v1/public/career

**Description:**  
Accepts a career application. The server sends:
- A thank-you email to the applicant
- A notification email to the configured ADMIN_EMAIL including applicant details

**Authentication:** None. Public endpoint.

**Request**
- Content-Type: application/json

**Request body schema (validation from src/validators/careerValidaton.js):**

| Field     | Type   | Required | Validation / Notes                |
|-----------|--------|----------|-----------------------------------|
| name      | string | Yes      | trimmed, 3–100 chars              |
| email     | string | Yes      | valid email format                |
| phone     | string | Yes      | exactly 10 digits (pattern /^[0-9]{10}$/) |
| domain    | string | Yes      | trimmed, 2–100 chars              |
| motiveType| string | Yes      | trimmed, 3–100 chars; applicant's motive/motivation type |

Example request body
```json
{
  "name": "Rajat Kumar",
  "email": "rajat.kumar@example.com",
  "phone": "9876543210",
  "domain": "Frontend Development",
  "motiveType": "Internship - Summer 2026"
}
```

**Success response**
- Status: 201 Created
```json
{
  "success": true,
  "message": "Thankyou for your application"
}
```

**Validation error responses**
- Status: 400 Bad Request
```json
{
  "success": false,
  "message": "Phone number must be exactly 10 digits, Email is required"
}
```

**Other possible errors**
- 500 Internal Server Error — e.g., SMTP failure:
```json
{
  "success": false,
  "message": "Something went wrong",
  "error": "Email sending failed"
}
```

---

## GET /api/v1/public/certificates/search

**Description:**  
Global search endpoint for certificates.  
Search by: certificate number, student name, email, or university enrollment number.

**Authentication:** None. Public endpoint.

**Request**
- Method: GET
- Query parameters:
  - `query` (string, required): The search term. Can be a cert no, student name, email, or enrollment number.

Example request:
```
GET /api/v1/public/certificates/search?query=Priya%20Sharma
```

**Success response**
- Status: 200 OK
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "certNumber": "VS-2025-12345",
      "studentName": "Priya Sharma",
      "email": "priya.sharma@example.com",
      "enrollmentNo": "UEN123456",
      "course": "B.Tech Computer Science",
      "internshipFrom": "2025-05-01T00:00:00.000Z",
      "internshipTo": "2025-06-30T00:00:00.000Z",
      "issuedBy": "Aditya Suman",
      "certificateURL": "https://res.cloudinary.com/...",
      "revoked": false
    }
    // ...more results
  ]
}
```

**Response fields**
| Field          | Type      | Description                                   |
|----------------|-----------|-----------------------------------------------|
| success        | boolean   | true on success                               |
| count          | number    | No. of results returned                       |
| data           | array     | Array of certificate summary objects          |
| certNumber     | string    | Certificate number                            |
| studentName    | string    | Name of student                               |
| email          | string    | Email of student                              |
| enrollmentNo   | string    | University enrollment number                  |
| course         | string    | Course/field                                  |
| internshipFrom | string    | Internship start date (ISO)                   |
| internshipTo   | string    | Internship end date (ISO)                     |
| issuedBy       | string    | Name of issuer (employee/admin)               |
| certificateURL | string    | Downloadable PDF URL                          |
| revoked        | boolean   | If true, certificate is revoked               |

**Validation error responses**
- Status: 400 Bad Request (if `query` missing)
```json
{
  "success": false,
  "message": "Please provide a search query"
}
```

**No results**
- Status: 404 Not Found
```json
{
  "success": false,
  "message": "No certificates found for this query"
}
```

**Other possible errors**
- 500 Internal Server Error

**Notes:**
- Returns up to 20 most recent matching certificates.
- Search is case-insensitive and matches partial strings.
- Useful for institutions, students, and verifiers.

---

## GET /api/v1/public/certificates/verify/:hash

**Description:**  
Verify a certificate using its unique verification hash.  
Typically, this endpoint is linked from a QR code on the certificate.

**Authentication:** None. Public endpoint.

**Request**
- Method: GET
- URL parameter:
  - `hash` (string, required): The unique verification hash for the certificate.

Validation:
- The route uses `joiValidator` with `certificateValidator.verifyHashParamSchema`.
  - `hash` is required and must be a non-empty string.

Example request:
```
GET /api/v1/public/certificates/verify/9f2a4b5c1d2e3f4a5b6c7d8e9f0a1b2c
```

**Success response**
- Status: 200 OK
```json
{
  "success": true,
  "message": "Certificate is valid",
  "data": {
    "certNumber": "VS-2025-12345",
    "studentName": "Priya Sharma",
    "email": "priya.sharma@example.com",
    "course": "B.Tech Computer Science",
    "internshipFrom": "2025-05-01T00:00:00.000Z",
    "internshipTo": "2025-06-30T00:00:00.000Z",
    "issuedBy": "Aditya Suman",
    "certificateURL": "https://res.cloudinary.com/..."
  }
}
```

**Response fields**
| Field          | Type      | Description                                   |
|----------------|-----------|-----------------------------------------------|
| success        | boolean   | true on success                               |
| message        | string    | "Certificate is valid"                        |
| data           | object    | Certificate details                           |
| certNumber     | string    | Certificate number                            |
| studentName    | string    | Name of student                               |
| email          | string    | Email of student                              |
| course         | string    | Course/field                                  |
| internshipFrom | string    | Internship start date (ISO)                   |
| internshipTo   | string    | Internship end date (ISO)                     |
| issuedBy       | string    | Name of issuer (employee/admin)               |
| certificateURL | string    | Downloadable PDF URL                          |

**Validation error responses**
- Status: 400 Bad Request (if hash missing/invalid)
```json
{
  "success": false,
  "message": "Verification hash is required"
}
```

**Invalid/fake hash**
- Status: 404 Not Found
```json
{
  "success": false,
  "message": "Invalid or fake certificate"
}
```

**Other possible errors**
- 500 Internal Server Error

**Notes:**
- This endpoint is intended for use by employers, institutions, or students themselves to verify the authenticity of a certificate.
- The hash should come from the certificate's QR code or verification link.
- If found, returns all certificate metadata needed to display/validate the certificate.

---

## Validation error message reference

The validators provide specific messages; the joiValidator middleware aggregates Joi errors and returns them joined. Here are the key messages you may see:

Contact validation messages (contactValidaton.js)
- Name:
  - "Name is required"
  - "Name cannot be empty"
  - "Name must be at least 3 characters"
  - "Name must be at most 100 characters"
- Email:
  - "Email is required"
  - "Please provide a valid email"
- Message:
  - "Message is required"
  - "Message cannot be empty"
  - "Message must be at least 10 characters"
  - "Message must be at most 1000 characters"

Career validation messages (careerValidaton.js)
- Name:
  - "Name is required", "Name cannot be empty", "Name must be at least 3 characters", "Name must be at most 100 characters"
- Email:
  - "Email is required", "Please provide a valid email"
- Phone:
  - "Phone number is required", "Phone number must be exactly 10 digits"
- Domain:
  - "Domain is required", etc.
- MotiveType:
  - "Motive is required", etc.

Certificate verification hash validation (certificateValidaton.js)
- Hash:
  - "Verification hash is required"
  - "Verification hash cannot be empty"

When Joi validation fails, the middleware sends a single 400 response with a concatenated message string.

---

## Security & anti-abuse recommendations

- Add CAPTCHA or other bot protections on the frontend for contact/career forms.
- Consider:
  - limiting submissions per IP / per email,
  - storing recent submissions to prevent spamming,
  - sanitizing content before emailing,
  - sending emails asynchronously (queue) to improve responsiveness,
  - logging submissions (with rate-limited retention) for audit and support.

---

## Implementation notes (from code review)

- The controller uses `sendEmail` (src/utils/nodemailer.js). That utility throws a generic "Email sending failed" error if send fails; controllers catch and forward the error to global handler.
- The public routes are validated using joiValidator middleware in src/routers/publicRoute.js — the router maps:
  - POST /contact -> joiValidator(contactValidator.createContactSchema) -> publicController.submitContact
  - POST /career -> joiValidator(careerValidator.createCareerSchema) -> publicController.submitCareer
  - GET /certificates/search -> publicController.globalCertificateSearch
  - GET /certificates/verify/:hash -> joiValidator(certificateValidator.verifyHashParamSchema) -> certificateController.verifyCertificate
- Responses use a consistent `{ success: true, ... }` shape for success and `{ success:false, message:"..." }` for AppError. In development, the error handler may include additional debug fields.
- The global rate limiter is applied to /api/v1 in src/index.js.

---