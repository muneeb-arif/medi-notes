# AI Health Assistant Spec (v2+) – Medi Note

This document defines requirements, constraints, and implementation guidance for the **AI-based 1:1 personal healthcare assistant**. The assistant must be safe, privacy-preserving, and designed to support (not replace) clinical care.

---

## 1. Purpose

Provide users with:
- Plain-language explanations of their stored medical data (reports, vitals, medications).
- Summaries of health history and timelines.
- Checklists and questions to ask their doctor.
- Non-diagnostic guidance (education and lifestyle-level suggestions).
- Triage-style prompts that encourage medical consultation when needed.

The assistant **must not**:
- Diagnose diseases.
- Provide emergency medical instructions beyond “seek immediate care”.
- Recommend starting/stopping prescription medications.
- Interpret results as definitive without clinician review.

---

## 2. Scope (MVP for AI)

### 2.1 Supported Use Cases (Phase 1 AI)

1. **Report Explanation**
   - User selects a stored report (lab test, imaging report, prescription).
   - AI provides:
     - what the test is
     - what high/low could mean (general)
     - what questions to ask the doctor
     - “when to worry” red flags

2. **Vitals Trend Summary**
   - AI analyzes last N readings for a vital type (BP, glucose).
   - AI provides:
     - trend direction summary
     - general best-practice ranges (with disclaimers)
     - tracking suggestions (when/how to measure)

3. **Medication List Clarification**
   - AI explains medication names and general purpose (education).
   - AI warns user not to change dosage without doctor.

4. **Doctor Visit Preparation**
   - AI produces a short “visit summary”:
     - top symptoms / history notes user enters
     - last reports list
     - vitals trends
     - medication list
     - suggested questions

### 2.2 Explicitly Out-of-Scope (initial versions)

- Diagnosing (“you have X”).
- Dose adjustments (“increase/decrease your medication”).
- Emergency clinical instructions (CPR, etc.) beyond “call emergency services”.
- “Second opinion” against a doctor’s advice.
- Pregnancy/infertility-specific medical recommendations without clinical disclaimers and additional safety layer.

---

## 3. User Experience

### 3.1 Entry Points

- “AI Assistant” tab or Home shortcut.
- “Explain this report” button in Report Viewer.
- “Summarize vitals” button in Vitals screen.

### 3.2 Conversation Modes

1. **Contextual Explanation Mode**
   - user: “Explain my CBC report”
   - context: selected report metadata + extracted text + profile age/gender.

2. **Chat Mode**
   - user asks questions
   - AI replies based on user-provided and app-stored context.

3. **Summary Mode**
   - one-click health summary generation.

### 3.3 Required Disclaimers

- Show at start of conversation and on each report explanation:
  - “This is not medical advice. For diagnosis or treatment, consult a doctor.”
- For red flags:
  - “If you have severe symptoms, seek immediate medical care.”

---

## 4. Data Inputs & Minimization

### 4.1 Allowed Data (with user consent)

- Age (or age range), gender (optional).
- Report extracted text (only selected report).
- Vitals readings (selected timeframe only).
- Medication names (selected profile only).
- User-entered symptoms notes.

### 4.2 Disallowed / Sensitive Data

- Full name, address, CNIC/passport.
- Phone numbers, emails.
- Free-text doctor notes that may contain identifying info unless de-identified first.
- Raw PDFs/images sent to external LLM without extraction and review.

### 4.3 De-identification Rules

Before sending to AI provider:
- Replace person name with “Patient”.
- Replace doctor name with “Clinician”.
- Replace dates with relative times when possible (e.g., “3 months ago”).
- Remove contact details.

---

## 5. Safety & Guardrails

### 5.1 Safety Policy Categories

- **Medical safety:** detect emergencies and recommend urgent care.
- **Medication safety:** refuse dosage changes; advise doctor consultation.
- **Mental health safety:** if user expresses self-harm, route to crisis guidance (future).
- **Children safety:** extra caution for pediatric recommendations.

### 5.2 Output Constraints

- Use probability language:
  - “could be associated with…”
  - “sometimes indicates…”
- Always include “ask your doctor” suggestions.
- Never output:
  - “You have X”
  - “Start taking…”
  - “Stop taking…”

### 5.3 Red-Flag Detection

When any of the following appear in user text:
- chest pain
- fainting
- severe shortness of breath
- uncontrolled bleeding
- severe allergic reaction
- suicidal thoughts

AI must respond with:
- urgent care advice
- no additional speculation

---

## 6. System Architecture

### 6.1 Components

- `AI Gateway Service` (backend)
  - de-identification
  - prompt templating
  - rate limiting
  - logging control
- External LLM provider (configurable)
- `AiSession` and `AiMessage` persistence store

### 6.2 Data Flow

1. User triggers AI action.
2. Client sends request to AI Gateway with `profileId`, `conditionProfileId?`, and selected context IDs.
3. Gateway fetches relevant data, de-identifies it, builds prompt.
4. Gateway calls LLM provider.
5. Response is post-processed for safety and stored.
6. Client displays response.

---

## 7. Storage & Retention

- Store only:
  - session metadata (ids, timestamps)
  - user message text
  - assistant message text
- Provide user option:
  - “Delete AI chat history”
- Default retention:
  - 90 days (configurable)
- Never store raw extracted report text in logs.

---

## 8. Rate Limits & Monetization Hooks

### 8.1 Free Tier Suggestions

- X AI messages per day (e.g., 5–10)
- report explanations limited per month
- vitals summaries limited

### 8.2 Paid Tier

- unlimited or high usage
- “health summary PDF” export
- AI-based report extraction

---

## 9. Compliance Notes

- Ensure explicit user consent before enabling AI.
- Provide “data used for AI” explanation screen.
- Prefer providers with no retention / opt-out policies if possible.

---

## 10. Acceptance Criteria (AI Health Assistant)

- User can request explanation of a report and receive:
  - plain-language explanation
  - disclaimers
  - questions to ask doctor
- AI never provides diagnosis or medication adjustments.
- AI requests show consistent performance and do not leak PHI.
