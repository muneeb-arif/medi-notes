# Project Structure – Medi Note

This document defines the folder layout and naming conventions for the Medi Note mobile app (Expo + React Native + TypeScript). It is based on the SRS/wireframes and is optimized for maintainability, testability, and safe usage with AI-assisted coding tools.

## 1. High-Level Layout

```text
project-root/
  app/                     # Entry for Expo Router (if used) or top-level navigators
  src/
    app/
      AppProviders.tsx     # QueryClientProvider, Zustand providers, theme
    navigation/            # Navigation stacks and tab navigators
    theme/                 # Colors, spacing, typography, shadows
    components/            # Reusable presentational components
    features/              # Feature-based modules (see below)
    services/              # API client, auth, share, analytics, etc.
    store/                 # Global Zustand stores (session, UI)
    utils/                 # Pure helper functions
  assets/
    fonts/
    images/
    icons/
  docs/                    # Markdown documentation
  tests/                   # Unit/integration tests
  app.json
  eas.json
  package.json
  tsconfig.json
  .eslintrc.cjs
  .prettierrc
  README.md
```

### 1.1 Feature-Based Folder Structure

Each user-facing capability from the SRS maps to a feature folder:

```text
src/features/
  auth/
  onboarding/
  home/
  profiles/              # Person profiles + profile editor
  conditionProfiles/     # Sub-profiles per specialty (General, Cardiology, ED, etc.)
  emergency/
  reports/
  vitals/
  medications/
  appointments/
  doctors/
  chat/
  consent/
  notifications/
  insurance/
  settings/
  accessLog/
  timeline/
  emptyStates/
```

Each feature folder has the following internal structure:

```text
src/features/<feature>/
  screens/               # Screen-level components used in navigation
  components/            # Feature-specific UI components
  api/                   # API functions for this feature only
  hooks/                 # React hooks (usually wrappers around React Query)
  types.ts               # TypeScript types and interfaces
  constants.ts           # Feature-specific constants/enums
```

**Rules**

- Shared UI never lives inside `features/` – it goes to `src/components/`.
- Shared domain types belong in `src/domain/` if many features depend on them; otherwise keep them in `types.ts` inside the feature.

---

## 2. Navigation Structure

Navigation is derived from the sitemap and UX flow.

```text
src/navigation/
  RootNavigator.tsx         # Decides between Auth stack and Main tabs
  AuthNavigator.tsx         # Login / Register / Forgot Password
  OnboardingNavigator.tsx   # Optional intro flow
  MainTabsNavigator.tsx     # Home, Profiles, Add, Notifications, Settings
  HomeStack.tsx             # Dashboard, Timeline, etc.
  ProfileStack.tsx          # Medical profile, emergency view
  ReportsStack.tsx          # Reports list, viewer, add/edit report
  AppointmentsStack.tsx     # Appointments, booking, doctor profile
  DoctorsStack.tsx          # Directory & doctor profiles
  SettingsStack.tsx         # Settings, consent, access log, insurance
```

### 2.1 Screen Mapping (Examples)

- `HomeStack`
  - `HomeDashboardScreen`
  - `VitalsDashboardScreen`
  - `TimelineScreen`

- `ProfileStack`
  - `MedicalProfileScreen`
  - `EmergencyInfoScreen`
  - `ManageProfilesScreen`
  - `ProfileEditorScreen`

- `ReportsStack`
  - `ReportsListScreen`
  - `ReportViewerScreen`
  - `AddReportScreen`

- `SettingsStack`
  - `SettingsScreen`
  - `ConsentAccessScreen`
  - `DoctorAccessLogScreen`
  - `NotificationSettingsScreen`
  - `AccountSettingsScreen`
  - `InsuranceScreen`

---

## 3. Components Structure

```text
src/components/
  layout/
    Screen.tsx           # SafeArea, background, padding
    AppBar.tsx
    SectionHeader.tsx
  ui/
    Button.tsx
    IconButton.tsx
    TextField.tsx
    Chip.tsx
    Card.tsx
    Avatar.tsx
    TagPill.tsx
    Badge.tsx
    SegmentedControl.tsx
    ListItem.tsx
    ToggleRow.tsx
    EmptyState.tsx
  feedback/
    Loader.tsx
    ErrorState.tsx
    Snackbar.tsx
  charts/
    MiniLineChart.tsx     # Simple vital trends view
    MiniBarChart.tsx
```

**Guidelines**

- Components must be **pure**, accept props, and never call APIs directly.
- Feature components can compose base components with feature-specific text and icons.

---

## 4. Theme Structure

```text
src/theme/
  colors.ts
  typography.ts
  spacing.ts
  radius.ts
  shadows.ts
  index.ts               # Aggregates theme object
```

Colors and typography follow branding in the SRS (sky blue primary, navy text, rounded cards).

---

## 5. Services & API

```text
src/services/
  apiClient.ts           # Axios/fetch wrapper with auth + error handling
  auth.service.ts        # login, logout, refresh token
  profile.service.ts     # non-React-query higher-level functions
  share.service.ts       # signed links, QR code payloads
  analytics.service.ts   # optional
```

All network calls from feature `api/` files must use `apiClient`.

---

## 6. Global State / Store

```text
src/store/
  session.store.ts       # auth tokens, active account, active personId
  ui.store.ts            # global UI flags (theme, loading overlays)
  featureFlags.store.ts  # toggles for AI features, doctor onboarding, etc.
```

Global stores must remain thin — most data belongs in React Query caches or feature-level state.

---

## 7. Utilities

```text
src/utils/
  date.ts               # formatDate, parseServerDate
  validation.ts         # generic zod schemas / helpers
  phone.ts              # format phone numbers
  files.ts              # mime type helpers
  sharing.ts            # construct WhatsApp / share messages
  logging.ts            # optional wrapper around console.log
```

Utilities must be stateless and side-effect free (except logging).

---

## 8. Testing Layout

```text
tests/
  unit/
    components/
    utils/
  integration/
    features/
      reports/
      profiles/
```

- Unit tests: isolated functions and simple components.
- Integration tests: user flows (e.g., upload report, view timeline).

---

## 9. Naming & Import Rules

- Use **absolute imports** from `src/*` via `tsconfig` paths (e.g., `@features/reports/...`).
- Do not create cyclic dependencies between features.
- When a type is reused in multiple features, extract it into `src/domain/`.

---

## 10. Files to Keep Small

To help AI tools and human reviewers:

- Screens: aim for **< 200 lines**.
- Components: aim for **< 150 lines**.
- Hooks: aim for **< 150 lines**.
- Break down long JSX into subcomponents immediately.
