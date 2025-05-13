# Jekle - Plateforme de Streaming

## Structure du Projet

\`\`\`
ezyZip/
├── app/                      # Dossier principal de l'application Next.js
│   ├── admin/                # Pages d'administration
│   ├── dashboard/            # Pages du tableau de bord utilisateur
│   ├── requests/             # Pages de demandes de films
│   ├── api/                  # Routes API Next.js
│   ├── globals.css           # Styles globaux
│   └── layout.tsx            # Layout principal
├── components/               # Composants React
│   ├── admin/                # Composants d'administration
│   ├── dashboard/            # Composants du tableau de bord
│   ├── requests/             # Composants de demandes
│   ├── ui/                   # Composants UI réutilisables
│   └── ...
├── lib/                      # Bibliothèques et utilitaires
├── hooks/                    # Hooks React personnalisés
├── public/                   # Fichiers statiques
├── types/                    # Types TypeScript
├── netlify/                  # Fonctions Netlify
│   └── functions/            # Fonctions serverless
├── .env.local                # Variables d'environnement locales
├── netlify.toml              # Configuration Netlify
├── next.config.mjs           # Configuration Next.js
├── package.json              # Dépendances et scripts
└── README.md                 # Documentation
\`\`\`

## Déploiement sur Netlify

### Prérequis

- Un compte GitHub
- Un compte Netlify
- Une base de données MongoDB (Atlas ou autre)
- Un compte Gmail pour l'envoi d'emails

### Configuration des variables d'environnement

Avant de déployer, vous devez configurer les variables d'environnement suivantes sur Netlify:

- `MONGODB_URI`: Votre chaîne de connexion MongoDB
- `JWT_SECRET`: Une chaîne aléatoire pour signer les JWT
- `EMAIL_USER`: Votre adresse Gmail
- `EMAIL_PASS`: Mot de passe d'application Gmail
- `NEXTAUTH_SECRET`: Une chaîne aléatoire pour NextAuth
- `NEXTAUTH_URL`: L'URL de votre site Netlify

### Étapes de déploiement

1. **Créer un dépôt GitHub**

   Créez un nouveau dépôt sur GitHub et poussez votre code:

   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/ezyZip.git
   git push -u origin main
   \`\`\`

2. **Connecter Netlify à GitHub**

   - Connectez-vous à votre compte Netlify
   - Cliquez sur "New site from Git"
   - Sélectionnez GitHub comme fournisseur
   - Autorisez Netlify à accéder à vos dépôts
   - Sélectionnez votre dépôt ezyZip

3. **Configurer les paramètres de build**

   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Configurer les variables d'environnement**

   Dans les paramètres du site Netlify, ajoutez les variables d'environnement mentionnées ci-dessus.

5. **Déployer**

   Cliquez sur "Deploy site" et attendez que le déploiement soit terminé.

## Développement local

1. Installez les dépendances:

   \`\`\`bash
   npm install
   \`\`\`

2. Créez un fichier `.env.local` avec les variables d'environnement nécessaires.

3. Démarrez le serveur de développement:

   \`\`\`bash
   npm run dev
   \`\`\`

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Fonctionnalités

- **Authentification**: Inscription avec vérification par email, connexion avec JWT
- **Catalogue de films**: Affichage des films et séries disponibles
- **Lecture de vidéos**: Support pour les vidéos Google Drive
- **Demandes de films**: Les utilisateurs peuvent demander l'ajout de nouveaux films
- **Administration**: Gestion des utilisateurs, films et demandes

## Identifiants de test

- **Admin**: 
  - Username: djamalax19
  - Password: Tiger19667

## Notes techniques

- Les URL Google Drive sont automatiquement transformées en URLs de prévisualisation
- La base de données MongoDB stocke les utilisateurs, films et demandes
- L'API est déployée comme une fonction serverless Netlify
- L'authentification utilise JWT avec tokens d'accès et de rafraîchissement
