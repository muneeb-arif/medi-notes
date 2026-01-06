# Medi Note – API Contract (v1, REST, JSON)

> This document defines the **backend REST API** for the Medi Note app.  
> All endpoints are versioned under `/api/v1`.  
> Data models are aligned with `domain-model.md` and `SRS-functional.md`.

---

## 0. Conventions

- **Base URL:** `https://api.mymedilogs.com/api/v1`
- **Media type:** `application/json`
- **Auth:** Bearer JWT in `Authorization: Bearer <token>`
- **Dates:** ISO 8601 strings in UTC, e.g. `2025-07-26T15:30:00Z`
- **Pagination:** `?page=1&limit=20` → response includes `meta: { page, limit, total }`
- **Errors:** Standard error object

```json
{
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "Report not found",
    "details": {}
  }
}
```

---

## 1. Authentication & Account

### 1.1 Register

**POST** `/auth/register`

Create a new account.

**Request**

```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd",
  "name": "Primary User"
}
```

**Response 201**

```json
{
  "account": {
    "id": "acc_123",
    "email": "user@example.com",
    "name": "Primary User",
    "createdAt": "2025-07-26T10:00:00Z"
  },
  "tokens": {
    "accessToken": "jwt-access",
    "refreshToken": "jwt-refresh"
  }
}
```

---

### 1.2 Login

**POST** `/auth/login`

**Request**

```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd"
}
```

**Response 200**

Same structure as register.

---

### 1.3 Refresh Token

**POST** `/auth/refresh`

```json
{
  "refreshToken": "jwt-refresh"
}
```

**Response**

```json
{
  "accessToken": "jwt-access-new",
  "refreshToken": "jwt-refresh-new"
}
```

---

### 1.4 Logout

**POST** `/auth/logout`

Invalidates the refresh token currently in use.

```json
{
  "refreshToken": "jwt-refresh"
}
```

---

### 1.5 Get Current Account

**GET** `/account/me`

**Response**

```json
{
  "id": "acc_123",
  "email": "user@example.com",
  "name": "Primary User",
  "settings": {
    "language": "en",
    "timezone": "Asia/Karachi",
    "notificationPreferences": {
      "appointments": true,
      "medications": true,
      "reports": true,
      "security": true
    }
  },
  "createdAt": "2025-07-26T10:00:00Z"
}
```

---

## 2. Person Profiles

Base path: `/profiles`

### 2.1 List Profiles

**GET** `/profiles`

**Response**

```json
{
  "items": [
    {
      "id": "prof_1",
      "fullName": "Sarah Ahmad",
      "dateOfBirth": "1980-01-01",
      "gender": "female",
      "relationToAccount": "self",
      "bloodType": "O+",
      "photoUrl": null,
      "emergencyAccessEnabled": true,
      "doctorSharingEnabled": true,
      "lastUpdatedAt": "2025-07-20T00:00:00Z"
    }
  ]
}
```

---

### 2.2 Create Profile

**POST** `/profiles`

```json
{
  "fullName": "Sarah Ahmad",
  "dateOfBirth": "1980-01-01",
  "gender": "female",
  "relationToAccount": "self",
  "bloodType": "O+",
  "heightCm": 164,
  "weightKg": 68,
  "emergencyContacts": [
    {
      "name": "Adam Ahmad",
      "relation": "husband",
      "phone": "+923001234567"
    }
  ]
}
```

**Response 201** – returns created profile.

---

### 2.3 Get Profile Detail

**GET** `/profiles/{profileId}`

---

### 2.4 Update Profile

**PATCH** `/profiles/{profileId}`

Payload: any editable fields (same as create).  

---

### 2.5 Delete Profile

**DELETE** `/profiles/{profileId}`

Soft or hard delete depending on policy.

---

### 2.6 Toggle Privacy Flags

**PATCH** `/profiles/{profileId}/settings`

```json
{
  "emergencyAccessEnabled": true,
  "doctorSharingEnabled": true
}
```

---

## 3. Condition Profiles (Sub-Profiles)

Base path: `/profiles/{profileId}/conditions`

### 3.1 List Condition Profiles

**GET** `/profiles/{profileId}/conditions`

```json
{
  "items": [
    {
      "id": "cond_1",
      "label": "Cardiology",
      "specialty": "cardiology",
      "description": "Heart health profile",
      "isPrimary": false,
      "createdAt": "2025-07-01T00:00:00Z"
    }
  ]
}
```

### 3.2 Create

**POST** `/profiles/{profileId}/conditions`

```json
{
  "label": "Endocrinology",
  "specialty": "endocrinology",
  "description": "Diabetes management"
}
```

### 3.3 Update

**PATCH** `/profiles/{profileId}/conditions/{conditionId}`

### 3.4 Delete

**DELETE** `/profiles/{profileId}/conditions/{conditionId}`

(409 if referenced by active consent, depending on rules.)

---

## 4. Reports (Medical Documents)

Base path: `/profiles/{profileId}/reports`

### 4.1 Upload Report (Metadata First)

Uploads can be implemented as **two-step**:

1) Get upload URL  
2) Confirm metadata

#### 4.1.1 Create Upload Session

**POST** `/profiles/{profileId}/reports/upload-url`

```json
{
  "fileName": "cbc-results.pdf",
  "fileType": "application/pdf"
}
```

**Response**

```json
{
  "uploadUrl": "https://storage/...signed-url",
  "fileKey": "reports/prof_1/rep_123.pdf"
}
```

Client uploads file directly to storage.

#### 4.1.2 Create Report Metadata

**POST** `/profiles/{profileId}/reports`

```json
{
  "title": "CBC Lab Report",
  "reportDate": "2025-07-15",
  "type": "lab",
  "doctorName": "Dr. Rizwan",
  "facility": "ABC Labs",
  "tags": ["diabetes", "lab"],
  "conditionProfileId": "cond_endo",
  "fileKey": "reports/prof_1/rep_123.pdf",
  "includeInEmergency": false
}
```

---

### 4.2 List Reports

**GET** `/profiles/{profileId}/reports?type=lab&conditionProfileId=cond_endo&page=1&limit=20`

**Response**

```json
{
  "items": [
    {
      "id": "rep_123",
      "title": "CBC Lab Report",
      "reportDate": "2025-07-15",
      "type": "lab",
      "doctorName": "Dr. Rizwan",
      "facility": "ABC Labs",
      "tags": ["diabetes"],
      "conditionProfileId": "cond_endo",
      "fileUrl": "https://storage/...signed-view-url",
      "includeInEmergency": false,
      "createdAt": "2025-07-16T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

`fileUrl` is a **short-lived signed URL**.

---

### 4.3 Get Single Report

**GET** `/profiles/{profileId}/reports/{reportId}`

---

### 4.4 Update Report

**PATCH** `/profiles/{profileId}/reports/{reportId}`

```json
{
  "title": "Updated Report Title",
  "tags": ["cardiology"],
  "includeInEmergency": true
}
```

---

### 4.5 Delete Report

**DELETE** `/profiles/{profileId}/reports/{reportId}`

---

## 5. Vitals

Base path: `/profiles/{profileId}/vitals`

### 5.1 Add Vital Reading

**POST** `/profiles/{profileId}/vitals`

```json
{
  "type": "blood_pressure",
  "value": {
    "systolic": 130,
    "diastolic": 85
  },
  "unit": "mmHg",
  "recordedAt": "2025-07-26T07:00:00Z",
  "conditionProfileId": "cond_cardio",
  "notes": "Morning measurement"
}
```

### 5.2 List Vital Readings

**GET** `/profiles/{profileId}/vitals?type=blood_pressure&from=2025-07-01&to=2025-07-31`

---

### 5.3 Delete Vital Reading

**DELETE** `/profiles/{profileId}/vitals/{vitalId}`

---

## 6. Medications

Base path: `/profiles/{profileId}/medications`

### 6.1 Add Medication

**POST** `/profiles/{profileId}/medications`

```json
{
  "name": "Metformin",
  "genericName": "Metformin",
  "dose": 500,
  "doseUnit": "mg",
  "frequency": "twice_daily",
  "schedule": "Morning and night",
  "startDate": "2025-07-10",
  "endDate": null,
  "status": "ongoing",
  "conditionProfileId": "cond_endo",
  "notes": "Take with food"
}
```

### 6.2 List Medications

**GET** `/profiles/{profileId}/medications?status=ongoing`

### 6.3 Update Medication

**PATCH** `/profiles/{profileId}/medications/{medId}`

### 6.4 Delete Medication

**DELETE** `/profiles/{profileId}/medications/{medId}`

---

## 7. Doctors

Base path: `/doctors`

### 7.1 List Saved Doctors

**GET** `/doctors`

```json
{
  "items": [
    {
      "id": "doc_1",
      "fullName": "Dr. Sarah Rehman",
      "specialties": ["cardiology"],
      "phone": "+923001234567",
      "email": "s.rehman@example.com",
      "hospital": "St. Mary's Medical Center"
    }
  ]
}
```

### 7.2 Create Doctor

**POST** `/doctors`

### 7.3 Update Doctor

**PATCH** `/doctors/{doctorId}`

### 7.4 Delete Doctor

**DELETE** `/doctors/{doctorId}`

---

## 8. Appointments

Base path: `/profiles/{profileId}/appointments`

### 8.1 Create Appointment

**POST** `/profiles/{profileId}/appointments`

```json
{
  "doctorId": "doc_1",
  "clinicName": "St. Mary's Medical Center",
  "scheduledFor": "2025-07-26T10:00:00Z",
  "mode": "in_person",
  "reason": "Follow-up visit",
  "notes": "Bring previous lab reports"
}
```

### 8.2 List Appointments

**GET** `/profiles/{profileId}/appointments?status=upcoming`

### 8.3 Update Appointment

**PATCH** `/profiles/{profileId}/appointments/{apptId}`

### 8.4 Cancel Appointment

**DELETE** `/profiles/{profileId}/appointments/{apptId}`

---

## 9. Emergency Info

Base path: `/profiles/{profileId}/emergency`

### 9.1 Get Emergency Summary

**GET** `/profiles/{profileId}/emergency`

**Response**

```json
{
  "profile": {
    "fullName": "Sarah Ahmad",
    "ageYears": 45,
    "gender": "female",
    "bloodType": "O+"
  },
  "allergies": ["Penicillin", "Nuts"],
  "chronicConditions": ["Diabetes", "Hypertension"],
  "criticalMedications": [
    {
      "name": "Metformin",
      "dose": "500 mg",
      "frequency": "1 tablet daily"
    }
  ],
  "devices": ["Pacemaker"],
  "riskFlags": ["Anesthesia sensitivity", "Anticoagulants in use"],
  "emergencyContacts": [
    {
      "name": "Adam Ahmad",
      "relation": "Husband",
      "phone": "+923001234567"
    }
  ],
  "primaryDoctor": {
    "name": "Dr. Sarah Rehman",
    "phone": "+923001112233"
  }
}
```

Emergency access mode is tracked at server by reading auth context or token type.

---

## 10. Notifications

Base path: `/notifications`

### 10.1 List Notifications

**GET** `/notifications?category=medications&status=unread&page=1&limit=20`

### 10.2 Mark Read

**POST** `/notifications/{notificationId}/read`

```json
{ "read": true }
```

---

## 11. Consent & Sharing

### 11.1 List Consents

**GET** `/profiles/{profileId}/consents`

```json
{
  "items": [
    {
      "id": "cons_1",
      "doctorId": "doc_1",
      "scope": "condition_profile",
      "conditionProfileId": "cond_endo",
      "accessScope": "view_only",
      "expiresAt": "2025-12-31T00:00:00Z",
      "status": "active",
      "createdAt": "2025-07-10T00:00:00Z"
    }
  ]
}
```

### 11.2 Create Consent

**POST** `/profiles/{profileId}/consents`

```json
{
  "doctorId": "doc_1",
  "scope": "condition_profile",
  "conditionProfileId": "cond_endo",
  "accessScope": "view_only",
  "expiresAt": "2025-12-31T00:00:00Z"
}
```

### 11.3 Revoke Consent

**POST** `/profiles/{profileId}/consents/{consentId}/revoke`

---

### 11.4 Generate Share Link (Temporary Access Token)

**POST** `/profiles/{profileId}/share-links`

```json
{
  "scope": "condition_profile",
  "conditionProfileId": "cond_endo",
  "expiresInMinutes": 60
}
```

**Response**

```json
{
  "shareId": "share_abc",
  "url": "https://share.mymedilogs.com/s/xyz123"
}
```

This URL is what gets shared via WhatsApp, QR, etc.

---

### 11.5 Access Log

**GET** `/profiles/{profileId}/access-logs?from=2025-07-01&to=2025-07-31`

```json
{
  "items": [
    {
      "id": "log_1",
      "actorType": "doctor",
      "actorId": "doc_1",
      "action": "view_profile",
      "personProfileId": "prof_1",
      "conditionProfileId": "cond_endo",
      "emergencyMode": false,
      "timestamp": "2025-07-26T10:01:00Z"
    }
  ]
}
```

---

## 12. Insurance

Base path: `/profiles/{profileId}/insurance`

### 12.1 List Policies

**GET** `/profiles/{profileId}/insurance`

### 12.2 Add Policy

**POST** `/profiles/{profileId}/insurance`

```json
{
  "providerName": "ABC Insurance",
  "policyNumber": "P-123456",
  "memberId": "M-987654",
  "expiryDate": "2026-01-01",
  "notes": "Corporate plan"
}
```

### 12.3 Update Policy

**PATCH** `/profiles/{profileId}/insurance/{policyId}`

### 12.4 Delete Policy

**DELETE** `/profiles/{profileId}/insurance/{policyId}`

---

## 13. AI (Future – v2+)

Base path: `/ai`

### 13.1 Start AI Session

**POST** `/ai/sessions`

```json
{
  "personProfileId": "prof_1",
  "conditionProfileId": "cond_endo",
  "type": "health"
}
```

**Response**

```json
{
  "id": "ais_1",
  "type": "health",
  "createdAt": "2025-07-26T12:00:00Z"
}
```

### 13.2 Send Message

**POST** `/ai/sessions/{sessionId}/messages`

```json
{
  "message": "Explain my last HbA1c result in simple words."
}
```

**Response**

```json
{
  "id": "msg_2",
  "role": "assistant",
  "content": "Your HbA1c of 7.2% means your blood sugar has been slightly above target over the last 3 months...",
  "timestamp": "2025-07-26T12:01:00Z"
}
```

AI backend must receive only minimal necessary data; PHI is de-identified where possible.

---

## 14. Misc & Supporting Endpoints

### 14.1 Health Check

**GET** `/health`

Response: `{ "status": "ok" }`

### 14.2 App Config

**GET** `/config`

Returns feature flags, supported vital types, medication frequencies, etc.

---

## 15. Error Codes (Examples)

| Code                        | HTTP | Description                                      |
|-----------------------------|------|--------------------------------------------------|
| `UNAUTHORIZED`              | 401  | Missing/invalid token                            |
| `FORBIDDEN`                 | 403  | No access (consent missing/expired)             |
| `PROFILE_NOT_FOUND`         | 404  | Profile ID invalid                               |
| `REPORT_NOT_FOUND`          | 404  | Report ID invalid                                |
| `UPLOAD_NOT_AUTHORIZED`     | 403  | File upload denied                               |
| `INVALID_FILE_TYPE`         | 400  | Only PDF/JPEG/PNG supported                      |
| `CONSENT_CONFLICT`          | 409  | Cannot modify/delete due to consent constraints  |
| `EMERGENCY_ACCESS_DISABLED` | 403  | Emergency view not enabled for this profile      |
| `AI_NOT_AVAILABLE`          | 503  | AI service unavailable                           |

---

This API contract is intended as a **baseline**.  
As implementation progresses, details like query parameters, enums, and error codes can be refined and kept in sync with this document.
