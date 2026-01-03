# HFRAT Backend API Reference

This document describes the REST API provided by the HFRAT backend for frontend integration.

Base URL: `http://127.0.0.1:8000/api/`

Authentication: JWT (JSON Web Tokens) via SimpleJWT

All authenticated endpoints require the header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### Login (Obtain Token)
- **Method**: POST
- **URL**: `/api/token/`
- **Body (JSON)**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Response (200)**:
```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```
- **Auth**: Not required

### Refresh Token
- **Method**: POST
- **URL**: `/api/token/refresh/`
- **Body (JSON)**:
```json
{
  "refresh": "<jwt_refresh_token>"
}
```
- **Response (200)**:
```json
{
  "access": "<new_jwt_access_token>"
}
```
- **Auth**: Not required

### Health Check (Role Hint)
- **Method**: GET
- **URL**: `/api/health/`
- **Response (200)**:
```json
{
  "status": "ok",
  "role": "ADMIN" | "MONITOR" | "REPORTER" | null
}
```
- **Auth**: Optional (role is included only if authenticated)

---

## Users & Roles

Roles:
- `ADMIN` (Administrator): Full admin access
- `MONITOR`: Read-only dashboard access
- `REPORTER`: Can create/update a resource report for their assigned facility

### Create User (Admin)
- **Method**: POST
- **URL**: `/api/admin/users/`
- **Body (JSON)**:
```json
{
  "username": "newuser",
  "password": "secure123",
  "role": "REPORTER",
  "facility_id": 3
}
```
- **Response (201)**:
```json
{
  "id": 12,
  "username": "newuser",
  "role": "REPORTER",
  "facility": {
    "id": 3,
    "facility_name": "Kigali Central Hospital"
  }
}
```
- **Auth**: Required (ADMIN only)

### List Users (Admin)
- **Method**: GET
- **URL**: `/api/admin/users/list/`
- **Response (200)**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "ADMIN",
    "facility": null
  },
  {
    "id": 2,
    "username": "reporter",
    "role": "REPORTER",
    "facility": {
      "id": 5,
      "facility_name": "Kinshasa General Hospital"
    }
  }
]
```
- **Auth**: Required (ADMIN only)

---

## Hospitals (Facilities)

Facilities represent hospitals/clinics. Each facility has `country`, `city_or_state`, and optional `location_detail`.

### List Facilities (Admin)
- **Method**: GET
- **URL**: `/api/admin/facilities/`
- **Response (200)**:
```json
[
  {
    "id": 1,
    "facility_name": "Kinshasa General Hospital",
    "country": "DR Congo",
    "city_or_state": "Kinshasa",
    "location_detail": "Gombe"
  },
  {
    "id": 2,
    "facility_name": "Kigali Central Hospital",
    "country": "Rwanda",
    "city_or_state": "Kigali",
    "location_detail": null
  }
]
```
- **Auth**: Required (ADMIN only)

### Create Facility (Admin)
- **Method**: POST
- **URL**: `/api/admin/facilities/`
- **Body (JSON)**:
```json
{
  "facility_name": "Lubumbashi Provincial Hospital",
  "country": "DR Congo",
  "city_or_state": "Lubumbashi",
  "location_detail": "Katuba"
}
```
- **Response (201)**:
```json
{
  "id": 7,
  "facility_name": "Lubumbashi Provincial Hospital",
  "country": "DR Congo",
  "city_or_state": "Lubumbashi",
  "location_detail": "Katuba"
}
```
- **Auth**: Required (ADMIN only)

---

## Reports

A `ResourceReport` is a single upsertable record per facility, containing ICU beds, ventilators, staff counts, and `last_updated`.

### Create/Update Report (Reporter)
- **Method**: POST or PUT
- **URL**: `/api/reporter/report/`
- **Body (JSON)**:
```json
{
  "icu_beds_available": 12,
  "ventilators_available": 5,
  "staff_on_duty": 28
}
```
- **Response (200)**:
```json
{
  "icu_beds_available": 12,
  "ventilators_available": 5,
  "staff_on_duty": 28,
  "last_updated": "2025-12-29T19:32:10Z"
}
```
- **Auth**: Required (REPORTER only; must be assigned to a facility)

### Dashboard (Monitor)
- **Method**: GET
- **URL**: `/api/monitor/dashboard/`
- **Response (200)**:
```json
[
  {
    "facility_name": "Kinshasa General Hospital",
    "icu_beds_available": 0,
    "ventilators_available": 2,
    "staff_on_duty": 12,
    "last_updated": "2025-12-29T19:32:10Z",
    "status": "CRITICAL"
  },
  {
    "facility_name": "Kigali Central Hospital",
    "icu_beds_available": 16,
    "ventilators_available": 6,
    "staff_on_duty": 40,
    "last_updated": "2025-12-29T19:35:24Z",
    "status": "OK"
  }
]
```
- **Auth**: Required (MONITOR only)

---

## Error Responses

Common error formats follow DRF conventions:

- **401 Unauthorized** (missing/invalid token)
```json
{ "detail": "Authentication credentials were not provided." }
```

- **403 Forbidden** (insufficient role)
```json
{ "detail": "You do not have permission to perform this action." }
```

- **400 Bad Request** (validation error)
```json
{ "facility_id": ["Reporters must be assigned to a facility."] }
```

---

## Notes

- All times are in ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- Reporters can only upsert their own facility's report.
- Admin-created users must follow role/facility rules:
  - `REPORTER` → must have `facility_id`
  - `MONITOR`, `ADMIN` → must NOT have `facility_id`
