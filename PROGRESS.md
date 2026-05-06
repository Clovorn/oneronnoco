# OneRonnoco — Build Progress

## Phase 1 — Foundation + Lead Pipeline

### Status: IN PROGRESS

### Completed ✅
- [x] Project specification received and read in full
- [x] Local project workspace created at `projects/oneronnoco`
- [x] Prior FrankOS work preserved in separate archive project
- [x] React 18 + Vite app scaffolded
- [x] Tailwind CSS installed and configured (Ronnoco brand colors)
- [x] Dependencies installed: react-router-dom, zustand, supabase-js, recharts, tanstack/react-table, xlsx, headlessui, heroicons, date-fns, clsx
- [x] `.env.example` created with all required variables
- [x] `netlify.toml` configured for Vite + SPA redirect
- [x] Full SQL schema written (migrations 001, 002, 003)
  - All tables from spec sections 5.1–5.7
  - All RLS policies
  - Seed data (distributors, Core-Mark divisions, programs, ROMs, form registry)
  - Lead/deal auto-numbering sequences
- [x] Supabase Edge Functions scaffolded
  - `jotform-intake` — full lead/deal intake with field mapping, lead linking logic
  - `send-notification` — Resend email delivery
  - `velocity-parse` — placeholder for Phase 3
- [x] React app structure built per Section 8 spec
  - `src/lib/supabase.js` — Supabase client
  - `src/store/authStore.js` — Zustand auth store with role
  - `src/store/uiStore.js` — Zustand UI state
  - `src/hooks/useAuth.js`
  - `src/hooks/usePermissions.js`
  - `src/hooks/useLeads.js`
  - `src/hooks/useDeals.js`
  - `src/hooks/useNotifications.js`
  - `src/utils/formatters.js`
  - `src/utils/permissions.js`
  - `src/components/layout/AppShell.jsx`
  - `src/components/layout/Sidebar.jsx` — role-based nav
  - `src/components/layout/Header.jsx` — with notification bell
  - `src/components/ui/Badge.jsx` — all badge variants
  - `src/components/ui/Spinner.jsx`
  - `src/components/ui/Modal.jsx` — Headless UI modal
  - `src/pages/auth/Login.jsx`
  - `src/pages/auth/ForgotPassword.jsx`
  - `src/pages/DashboardPage.jsx`
  - `src/pages/leads/LeadsPage.jsx` — list, filters, search, table
  - `src/pages/deals/DealsPage.jsx` — stage tabs, urgency badges, realtime

### Pending — Phase 1 Remaining 🔲
- [ ] Create Supabase project (requires operator: supabase.com → New Project → `oneronnoco`)
- [ ] Apply SQL migrations 001, 002, 003 via Supabase SQL editor
- [ ] Configure Supabase Auth settings (email/password, disable email confirmation)
- [ ] Create GitHub repo `oneronnoco`
- [ ] Initial commit and push
- [ ] Connect Netlify to GitHub repo and verify deployment
- [ ] Add `.env` with real Supabase URL + anon key
- [ ] Verify login/auth works end to end
- [ ] Lead detail page (`/leads/:id`)
- [ ] New lead form (`/leads/new`)
- [ ] Pipeline step advancement modal
- [ ] Rep assignment modal
- [ ] Admin user management page
- [ ] Admin form registry page
- [ ] Deploy Jotform webhook Edge Function
- [ ] Test Jotform webhook with sample payload

---

## Phase 2 — Deal Processing
Not started.

## Phase 3 — Velocity Intelligence
Not started.

## Phase 4 — Reporting & Communications
Not started.

## Phase 5 — External Portals
Not started.
