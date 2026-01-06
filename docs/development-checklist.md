# Development Priority Checklist – Medi Note

> Plan type: **Option A – 3 Phases (MVP → v1.0 → v2.0)**  
> Audience: You (solo dev) + any future dev/design help.  
> Goal: Ship useful value fast, keep scope under control, and evolve towards the full SRS.

---

## Phase 1 – MVP (Foundations + Core Patient App)

**Goal:** A fully working patient app for a single user managing self + family, with core records, basic security, and no doctors/AI yet.  
**Target:** First real users in Pakistan, no external doctors portal.

### 1. Environment & Project Setup

- [ ] Create Expo + TypeScript project.
- [ ] Add base dependencies:
  - [ ] React Navigation (stack + tabs)
  - [ ] React Query
  - [ ] Zustand
  - [ ] React Hook Form + Zod
  - [ ] HTTP client (axios or fetch wrapper)
- [ ] Configure `tsconfig` paths (`@features`, `@components`, `@theme`, etc.).
- [ ] Add ESLint + Prettier and run once to clean code.
- [ ] Add `.env` handling for dev/staging/prod.

### 2. Theme, Layout & Shared Components

- [ ] Implement theme system based on `theme/` docs:
  - [ ] colors.ts
  - [ ] typography.ts
  - [ ] spacing.ts
  - [ ] radius.ts
- [ ] Build base layout components:
  - [ ] `Screen` (SafeArea + ScrollView / FlatList wrapper)
  - [ ] `AppBar` (title + back/action icons)
  - [ ] `SectionHeader`
- [ ] Build generic UI components:
  - [ ] `Button`, `IconButton`
  - [ ] `Card`
  - [ ] `Avatar`
  - [ ] `TagPill` / `Chip`
  - [ ] `EmptyState`
  - [ ] `ListItem`
  - [ ] `ToggleRow`
- [ ] Confirm all screens in MVP use these shared components (no inline ad-hoc styling where avoidable).

### 3. Navigation Skeleton

- [ ] Implement `RootNavigator`:
  - [ ] Auth stack (Login/Register/Forgot)
  - [ ] Main tabs (Home, Profiles, Reports, Notifications, Settings)
- [ ] Implement per-tab stacks:
  - [ ] `HomeStack`
  - [ ] `ProfileStack`
  - [ ] `ReportsStack`
  - [ ] `SettingsStack`
- [ ] Wire placeholder screens to ensure navigation works end-to-end.

### 4. Auth & Session (Basic)

_Backend assumptions for MVP: single REST API with auth, profiles & records._

- Backend:
  - [ ] Implement `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`.
  - [ ] Implement `/account/me`.
- Frontend:
  - [ ] `auth.service.ts` using `apiClient`.
  - [ ] `session.store.ts` (tokens, active account).
  - [ ] Login / Register / Logout flows.
  - [ ] Protect main app behind auth gate.

### 5. Profiles (Person Profiles only – no condition profiles yet)

- Backend:
  - [ ] Endpoints:
    - [ ] `GET /profiles`
    - [ ] `POST /profiles`
    - [ ] `GET /profiles/{id}`
    - [ ] `PATCH /profiles/{id}`
    - [ ] `DELETE /profiles/{id}`
  - [ ] Model: `PersonProfile` as per `domain-model.md`.
- Frontend:
  - [ ] `profiles/types.ts` for `PersonProfile`.
  - [ ] `profiles/api/profiles.api.ts` CRUD.
  - [ ] `profiles/hooks/useProfiles.ts` (list, detail, create/update/delete).
  - [ ] Screens:
    - [ ] `ManageProfilesScreen` (list + add button).
    - [ ] `ProfileEditorScreen` (create/edit).
    - [ ] `MedicalProfileScreen` (view profile summary).
  - [ ] UI flows:
    - [ ] Switch active profile.
    - [ ] Delete profile with confirmation modal.
  - [ ] Respect per-profile flags:
    - [ ] `emergencyAccessEnabled` toggle in editor (UI only for now).

### 6. Reports (Basic)

_No doctors, sharing, or fancy filters yet. Just upload & view._

- Backend:
  - [ ] Implement signed upload URL endpoint.
  - [ ] Implement:
    - [ ] `POST /profiles/{id}/reports/upload-url`
    - [ ] `POST /profiles/{id}/reports`
    - [ ] `GET /profiles/{id}/reports`
    - [ ] `GET /profiles/{id}/reports/{reportId}`
    - [ ] `DELETE /profiles/{id}/reports/{reportId}`
- Frontend:
  - [ ] `reports/types.ts` for `Report`.
  - [ ] `reports/api/reports.api.ts` (upload + metadata create/list/get/delete).
  - [ ] `reports/hooks/useReports.ts`.
  - [ ] Screens:
    - [ ] `ReportsListScreen` (list per active profile).
    - [ ] `AddReportScreen` (file picker + metadata form).
    - [ ] `ReportViewerScreen` (PDF/image).
  - [ ] Error handling for:
    - [ ] failed upload
    - [ ] unsupported file type
    - [ ] missing file.

### 7. Vitals (Core subset)

- Backend:
  - [ ] `POST /profiles/{id}/vitals`
  - [ ] `GET /profiles/{id}/vitals`
  - [ ] `DELETE /profiles/{id}/vitals/{vitalId}`
- Frontend:
  - [ ] `vitals/types.ts` for `VitalReading`.
  - [ ] `vitals/api/vitals.api.ts`.
  - [ ] `vitals/hooks/useVitals.ts`.
  - [ ] Screens:
    - [ ] `VitalsDashboardScreen` (simple cards).
    - [ ] `VitalsHistoryScreen` (list; charts can wait until v1.0).
  - [ ] Support at least BP, glucose, HR, weight.

### 8. Medications (List Only)

_Keep Phase 1 simple: no reminders or complex schedules._

- Backend:
  - [ ] `POST /profiles/{id}/medications`
  - [ ] `GET /profiles/{id}/medications`
  - [ ] `PATCH /profiles/{id}/medications/{medId}`
  - [ ] `DELETE /profiles/{id}/medications/{medId}`
- Frontend:
  - [ ] `medications/types.ts`.
  - [ ] `medications/api/medications.api.ts`.
  - [ ] `medications/hooks/useMedications.ts`.
  - [ ] `MedicationsListScreen` (ongoing & past).
  - [ ] `MedicationEditorScreen`.

### 9. Home Dashboard (MVP Version)

- [ ] Show:
  - [ ] Active profile summary (name, age, basic stats).
  - [ ] Shortcuts: Profile, Reports, Medications, Vitals.
  - [ ] Recent reports (last 3–5).
  - [ ] Recent vitals.
- [ ] Pull from existing hooks (no new backend endpoints needed).

### 10. Settings (MVP Version)

- [ ] Simple screen with:
  - [ ] Account info (email, name).
  - [ ] Language placeholder.
  - [ ] Logout button.
- [ ] No advanced privacy or notification settings yet.

### 11. Security & Privacy Checklist (Phase 1)

- [ ] Force HTTPS in all environments.
- [ ] Do not log any PHI on client or server.
- [ ] Tokens stored in SecureStore / encrypted storage where available.
- [ ] Basic rate limiting on auth endpoints.
- [ ] Data model ready for consents/access logs later (but not implemented yet).

### 12. Testing Checklist (Phase 1)

- [ ] Unit tests:
  - [ ] `calculateAge` and date utilities.
  - [ ] Vital utilities if any.
- [ ] Manual flows:
  - [ ] Register → Login → Create profile → Add report → View report.
  - [ ] Add vitals → view in history.
  - [ ] Add medications → view list.
  - [ ] Logout/login again and verify data persists.
- [ ] Smoke test on:
  - [ ] 1 Android device (real).
  - [ ] 1 iOS device (if available via Expo Go).

---

## Phase 2 – v1.0 (Polished Patient App + Consent + Condition Profiles)

**Goal:** Turn MVP into a polished product with condition profiles, emergency view, consents, early notifications, and improved UX.

### 1. Condition Profiles (Sub-Profiles)

- Backend:
  - [ ] Implement `ConditionProfile` model & migrations.
  - [ ] Endpoints under `/profiles/{id}/conditions`.
  - [ ] Add optional `conditionProfileId` to:
    - [ ] reports
    - [ ] vitals
    - [ ] medications
    - [ ] appointments.
- Frontend:
  - [ ] `conditionProfiles/types.ts`.
  - [ ] `conditionProfiles/api/conditionProfiles.api.ts`.
  - [ ] `conditionProfiles/hooks/useConditionProfiles.ts`.
  - [ ] UI:
    - [ ] Condition profile selector inside Profile and relevant forms.
    - [ ] Basic management screen to add/edit/delete condition profiles.
  - [ ] Update:
    - [ ] Add/Edit report → allow selecting condition profile.
    - [ ] Vital entry → allow optional condition profile.
    - [ ] Medications → allow optional condition profile.

### 2. Emergency Profile (Read-Only View)

- Backend:
  - [ ] `/profiles/{id}/emergency` endpoint using current stored data.
- Frontend:
  - [ ] `EmergencyInfoScreen`:
    - [ ] Strict layout: critical info only.
    - [ ] Read-only.
  - [ ] Add emergency card on Home.
  - [ ] Respect `emergencyAccessEnabled` flag from profile.

### 3. Consent & Access Logs (Basic Implementation)

- Backend:
  - [ ] `ConsentGrant` & `AccessLog` models.
  - [ ] Endpoints for:
    - [ ] `GET /profiles/{id}/consents`
    - [ ] `POST /profiles/{id}/consents`
    - [ ] `POST /profiles/{id}/consents/{consentId}/revoke`
    - [ ] `GET /profiles/{id}/access-logs`
  - [ ] AccessLog writes for:
    - [ ] profile view
    - [ ] report view.
- Frontend:
  - [ ] `consent/types.ts`.
  - [ ] `consent/api/consent.api.ts`.
  - [ ] `consent/hooks/useConsents.ts`, `useAccessLogs.ts`.
  - [ ] Screens:
    - [ ] `ConsentAccessScreen` (list + simple create & revoke).
    - [ ] `AccessLogScreen` (history list).
  - [ ] Insert client calls to log relevant events, or rely on server to infer from endpoints.

### 4. Notifications Center (Core)

- Backend:
  - [ ] `Notification` model.
  - [ ] `GET /notifications` and `POST /notifications/{id}/read`.
  - [ ] Basic generation of:
    - [ ] appointment reminders
    - [ ] simple medication reminders
    - [ ] security alerts (login from new device).
- Frontend:
  - [ ] `notifications/types.ts`.
  - [ ] `notifications/api/notifications.api.ts`.
  - [ ] `notifications/hooks/useNotifications.ts`.
  - [ ] `NotificationsScreen`:
    - [ ] Tabbed filters (All, Appointments, Meds, Reports, Security).
    - [ ] Navigation to target destination on tap.

### 5. Settings & Privacy (v1.0)

- [ ] Expand Settings with:
  - [ ] Notification toggles.
  - [ ] Privacy controls link to Consents & Access Logs.
  - [ ] Data export trigger (even if just stubbed for now).
- Backend:
  - [ ] endpoint for notification settings.

### 6. UX & Polish

- [ ] Apply consistent typography, colors, spacing across all screens.
- [ ] Improve empty states for profiles, reports, vitals, meds.
- [ ] Add loading states (skeleton/spinners) for API-heavy screens.
- [ ] Handle offline UI states gracefully (banners).

### 7. Security & Privacy Checklist (Phase 2)

- [ ] Ensure PHI is still not logged anywhere.
- [ ] Hide sensitive details from notification texts.
- [ ] Implement re-authentication requirement for sensitive actions (e.g., account deletion).
- [ ] Start drafting real Privacy Policy & ToS (even if you refine later).

### 8. Testing Checklist (Phase 2)

- [ ] Add tests for:
  - [ ] condition profile assignment/filtering.
  - [ ] emergency info generation logic (server-side, if tested).
  - [ ] consents creation/revocation.
  - [ ] notifications listing.
- [ ] Manual:
  - [ ] Multi-profile use case (self + 2 family members).
  - [ ] Condition-specific view (e.g., Cardiology vs General).
  - [ ] Emergency view scenario (simulate real emergency use).

**v1.0 Completion Criteria:**

- A new user can:
  - [ ] Create multiple profiles and condition profiles.
  - [ ] Add reports, vitals, meds, appointments.
  - [ ] View emergency info.
  - [ ] Configure basic consents & see access logs.
  - [ ] Use the app daily without hitting obvious bugs.

---

## Phase 3 – v2.0 (Advanced: Doctors, Sharing, AI, Family Tree)

**Goal:** Extend app towards full vision: doctor onboarding, share links, early AI, and family risk features.  
This phase can be split further later; treat it as a roadmap bucket.

### 1. Doctor Onboarding (Minimal)

- Backend:
  - [ ] `Doctor` accounts with login/register (separate auth space).
  - [ ] Permissions: doctor can only view profiles they have consent for.
- Frontend (patient side):
  - [ ] Doctor directory (even if manually seeded initially).
  - [ ] Ability to search/select a doctor when creating consent.
- Frontend (doctor side – can be web or minimal mobile early on):
  - [ ] Simple interface to:
    - [ ] view shared profiles
    - [ ] upload reports
    - [ ] add visit notes.

### 2. Share Links & QR

- Backend:
  - [ ] `POST /profiles/{id}/share-links` for temporary access tokens.
  - [ ] Landing endpoint `/share/{token}` that:
    - [ ] verifies token & expiration
    - [ ] returns limited view data.
- Frontend:
  - [ ] UI to create share link with scope + expiry.
  - [ ] QR generation view.
  - [ ] Integration with native share sheet (WhatsApp, email, etc.).
- Security:
  - [ ] Each token use logged in AccessLog.
  - [ ] Tokens short-lived by default.

### 3. Family Tree & Relations (Base)

- Backend:
  - [ ] `FamilyRelation` model per `domain-model.md`.
  - [ ] Endpoints to:
    - [ ] define relationship between profiles.
    - [ ] retrieve simple family graph per account.
- Frontend:
  - [ ] UI for linking family profiles (parent/child/sibling).
  - [ ] Basic visual summary (doesn’t have to be a full-blown graph yet).

### 4. AI Foundations (Optional but Strategically Important)

- Backend:
  - [ ] `AiSession` and `AiMessage` models.
  - [ ] `/ai/sessions` and `/ai/sessions/{id}/messages` endpoints.
  - [ ] Integration with external LLM provider, with:
    - [ ] de-identification step
    - [ ] safe prompt templates.
- Frontend:
  - [ ] “Ask Medi Note” or “Health Assistant” tab:
    - [ ] Basic chat UI.
    - [ ] Restrict to explanation and summarization of existing data.
- Safety:
  - [ ] Prominent disclaimer about not being a doctor.
  - [ ] No direct treatment or medication changes suggested by AI.

### 5. Insurance & Claims (Enhanced)

- Backend:
  - [ ] Add `InsurancePolicy` + optional `InsuranceClaim`.
- Frontend:
  - [ ] Insurance section with card storage and notes.
  - [ ] (Later) simple claim log.

### 6. Monetization Hooks

- [ ] In-code feature flags for:
  - [ ] Pro / free differentiators (storage limit, AI usage, condition profiles limit).
- [ ] Simple local enforcement (no payment processing yet).
- [ ] Prepare architecture for Stripe/Braintree or platform IAP later.

### 7. Security & Compliance Hardening (Phase 3)

- [ ] Encrypt sensitive columns at rest where supported (backend).
- [ ] Ensure full audit logging for doctor usage and share links.
- [ ] Prepare HIPAA/GDPR checklist for potential US/EU rollout.
- [ ] Evaluate migration path from low-cost infra to AWS HIPAA-ready if traction increases.

### 8. Testing & Hardening

- [ ] Expand integration tests for:
  - [ ] share links.
  - [ ] doctor view vs consent permissions.
  - [ ] family relations retrieval.
- [ ] Conduct basic security review (SQL injection, IDOR, insecure direct object access, etc.).

**v2.0 Completion Criteria:**

- App is used by:
  - [ ] real patients & families.
  - [ ] some pilot doctors.
- Patients can:
  - [ ] share condition-specific info securely.
- Doctors can:
  - [ ] access shared profiles & upload notes.
- Optional AI:
  - [ ] provides safe, clearly-labeled explanations and summaries.

---

## How to Use This Checklist

- Treat **Phase 1** as *non-negotiable foundation*. Don’t pull Phase 3 items into Phase 1.  
- Keep a simple tracker (Notion, ClickUp, or GitHub Projects) and paste this checklist as your master plan.  
- Before each coding session, pick **1–3 items** only. Don’t context-switch across phases.

You can refine this document as you learn from users and as the product evolves.
