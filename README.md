# 🎓 MemoireUP - Frontend

Bienvenue sur le dépôt **Frontend** de MemoireUP. Ce projet est une plateforme universitaire d'excellence (développée avec Next.js 15, React 19 et Tailwind CSS) permettant de consulter, déposer et gérer des mémoires académiques.

Ce guide vous expliquera de A à Z comment cloner le projet, l'installer et le lancer sur votre machine locale.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :

1. **Node.js** (version 18.17 ou supérieure recommandée) : [Télécharger Node.js](https://nodejs.org/)
2. **Git** : [Télécharger Git](https://git-scm.com/)

---

## 🚀 Installation de A à Z

Suivez ces étapes dans le terminal de votre choix (Command Prompt, PowerShell, Terminal MacOS/Linux, ou le terminal intégré de VS Code).

### Étape 1 : Cloner le dépôt (Repository)

Ouvrez votre terminal, placez-vous dans le dossier où vous souhaitez installer le projet (par exemple `cd Documents`), puis tapez la commande suivante :

```bash
git clone https://votre-lien-du-repo/memoire-frontend.git
```
*(Remplacez le lien ci-dessus par le lien Git réel de votre dépôt).*

### Étape 2 : Entrer dans le dossier du projet

Une fois le projet cloné, déplacez-vous à l'intérieur du dossier nouvellement créé :

```bash
cd memoire-frontend
```

### Étape 3 : Installer les dépendances

Le projet utilise des bibliothèques externes (comme Tailwind, Axios, Lucide-react etc.). Vous devez les télécharger en exécutant cette commande :

```bash
npm install
```
*Patientez quelques secondes / minutes pendant le téléchargement des paquets dans le dossier `node_modules`.*

### Étape 4 : Configurer l'environnement

Le frontend doit savoir où trouver l'API Backend.
1. À la racine du projet `memoire-frontend`, créez un nouveau fichier nommé exactement **`.env.local`**.
2. Ouvrez ce fichier et ajoutez-y l'URL de votre backend Django local :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
*(Assurez-vous que le backend Django tourne bel et bien sur le port 8000. S'il est sur un autre port, modifiez cette URL en conséquence).*

---

## 💻 Démarrer l'application

### Étape 5 : Lancer le serveur de développement

Toujours dans le dossier du projet `memoire-frontend`, lancez la commande :

```bash
npm run dev
```

### Étape 6 : Accéder au site

Une fois le serveur démarré, vous verrez un message indiquant l'URL locale.
Ouvrez votre navigateur web (Chrome, Firefox, Safari, Edge...) et allez à l'adresse suivante :

👉 **[http://localhost:3000](http://localhost:3000)**

🎉 **Félicitations !** L'application tourne sur votre machine.

---

## 🏗️ Pour la mise en production (Build)

Si vous souhaitez déployer l'application sur un serveur (comme Vercel ou VPS), vous ne devez pas utiliser `npm run dev` mais créer une version optimisée :

1. Compiler le projet :
   ```bash
   npm run build
   ```
2. Lancer la version compilée :
   ```bash
   npm start
   ```

---

## 📁 Structure principale du projet

- `src/app/` : Contient toutes les pages de l'application (Système de routing Next.js App Router).
  - `page.tsx` : La page d'accueil (Hero section, recherche de mémoires).
  - `login/` : Page de connexion.
  - `dashboard/` : Espace personnel (protégé) avec gestion par rôle.
- `src/app/components/` : Composants réutilisables (Sidebar, Layouts...).
- `src/app/contexts/` : Contexte React (`AuthContext.tsx`) pour gérer l'authentification et les routes protégées.
- `src/app/lib/api.ts` : Configuration de l'instance Axios (gestion automatique des Tokens JWT).
- `src/app/services/` : Services pour faire les requêtes à l'API backend.
- `src/app/types/index.ts` : Tous les modèles TypeScript du projet (Types stricts pour plus de sécurité).
