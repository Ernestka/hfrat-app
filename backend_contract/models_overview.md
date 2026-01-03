# Data Models Overview

This document explains the core database models and their relationships in plain English to help frontend developers understand the data structures.

---

## Facility (Hospital/Clinic)
Represents a healthcare facility.

- **id**: integer (auto-increment primary key)
- **facility_name**: string (required)
- **country**: string (required; defaults to "Unknown")
- **city_or_state**: string (required; defaults to "Unknown")
- **location_detail**: string (optional; more granular location info)

A facility can have:
- Many users related to it (`users` relation)
- Exactly one resource report (`resource_report` relation)

---

## User
Custom user extending Django's `AbstractUser` with a `role` and optional `facility`.

- **id**: integer
- **username**: string (unique; required)
- **password**: string (hashed; required)
- **role**: enum/string (required):
  - `ADMIN` (Administrator)
  - `MONITOR`
  - `REPORTER`
- **facility**: Facility (optional depending on role)

Role-to-facility rules:
- `REPORTER` → MUST be assigned to a facility
- `MONITOR` → MUST NOT be assigned to a facility
- `ADMIN` → MUST NOT be assigned to a facility

These rules are enforced both in model validation and via a database constraint (`user_facility_role_requirement`).

---

## ResourceReport
One per facility. Contains current resource availability data.

- **id**: integer
- **facility**: Facility (one-to-one; required)
- **icu_beds_available**: integer (required; non-negative)
- **ventilators_available**: integer (required; non-negative)
- **staff_on_duty**: integer (required; non-negative)
- **last_updated**: datetime (auto-updated whenever report changes)

Relationships:
- Each `ResourceReport` belongs to exactly one `Facility`.
- A `Facility` has at most one `ResourceReport`.

---

## Relationships Summary

Textual relationship graph:

- `Reporter (User role)` → assigned to → `Facility`
- `Facility` → has one → `ResourceReport`
- `Monitor (User role)` → reads → all `ResourceReport`s
- `Admin (User role)` → manages → `User` and `Facility`

---

## Field Requirements

- All numeric fields in `ResourceReport` must be non-negative.
- `User.role` must be one of: `ADMIN`, `MONITOR`, `REPORTER`.
- `Reporter` users must have a `facility` assigned; other roles must not.

---

## Example Objects

### Facility
```json
{
  "id": 2,
  "facility_name": "Kigali Central Hospital",
  "country": "Rwanda",
  "city_or_state": "Kigali",
  "location_detail": null
}
```

### User (Reporter)
```json
{
  "id": 12,
  "username": "reporter",
  "role": "REPORTER",
  "facility": {
    "id": 2,
    "facility_name": "Kigali Central Hospital"
  }
}
```

### ResourceReport
```json
{
  "icu_beds_available": 12,
  "ventilators_available": 5,
  "staff_on_duty": 28,
  "last_updated": "2025-12-29T19:32:10Z"
}
```
