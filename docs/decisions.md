# Architectural Decisions – Medi Note

## ADR-001: Mobile Stack
- Expo + React Native + TypeScript
- Reason: fast iteration, OTA updates, shared codebase

## ADR-002: State Management
- React Query for server state
- Zustand for client/session state
- Reason: separation of concerns, simplicity

## ADR-003: Backend Communication
- REST JSON API
- Centralized apiClient
- Reason: clarity, auditability

## ADR-004: Security Posture
- Privacy-first
- No PHI in logs
- Consent-driven access
