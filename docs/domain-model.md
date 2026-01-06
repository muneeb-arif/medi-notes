# Domain Model – Medi Note

This file defines the data structures, entities, and relationships in the system.

---

## 1. Account & Authentication

### Account
- id
- email
- phone
- createdAt
- settings
- preferences

### Session
- accessToken
- refreshToken
- device metadata

---

## 2. Person Profile

### PersonProfile
- id
- accountId
- fullName
- dateOfBirth
- gender
- relationToAccount
- bloodType
- height
- weight
- allergies[]
- chronicConditions[]
- emergencyContactName
- emergencyContactPhone
- emergencyAccessEnabled
- doctorSharingEnabled
- insuranceIds[]
- photoUrl
- lastUpdatedAt

---

## 3. Condition Profiles

### ConditionProfile
- id
- personProfileId
- label (General, Cardiology, ED, Psychology, etc.)
- description
- isPrimary
- specialty
- createdAt
- updatedAt

Any medical record (report, vital, medication) may link to a condition profile.

---

## 4. Medical Records

### Report
- id
- personProfileId
- conditionProfileId?
- title
- type (Lab, Scan, DoctorNote, Prescription…)
- fileUrl
- fileType
- date
- doctorName?
- tags
- includeInEmergencyView
- createdAt
- updatedAt

### VitalReading
- id
- personProfileId
- conditionProfileId?
- type (BP, HR, Temp, Glucose…)
- value struct
- unit
- source
- recordedAt

### Medication
- id
- personProfileId
- conditionProfileId?
- name
- genericName
- dose
- frequency
- schedule
- startDate
- endDate
- notes
- status (Ongoing, Completed, Paused)

---

## 5. Appointments & Doctors

### Doctor
- id
- fullName
- specialties[]
- experienceYears
- contact info
- clinics[]

### Appointment
- id
- personProfileId
- doctorId
- clinicId
- scheduledFor
- mode (Video, InPerson)
- notes
- status

---

## 6. Consent & Sharing

### ConsentGrant
- id
- grantorAccountId
- personProfileId
- conditionProfileId?
- doctorId
- accessScope (Full, Limited, EmergencyOnly)
- expiresAt

### AccessLog
- id
- actorType (Doctor/Patient/System)
- actorId
- personProfileId
- conditionProfileId?
- action
- metadata
- timestamp
- emergencyMode

### TemporaryAccessToken
- id
- token
- personProfileId
- conditionProfileId?
- grantee
- expiresAt

---

## 7. Notifications

### Notification
- id
- type (Appointment, Medication, Report, Security)
- personProfileId
- message (not containing PHI)
- createdAt
- readAt?

---

## 8. Insurance

### InsurancePolicy
- id
- personProfileId
- providerName
- policyNumber
- memberId
- expiryDate
- frontImageUrl
- backImageUrl
- notes

---

## 9. AI

### AiSession
- id
- accountId
- personProfileId?
- conditionProfileId?
- aiType (Health, Psychology, Risk)
- createdAt

### AiMessage
- id
- sessionId
- role (User, Assistant)
- content
- timestamp
