# Coding Standards – Medi Note

These standards ensure consistency, readability, and safety across the codebase, and make it easier to work with AI-assisted tools (Cursor) without introducing bugs.

## 1. General Principles

1. **Patient safety first** – errors must fail safe; never show misleading or partial medical information.
2. **Privacy by default** – no PHI in logs, analytics, or notifications previews.
3. **Small, composable units** – prefer many small components / hooks over large files.
4. **Type-safe code** – all code is written in TypeScript with `strict` mode enabled.
5. **Single responsibility** – each file has a clear, narrow purpose.

---

## 2. TypeScript & React

- Enable `strict: true` in `tsconfig.json`.
- Always type component props and hook return values explicitly.
- Prefer **interfaces** for public types and **type aliases** for unions.

```ts
export interface PersonProfile {
  id: string;
  accountId: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  relationToAccount: "self" | "spouse" | "child" | "parent" | "other";
}
```

- Use functional components only; no class components.
- Use React hooks (`useState`, `useEffect`, etc.) following the Rules of Hooks.

### 2.1 React Query

- All server data must flow through React Query hooks.
- Use feature-specific hooks:

```ts
// src/features/reports/hooks/useReports.ts
export const useReports = (personId: string) =>
  useQuery({
    queryKey: ["reports", personId],
    queryFn: () => getReports(personId),
  });
```

- Avoid calling `apiClient` directly from components; wrap in hooks.

---

## 3. Styling

- Use **Styled Components** or `StyleSheet.create` (pick one and stick to it across the project).
- Never hardcode theme values; import from `src/theme`.

```ts
const Card = styled.View`
  background-color: ${props => props.theme.colors.card};
  border-radius: ${props => props.theme.radius.lg}px;
  padding: ${props => props.theme.spacing.md}px;
`;
```

- Keep inline styles minimal; extract reusable styles to styled components.

---

## 4. Naming Conventions

- Components: `PascalCase` (e.g., `ProfileCard`, `VitalsGraph`).
- Hooks: `useCamelCase` (e.g., `useVitals`, `useCreateReport`).
- Types/interfaces: `PascalCase` (e.g., `Report`, `VitalReading`).
- Enums: `PascalCase` with uppercase members.

```ts
export enum AccessMode {
  Normal = "normal",
  Emergency = "emergency",
}
```

- Constants: `SCREAMING_SNAKE_CASE` if exported or shared.

---

## 5. Error Handling & Null Safety

- Never assume API responses are non-null; always validate and handle empty states.
- Use safe access and fallback values:

```ts
const age = profile ? calculateAge(profile.dateOfBirth) : "—";
```

- When something is truly impossible by design, assert it with **narrowed types**, not with `any` or `as` casts.

---

## 6. Forms & Validation

- Use `react-hook-form` + `zod` schemas for all non-trivial forms (profile edit, report upload, medication, insurance, consent).
- Validation rules must reflect medical constraints (e.g., date not in future where inappropriate).

```ts
const profileSchema = z.object({
  fullName: z.string().min(2),
  dateOfBirth: z.string(),
  emergencyContactPhone: z.string().optional(),
});
```

- Show validation messages near inputs, not in generic toasts.

---

## 7. Security & Privacy in Code

- Never log:
  - full names
  - medical conditions
  - diagnoses
  - medications
  - report titles
- Use obfuscated identifiers in logs (IDs only).
- Push notifications:
  - Title can be generic ("New report available")
  - Body must not include specific conditions or diagnoses.

---

## 8. Asynchronous Code

- Prefer `async/await` over promise chains.
- Always wrap async logic in `try/catch` in React Query `mutationFn` and non-React Query async code.
- Watch out for race conditions when switching profiles; use `queryKey` patterns that include `personId` and `conditionProfileId`.

---

## 9. Imports & Modules

- Use absolute imports with aliases like `@features`, `@components`, `@theme`.
- Group imports: third-party, then internal modules.
- Do not create circular imports between features.

---

## 10. Comments & Documentation

- Prefer self-explanatory names over comments.
- Add JSDoc comments for complex hooks and utilities, especially around consent, emergency flows, and access logging.

```ts
/**
 * Records a profile view in the audit log.
 * This must be called every time a doctor or patient opens a profile screen.
 */
export async function logProfileView(args: LogProfileViewInput) { ... }
```

---

## 11. Testing Expectations

- All utility functions must have unit tests.
- Complex hooks (e.g., consent management, report sharing) require integration tests.
- Screens with critical flows (emergency view, sharing, report upload) must have at least one automated test before release.

---

## 12. Linting & Formatting

- Use ESLint with React + TypeScript configs.
- Use Prettier for formatting; do not manually format.
- CI must fail on lint or type errors.

---

## 13. Handling Experimental Features

- Future features (AI assistant, family tree, WhatsApp integration, doctor onboarding) must be guarded by **feature flags**.
- Do not leave experimental code paths enabled by default in production builds.
