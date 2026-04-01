# Carte Fidélité - Wallet iOS & Android

Système complet de cartes de fidélité pour restaurants indépendants, avec intégration native Apple Wallet et Google Wallet.

## Fonctionnalités

- **Programmes flexibles** : tampons (10 visites = 1 cadeau) ou points (accumuler des points)
- **Apple Wallet** : génération de fichiers `.pkpass` signés, mise à jour automatique via APNs
- **Google Wallet** : création de passes Loyalty via l'API REST, lien "Add to Google Wallet"
- **Dashboard restaurant** : gestion des programmes, liste des clients, statistiques
- **Scanner QR** : scan via la caméra du téléphone pour ajouter des tampons/points
- **Page d'inscription client** : responsive, détection iOS/Android automatique
- **Sécurité** : auth JWT, rate limiting, helmet

## Architecture

```
carte-fidelite/
  backend/          # API Node.js + Express + TypeScript + Prisma
  frontend/         # Dashboard React + Vite + TailwindCSS
  passes/templates/ # Assets visuels pour les passes (logo, icon)
```

## Prérequis

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **Apple Developer Account** ($99/an) pour Apple Wallet
- **Google Cloud Console** avec API Google Wallet activée

## Installation

### 1. Base de données

```bash
# Créer la base PostgreSQL
createdb carte_fidelite
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres (DATABASE_URL, JWT_SECRET, etc.)

npm install
npx prisma migrate dev --name init
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le dashboard est accessible sur `http://localhost:5173`.

## Configuration des Wallets

### Apple Wallet

1. Connectez-vous à [Apple Developer](https://developer.apple.com)
2. Créez un **Pass Type ID** (ex: `pass.com.votredomaine.loyalty`)
3. Générez un certificat de signature pour ce Pass Type ID
4. Téléchargez le certificat WWDR d'Apple
5. Placez les fichiers dans `backend/certs/` :
   - `wwdr.pem` : certificat WWDR
   - `signerCert.pem` : votre certificat de signature
   - `signerKey.pem` : votre clé privée
6. Mettez à jour `.env` avec votre `APPLE_PASS_TYPE_ID` et `APPLE_TEAM_ID`

### Google Wallet

1. Activez l'API Google Wallet dans [Google Cloud Console](https://console.cloud.google.com)
2. Créez un compte de service avec le rôle "Wallet Object Issuer"
3. Téléchargez la clé JSON du compte de service
4. Placez-la dans `backend/certs/google-service-account.json`
5. Dans la [Google Pay & Wallet Console](https://pay.google.com/business/console), récupérez votre Issuer ID
6. Mettez à jour `.env` avec `GOOGLE_WALLET_ISSUER_ID`

### Assets des passes (optionnel)

Placez dans `passes/templates/` :
- `logo.png` : logo affiché sur le pass (160x50px recommandé)
- `icon.png` : icône du pass (29x29px)

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription restaurant |
| POST | `/api/auth/login` | Connexion restaurant |
| GET | `/api/restaurants/me` | Profil restaurant |
| GET | `/api/restaurants/stats` | Statistiques |
| POST | `/api/programs` | Créer un programme |
| GET | `/api/programs` | Lister les programmes |
| GET | `/api/programs/:id` | Détails d'un programme |
| GET | `/api/cards` | Lister les cartes clients |
| POST | `/api/cards/:serial/stamp` | Ajouter un tampon/points |
| POST | `/api/cards/:serial/redeem` | Utiliser une récompense |
| GET | `/api/public/programs/:id` | Info programme (public) |
| POST | `/api/public/register/:programId` | Inscription client |
| GET | `/api/passes/apple/:serial` | Télécharger .pkpass |
| GET | `/api/passes/google/:serial` | URL Google Wallet |

## Parcours utilisateur

1. Le restaurant crée un programme de fidélité via le dashboard
2. Il partage le lien d'inscription (`/join/:programId`) avec ses clients
3. Le client s'inscrit et reçoit sa carte dans son wallet (iOS ou Android)
4. A chaque visite, le restaurant scanne le QR code de la carte via le scanner
5. La carte se met à jour automatiquement dans le wallet du client
6. Quand l'objectif est atteint, le client reçoit sa récompense
