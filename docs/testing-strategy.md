# Testing Strategy – Medi Note

This document describes how we test the Medi Note app to ensure correctness, safety, and reliability, especially for critical healthcare flows.

## 1. Goals

1. Prevent regressions in core flows: profile management, emergency info, reports, vitals, appointments, consent, and sharing.
2. Ensure security/privacy rules are enforced at the UI and API level.
3. Keep the testing approach pragmatic enough for a small team but extensible.

---

## 2. Types of Tests

### 2.1 Unit Tests

- Scope: pure functions and small utilities.
- Examples:
  - `calculateAge`
  - date formatting helpers
  - vital trend transformers
  - consent decision helpers

### 2.2 Component Tests

- Scope: React components that render UI based on props.
- Examples:
  - `ProfileCard`
  - `VitalsCard`
  - `NotificationItem`
  - `EmptyState`

Use React Testing Library for RN where possible.

### 2.3 Integration / Flow Tests

- Scope: multi-step flows that involve hooks, navigation, and API mocks.
- Examples:
  - Creating/editing a profile.
  - Uploading a report and then viewing it in the list and viewer.
  - Toggling emergency access and ensuring emergency screen updates.
  - Booking an appointment via doctor directory.
  - Granting and revoking consent and verifying access log entries.

### 2.4 Manual Exploratory Testing

- Performed on staging builds.
- Focus on real-device behavior (Android + iOS).
- Especially necessary for:
  - file uploads
  - camera usage
  - sharing and deep links
  - push notifications
  - WhatsApp integration.

---

## 3. Test Coverage Priorities

### 3.1 High Priority (Must Have)

- Authentication:
  - login, logout, session expiry
- Profile:
  - create/edit profile
  - switching between profiles
  - viewing medical profile
- Emergency:
  - viewing emergency info (when enabled)
  - verifying only critical fields show up
- Reports:
  - upload PDF/image
  - failure & retry path
  - view report in viewer
- Vitals:
  - add reading
  - display in dashboard and history
- Consent & Access:
  - grant, extend, revoke consents
  - generating temporary access links (client-side only)
- Settings & Privacy:
  - toggling “Allow doctors to view profile”
  - toggling “Allow emergency access without login”
  - account deletion confirmation flow.

### 3.2 Medium Priority

- Notifications center filters.
- Appointment booking and history views.
- Insurance & billing listing (if enabled in MVP).
- Chat UI rendering (if enabled).

### 3.3 Future / Optional

- AI assistant flows.
- Family tree & risk predictions.
- Doctor onboarding dashboards.

---

## 4. Tooling

- **Test runner:** Jest
- **Component testing:** React Native Testing Library
- **Mocking:** jest.mock, MSW (Mock Service Worker) for API
- **CI:** GitHub Actions running:
  - lint
  - TypeScript build
  - Jest tests

---

## 5. Test Data

- Use synthetic data only.
- Provide factories or builders:

```ts
function buildPersonProfile(overrides: Partial<PersonProfile> = {}): PersonProfile {
  return {
    id: "profile-1",
    accountId: "account-1",
    fullName: "Test User",
    dateOfBirth: "1990-01-01",
    gender: "female",
    relationToAccount: "self",
    ...overrides,
  };
}
```

This avoids fragile fixtures and encourages readable test cases.

---

## 6. Test Scenarios (Examples)

### 6.1 Upload New Report

1. User opens `AddReportScreen`.
2. Selects file (mocked URI).
3. Fills title and doctor name.
4. Submits form:
   - expect loading indicator
   - expect success toast
   - expect navigation back to `ReportsListScreen`
   - expect list to show new report entry.

### 6.2 Emergency Access Toggle

1. User edits profile and enables emergency access.
2. Save profile.
3. Open `EmergencyInfoScreen`:
   - verify it displays updated fields.
4. Disable emergency access.
5. Attempt to open emergency info:
   - expect an explanatory message or disabled state.

### 6.3 Consent Grant & Log

1. User opens `ConsentAccessScreen`.
2. Taps “Grant new access”.
3. Fills doctor name and scope.
4. Submits:
   - expect new entry in active list.
   - expect history entry for “Granted access”.
5. Revokes access:
   - expect status change.
   - expect history entry for “Revoked access”.

---

## 7. Release Testing Checklist (Staging)

Before each release, perform manual verification on staging with production-like config:

- Onboarding flow (first-time user).
- Multi-profile creation and switching.
- Upload 2–3 reports of different types.
- Add 3–4 vitals readings and view graphs.
- Book an appointment and verify notifications.
- Share profile summary via secure link.
- Test doctor access log updates when profile is viewed (simulated).
- Toggle each privacy setting and verify behavior.
- Try app with:
  - offline mode
  - slow network
  - interrupted uploads.

---

## 8. Regression Policy

- Any bug in production that results from a missing test should result in:
  - a new test case
  - an update to this strategy if necessary.

---

## 9. Performance & Load

For later phases:

- Add basic load tests on backend API for:
  - login
  - list reports
  - upload report
- Monitor mobile performance metrics:
  - time to first screen
  - navigation responsiveness
  - memory usage on old devices.

