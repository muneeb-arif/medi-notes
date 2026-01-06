# Release Process – Medi Note

This document explains how we move from local development to production releases for the mobile app. It is geared toward a solo or small team using Expo and cloud backends.

## 1. Environments

- **Local** – developer machines; connects to dev backend.
- **Development backend** – for day-to-day testing; no real PHI.
- **Staging** – mirrors production configuration; test accounts only.
- **Production** – real users.

Environment configuration is managed via:

- `.env.development`
- `.env.staging`
- `.env.production`

Expo `app.config` or `app.json` picks the right environment variables based on build profile.

---

## 2. Branching Strategy

Simple and pragmatic:

- `main` – always deployable; matches production.
- `develop` – integration branch; corresponds to staging.
- `feature/*` – one branch per feature.

Rules:

- Feature branches merge into `develop` via PR with review.
- `develop` is merged into `main` only after staging testing passes.

---

## 3. Versioning

Use semantic versioning: `MAJOR.MINOR.PATCH`.

- `MAJOR` – breaking changes in data model or major UX change.
- `MINOR` – new features, backward compatible.
- `PATCH` – bug fixes and small improvements.

Mobile builds must bump:

- `version` string
- `buildNumber` / `android.versionCode` in Expo config.

---

## 4. Build Types

### 4.1 Development Builds

- Run locally with `npx expo start` and Expo Go.
- Optional: EAS development builds for native modules testing.

### 4.2 Staging Builds

- Built via EAS with `profile: staging`.

```bash
eas build --profile staging --platform android
eas build --profile staging --platform ios
```

- Distributed via EAS links or internal test channels.
- Connects to staging backend.

### 4.3 Production Builds

- Built via EAS with `profile: production`.

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

- Uploaded to:
  - Google Play Console (internal testing → open testing → production)
  - App Store Connect (TestFlight → App Store release)

---

## 5. Pre-Release Checklist

Before cutting a production build:

1. **Code & Quality**
   - All features merged into `main`.
   - Lint checks pass.
   - TypeScript build passes.
   - Test suite (unit + integration) passes.

2. **Security & Privacy**
   - No debug logs containing PHI.
   - Environment variables point to production backend and storage.
   - Error monitoring DSN configured (Sentry, etc.)

3. **Product**
   - Onboarding, Home Dashboard, Medical Profile, Emergency Info, Reports, Vitals, Appointments, Notifications, Settings & Privacy all pass manual smoke tests based on SRS scenarios.
   - Sharing flows tested:
     - PDF export
     - profile share link
     - emergency access.

4. **Store Assets**
   - App name and icon set correctly.
   - Screenshots prepared (home, profile, emergency, vitals, reports).
   - App description highlights privacy and security.

5. **Legal**
   - Privacy Policy and Terms of Service URLs set in store listings.
   - In-app consent text matches latest policies.

---

## 6. Staged Rollout

For each production release:

1. Start with a small percentage of users (5–10%) where store allows staged rollout.
2. Monitor:
   - crash rates
   - error rates for core APIs
   - performance metrics
3. If stable after 24–72 hours, roll out to 100%.

---

## 7. Hotfixes

If a critical issue is found:

1. Create `hotfix/x.y.z` branch from `main`.
2. Apply minimal change; bump PATCH version.
3. Run tests and build again.
4. Release via fast track on stores.
5. Merge hotfix back into `main` and `develop`.

---

## 8. Backend Deployments

Backend should be deployed separately but coordinated:

- For DB schema changes:
  - perform backward compatible migrations first
  - deploy backend
  - then release new app version that relies on new schema.

- Use IaC (e.g., Terraform) to track infra changes.

---

## 9. Post-Release Monitoring

For at least the first week after release:

- Track:
  - Crash-free sessions
  - API error rates
  - Latency for critical endpoints (login, profile, reports)
  - App store reviews mentioning bugs

- Document learnings and feed them back into `roadmap.md`.

---

## 10. Feature Flags

For risky features (AI assistant, chat, doctor onboarding, WhatsApp integration):

- Wrap them in remote or local feature flags.
- Enable flags only:
  - in dev and staging by default
  - in production for limited audiences initially.

