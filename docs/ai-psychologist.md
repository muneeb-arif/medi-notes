# AI Psychologist Spec (v2+) – Medi Note

This document defines requirements for an AI-based psychologist / mental wellness assistant. This feature is high risk and must be implemented with strict safety guardrails.

---

## 1. Purpose

Provide mental wellness support through:
- Journaling prompts
- Cognitive Behavioral Therapy (CBT)-style reflection questions
- Stress management techniques (breathing, mindfulness, sleep hygiene)
- Emotional check-ins and mood tracking insights

The AI is **not a therapist** and must not:
- diagnose mental health conditions
- provide trauma therapy
- replace licensed professional care
- handle emergencies with anything other than urgent referral guidance

---

## 2. Feature Scope

### 2.1 MVP Use Cases

1. **Mood Check-in**
   - “How are you feeling today?”
   - mood selection + text reflection

2. **Journaling Prompts**
   - prompts by theme: anxiety, stress, burnout, grief, self-esteem

3. **CBT Reflection**
   - identify thought → emotion → behavior
   - reframe thought prompts

4. **Self-care Recommendations**
   - non-medical suggestions:
     - breathing exercises
     - journaling
     - hydration/sleep reminders
     - walk/stretch suggestions

5. **Progress Summary**
   - weekly summary of moods (not medical diagnosis)
   - highlight patterns:
     - “You felt more stressed on weekdays.”

### 2.2 Out-of-Scope / Not Allowed

- diagnosing conditions (depression, PTSD, etc.)
- prescribing medication
- crisis counseling beyond referral guidance
- relationship advice that encourages manipulation or harm
- sexual or explicit content, especially involving minors

---

## 3. Safety Requirements

### 3.1 Crisis Detection

Must detect:
- suicidal ideation
- self-harm intent
- violence intent

When detected:
- respond with compassionate language
- advise seeking immediate help
- show local crisis resources screen (Pakistan + international)
- encourage contacting trusted person

### 3.2 Medical Referral Rules

If user mentions:
- severe panic attacks
- inability to function
- prolonged depression symptoms
- hallucinations

AI must suggest professional support:
- “Please consider speaking to a licensed mental health professional.”

### 3.3 Tone and Style Rules

- calm, respectful, non-judgmental
- avoid certainty claims
- no blame language
- allow user to stop session easily

---

## 4. UX Design Requirements

### 4.1 Entry Points

- Settings → “Mental wellness”
- Home shortcut (“Check in”)

### 4.2 Session Modes

1. **Guided Session**
   - short structured chat (5–10 prompts)

2. **Free Chat (Optional)**
   - user speaks freely; guardrails applied

3. **Journaling Mode**
   - user writes; AI provides reflection questions

### 4.3 Consent

- Must require explicit opt-in:
  - “This tool is not a substitute for professional therapy.”

---

## 5. Data Handling

### 5.1 Allowed Data

- mood ratings
- journal entries (user typed)
- optional tags (sleep, work stress)

### 5.2 Data Minimization

- Do not mix mental health chat with medical profile automatically.
- Allow user to keep mental wellness data separate from medical data.
- Provide “hide/lock mental wellness” option.

### 5.3 Retention

- user can delete sessions
- default retention:
  - 90 days or user-defined
- do not include journal content in error logs

---

## 6. AI Prompting Strategy

- Use structured templates:
  - “You are a supportive mental wellness assistant…”
- Add strict system instructions:
  - do not diagnose
  - crisis protocol
  - no medical or medication advice

---

## 7. Monetization (Optional)

- Free:
  - daily mood check-in
- Paid:
  - personalized weekly summary
  - guided program packs (sleep, anxiety, confidence)

---

## 8. Acceptance Criteria

- The assistant provides safe journaling prompts and CBT-style questions.
- Crisis keywords trigger immediate referral response.
- The assistant never diagnoses or gives treatment plans.
- Users can delete sessions and keep wellness data separate.
