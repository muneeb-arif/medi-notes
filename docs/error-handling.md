# Error Handling Guidelines – Medi Note

The purpose of this document is to define how errors are detected, handled, logged, and presented to users throughout the system. For a healthcare app, error handling must be conservative and user-friendly.

## 1. Principles

1. **Never compromise safety** – if in doubt, show less data, not more.
2. **Fail visibly but calmly** – always show a clear message; never crash silently.
3. **Do not leak PHI** – error messages and logs must avoid sensitive details.
4. **Be recoverable** – give users an obvious next step (retry, contact support, etc.).

---

## 2. Error Categories

### 2.1 Client-Side Errors

- Validation failures (invalid date, empty required field)
- Navigation issues (missing route params)
- Local network issues (offline, timeout)

### 2.2 Server-Side Errors

- 4xx (bad request, unauthorized, forbidden, not found)
- 5xx (internal server error, dependency failure)
- Storage issues (file upload failure)

### 2.3 Security & Access Errors

- Unauthorized profile access
- Expired or invalid share link
- Emergency access disabled

---

## 3. User-Facing Error Patterns

### 3.1 Toast / Snackbar

For transient errors that do not block the main screen:

- Failed background refresh
- Temporary network hiccup

Example:

> “Couldn’t refresh reports. Pull to retry.”

### 3.2 Inline Form Errors

- Each field shows its own error message when validation fails.
- Multi-field errors show a banner at top of form.

Example:

> “Please enter a valid date of birth.”

### 3.3 Full-Screen Error State

Use the shared `ErrorState` component (icon + title + description + primary button) for:

- Hard failure to load a critical screen (Home, Profile, Emergency Info, Report Viewer).
- Unknown errors after multiple retries.

Example for reports:

- Title: “We couldn’t load your reports”
- Subtitle: “Check your connection and try again.”
- Button: “Retry”

---

## 4. Error Handling in Code

### 4.1 API Layer

- All `apiClient` calls must:
  - throw a custom error object with:
    - `statusCode`
    - `code` (optional machine-readable code)
    - `message` (generic safe message)
- The actual server response (if sensitive) is **not** exposed directly to UI.

```ts
interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export async function apiClient<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await axiosInstance.request<T>(config);
    return res.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
```

### 4.2 React Query

- Use `onError` callbacks to:
  - log the error (without PHI)
  - show appropriate user messages

```ts
const { data, error, isLoading } = useReports(personId);

if (error) {
  return <ErrorState title="Couldn't load reports" onRetry={refetch} />;
}
```

### 4.3 Mutations (e.g., upload report, edit profile)

- Show optimistic UI only when safe.
- If a mutation fails:
  - roll back any optimistic state
  - show an inline or toast error
  - for uploads, show “Retry” and “Cancel” buttons

---

## 5. Security-Related Errors

- Access denied to profile or report:
  - Message: “You don’t have permission to view this information.”
  - Do not reveal whether the resource exists or not.
- Expired token:
  - Prompt re-login.
- Emergency access disabled:
  - Message: “Emergency access for this profile is disabled.”

All security-related errors must be logged with:

- anonymized user ID
- action attempted
- timestamp
- IP/device fingerprint (if applicable)

---

## 6. File Upload & Report Viewer Errors

- If upload fails:
  - Show explicit error state from SRS (Screen 14).
  - Keep the file reference in memory while on screen so user can retry.
- If viewer fails to load a PDF/image:
  - Show placeholder with message: “We couldn’t display this file.”
  - Provide “Download File” as an alternative.

---

## 7. Offline & Connectivity

- Detect offline status via NetInfo.
- For critical screens:
  - show inline banner: “You are offline. Some information may be outdated.”
- For operations requiring network (upload, share, chat):
  - prevent action with clear message if offline.

---

## 8. Logging

- Errors are logged using a central logger (Sentry or similar).
- Payload must exclude PHI:
  - Only include IDs, error codes, request type, and optional anonymized metadata.
- Use structured logging where possible.

---

## 9. Edge Cases

- Partial data:
  - If some sections fail while others succeed (e.g., vitals loaded, appointments failed), show partial data plus a localized error for the failed section.
- Timeouts:
  - Use sensible timeouts (e.g., 15–30 seconds) to avoid infinite waiting.
  - Treat timeouts as network errors and show retry options.

---

## 10. Developer Responsibilities

- No `console.error` left in production; use the central logger.
- All new APIs must have explicit error mapping to user-friendly messages.
- QA must test:
  - server down
  - auth revoked
  - network offline
  - failed uploads
  - invalid/expired share links
