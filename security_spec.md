# Security Specification — Project Growth Roadmap (No-Auth Workspace)

## 1. Data Invariants

1. **Direct Workspace Collaboration (No Google Auth Required)**: Per user request, reading and editing `roadmap_items` and appending to `audit_logs` does not require Google Sign-In.
2. **Strict Schema & Allowlist Enforcement**: Every `roadmap_items` and `audit_logs` write is validated against `hasAll` and `hasOnly` field allowlists, strict string types and max sizes, valid workstream/status/action enums, and `^[a-zA-Z0-9_\-]+$` ID regex checks to block shadow fields and resource exhaustion.
3. **Immutable Audit Trail**: `audit_logs` entries are strictly append-only (`update` and `delete` are denied for everyone).
4. **Temporal Integrity & Immortality**: `createdAt` and `updatedAt` must equal `request.time`; `id`, `visibility`, `createdBy`, and `createdAt` are immutable on updates.
5. **Default-Deny Catch-All**: All other collections and paths remain denied by default (`match /{document=**} { allow read, write: if false; }`).
