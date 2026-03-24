# Avizio — SaaS de gestion automatisée d'avis clients

Avizio envoie automatiquement un SMS après chaque visite client. Les clients satisfaits sont redirigés vers Google Reviews, les mécontents vous contactent en privé.

## Stack technique

- **Frontend** : Next.js 14 + Tailwind CSS + TypeScript
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL via Prisma ORM
- **SMS** : Twilio
- **Paiements** : Stripe
- **Déploiement** : Vercel

## Installation

### 1. Cloner et installer

```bash
git clone https://github.com/louisfrechede/avizio.git
cd avizio
npm install
```

### 2. Configurer la base de données

Créer une base PostgreSQL gratuite sur [Neon](https://neon.tech) ou [Supabase](https://supabase.com).

```bash
cp .env.example .env
# Remplir DATABASE_URL avec l'URL de votre base
```

### 3. Initialiser la base

```bash
npx prisma db push
npx prisma generate
```

### 4. Lancer en local

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Inscription + connexion
│   │   ├── business/      # Info publique commerce
│   │   ├── customers/     # CRUD clients
│   │   ├── dashboard/     # Stats dashboard
│   │   ├── reviews/       # Gestion avis
│   │   ├── sms/           # Envoi SMS
│   │   └── webhooks/      # Stripe webhooks
│   ├── dashboard/         # Dashboard commerçant
│   ├── login/             # Page de connexion
│   └── rate/[businessId]/ # Page de notation client
├── components/
│   └── Sidebar.tsx
└── lib/
    ├── auth.ts            # JWT + bcrypt
    ├── prisma.ts          # Client Prisma
    └── sms.ts             # Twilio + logique SMS
```

## API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/signup` | POST | Inscription commerçant |
| `/api/auth/login` | POST | Connexion |
| `/api/dashboard` | GET | Stats du dashboard |
| `/api/reviews` | GET/POST | Liste + création d'avis |
| `/api/sms` | GET/POST | Historique + envoi SMS |
| `/api/customers` | GET/POST | Liste + ajout clients |
| `/api/business/[id]` | GET | Info publique (page de notation) |
| `/api/webhooks/stripe` | POST | Webhook Stripe |

## Déploiement sur Vercel

1. Push le code sur GitHub
2. Connecter le repo sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement dans Vercel Settings
4. Déployer

---

Fait avec ❤️ par Louis & Avizio
