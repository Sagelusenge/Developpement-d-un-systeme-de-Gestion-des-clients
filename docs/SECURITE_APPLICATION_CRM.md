# Securisation de l'application CRM

Ce document resume les protections mises en place dans le CRM Quincaillerie Centrale. L'objectif est de proteger les comptes, les donnees clients, les ventes, les paiements, les fichiers et l'API.

## 1. Authentification et comptes

L'application utilise une authentification par jeton JWT. Apres connexion, le backend signe un jeton contenant uniquement les informations utiles : identifiant, role, entreprise et type de compte.

Les mots de passe ne sont jamais stockes en clair. Ils sont haches avec `bcryptjs`, ce qui rend leur lecture directe impossible dans la base de donnees.

Les clients confirment leur email avec un code temporaire avant l'activation de leur espace. Les codes de confirmation et de reinitialisation expirent rapidement et sont stockes sous forme de hash.

## 2. Limitation des tentatives

Les endpoints sensibles sont proteges par une limite de tentatives sur 15 minutes.

Endpoints concernes :

- connexion equipe : `POST /api/auth/login`
- mot de passe oublie equipe : `POST /api/auth/forgot-password`
- verification et reinitialisation du code equipe
- connexion client : `POST /api/client-auth/login`
- inscription client : `POST /api/client-auth/register`
- verification email client : `POST /api/client-auth/verify-email`
- renvoi du code client : `POST /api/client-auth/resend-code`

En cas d'abus, l'API repond :

```json
{
  "success": false,
  "message": "Trop de tentatives. Reessayez apres 15 minutes."
}
```

Cette protection reduit les attaques par force brute et evite les renvois excessifs de codes.

## 3. Autorisation par roles

Le backend controle les droits selon le role :

- `manager` : supervision, clients, rapports, commandes, reclamations.
- `vendeur` : ventes, paiements, clients, commandes.
- `magasinier` : stock, produits et mouvements.
- `client` : espace personnel, commandes, factures, paiements, reclamations et profil.

Les boutons caches dans l'interface ne suffisent pas : les routes sensibles verifient aussi le role cote serveur.

## 4. Validation des donnees

Les donnees recues par l'API sont controlees avant traitement :

- champs obligatoires ;
- formats email, telephone, montant ;
- montants positifs ;
- quantites positives ;
- appartenance a la bonne entreprise ;
- factures et commandes appartenant bien au client connecte.

Les paiements sont refuses si le montant depasse le reste a payer.

## 5. Protection SQL

Les requetes SQL utilisent des parametres separes des valeurs utilisateur. Cela evite les injections SQL classiques, car les entrees ne sont pas concatenees directement dans les requetes.

La base MySQL utilise aussi des cles et contraintes pour garder la coherence entre clients, ventes, paiements, produits et commandes.

## 6. Transactions critiques

Les operations importantes sont executees dans des transactions SQL :

- creation de vente ;
- mise a jour du stock ;
- creation de paiement ;
- validation Mobile Money ;
- confirmation Stripe par webhook.

Si une etape echoue, la transaction est annulee. Cela evite les factures ou paiements partiels incoherents.

## 7. Paiements securises

Stripe est gere cote backend. La cle secrete Stripe n'est jamais envoyee au navigateur.

Le paiement par carte utilise une session Checkout. Apres paiement, Stripe appelle un webhook backend. Le backend verifie ensuite :

- la reference interne ;
- le montant attendu ;
- le solde restant ;
- l'idempotence pour eviter un double paiement.

Mobile Money utilise une demande de paiement avec reference externe. Une reference deja utilisee est refusee.

## 8. Notifications de dette et paiement

Apres une vente ou un paiement, le client peut recevoir une notification et un email.

Si la facture est totalement payee, le message indique que la totalite a ete reglee.

Si une dette reste ouverte, le message indique clairement le montant restant a payer.

Les rappels automatiques de dette sont limites pour eviter le harcelement. En production, ils doivent rester espaces. Pour les tests, l'intervalle peut etre reduit temporairement avec :

```env
DEBT_REMINDER_MIN_AGE_MINUTES=0
DEBT_REMINDER_INTERVAL_MINUTES=3
```

## 9. CORS et separation frontend/backend

Le backend accepte uniquement les origines autorisees dans `FRONTEND_URL`. Cela limite les appels navigateur provenant de sites inconnus.

Le frontend ne communique jamais directement avec MySQL. Toutes les actions passent par l'API Express, qui applique les validations et les controles de role.

## 10. Secrets et variables d'environnement

Les secrets sont places dans les variables d'environnement :

- `JWT_SECRET`
- identifiants MySQL
- identifiants email
- cles Stripe
- cle OpenAI si active

Le fichier `.env` ne doit pas etre pousse dans Git. Seul `.env.example` sert de modele sans secrets reels.

## 11. Emails et dependances

L'envoi email utilise Nodemailer. Les dependances ont ete auditees et mises a jour afin de supprimer les vulnerabilites connues detectees par `npm audit`.

Resultat attendu apres correction :

- backend : 0 vulnerabilite connue ;
- frontend : 0 vulnerabilite connue.

## 12. Fichiers et uploads

Les fichiers envoyes par les utilisateurs sont limites en taille et type. Les noms techniques sont generes par le backend afin d'eviter les collisions et les chemins dangereux.

En production, il est recommande de stocker les fichiers sensibles dans un stockage objet prive avec URLs signees, plutot que de tout rendre public.

## 13. Journalisation et audit

Les actions importantes de l'equipe sont journalisees :

- utilisateur ;
- role ;
- module ;
- action ;
- reference ;
- date.

Les logs ne doivent pas contenir de mots de passe, codes de verification ou cles secretes.

## 14. Mesures a renforcer en production

Les protections actuelles couvrent les risques principaux, mais certaines ameliorations restent conseillees pour une vraie production :

- ajouter des en-tetes HTTP de securite avec Helmet ;
- utiliser un rate limiter partage Redis si plusieurs instances backend tournent en meme temps ;
- renforcer la validation reelle des fichiers par signature binaire ;
- stocker les documents sensibles dans un bucket prive ;
- imposer un `JWT_SECRET` long et aleatoire ;
- surveiller les logs, erreurs et tentatives bloquees.

## Resume court

Le CRM est securise par plusieurs couches : mots de passe haches, JWT, roles, validation backend, requetes SQL parametrees, transactions, CORS, secrets hors code, verification des paiements, limitation des tentatives et audit des dependances.

La regle principale est simple : les controles critiques restent toujours cote serveur.
