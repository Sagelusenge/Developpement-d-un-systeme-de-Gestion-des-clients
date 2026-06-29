# Guide GitHub du projet CRM PME

Ce document explique comment mettre le projet sur GitHub pour la première fois, comment ignorer les fichiers sensibles comme `.env`, et comment pousser les futures modifications proprement.

## 1. Pourquoi utiliser GitHub ?

GitHub permet de :

- sauvegarder le code du projet en ligne ;
- suivre l’historique des modifications ;
- travailler à plusieurs sans perdre les changements ;
- déployer plus facilement le backend et le frontend ;
- récupérer le projet sur une autre machine.

## 2. Créer le dépôt sur GitHub

Sur GitHub :

1. cliquer sur `New repository` ;
2. donner un nom au dépôt, par exemple :

```text
Developpement-d-un-systeme-de-Gestion-des-clients
```

3. choisir `Public` ou `Private` ;
4. ne pas cocher `Add a README file` si le projet contient déjà un README ;
5. cliquer sur `Create repository`.

GitHub donnera ensuite une URL du genre :

```bash
https://github.com/Sagelusenge/Developpement-d-un-systeme-de-Gestion-des-clients.git
```

## 3. Ouvrir le terminal dans le projet

Se placer à la racine du projet :

```bash
cd C:\Users\sagel\Downloads\programmation\CRM-PME
```

La racine du projet est le dossier qui contient généralement :

- `backend/`
- `frontend/`
- `docs/`
- `.gitignore`
- `README.md`

## 4. Initialiser Git

Si le projet n’est pas encore initialisé avec Git :

```bash
git init
```

Cette commande crée un dossier caché `.git/` qui permet à Git de suivre l’historique du projet.

## 5. Ignorer les fichiers sensibles avec `.gitignore`

Le fichier `.env` contient des informations sensibles :

- clés Stripe ;
- clés OpenAI ;
- mots de passe ;
- identifiants de base de données ;
- secrets JWT ;
- secrets SMTP ;
- secrets de webhook.

Il ne faut jamais envoyer ce fichier sur GitHub.

Créer ou vérifier le fichier `.gitignore` à la racine du projet.

Contenu conseillé :

```gitignore
# Variables sensibles
.env
backend/.env
frontend/.env
*.env

# Dépendances Node.js
node_modules/
backend/node_modules/
frontend/node_modules/

# Builds
dist/
frontend/dist/
build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Fichiers système
.DS_Store
Thumbs.db

# Dossiers temporaires
tmp/
temp/
```

La ligne la plus importante pour ce projet est :

```gitignore
backend/.env
```

Elle empêche Git d’envoyer le fichier `backend/.env`.

## 6. Vérifier que `.env` est bien ignoré

Avant de faire un commit, vérifier :

```bash
git status
```

Si `backend/.env` n’apparaît pas dans la liste, c’est bon.

On peut aussi vérifier avec :

```bash
git check-ignore -v backend/.env
```

Si Git affiche une ligne venant de `.gitignore`, cela veut dire que le fichier est bien ignoré.

Exemple de résultat attendu :

```text
.gitignore:3:backend/.env backend/.env
```

## 7. Ajouter les fichiers au suivi Git

Ajouter tous les fichiers autorisés :

```bash
git add .
```

Puis vérifier :

```bash
git status
```

Important : si `backend/.env` apparaît dans les fichiers ajoutés, il faut arrêter et corriger avant de continuer.

## 8. Faire le premier commit

Créer le premier commit :

```bash
git commit -m "Initial commit - CRM PME"
```

Un commit est une sauvegarde officielle de l’état du projet.

## 9. Lier le dépôt local au dépôt GitHub

Définir la branche principale :

```bash
git branch -M main
```

Ajouter l’adresse du dépôt GitHub :

```bash
git remote add origin https://github.com/Sagelusenge/Developpement-d-un-systeme-de-Gestion-des-clients.git
```

Vérifier le lien :

```bash
git remote -v
```

## 10. Envoyer le projet sur GitHub

Pousser le projet :

```bash
git push -u origin main
```

Après cette commande, le projet est disponible sur GitHub.

## 11. Procédure complète rapide

Voici la procédure résumée :

```bash
cd C:\Users\sagel\Downloads\programmation\CRM-PME
git init
git check-ignore -v backend/.env
git add .
git status
git commit -m "Initial commit - CRM PME"
git branch -M main
git remote add origin https://github.com/Sagelusenge/Developpement-d-un-systeme-de-Gestion-des-clients.git
git push -u origin main
```

## 12. Que faire si `.env` a été ajouté par erreur ?

Si `.env` a été ajouté avec `git add .` mais n’a pas encore été envoyé sur GitHub :

```bash
git rm --cached backend/.env
git add .gitignore
git commit -m "Ignore environment files"
```

La commande `git rm --cached` retire le fichier du suivi Git sans le supprimer de la machine.

## 13. Que faire si `.env` a déjà été poussé sur GitHub ?

Si le fichier `.env` a déjà été envoyé sur GitHub, il faut considérer les secrets comme exposés.

Il faut donc :

1. régénérer les clés Stripe ;
2. régénérer les clés OpenAI ;
3. changer les mots de passe de base de données ;
4. changer les secrets JWT ;
5. changer les secrets SMTP si nécessaire ;
6. supprimer le fichier de l’historique Git si le dépôt doit rester propre.

Même si le fichier est supprimé après, l’ancien secret peut encore exister dans l’historique Git.

## 14. Pousser les futures modifications

Après avoir modifié le projet :

```bash
git status
git add .
git commit -m "Description claire de la modification"
git push
```

Exemple :

```bash
git add .
git commit -m "Amelioration de la navigation vendeur"
git push
```

## 15. Bonnes pratiques

- Ne jamais envoyer `.env` sur GitHub.
- Ne jamais mettre une clé secrète directement dans le code.
- Utiliser `.env.example` pour montrer les variables nécessaires sans leurs vraies valeurs.
- Faire des commits avec des messages clairs.
- Vérifier `git status` avant chaque commit.
- Garder la branche `main` propre.
- Tester le projet avant de pousser.

## 16. Exemple de fichier `.env.example`

On peut créer un fichier `.env.example` sans secrets réels :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crm_pme
JWT_SECRET=change_me
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Ce fichier peut être envoyé sur GitHub, car il ne contient pas de vraies clés.

## 17. Conclusion

La règle principale est simple :

```text
Le code va sur GitHub.
Les secrets restent dans .env.
```

Avec cette organisation, le projet reste propre, sécurisé et facile à déployer.
