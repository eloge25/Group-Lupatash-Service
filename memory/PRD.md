# PRD — Group Lupatash Service SARL (GLS)

## Problem Statement
Build a French 3D website for import/export & customs agency "Group Lupatash Service SARL" (GLS),
founded 2019, specialized in mining & automobile sectors, also pharmaceutical & commercial.
Worked with AECL, SicoMine, Jambo Mart, Malibu Cars. Needs trucks/ports imagery, customs
professionals scanning/carrying boxes. Site vitrine + contact form (DB) + admin dashboard.
Brand colors: blue, white, red.

## Architecture
- **Frontend**: React 19, Tailwind, framer-motion, @react-three/fiber@9 + drei (interactive 3D
  shipping containers), lucide-react icons, sonner toasts. Fonts: Outfit (display) + Manrope (body).
- **Backend**: FastAPI + MongoDB (motor). JWT auth (Bearer token in localStorage), bcrypt.
- **Routes**: `/` (home), `/login`, `/admin`.

## User Personas
- **Prospect/Client**: browses services/sectors, submits contact/quote request.
- **Admin GLS**: logs in to view/manage contact messages.

## Core Requirements (static)
- Sections: Accueil, À propos, Services, Secteurs (Mines/Automobile/Pharmaceutique/Commercial),
  Partenaires, Contact.
- Real interactive 3D in hero (blue/white/red containers).
- Contact form persists to DB; admin dashboard to read/mark/delete.

## Implemented (2026-06-30)
- ✅ Full bilingual-ready French marketing site with 3D hero, all 6 sections, marquee partners.
- ✅ Contact form → POST /api/contact (stored in Mongo).
- ✅ JWT admin auth (admin@gls-douane.com), admin dashboard with stats, list, detail, mark-read, delete, logout.
- ✅ Backend tested 11/11. Frontend E2E tested (login, contact, dashboard). Logout redirect race fixed.
- ✅ Generated GLS logo (dark + white variants).

## Backlog / Next
- **P1**: Replace placeholder phone number (+243 000 000 000) and email with real GLS contact info.
- **P1**: Replace generated logo with official GLS logo when provided.
- **P2**: Email notification on new contact (Resend/SendGrid).
- **P2**: Brute-force lockout on login; ProtectedRoute wrapper refactor.
- **P2**: Multi-language toggle (FR/EN); SEO meta + Open Graph.

## Credentials
See /app/memory/test_credentials.md
