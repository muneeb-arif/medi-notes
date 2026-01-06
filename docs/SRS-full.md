# Medi Note – Comprehensive Software Requirements Specification (Full)

> This is the **full SRS** for the Medi Note mobile application.  
> It combines functional requirements, non‑functional requirements, architecture, security, compliance, and future roadmap into a single reference.

---

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to define the complete set of requirements and high‑level architecture for the **Medi Note** application – a patient‑centric health records app for managing personal and family medical data, sharing it securely with doctors, and enabling future AI‑based assistance.

This document is intended for:

- Product owner / founder  
- Designers & engineers  
- Security & compliance reviewers  
- Potential partners (clinics, hospitals, insurers)

### 1.2 Scope

Medi Note is a **mobile application (iOS & Android)** built with **React Native (Expo)** and a cloud backend. It allows:

- Individuals to manage their own and family members’ health records.
- Patients to store and view lab reports, prescriptions, vitals, medications, surgeries, insurance, and doctor information.
- Users to present a concise **Emergency profile** in critical situations.
- Patients to share selected data with doctors using consents, secure links, and QR codes.
- In future, AI modules to summarize history, explain reports, and assist with mental health and risk prediction.

The system initially targets users in **Pakistan** but is designed to be **HIPAA/GDPR‑ready** for future global expansion.

---

## 2. Product Overview

### 2.1 High‑Level Features

1. **User Account & Authentication**
   - Email / password login & registration.
   - Multi‑device access.
   - Optional biometric app lock.

2. **Person Profiles (Self + Family)**
   - Create multiple profiles under one account.
   - Each person has demographic info, emergency contacts, medical identity, and insurance.

3. **Condition Profiles (Sub‑Profiles per person)**
   - Within a person profile, user may create multiple “Condition Profiles” such as:
     - General health
     - Cardiology
     - Endocrinology / Diabetes
     - Psychology / Mental Health
     - ED / Fertility
   - Each condition profile can be shared independently with a doctor.

4. **Medical Records Management**
   - Upload and view lab reports, scans, prescriptions as PDFs/images.
   - Tag reports by type, specialty, and condition.
   - Attach doctor and clinic info.

5. **Vitals & Health Logs**
   - Track metrics like blood pressure, heart rate, temperature, blood glucose, weight.
   - Show recent readings and historical trends.

6. **Medications**
   - Maintain ongoing and past medication list.
   - Store dosage, frequency, schedule, instructions.
   - Organize by Ongoing / Past / Daily / Weekly / SOS.

7. **Appointments & Doctor Information**
   - Store upcoming & past appointments.
   - Save doctor profiles and preferred hospitals.
   - (Future) Doctor onboarding and verification.

8. **Emergency Profile**
   - Separate screen showing critical info only:
     - Name, age, blood group.
     - Allergies.
     - Chronic conditions.
     - Implants/devices.
     - Risk flags.
     - Current critical medications.
     - ICE contacts.
   - Optionally accessible without login if user enables it.

9. **Notifications & Reminders**
   - Medication reminders.
   - Appointment reminders.
   - Report upload confirmations.
   - Security alerts (new device, emergency access used, profile shared, etc.).

10. **Consent, Sharing & Access Logs**
    - Grant & revoke consents for specific doctors.
    - Generate temporary access links/QR that reference a profile or condition profile.
    - View access logs of who accessed which data and when.
    - Emergency access logging.

11. **Insurance & Billing**
    - Store insurance card details and photos.
    - Record claims / visit summaries (future).

12. **AI Assistants (Future)**
    - Personal health assistant that:
      - Summarizes history.
      - Explains lab reports in plain language.
      - Suggests follow‑up questions for doctor visits.
    - AI psychologist:
      - Journaling and CBT‑style reflective prompts.
    - Family‑tree risk engine:
      - Creates family graph from linked profiles.
      - Highlights possible hereditary risks.

13. **WhatsApp & Integrations (Future)**
    - Share generated PDFs or secure links via WhatsApp.
    - (Future) Parse incoming lab reports shared via WhatsApp or email to auto‑attach to profiles.

---

## 3. Users & Personas

### 3.1 Primary Personas

1. **Self‑Manager (Age 25–45)**
   - Tech‑savvy, manages their own diabetes/hypertension, wants all reports in one place.

2. **Family Caregiver**
   - Manages parents’ and children’s records.
   - Needs multi‑profile, multi‑condition support.

3. **Frequent Patient**
   - Visits multiple specialists (cardiologist, fertility clinic, psychiatrist).
   - Needs to share **only relevant** history with each doctor.

### 3.2 Secondary Personas

1. **Doctor / Specialist**
   - Receives structured summary.
   - Uploads summary report/notes.

2. **Clinic / Hospital Admin (Future)**
   - Integrates patient records with clinic EMR.

---

## 4. Functional Requirements (Module‑Wise)

### 4.1 Authentication & Account

**FR‑AUTH‑01** User can register using email and password.  
**FR‑AUTH‑02** User can log in using email and password.  
**FR‑AUTH‑03** The system must validate email format and password strength.  
**FR‑AUTH‑04** If login fails, user sees a clear error without revealing internal details.  
**FR‑AUTH‑05** Users can log out and clear local tokens.  
**FR‑AUTH‑06** Users can request password reset via email.  
**FR‑AUTH‑07** (Future) Users can enable biometric app lock (Face ID / Touch ID / fingerprint).  

### 4.2 Person Profiles

**FR‑PROF‑01** User can create multiple person profiles (self + family).  
**FR‑PROF‑02** Each profile records: name, gender, DOB, relation to user, blood type, height, weight, primary language, photo.  
**FR‑PROF‑03** Each profile records emergency contacts (name, relation, phone).  
**FR‑PROF‑04** User can edit existing profiles.  
**FR‑PROF‑05** User can mark one profile as “You / primary”.  
**FR‑PROF‑06** User can delete a profile (with confirmation).  
**FR‑PROF‑07** Deleting a profile must also mark all associated records for deletion.  
**FR‑PROF‑08** User can toggle:
  - “Allow doctors to view my profile”.
  - “Allow emergency access without login”.  

### 4.3 Condition Profiles (Sub‑Profiles)

**FR‑COND‑01** For each person profile, user can create multiple condition profiles.  
**FR‑COND‑02** Condition profile fields: name/label, specialty (Cardiology, ED, Psychology…), notes.  
**FR‑COND‑03** User can set one condition profile as primary.  
**FR‑COND‑04** When adding reports, vitals, meds, and appointments, user can optionally link them to a specific condition profile.  
**FR‑COND‑05** Sharing to a doctor can be scoped to:
  - Full person profile (all conditions).
  - Single condition profile only.  

### 4.4 Medical Records & Reports

**FR‑REP‑01** User can upload PDF or image files as reports.  
**FR‑REP‑02** Each report contains: title, date, type (Lab, Radiology, Visit Note, Prescription, Discharge, Other), facility/hospital, doctor, tags, and linked condition profile.  
**FR‑REP‑03** User can view the report preview (PDF/image viewer).  
**FR‑REP‑04** User can filter reports by type, date range, condition profile.  
**FR‑REP‑05** User can download a report file to device.  
**FR‑REP‑06** User can delete a report (with confirmation).  
**FR‑REP‑07** User can mark a report as important or include in emergency view.  
**FR‑REP‑08** Doctor users (future) can upload reports directly into a profile they have access to.  

### 4.5 Vitals

**FR‑VIT‑01** User can record vital readings (BP, HR, Temp, Glucose, Weight, etc.).  
**FR‑VIT‑02** Each vital reading stores type, value (structured), unit, date/time, and optional condition profile.  
**FR‑VIT‑03** Users can view a dashboard showing latest readings.  
**FR‑VIT‑04** Users can see historical charts/trends for each vital type.  
**FR‑VIT‑05** Users can delete or correct a reading.  

### 4.6 Medications

**FR‑MED‑01** User can add medications with fields: drug name, dosage, unit, frequency, schedule, start date, stop date, notes.  
**FR‑MED‑02** Medications can be categorized as Ongoing, Past, Daily, Weekly, SOS.  
**FR‑MED‑03** User can view medication lists filtered by category.  
**FR‑MED‑04** User can archive or mark medications as completed.  
**FR‑MED‑05** User can link medications to condition profiles.  
**FR‑MED‑06** User receives reminders based on medication schedules (if enabled).  

### 4.7 Appointments & Doctors

**FR‑DOC‑01** User can save doctor profiles with: name, specialty, hospital/clinic, phone, email, notes.  
**FR‑DOC‑02** User can see doctor contact info and initiate call or email.  
**FR‑APPT‑01** User can log and view upcoming and past appointments, linked to a doctor and person profile.  
**FR‑APPT‑02** Appointment fields: date/time, location, doctor, reason, notes, outcome.  
**FR‑APPT‑03** User receives reminders for upcoming appointments (if enabled).  
**FR‑APPT‑04** (Future) Doctors can manage appointments and availability from their own interface.  

### 4.8 Emergency Profile

**FR‑EMR‑01** Each person profile has an automatically assembled Emergency Info view.  
**FR‑EMR‑02** Emergency view shows:
  - Name, age, gender, blood type.
  - Allergies.
  - Critical medications.
  - Chronic conditions.
  - Devices/implants.
  - Important risk flags (e.g., anesthesia sensitivity, anticoagulants in use).
  - Primary doctor & emergency contacts.  
**FR‑EMR‑03** User can configure which fields are visible in emergency view.  
**FR‑EMR‑04** User can enable emergency access without login; in that case emergency screen is accessible via lock screen shortcut or QR.  
**FR‑EMR‑05** Every emergency access event is logged in AccessLog as emergency mode.  

### 4.9 Notifications

**FR‑NOTIF‑01** App supports a notification center with tabs: All, Appointments, Medications, Reports, Security.  
**FR‑NOTIF‑02** Notifications show summary text without PHI details.  
**FR‑NOTIF‑03** Tapping a notification navigates to the relevant screen (report viewer, appointment, etc.).  
**FR‑NOTIF‑04** Security notifications include:
  - new device login,
  - emergency access used,
  - profile shared via link/QR.  
**FR‑NOTIF‑05** Users can control notification types in Settings.  

### 4.10 Consent, Sharing & Access Logs

**FR‑CONS‑01** Users can view active and past consents per person profile / condition profile.  
**FR‑CONS‑02** User can create a new consent specifying:
  - doctor,
  - scope (full profile vs. condition profile),
  - duration/expiry,
  - allowed actions (view only or upload reports).  
**FR‑CONS‑03** User can revoke consents at any time.  
**FR‑CONS‑04** System maintains an AccessLog of all relevant events:
  - profile viewed,
  - report opened,
  - report downloaded,
  - exported summary generated,
  - emergency access invoked.  
**FR‑CONS‑05** Access logs are visible to patient in Settings.  

### 4.11 Insurance & Billing

**FR‑INS‑01** Users can store insurance policies per person profile.  
**FR‑INS‑02** Policy fields: provider, plan name, member id, policy number, expiry date, card images (front/back).  
**FR‑INS‑03** User can mark preferred policy.  
**FR‑INS‑04** (Future) User can log claims and reimbursement details.  

### 4.12 AI Features (Future)

**FR‑AI‑01** Health AI can create a plain‑language summary of a person’s medical history.  
**FR‑AI‑02** Health AI can explain a specific report (e.g., blood test).  
**FR‑AI‑03** AI must present information as guidance, not diagnosis; include disclaimers.  
**FR‑AI‑04** Psychologist AI can provide journaling prompts and cognitive reframing suggestions.  
**FR‑AI‑05** Family risk engine can compute risk flags based on:
  - family relations,
  - conditions across family tree,
  - demographics.  

### 4.13 WhatsApp & Integrations (Future)

**FR‑INT‑01** User can share profile summaries and reports via WhatsApp using secure links.  
**FR‑INT‑02** Shared links are short‑lived, token‑based, and read‑only.  
**FR‑INT‑03** (Future) System can ingest selected incoming reports from WhatsApp/email and attach them to profiles after user confirmation.  

---

## 5. Non‑Functional Requirements

### 5.1 Performance

- NFR‑PERF‑01: Home dashboard must load in < 3 seconds on a typical 4G network.  
- NFR‑PERF‑02: Report viewer must open within 5 seconds for files up to 10 MB.  
- NFR‑PERF‑03: API endpoints should generally respond within 500–1000 ms under normal load.

### 5.2 Security & Privacy

- End‑to‑end encryption using TLS.
- Encrypted storage for PHI.
- No PHI in logs or analytics events.
- Access control enforced at API level using user identity and consent rules.
- Emergency access heavily logged.
- Compliance‑oriented features: explicit consent for AI, data export/deletion.

### 5.3 Availability & Reliability

- Target uptime 99% for production backend.
- Daily database backups with 7–30 day retention.
- Graceful degradation: if some services fail (e.g., AI), core record access must still work.

### 5.4 Usability

- Simple, non‑technical language in UI.
- Clear sectioning by profile, condition, module (reports, meds, vitals).
- Large touch targets and legible fonts, suitable for older patients.

---

## 6. High‑Level Architecture (Summary)

The architecture follows the structure described in `architecture.md`:

- Mobile app: Expo + React Native, feature‑based architecture, React Navigation, React Query, Zustand.
- Backend: modular services for auth, profiles, records, consents, notifications, AI.
- Storage: PostgreSQL + object storage (R2/S3).
- Security: JWT auth, signed URLs, access logs, consent enforcement.

---

## 7. Data Model Summary

Entities:

- Account, PersonProfile, ConditionProfile, FamilyRelation  
- Report, VitalReading, Medication, ConditionDiagnosis, Surgery  
- Doctor, Clinic, Appointment, ChatThread, ChatMessage  
- ConsentGrant, AccessLog, TemporaryAccessToken  
- InsurancePolicy, InsuranceClaim (future)  
- AiSession, AiMessage, RiskFlag (future)

See `domain-model.md` for full definitions.

---

## 8. Compliance & Legal

- Designed to be HIPAA/GDPR‑ready:
  - Right to access → export summaries.
  - Right to erasure → account/profile deletion.
  - Consent tracking → ConsentGrant & AccessLog tables.
- Country‑specific compliance (Pakistan first, US/EU later) handled via deployment choices.

---

## 9. Roadmap Alignment

This SRS is aligned with the phased roadmap:

1. MVP patient app.
2. Doctor access & consents.
3. Condition profiles & family tree.
4. AI assistants.
5. Integrations and enterprise partnerships.

