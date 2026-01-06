# Cursor Workflow – Medi Note

This document explains how to use Cursor (or any AI coding assistant) safely and productively on this project. The goal is to leverage AI for speed while maintaining predictable, high-quality code.

## 1. General Principles

1. **Small, targeted prompts** – never ask Cursor to edit the whole project or multiple features at once.
2. **One feature per session** – when possible, work on a single feature folder (`features/reports`, `features/vitals`, etc.).
3. **Human owns architecture** – follow the architecture and domain model docs; do not let AI invent new patterns or folders.

---

## 2. Setup

When you open the repo in Cursor:

1. Pin the following files in the sidebar:
   - `docs/overview.md`
   - `docs/architecture.md`
   - `docs/domain-model.md`
   - `docs/project-structure.md`
   - `docs/coding-standards.md`
   - This file: `docs/cursor-workflow.md`

2. Tell Cursor in your first prompt:

> “Follow the documentation in the `docs/` folder strictly. Do not introduce new libraries or change folder structure unless explicitly requested.”

---

## 3. Typical Workflow per Feature

### 3.1 Create Types First

Prompt example:

> “Using `docs/domain-model.md`, create `src/features/reports/types.ts` with TypeScript interfaces for Report, ReportType, and ReportTag.”

Review the generated file manually and adjust if needed.

### 3.2 Create API Functions

Prompt example:

> “In `src/features/reports/api/reports.api.ts`, implement functions using `apiClient` for:
> - getReports(personId)
> - getReport(reportId)
> - createReport(payload)
> - updateReport(reportId, payload)
> - deleteReport(reportId)
> Follow the endpoint patterns in `docs/api-overview.md`.”

Ensure only `apiClient` is used for network calls.

### 3.3 Create Hooks

Prompt example:

> “Create `src/features/reports/hooks/useReports.ts` that exposes:
> - useReports(personId)
> - useReport(reportId)
> - useCreateReport()
> - useUpdateReport()
> - useDeleteReport()
> using React Query and types from `types.ts`.”

### 3.4 Build Screens & Components

Prompt example:

> “Implement `ReportsListScreen.tsx` under `src/features/reports/screens/` that:
> - uses `useReports(activePersonId)`
> - displays cards per report as described in `medi-logs-wireframes.pdf` (Screen 10)
> - uses shared components: Card, SectionHeader, ListItem.
> - supports empty state using `EmptyState` component.”

---

## 4. Editing Existing Code with Cursor

When updating a file:

1. **Select only the relevant file or code block**.
2. Describe the change precisely:

> “Refactor this component to receive `personId` as a prop instead of reading from global store. Update types accordingly.”

3. After Cursor edits, always:
   - Review the diff
   - Run TypeScript checks and tests
   - Fix any side effects manually

Never allow Cursor to apply multi-file refactors without you reviewing each changed file.

---

## 5. Adding New Libraries

Before asking Cursor to use a new dependency:

1. Check if the feature can be implemented with existing libraries.
2. If necessary, update `docs/architecture.md` to record the new dependency.
3. Explicitly instruct Cursor:

> “Install `@tanstack/react-query` and configure a QueryClient in `AppProviders.tsx`. Follow the patterns in `docs/architecture.md` and do not modify navigation files.”

---

## 6. Working with Complex Flows

For critical areas (emergency access, consent, sharing, AI):

1. Write a **mini spec** in a comment at the top of the file describing:
   - inputs
   - outputs
   - edge cases
   - security/privacy rules

2. Ask Cursor to generate only the internal logic, not the whole file.

Example:

> “Inside the `handleShareProfile` function, implement the logic to:
> - call `share.service.createShareLink(personId, conditionProfileId)`
> - show a confirmation modal with a warning message about sharing PHI
> - then open the native share sheet with the generated URL.”

---

## 7. Avoiding Common AI Pitfalls

- **Do not** let Cursor:
  - change imports globally
  - rename types across modules
  - move files or restructure the project
- **Do not** accept:
  - untyped `any` usage
  - inline fetching logic inside components
  - direct date/string parsing without utilities

If Cursor suggests changes contradicting docs, keep the docs as the source of truth.

---

## 8. Testing with Cursor

Use Cursor to help write tests, but keep them explicit.

Prompt example:

> “Write unit tests for `calculateAge` in `src/utils/date.ts` using Jest. Include cases for:
> - leap year birthdates
> - today equals birthday
> - future dates (should clamp or return 0).”

Review test assertions carefully to ensure they match the business rules.

---

## 9. Code Reviews

- Treat Cursor-generated code as junior-dev-level code.
- Every change must be reviewed by you (or another human) before merging.
- No direct pushes to `main` from Cursor-generated branches without review.

---

## 10. When to Avoid Using Cursor

- Legal text (privacy policy, terms) after lawyers review.
- Extremely security-sensitive code (crypto, token handling) – write manually and double-check.

