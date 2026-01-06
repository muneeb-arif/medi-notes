# Medi Note – Software Requirements Specification (Functional Core)

> This is the **engineering‑focused SRS**.  
> It contains only functional and non‑functional requirements (no business/architecture/monetization details).

---

## 1. Purpose & Scope

The Medi Note app enables users to:

- Create and manage personal and family medical profiles.
- Store and retrieve medical records (reports, vitals, medications).
- Present an emergency profile.
- Share selected data with doctors under explicit consent.
- Receive reminders for medications and appointments.

The app targets iOS and Android mobile platforms.

---

## 2. Actors

- **User (Account Owner)** – registered person managing profiles.
- **Person Profile** – each represented individual (self, spouse, child, parent).
- **Doctor (Future)** – medical professional with controlled access.
- **System** – backend APIs, storage, notification services.

---

## 3. Functional Requirements

### 3.1 Registration & Authentication

FR‑AUTH‑01 User can register with email and password.  
FR‑AUTH‑02 User can log in with valid credentials.  
FR‑AUTH‑03 User can log out and revoke session locally.  
FR‑AUTH‑04 The system must prevent access to protected content without authentication.  
FR‑AUTH‑05 User can initiate a password reset via email.  
FR‑AUTH‑06 The app must support multiple concurrent sessions (phone + tablet).  

### 3.2 Person Profile Management

FR‑PROF‑01 User can create at least 10 person profiles under one account.  
FR‑PROF‑02 Each profile includes required fields: full name, date of birth, gender, relation to user.  
FR‑PROF‑03 Optional fields: blood type, height, weight, photo, language, notes.  
FR‑PROF‑04 Each profile has one or more emergency contacts with name and phone.  
FR‑PROF‑05 User can edit profile fields at any time.  
FR‑PROF‑06 User can switch active profile from a profile list screen.  
FR‑PROF‑07 User can delete a profile; system asks for confirmation.  
FR‑PROF‑08 Deleting a profile must remove or mark for deletion all associated medical records.  
FR‑PROF‑09 Settings per profile:
  - toggle “Allow doctors to view my profile”.
  - toggle “Allow emergency access without login”.

### 3.3 Condition Profiles (Sub‑Profiles)

FR‑COND‑01 For each person profile, user can create multiple condition profiles.  
FR‑COND‑02 Each condition profile has a label (text) and optional specialty.  
FR‑COND‑03 User can edit and delete condition profiles (except if referenced by active consents).  
FR‑COND‑04 When creating or editing records, user can select an associated condition profile.  
FR‑COND‑05 The system must be able to filter lists (reports, meds, appointments) by condition profile.  

### 3.4 Medical Reports

FR‑REP‑01 User can upload files as reports (PDF, JPEG, PNG).  
FR‑REP‑02 Each report must be associated with a person profile and may be associated with a condition profile.  
FR‑REP‑03 Required report metadata: title, report date, report type.  
FR‑REP‑04 Optional metadata: doctor name, facility, tags, notes, includeInEmergencyView flag.  
FR‑REP‑05 User can view a list of reports for a profile, sorted by date (newest first).  
FR‑REP‑06 User can view an individual report with embedded viewer.  
FR‑REP‑07 User can filter reports by type and tags.  
FR‑REP‑08 User can delete a report.  
FR‑REP‑09 System must prevent upload of unsupported file types.  

### 3.5 Vitals

FR‑VIT‑01 User can record vitals for a person profile with fields:
  - type
  - value (structured, e.g., systolic/diastolic)
  - unit
  - date/time.  
FR‑VIT‑02 User can optionally associate a vital with a condition profile.  
FR‑VIT‑03 User can view latest readings on a vitals dashboard.  
FR‑VIT‑04 User can view a chronological list or chart of readings by vital type.  
FR‑VIT‑05 User can delete a vital record.  

### 3.6 Medications

FR‑MED‑01 User can add medications for a person profile with fields:
  - name
  - dose
  - doseUnit
  - frequency
  - schedule string
  - startDate
  - optional endDate
  - notes.  
FR‑MED‑02 Medications can be marked as Ongoing, Paused, Completed.  
FR‑MED‑03 User can view lists of medications:
  - Ongoing
  - Past
  - Daily / Weekly / SOS (filter tabs).  
FR‑MED‑04 User can edit and delete medications.  
FR‑MED‑05 System must be able to generate reminder events from medication schedules (if enabled).  

### 3.7 Appointments

FR‑APPT‑01 User can create appointments for a person profile.  
FR‑APPT‑02 Appointment fields: date/time, doctor, location/clinic, mode (InPerson/Online), reason, notes.  
FR‑APPT‑03 User can view upcoming and past appointments separately.  
FR‑APPT‑04 User can edit and cancel appointments.  
FR‑APPT‑05 System generates appointment reminders (notification) configurable in settings.  

### 3.8 Doctors

FR‑DOC‑01 User can create local doctor entries with name, specialty, phone, email, hospital.  
FR‑DOC‑02 User can edit and delete doctor entries.  
FR‑DOC‑03 Appointment creation screen must allow selecting existing doctor or adding a new one.  
FR‑DOC‑04 (Future) Doctors as a separate authenticated role may view shared profiles within granted access.  

### 3.9 Emergency Information

FR‑EMR‑01 System must generate an Emergency Info view per person profile using a subset of stored data.  
FR‑EMR‑02 Emergency Info must be read‑only and not editable directly; changes are made in the main profile and medical records.  
FR‑EMR‑03 If “Allow emergency access without login” is enabled for a profile, the emergency view must be accessible from app entry or via special link/QR.  
FR‑EMR‑04 Each emergency access must create an AccessLog entry flagged as emergency.  

### 3.10 Notifications

FR‑NOTIF‑01 The app must display a notifications list with filter tabs for:
  - Appointments
  - Medications
  - Reports
  - Security  
FR‑NOTIF‑02 Tapping a notification navigates to its target screen.  
FR‑NOTIF‑03 User can mark notifications as read.  
FR‑NOTIF‑04 User can configure which notification types are enabled per account.  

### 3.11 Consent & Sharing

FR‑CONS‑01 User can create a consent record granting a doctor access to:
  - either a full person profile
  - or a specific condition profile.  
FR‑CONS‑02 Consent must define an expiry date or be indefinite until revoked.  
FR‑CONS‑03 User can revoke an active consent at any time.  
FR‑CONS‑04 System must prevent doctor access to profiles without valid consent.  
FR‑CONS‑05 System must maintain access logs for:
  - profile views
  - report views/downloads
  - emergency accesses
  - share link usage.  
FR‑CONS‑06 User can view access logs in a dedicated screen.  

### 3.12 Insurance

FR‑INS‑01 User can add insurance policies for a person profile.  
FR‑INS‑02 User can view, edit, and delete insurance entries.  

---

## 4. Non‑Functional Requirements

### 4.1 Security

NFR‑SEC‑01 All network communication must use HTTPS/TLS.  
NFR‑SEC‑02 Authentication tokens must be stored in secure storage where supported by platform.  
NFR‑SEC‑03 No PHI may be written to device logs or analytics.  
NFR‑SEC‑04 Error messages must not reveal implementation details or PHI.  

### 4.2 Performance

NFR‑PERF‑01 The app must remain responsive on mid‑range Android devices with 3–4 GB RAM.  
NFR‑PERF‑02 Listing up to 500 reports for a profile must complete within 2 seconds on a normal connection.  

### 4.3 Reliability

NFR‑REL‑01 Core data (profiles, reports metadata, vitals, meds, appointments) must be persisted on backend; loss of local cache must not lose critical data.  
NFR‑REL‑02 The system must handle transient network failures with retry patterns at API/client level where appropriate.  

### 4.4 Usability

NFR‑USAB‑01 Text and icons must be legible for older users (min font 14–16 pt for body).  
NFR‑USAB‑02 Navigation must be logically grouped by features (Home, Profiles, Reports, Medications, Notifications, Settings).  

### 4.5 Internationalization

NFR‑I18N‑01 First release may be English‑only but architecture should allow Urdu/localization in future.  

---

## 5. Constraints & Assumptions

- The mobile app will be built using Expo + React Native.
- Internet connectivity is required for core operations (no offline full PHI storage in v1).
- Initial deployment will target a non‑HIPAA cloud but design is HIPAA/GDPR capable.
- External AI services, if used, will be integrated in later phases and not required for MVP.

