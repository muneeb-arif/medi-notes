# Data Storage & Retention Policy – Medi Note

This document describes how data is stored, encrypted, accessed, and retained for the Medi Note application. It is designed to be compatible with future HIPAA/GDPR compliance and the requirements in the SRS.

## 1. Data Classification

### 1.1 Protected Health Information (PHI)

Includes:

- PersonProfile details (name, DOB, gender, relation, blood type, etc.)
- Medical history (conditions, medications, surgeries, allergies)
- Vitals and readings
- Reports (PDFs, lab results, prescriptions, imaging)
- Appointments, doctor notes, chat messages
- Insurance details

### 1.2 Non-PHI

Includes:

- App settings and preferences
- General analytics events (feature usage, screen views without PHI)
- Device metadata (OS version, app version)
- Technical logs without identifiers

---

## 2. Storage Locations

### 2.1 Mobile App

- **SecureStore / Keychain / Keystore**  
  - Stores auth tokens and minimal session information.
- **AsyncStorage**  
  - Stores non-sensitive preferences (theme, language).
  - May cache small, non-PHI data (e.g., last viewed tab).
- No PHI is persisted unencrypted on device outside of platform-provided secure mechanisms.

### 2.2 Backend

Initial phase (non-HIPAA cloud, e.g. Supabase/Render/Cloudflare) and later HIPAA-ready AWS deployment must follow the same logical separation:

- **Relational Database (PostgreSQL)**  
  - Stores structured PHI and non-PHI.
  - Tables separated by domain (profiles, reports metadata, vitals, appointments, chat, consents, access logs, etc.).
  - Encryption at rest enabled.

- **Object Storage (e.g., S3/R2)**  
  - Stores report files, images, insurance card scans.
  - Server-side encryption enabled.
  - Files are never served publicly; only via **time-limited signed URLs**.

- **Logs Storage**  
  - Access logs and audit trails stored in dedicated tables.
  - Application logs stored in log service (e.g., CloudWatch/Sentry) without PHI.

---

## 3. Access Patterns

### 3.1 Principle of Least Privilege

- APIs expose only the minimum data required for each use case.
- Doctor-facing views are scoped by **ConsentGrant** and may show only a subset of a patient’s profiles or condition profiles.
- Emergency view returns only:
  - Allergies
  - Critical medications
  - Key conditions and devices
  - ICE contacts
  - Risk flags
  as defined in the SRS.

### 3.2 Signed URLs for Files

- File downloads and previews use object storage signed URLs with short expiry (e.g., 5–15 minutes).
- URLs are generated per request and are not stored in DB or logs.
- Share links (for WhatsApp / QR) are **separate** short tokens that reference a `TemporaryAccessToken` record; they never directly expose storage URLs.

---

## 4. Retention & Deletion

### 4.1 User-Initiated Deletion

- When a user deletes:
  - **A report** → metadata row soft-deleted or hard-deleted; file is deleted or marked for deletion in object storage.
  - **A profile** → cascade deletion of associated reports, vitals, meds, appointments, chat threads relating to that person.
  - **Account** → either:
    - Hard delete all associated person profiles and data, OR
    - Anonymize records where legal/audit retention is required (configurable per jurisdiction).

- Deletion must be **eventually consistent**:
  - DB delete happens immediately.
  - Files are removed via background job/worker.

### 4.2 Automatic Retention

- Access logs may be retained longer (e.g., 6–7 years) to support compliance requirements.
- For early versions, set a reasonable default (e.g., 3–5 years) and document it in the privacy policy.

---

## 5. Backups & Recovery

- Database backups performed daily; retention window between 7–30 days depending on environment.
- Object storage backups use versioning or replication.
- Recovery procedures are tested in non-production environments.

Backups must be:

- Encrypted at rest.
- Accessible only to infrastructure administrators.
- Covered by the same breach policies as primary data.

---

## 6. Environment Separation

- **Development environment**
  - Uses anonymized or synthetic data only.
  - Never contains production PHI.
- **Staging environment**
  - Mirrors production schema and configuration.
  - Uses test accounts; no real patient data.
- **Production environment**
  - Strict IP and identity controls for admin access.
  - Restricted access to DB and object storage.

---

## 7. Client Caching & Offline Support

- The app may cache:
  - non-sensitive configuration
  - last-opened profile ID
  - UI state
- Full medical records are **not** cached for offline use in v1 to avoid device-level risk.
- If offline support is added later, all locally cached PHI must:
  - be encrypted with keys bound to the device
  - be wipeable on logout / app uninstall
  - require biometric unlock for access

---

## 8. Data for AI Features

For AI-based 1:1 health assistant, psychologist, and family risk prediction:

- Data passed to the AI layer should be **minimized and de-identified**:
  - Replace names with generic labels (e.g., “Patient”, “Mother”).
  - Use age ranges instead of exact birthdates when possible.
- Requests and responses are logged in `AiSession` and `AiMessage` tables without including raw PHI when avoidable.
- External AI providers must be configured to avoid data retention if possible.

---

## 9. Export & Portability

- Users can:
  - Download a **Health Summary PDF** per person profile.
  - Download **Vitals Summary PDF** and timelines.
  - Optionally export JSON/HL7/FHIR in the future.

Generate exports from DB data; do not reuse long-lived object URLs. Exports are generated on demand and presented as short-lived signed downloads.

---

## 10. Monitoring & Alerts

- Storage operations (file uploads, deletions) should be monitored.
- Suspicious patterns (e.g., mass downloads, repeated access token failures) trigger security alerts.
- Access logs are periodically reviewed for anomalies.

