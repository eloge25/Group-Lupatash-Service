# PRD — Group Lupatash Service SARL (GLS)

## Problem Statement
Site web 3D en français pour la société d'import/export et agence en douane "Group Lupatash Service SARL" (GLS), fondée en 2019, spécialisée dans les secteurs minier et automobile, avec expérience en pharmaceutique et commercial. Partenaires : AECL, SicoMine, Jambo Mart, Malibu Cars. Imagerie de camions, ports, professionnels des douanes scannant des colis.

## User Choices
- Type : Site vitrine + formulaire de contact (messages en base + tableau de bord admin)
- 3D : Vrais effets 3D interactifs + animations modernes/parallaxe
- Sections : Accueil, À propos, Services, Secteurs, Partenaires, Contact
- Contact : enregistrement en base + dashboard admin (pas d'email)
- Couleurs : bleu, blanc, rouge ; logo généré

## Architecture
- Frontend : React 19, Tailwind, framer-motion, @react-three/fiber@9 + drei (conteneurs 3D), react-router v7, sonner
- Backend : FastAPI + MongoDB (motor), JWT Bearer auth (bcrypt), endpoints /api/*
- Auth : token Bearer en localStorage (clé `gls_token`), admin seedé au démarrage

## Personas
- Visiteur/Client B2B (mines, auto, pharma, commerce) cherchant un transitaire/agent en douane
- Administrateur GLS gérant les demandes de contact

## Implemented (2026-06-30)
- Page d'accueil 3D : hero avec conteneurs maritimes animés (rouge/bleu/blanc), stats, CTA
- Sections : À propos (bento), Services (grille technique), Secteurs (cartes hover), Partenaires (marquee), Contact (formulaire)
- Backend : POST /api/contact, auth login/me, GET messages/stats, PATCH read, DELETE
- Dashboard admin : stats, liste, détail, recherche, marquer lu, supprimer, déconnexion
- Tests : backend 11/11, frontend 100% (logout race corrigé)

## Credentials
- Admin : admin@gls-douane.com / GlsAdmin2019!

## Backlog
- P1 : Notification email réelle des nouveaux messages (Resend/SendGrid)
- P1 : Remplacer le logo généré par le logo officiel + vraies coordonnées (tél/adresse)
- P2 : Page détaillée par secteur, témoignages clients, multilingue (FR/EN)
- P2 : Brute-force lockout, ProtectedRoute réutilisable
- P2 : SEO/meta, sitemap, favicon GLS

## Next Tasks
- Collecter logo officiel + coordonnées réelles auprès du client
- Ajouter l'envoi d'email sur nouveau message si souhaité

## Mise à jour (juin 2026)
- CORRIGÉ (P0): vrai logo GLS.jpg de l'utilisateur restauré partout (Navbar, Footer, Login, AdminDashboard) via clé unique COMPANY.logo, affiché dans une pastille blanche arrondie sur fonds sombres (aucune génération IA).
- AJOUT: Section "Équipe" (#equipe) + lien navbar. Membre: Mme Lukenge Pataoli Asha Konde, Directrice Générale, avec photo fournie. Tableau TEAM dans content.js prêt à recevoir les autres membres (promis par l'utilisateur "demain").
- Fichiers: /app/frontend/src/components/Team.jsx, data/content.js, HomePage.jsx

## Mise à jour 2 (juin 2026)
- Logo incrusté: fond blanc supprimé via PIL -> /app/frontend/public/logo-gls.png (transparent), affiché avec drop-shadow blanc sur fonds sombres. Plus aucune pastille blanche.
- Bouton WhatsApp flottant (wa.me/243975007535) sur la page d'accueil (WhatsAppButton.jsx).
- Suivi de dossier: backend /api/dossiers (CRUD protégé, référence auto GLS-YYYY-XXXX, historique) + /api/track/{ref} public. Section #suivi (Tracking.jsx) avec timeline 6 étapes. Onglet "Dossiers" dans le dashboard admin (components/admin/DossiersPanel.jsx). Statuts: recu/documents/declaration/liquidation/libere/livre.
- Témoignages: section #temoignages (Testimonials.jsx) avec SicoMine, Malibu Cars, Jambo Mart, AECL.
- Nav: ajout lien "Suivi". Testé: iteration_4.json — 100% backend (22/22) et frontend.
- Dossier démo en base: GLS-2026-JB57 (Test Client / SicoMine, statut declaration).

## Audit de sécurité + durcissement (juin 2026)
Audit: CONDITIONAL PASS -> correctifs appliqués et testés (iteration_5.json, 34/34 backend, frontend 100%):
- SEC-001: références dossiers passées de 4 à 8 caractères (GLS-YYYY-XXXXXXXX, 36^8 combinaisons) + rate limit /api/track (15/min/IP) -> énumération infaisable. Ancien dossier démo supprimé, nouveau: GLS-2026-RIAYO3J8.
- SEC-002: parse_oid() -> 404 propre au lieu de 500 sur ObjectId invalide (dossiers + messages).
- Brute force login: verrouillage 15 min après 5 échecs/IP + 10 req/min. Contact: 5/5min/IP + max_length Pydantic sur tous les champs. JWT: 24h au lieu de 7j. CORS: allow_credentials=False. Seed admin: fail-fast sur env manquantes, create-only (plus de reset au boot). .gitignore: .env ajouté. Index unique sur dossiers.reference.
- Rate limiting en mémoire par IP (X-Forwarded-For 1er hop) — suffisant mono-pod; Redis si scaling horizontal (backlog P2).

## 3 nouvelles fonctionnalités (juin 2026) — testées iteration_6.json (100%)
1. WhatsApp Dossier: champ client_phone sur les dossiers (privé, jamais exposé via /api/track) + bouton WhatsApp vert par ligne dans l'admin (wa.me + message FR avec référence et lien #suivi).
2. Changement mot de passe: POST /api/auth/change-password (vérif mdp actuel, min 8 car., rate-limité 5/5min) + onglet "Paramètres" dans le dashboard (components/admin/SettingsPanel.jsx).
3. i18n FR/EN: /app/frontend/src/i18n/{translations.js,LanguageContext.jsx}, toggle FR/EN dans la Navbar, persistance localStorage 'gls-lang', tout le site public traduit (admin reste FR). Les statuts de suivi sont traduits côté frontend par code.
Note: content.js garde COMPANY/IMAGES/SECTORS(images)/TEAM(photo)/PARTNERS/DOSSIER_STATUSES(admin FR).

## Intégration Claude AI (juin 2026) — testée iteration_7.json (100%)
- Modèle: Claude Haiku 4.5 (claude-haiku-4-5-20251001) via emergentintegrations + EMERGENT_LLM_KEY (backend/.env).
- Chatbot public bilingue: ChatWidget.jsx (bouton flottant au-dessus de WhatsApp), streaming SSE (POST /api/chat), mémoire multi-tours par session (db.chat_messages, 10 derniers messages réinjectés dans le system prompt), historique restauré au rechargement (sessionStorage 'gls-chat-session' + GET /api/chat/history/{sid}), rate limit 15/min/IP, réponses texte brut (Markdown interdit).
- Brouillon IA admin: POST /api/admin/draft-reply/{msg_id} (protégé, 10/5min) → DraftReply.jsx dans le détail d'un message (streaming, Copier, mailto pré-rempli, Régénérer).
- System prompt GLS_KNOWLEDGE dans server.py: faits entreprise, pas de prix/délais, hors-sujet refusé.

## Équipe (juin 2026)
- Ajout M. Akilimali K. Eloge, Consultant (photo fournie), FR + EN. Équipe = 2 membres (DG + Consultant). Vérifié par capture d'écran.
