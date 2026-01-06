# Architecture – Medi Note

## 1. Architectural Style
- **Mobile App (Expo) with TypeScript**
- **Backend (REST API)** running on Supabase/AWS hybrid
- **Feature-based modular architecture**
- **Cloud object storage for reports**
- **React Query for data lifecycle**
- **Zustand for UI/session state**
- **API + Consent-driven authorization model**
- Future-ready for HIPAA/GDPR compliance.

---

## 2. Mobile Architecture

### 2.1 Layers
- **Presentation Layer**
  - Screens
  - Components
  - Navigation
- **Domain Layer**
  - Types & interfaces
  - Validation schemas
  - Business rules
- **Data Layer**
  - React Query hooks
  - API clients
  - Storage services

### 2.2 Key Modules
- Auth
- Profiles
- Condition Profiles
- Reports
- Medications
- Vitals
- Doctors
- Appointments
- Notifications
- Consent & Access
- Emergency
- Settings

---

## 3. Backend Architecture

### 3.1 Service Modules
- Auth Service
- Profile Service
- Condition Profile Service
- Reports Service
- Vitals Service
- Medications Service
- Appointments Service
- Consent & Access Service
- Notification Service
- AI Service (separate microservice)
- Share/Token Service

### 3.2 Data Flow
1. App triggers API call via React Query.
2. Backend verifies:
   - Authentication
   - Consent rules
   - Access scope
3. Backend retrieves/enriches data.
4. Backend returns secure response.
5. App caches with React Query.

---

## 4. Storage Architecture
### 4.1 Database
- PostgreSQL (Supabase → AWS RDS)
- Separate schemas for:
  - profiles
  - medical data
  - audit logs
  - consent records

### 4.2 File Storage
- Cloudflare R2 / AWS S3
- Strict private buckets
- Signed URLs for temporary access

### 4.3 Caching
- React Query caching on client
- Optional Redis on backend (future for AI/doctor search)

---

## 5. Security
- End-to-end HTTPS
- Signed URLs for file access
- JWT access + refresh tokens
- Consent-based authorization
- Access logs for every sensitive action
- No PHI in logs, notifications, or error messages

---

## 6. Future-Ready Extensions
### Doctor Onboarding
- Doctor accounts + clinics
- Write access for uploading reports

### AI Services
- Summaries, health advice, report explanation
- Psychologist assistant
- Risk prediction & family tree analysis

### Integrations
- WhatsApp messaging + report import
- Wearables (Fitbit, Samsung Health, Apple Health)
