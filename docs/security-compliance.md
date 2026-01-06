# Security & Compliance Checklist – Medi Note
(HIPAA & GDPR Ready – Plain Language)

> This document translates HIPAA and GDPR concepts into **practical, developer-friendly rules** for Medi Note.
> It is designed for a Pakistan-first launch, while keeping the system **ready for US/EU compliance**.

---

## 1. What We Are Protecting (PHI / Personal Data)

### 1.1 Data Classified as Sensitive
Treat the following as **highly sensitive**:
- Medical reports (PDFs, images)
- Diagnoses, conditions, medications
- Vitals and lab results
- Emergency information
- Mental health data (journals, AI psychologist sessions)
- Insurance details

### 1.2 Non-Sensitive (Still Protected)
- Email address
- Account metadata
- App usage metrics (non-PHI only)

Rule: **If in doubt, treat it as sensitive.**

---

## 2. Core Security Principles (Non-Negotiable)

- Least privilege (only minimum access)
- Explicit consent for sharing
- Auditability (who accessed what, when)
- Data minimization
- Secure by default

---

## 3. Authentication & Identity

### Required
- Strong password rules
- Hashed passwords (bcrypt/argon2)
- JWT access tokens with short expiry
- Refresh tokens stored securely

### Client Side
- Store tokens in:
  - SecureStore / Keychain / Keystore
- Never store tokens in AsyncStorage or plaintext

### Session Safety
- Invalidate refresh token on logout
- Detect and log new device logins
- Optional biometric lock (app-level)

---

## 4. Authorization & Access Control

### Profile-Level Access
- A user can only access:
  - their own account
  - profiles under that account
- Doctors can only access:
  - profiles with **active consent**

### Condition-Scoped Access
- If consent is limited to a condition profile:
  - API must enforce filtering
  - No accidental leakage of unrelated data

### Emergency Access
- Emergency access:
  - must be explicitly enabled per profile
  - must be read-only
  - must be logged

---

## 5. Consent Management (HIPAA Core Concept)

### Required Capabilities
- Explicit consent creation
- Defined scope:
  - full profile OR condition profile
- Expiry date or manual revocation
- Consent revocation at any time

### Audit Trail
Every access under consent must log:
- who accessed
- what was accessed
- when
- emergency vs normal

This is mandatory for HIPAA-style auditing.

---

## 6. Data Storage & Encryption

### In Transit
- HTTPS everywhere (TLS 1.2+)
- Reject insecure connections

### At Rest (Backend)
- Encrypt disks (cloud default)
- Encrypt sensitive DB columns if possible:
  - diagnoses
  - notes
  - insurance numbers
- Object storage:
  - private buckets
  - signed URLs only

### On Device
- Do NOT store full reports offline unless necessary
- Cache minimal metadata only
- Allow user to clear local cache

---

## 7. File Upload & Download Safety

- Validate file type server-side
- Accept only:
  - PDF
  - JPEG
  - PNG
- Virus/malware scanning (Phase 2+)
- Signed URLs:
  - short expiry
  - single purpose (upload or view)

---

## 8. Logging & Monitoring

### Allowed in Logs
- request IDs
- timestamps
- endpoint names
- anonymized IDs

### Forbidden in Logs
- report content
- vitals values
- medications
- mental health text
- names, emails, phone numbers

Rule: **Logs must never contain PHI.**

---

## 9. Notifications & Messaging Safety

- Never include PHI in push notifications
- Example:
  - ❌ “Your blood sugar is high”
  - ✅ “You have a new health update”
- Notification tap opens app after auth

---

## 10. AI-Specific Compliance

### Explicit Consent
- User must opt-in before AI usage
- Explain what data is used

### Data Minimization
- Send only:
  - selected report text
  - limited vitals window
- No identifiers sent to AI provider

### Retention
- AI providers:
  - must not retain or train on data (preferred)
- Local AI session storage:
  - user deletable
  - limited retention (e.g., 90 days)

---

## 11. Mental Health Data (Extra Protection)

Treat mental wellness data as **extra-sensitive**:
- Separate storage if possible
- Optional app lock for mental health section
- Clear crisis escalation logic
- Easy “delete all sessions” option

---

## 12. GDPR – User Rights (Plain English)

The system must support:

### Right to Access
- User can view all their data in the app

### Right to Export
- User can request/download:
  - profile summary
  - reports
  - medications
  - vitals

### Right to Rectification
- User can edit incorrect data

### Right to Erasure
- User can delete:
  - a profile
  - their entire account
- Deletion must:
  - remove data
  - or anonymize irreversibly

### Right to Restrict Processing
- User can revoke consents
- AI usage can be disabled

---

## 13. Account & Data Deletion

### Requirements
- Clear confirmation step
- Grace period (optional, e.g., 7 days)
- Background job to:
  - delete DB records
  - delete object storage files
  - invalidate tokens

### Logs
- Keep access logs (without PHI) if legally required
- Anonymize user identifiers where needed

---

## 14. Infrastructure & Vendor Choices

### Minimum Requirements
- Cloud provider with:
  - encryption at rest
  - access controls
  - audit logs
- Database backups:
  - encrypted
  - limited retention

### Third Parties
- Sign DPAs when possible
- Avoid vendors that:
  - retain medical data
  - use data for training by default

---

## 15. Incident Response Plan (Basic)

If a breach is suspected:
1. Disable affected access paths
2. Rotate credentials
3. Assess scope (what data, how many users)
4. Notify users if required
5. Document incident and fix root cause

---

## 16. What HIPAA Does *Not* Require (Common Myths)

- HIPAA certification (doesn’t exist)
- On-prem servers
- Zero bugs
- FDA approval

HIPAA requires **reasonable safeguards**, not perfection.

---

## 17. Compliance Readiness Checklist

### Phase 1 (MVP)
- [ ] HTTPS everywhere
- [ ] Secure auth
- [ ] No PHI in logs
- [ ] Basic access control
- [ ] Clear privacy policy draft

### Phase 2 (v1.0)
- [ ] Consent management
- [ ] Access logs
- [ ] Emergency access logging
- [ ] Data export
- [ ] AI opt-in

### Phase 3 (v2.0)
- [ ] Column-level encryption
- [ ] Vendor DPAs
- [ ] Advanced audit trails
- [ ] Regular security review

---

## 18. Final Guiding Rule

If a feature:
- surprises the user about data use
- hides access history
- shares data without consent

→ **it is not compliant**, even if technically clever.

Compliance is about **trust**, not paperwork.
