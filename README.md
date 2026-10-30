# 🏢 EcoPilot - Application d'Inventaire IT & Traçabilité (Next.js & Docker)

Application complète de gestion du parc informatique, licences logicielles et traçabilité d'affectation aux collaborateurs, conteneurisée avec **Docker** et reprenant la charte graphique et le thème corporate de **frontend-intern**.

---

## 🎨 Alignement avec le Thème `frontend-intern`

- **Couleur Primaire (Logo Blue) :** `hsl(205, 100%, 45%)` (`#0084E6`)
- **Fond de page :** Gris-bleu professionnel `#EFF1F8` (`hsl(228, 33%, 95%)`)
- **Sidebar :** Bleu nuit corporate `hsl(210, 90%, 10%)` avec surbrillance active
- **Typographie :** *Inter* pour l'interface & *JetBrains Mono* pour les Tags d'inventaire, numéros de série et clés logicielles
- **Dark Mode :** Support complet natif avec bascule en 1 clic (Header)

---

## 🚀 Lancement Rapide sur Docker

L'application est 100% conteneurisée avec un `Dockerfile` multi-stage optimisé (Node 20 Alpine standalone) et son fichier `docker-compose.yml`.

### Démarrage en 1 commande :

```bash
cd invantaire
docker compose up --build -d
```

L'application est immédiatement accessible sur votre navigateur à l'adresse :
👉 **`http://localhost:3000`**

### Pour arrêter le conteneur :

```bash
docker compose down
```

---

## 💻 Lancement en Local (Développement Sans Docker)

```bash
cd invantaire
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## 📋 Modules & Fonctionnalités Incluses

### 1. 🔐 Authentification & Premier Accès (`/login`)
- Premier écran d'accueil avec le design strict de **frontend-intern** (panneau gauche `/login.png.png`, logo, formulaire corporate).
- **Identifiants administrateur configurés :**
  - **Email :** `marwa@eco-pilot.com`
  - **Mot de passe :** `123456`
- Sécurisation des accès et redirection automatique vers le Dashboard.

### 2. 📊 Tableau de Bord Central (`/dashboard`)
- **KPIs en temps réel :** Total PC, Postes en service, Stock libre, Écrans connectés, Licences actives, Alertes de stock.
- **Jauge opérationnelle :** Répartition visuelle du parc informatique (Affecté, En stock, En SAV).
- **Fil d'actualité d'audit :** Dernières actions d'affectation et restitutions.

### 3. 💻 Parc Ordinateurs / PC (`/dashboard/pc`)
- Fiches détaillées : Tag, Marque (Dell, Lenovo, HP...), Modèle, N° de Série, Processeur, RAM, SSD, Garantie.
- Actions directes :
  - **Affecter à un collaborateur** (avec choix de l'état : Neuf, Bon état, etc.)
  - **Restituer en stock**
  - **Transférer en maintenance SAV**
  - **Ajout rapide d'un nouvel équipement**

### 4. 🖥️ Écrans & Moniteurs (`/dashboard/ecrans`)
- Suivi des moniteurs de bureau (24", 27" 4K, 34" Ultrawide incurvés, Hubs USB-C 90W).
- Affichage de l'emplacement et du collaborateur associé.
- Affectation et retour instantanés.

### 5. 🖱️ Accessoires & Périphériques (`/dashboard/accessoires`)
- Gestion des stocks de souris ergonomiques, claviers, casques antibruit, stations d'accueil et adaptateurs.
- Alertes visuelles automatiques lorsque le seuil critique de stock est atteint.
- Remise rapide en stock ou distribution en lot aux collaborateurs.

### 6. 🔑 Licences Logicielles & Abonnements (`/dashboard/licences`)
- Suivi des licences (Microsoft 365, JetBrains, Autodesk, Adobe CC, SentinelOne...).
- Suivi du ratio de sièges utilisés vs sièges totaux avec jauge.
- Masquage / affichage sécurisé des clés d'activation.
- Attribution et révocation nominative des accès par employé.

### 7. 👥 Collaborateurs & Dotations (`/dashboard/employes`)
- Annuaire complet des collaborateurs par département (IT, Études, RH, Direction, Travaux).
- Vue synoptique de la dotation de chaque employé (PC + Écrans + Licences).
- **Génération du Bon de Remise / Décharge signée** conforme et imprimable en 1 clic.

### 8. 📜 Traçabilité Complète & Journal d'Audit (`/dashboard/tracabilite`)
- Registre d'audit infalsifiable et horodaté à chaque mouvement.
- Références de décharges signées (#DCH-xxxx).
- Filtres multi-critères et **export immédiat en CSV**.

### 9. ☕ Autres Équipements & Locaux (`/dashboard/equipements`)
- Suivi du parc hors IT traditionnel :
  - **Électroménager & Espace Pause :** Machines à café (grains De'Longhi, capsules Nespresso Pro), réfrigérateur, micro-ondes, fontaine à eau Culligan.
  - **Bureautique :** Imprimantes multifonctions réseau, broyeurs de documents sécurisés.
  - **Audiovisuel & Visio :** Vidéoprojecteurs 4K de réunion, barres de visioconférence intelligentes (Logitech Rally Bar).
  - **Confort & Mobilier :** Équipements ergonomiques et confort des locaux.
- Fiches détaillées : Tag, Marque, Modèle, N° de Série, Emplacement/Salle, Référent/Responsable, Coût d'acquisition et Consignes d'entretien.
- Actions directes :
  - Ajout rapide avec modèles préconfigurés en 1 clic
  - Déclaration de mise en maintenance ou détartrage avec suivi de notes
  - Remise en service ou déclassement
  - **Export complet en CSV**

