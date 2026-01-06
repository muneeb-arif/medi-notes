# AI Family Tree & Risk Prediction Spec (v2+) – Medi Note

This document defines how the app will create a family tree from multiple profiles and use AI/analytics to highlight potential hereditary risks.

---

## 1. Purpose

Enable:
- linking multiple profiles (self + family) into a family tree
- identifying possible hereditary risk patterns
- producing preventative checklists and screening suggestions (not diagnosis)

This feature must be explained carefully:
- risks are probabilistic
- not a clinical determination
- users must consult doctors for screening decisions

---

## 2. Scope

### 2.1 Family Tree Creation

- Users can define relationships between profiles:
  - parent, child, sibling, spouse
- The system can infer indirect relationships:
  - child of parent, sibling relationships, etc.
- Auto-suggest relationships when:
  - same last name, close ages (optional feature)
  - user confirms before saving

### 2.2 Risk Signal Generation

Generate risk “signals” such as:
- “Family history of diabetes”
- “Family history of hypertension”
- “Cardiac disease present in first-degree relatives”
- “Cancer risk flags” (broad, non-specific)

### 2.3 Output Format

- Risk dashboard per person profile:
  - list of risk signals
  - what it generally means
  - suggested next steps:
    - “Discuss screening with your doctor”
- No numeric risk percentages in early versions (to avoid false precision).

---

## 3. Data Inputs

### 3.1 Allowed Inputs

- family relations graph
- chronic conditions (structured list)
- age, gender
- vitals trends (optional later)
- diagnoses labels and tags

### 3.2 Disallowed Inputs

- unverified “doctor notes” free text without extraction & cleaning
- personal identifiers beyond IDs

---

## 4. Safety Rules

- Never say “You will get X”.
- Use “may have increased risk” language.
- Encourage medical consultation for screening.
- For cancer/serious disease:
  - include extra caution language
  - do not list specific odds

---

## 5. Architecture

### 5.1 Modules

- `FamilyRelation` module (core, deterministic)
- `RiskRulesEngine` (rules-based first)
- `AI Risk Explainer` (LLM optional)

**Recommendation:** Start with a rules-based approach for signals, then use AI only for explanation.

### 5.2 Data Flow

1. User links family profiles.
2. Backend builds family graph.
3. Rules engine computes risk signals.
4. (Optional) AI explains signals in plain language.
5. Results shown in Risk Dashboard.

---

## 6. Example Risk Rule (Rules Engine)

- If person has:
  - diabetes OR prediabetes
  - AND first-degree relative has diabetes
→ create signal: “First-degree family history of diabetes”

---

## 7. UX Requirements

- Family Tree screen:
  - list-based view first (simple)
  - optional graph later
- Risk dashboard:
  - grouped by:
    - metabolic
    - cardiac
    - cancer
    - mental health
- Each signal has:
  - “What this means”
  - “When to discuss with a doctor”
  - “Suggested screening topics”

---

## 8. Consent & Privacy

- Users must confirm before linking profiles into family tree.
- Risks computed only within the account’s profiles; no external data.
- Provide “Exclude this profile from family tree analysis” toggle.

---

## 9. Monetization Hooks

- Free:
  - family tree linking
  - basic risk signals
- Paid:
  - advanced insights
  - AI explanations
  - exportable family health summary PDF

---

## 10. Acceptance Criteria

- User can create relationships between profiles.
- System generates a clear family tree representation.
- System produces safe, non-diagnostic risk signals.
- Signals include disclaimers and encourage clinical screening discussions.
