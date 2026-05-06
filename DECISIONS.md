# OneRonnoco — Build Decisions

## 2026-05-06 — Initial scaffold decisions

### D001 — Lead numbering using Postgres sequence
**Decision:** Used `NEXTVAL('public.lead_number_seq')` directly in the column default.
**Reason:** Simpler than a trigger, avoids race conditions, native Postgres approach.

### D002 — Headless UI for modals
**Decision:** Used `@headlessui/react` for Modal and dropdown components.
**Reason:** Spec mentioned Tailwind CSS; Headless UI is the standard unstyled companion for Tailwind projects. Provides accessible focus trapping and transitions.

### D003 — Path aliases
**Decision:** Configured `@` as alias for `src/` in both `vite.config.js`.
**Reason:** Spec file structure uses deep paths; aliases keep imports clean throughout.

### D004 — Edge Function for Jotform intake handles both leads and deals
**Decision:** Single `jotform-intake` function handles both form types, branching on `form.form_type`.
**Reason:** Spec describes this in Section 6.5. Adding new forms only requires form_registry insert — no code change needed.

### D005 — Realtime subscription in useDeals hook
**Decision:** Supabase Realtime channel is opened inside `useDeals` on the deals table.
**Reason:** Spec Section 7.2 requires new deals appear without page refresh for ops staff. This is the standard Supabase realtime pattern.

### D006 — Supabase client graceful fallback
**Decision:** Supabase client uses placeholder URL/key when env vars are missing.
**Reason:** Allows the app to render in dev without crashing before real credentials are available. All actual queries will fail until real credentials are provided — this is expected behavior.

### D007 — velocity_status field added to customers table
**Decision:** Added `velocity_status` field to customers table (not in original spec's customer table definition).
**Reason:** Spec Section 11 describes account status calculation and implies it needs to be stored somewhere accessible. Customer record is the correct canonical location.
