# Monetization Strategy – Medi Note

This document defines how **Medi Note** can become financially sustainable while keeping the **core experience free**, ethical, and user-trust–first.

---

## 1. Monetization Philosophy

Healthcare apps fail when:
- they paywall critical health access, or
- they push ads into sensitive medical contexts.

**Medi Note principles:**
- Core record-keeping must remain free.
- Users pay for **convenience, intelligence, and scale**, not safety.
- Monetization must never incentivize unsafe medical behavior.

---

## 2. User Segments & Willingness to Pay

### 2.1 Free Users (Majority)

- Individuals managing basic records
- Families with limited profiles
- Occasional doctor visits
- Low AI usage

### 2.2 Power Users (Primary Paid Segment)

- Chronic illness patients (diabetes, cardiac, fertility, mental health)
- Caregivers managing multiple family members
- Frequent doctor visits
- Heavy report uploads
- Interested in AI explanations and summaries

### 2.3 Professional / Partner Users (Later)

- Doctors / clinics
- Corporate wellness programs
- Insurance partners

---

## 3. Free Tier (Always Free)

The free tier must feel **complete and trustworthy**, not crippled.

### Included Features

- Unlimited:
  - person profiles (self + family)
  - basic reports (with reasonable storage cap)
  - vitals tracking
  - medications list
- Emergency profile
- Condition profiles (limited number)
- Basic notifications
- Manual doctor entries
- Local sharing (PDF export / screenshots)

### Limits (Soft)

- Storage cap (e.g., 1–2 GB)
- Limited AI usage
- Limited condition profiles per person (e.g., 2–3)

---

## 4. Pro Tier (Primary Revenue)

### Suggested Pricing (Pakistan-first)

- Monthly: PKR equivalent of USD $3–5
- Annual: ~20–30% discount

(Adjust regionally later.)

### Pro Features

#### 4.1 Advanced Organization

- Unlimited condition profiles
- Advanced filters & search
- Timeline / health history view
- Priority data export (PDF summaries)

#### 4.2 AI Features

- AI health assistant:
  - more daily messages
  - detailed summaries
  - report explanations
- AI psychologist:
  - guided programs
  - weekly wellness summaries
- AI family risk explanations

#### 4.3 Sharing & Collaboration

- Secure share links with expiry
- QR-based emergency sharing
- Doctor collaboration (upload notes)

#### 4.4 Storage & Backup

- Higher storage cap (e.g., 10–50 GB)
- Priority backups
- Version history for reports

---

## 5. Add-On Purchases (Optional)

These avoid forcing subscriptions on light users.

### Examples

- One-time “Doctor Visit Pack”
  - AI-generated visit summary
  - PDF export
- One-time “Family Health Report”
  - combined family tree + risk overview
- Extra storage bundles

---

## 6. Doctor & Clinic Monetization (Phase 3+)

### 6.1 Doctor Accounts

- Free:
  - limited number of shared profiles
- Paid:
  - clinic dashboard
  - upload reports directly
  - patient summaries
  - appointment management

### 6.2 Clinics / Hospitals

- White-labeled portals
- EMR-lite integrations
- Per-seat or per-patient pricing

---

## 7. What NOT to Monetize (Important)

- Emergency access
- Viewing existing personal records
- Deleting or exporting your own data
- Safety notifications
- Access logs

These must **never** be paywalled.

---

## 8. In-App Purchases vs External Billing

### Mobile Apps

- Use Apple / Google In-App Purchases for:
  - subscriptions
  - add-ons
- Keep pricing transparent.

### Web / Future

- Stripe for web-based subscriptions
- Unified entitlement system on backend

---

## 9. Feature Flagging Strategy

Implement early:

- `featureFlags` table or config
- Server-driven entitlements:
  - free
  - pro
  - doctor
- Client checks flags, server enforces limits

This avoids refactors later.

---

## 10. Ethics & Trust Safeguards

- Clear messaging:
  - “Paying does not improve medical outcomes.”
- No ads in medical views.
- No selling anonymized data without explicit opt-in.
- Transparent AI usage explanation.

---

## 11. Revenue Phasing

### Phase 1 (MVP)

- No payments
- Collect usage signals only

### Phase 2 (v1.0)

- Introduce Pro subscription
- Storage + AI limits enforced

### Phase 3 (v2.0)

- Doctor subscriptions
- Add-ons
- Enterprise pilots

---

## 12. Success Metrics

- Free → Pro conversion rate
- AI feature engagement
- Retention (30 / 90 days)
- Average profiles per user
- Storage growth per user

---

## 13. Acceptance Criteria

- App is usable without payment.
- Paid features feel valuable, not coercive.
- Monetization logic is centralized and auditable.
- No monetization decision compromises safety or privacy.
