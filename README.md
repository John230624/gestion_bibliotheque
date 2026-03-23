# Biblio

Biblio est une application full-stack de gestion de bibliotheque.  
Le projet combine une interface publique moderne, un espace usager, un tableau de bord administrateur et une API securisee par JWT.

## Objectif du projet

Cette application permet de :

- consulter un catalogue de livres
- rechercher un ouvrage rapidement
- afficher la fiche detaillee d un livre
- envoyer une demande d emprunt
- suivre les demandes cote usager
- administrer les livres, les utilisateurs et les emprunts
- visualiser des statistiques de gestion

## Stack technique

- Frontend : `Next.js 15`, `React 19`, `TypeScript`
- Backend : `Symfony 7`, `Doctrine ORM`
- Base de donnees : `MySQL`
- Authentification : `JWT`

## Organisation du depot

```text
Sylvere/
  backend/     API Symfony
  frontend/    Application Next.js
  docs/
```

## Prerequis

Avant de lancer le projet, il faut disposer de :

- `PHP 8.2+`
- `Composer`
- `Node.js 20+`
- `npm`
- `MySQL 8+`
- `OpenSSL`

## Installation

### 1. Cloner le depot

```bash
git clone <URL_DU_REPO>
cd Sylvere
```

### 2. Installer les dependances backend

```bash
cd backend
composer install
```

### 3. Configurer le backend

Le backend utilise le fichier :

[backend/.env](C:\Users\Lenovo\Desktop\Projects\Sylvere\backend\.env)

Variables importantes :

```env
APP_ENV=dev
APP_SECRET=change_me
DATABASE_URL="mysql://root:@127.0.0.1:3306/gestion_bibliotheque?serverVersion=8.0.37&charset=utf8mb4"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=change_me
```

Points a verifier :

- `APP_SECRET`
- `DATABASE_URL`
- `JWT_PASSPHRASE`

#### APP_SECRET

Remplacer `APP_SECRET` par une valeur secrete.

Exemple :

```env
APP_SECRET=mon_secret_biblio_2026_ultra_prive
```

#### Base MySQL

Creer une base nommee :

```text
gestion_bibliotheque
```

Puis adapter `DATABASE_URL` si ton utilisateur ou ton mot de passe MySQL est different.

Exemple :

```env
DATABASE_URL="mysql://root:root@127.0.0.1:3306/gestion_bibliotheque?serverVersion=8.0.37&charset=utf8mb4"
```

### 4. Generer les cles JWT

Le projet a besoin de ces fichiers :

- `backend/config/jwt/private.pem`
- `backend/config/jwt/public.pem`

Commande a lancer :

```bash
cd backend
php scripts/generate_jwt_keys.php
```

Notes importantes :

- la commande lit `JWT_PASSPHRASE` dans le fichier `.env`
- les cles sont generees dans `backend/config/jwt/`
- si `JWT_PASSPHRASE` change, il faut regenerer les cles

### 5. Executer les migrations

```bash
cd backend
php bin/console doctrine:migrations:migrate --no-interaction
```

### 6. Creer un compte administrateur

Le projet ne repose pas sur un compte de demonstration obligatoire.

Commande :

```bash
cd backend
php bin/console app:create-admin admin@example.com MotDePasse123 "Admin Principal"
```

### 7. Lancer le backend

Commande recommande :

```bash
cd backend
php -S 127.0.0.1:8000 server.php
```

Important :

- utiliser `server.php`
- ne pas lancer le backend avec `php -S 127.0.0.1:8000 -t public`

### 8. Installer le frontend

```bash
cd frontend
npm install
```

### 9. Configurer le frontend

Le frontend utilise :

[frontend/.env.local](C:\Users\Lenovo\Desktop\Projects\Sylvere\frontend\.env.local)

Valeur attendue :

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### 10. Lancer le frontend

```bash
cd frontend
npm run dev
```

## Acces locaux

- Frontend : [http://localhost:3000](http://localhost:3000)
- Backend API : [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

## Parcours de verification recommande

### Cote usager

1. ouvrir la page d accueil
2. creer un compte
3. se connecter
4. ouvrir un livre
5. envoyer une demande d emprunt
6. consulter l espace `Compte`

### Cote administrateur

1. se connecter avec un compte admin
2. ouvrir `Tableau de bord`
3. ajouter un livre
4. ajouter une image locale pour ce livre
5. gerer une demande d emprunt
6. approuver ou rejeter une demande
7. fournir une note explicative en cas de rejet

## Commandes utiles

### Verifier la connexion MySQL

```bash
cd backend
php bin/console doctrine:query:sql "SELECT 1"
```

### Rejouer les migrations

```bash
cd backend
php bin/console doctrine:migrations:migrate --no-interaction
```

### Creer un autre administrateur

```bash
cd backend
php bin/console app:create-admin admin2@example.com MotDePasse123 "Deuxieme Admin"
```

## Problemes frequents

### `Failed to fetch`

Verifier que :

- le backend est bien lance
- le frontend est bien lance
- MySQL fonctionne
- `NEXT_PUBLIC_API_URL` pointe vers `http://127.0.0.1:8000/api`

### `Unexpected token '<'` ou erreur HTML renvoyee par le backend

Cela signifie generalement qu une erreur Symfony s est produite.

Verifier :

```bash
cd backend
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:query:sql "SELECT 1"
```

### Probleme JWT

Verifier que ces fichiers existent :

- `backend/config/jwt/private.pem`
- `backend/config/jwt/public.pem`

Sinon :

```bash
cd backend
php scripts/generate_jwt_keys.php
```

### Ancien rendu conserve par le navigateur

Faire un rechargement force :

```text
Ctrl + F5
```

Si besoin, relancer aussi le frontend :

```bash
cd frontend
npm run dev
```

## Mise sur GitHub depuis VS Code

### Methode interface VS Code

1. ouvrir le dossier `Sylvere` dans VS Code
2. aller dans `Source Control`
3. initialiser Git si necessaire
4. effectuer le premier commit
5. cliquer sur `Publish to GitHub`
6. choisir `Public` ou `Private`

### Methode terminal VS Code

Depuis la racine du projet :

```bash
git init
git add .
git commit -m "Initialisation du projet Biblio"
git branch -M main
git remote add origin <URL_DU_REPO>
git push -u origin main
```

## Recommandation pour la personne qui teste

Pour eviter les erreurs de demarrage :

1. verifier MySQL
2. verifier les cles JWT
3. lancer le backend
4. lancer ensuite le frontend

Cet ordre est important pour que les formulaires, les dashboards et le catalogue fonctionnent correctement des le premier essai.
