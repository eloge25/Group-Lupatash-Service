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
