# EmploiRapide 2.0 🚀

Plateforme moderne de recherche d'emploi en Côte d'Ivoire, construite avec Next.js 15.

## 🎯 Objectif

Refondre et moderniser EmploiRapide.Net avec :
- Une expérience utilisateur fluide et mobile-first
- Performance SEO optimale
- Module intelligent d'analyse de CV

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **UI** : TailwindCSS + HeadlessUI + Lucide Icons
- **État** : Zustand
- **Base de données** : Prisma + SQLite (dev) / PostgreSQL (prod)
- **Auth** : NextAuth.js
- **Déploiement** : Vercel

## 🚀 Démarrage rapide

### Installation

```bash
cd emploirapide-next
npm install
```

### Configuration

Le fichier `.env` est déjà configuré avec :
- Base de données SQLite locale
- Configuration NextAuth

### Lancer le projet en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Prisma
npx prisma studio        # Interface visuelle de la BDD
npx prisma generate      # Générer le client Prisma
npx prisma db push       # Pousser le schéma vers la BDD
```

## 📁 Structure du projet

```
emploirapide-next/
├── app/                    # Pages et routes (App Router)
│   ├── api/               # API routes
│   ├── jobs/              # Pages liées aux offres
│   ├── cv/                # Upload et analyse CV
│   └── dashboard/         # Espaces recruteur/candidat
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires et config
│   ├── colors.ts         # Palette de couleurs
│   ├── utils.ts          # Fonctions utilitaires
│   ├── auth.ts           # Config NextAuth
│   └── prisma.ts         # Client Prisma
├── prisma/               # Schéma et migrations BDD
├── styles/               # Styles globaux
└── data/                 # Données mockées
```

## 🎨 Palette de couleurs

- **Primary** : `#0057B8` (Bleu confiance)
- **Secondary** : `#FFB81C` (Jaune énergie)
- **Accent** : `#E62E2D` (Rouge attention)
- **Background** : `#F9FAFB` (Fond clair)
- **Success** : `#16A34A`
- **Error** : `#DC2626`

## 📝 Fonctionnalités MVP

- ✅ Recherche d'offres par mots-clés/ville
- ✅ Affichage des offres avec pagination
- ✅ Détail d'une offre
- ✅ Upload CV + analyse basique
- ✅ Authentification email/password
- ✅ Dashboard recruteur

## 🔐 Authentification

L'authentification est gérée par NextAuth.js avec :
- Provider Credentials (email/password)
- Hashing bcrypt
- Sessions JWT
- Rôles utilisateur (candidat/recruteur/admin)

## 🗄️ Base de données

Le schéma Prisma inclut :
- **User** : Utilisateurs (candidats/recruteurs)
- **Job** : Offres d'emploi
- **Application** : Candidatures
- **CV** : CVs téléchargés et analysés

## 📦 Prochaines étapes

1. Intégration du design de l'écran d'accueil
2. Développement des composants UI
3. Implémentation du module d'analyse CV
4. Mise en place du scraping d'offres
5. Tests et optimisation

## 🤝 Contribution

Ce projet est développé avec passion pour moderniser l'accès à l'emploi en Côte d'Ivoire.

---

**Fait avec ❤️ pour EmploiRapide**
