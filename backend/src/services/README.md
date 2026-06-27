# Dossier backend/src/services

Ce dossier contient des fonctions partagees par plusieurs controllers.

Un service evite de dupliquer la meme logique dans plusieurs fichiers. Par exemple, `schemaService.js` verifie et complete certaines colonnes necessaires dans la base.

## Services utiles

- `schemaService.js`: verifie que certaines tables et colonnes existent.
- service mail: prepare l'envoi des emails et notifications quand la configuration SMTP est disponible.
- `chatRealtimeService.js`: conserve les connexions SSE par entreprise et diffuse `chat-update` apres chaque message.
- `mailService.js`: centralise les emails professionnels du CRM: verification de compte, bienvenue, commande recue, statut de commande, facture disponible, relance client et nouveaute produit.
- `openaiService.js`: appelle la Responses API pour le chat et l'analyse manager, uniquement si la cle serveur existe. Le chat garde d'abord les reponses fiables basees sur la base de donnees, puis utilise l'IA pour formuler une reponse naturelle.
- `mobileMoneyService.js`: adapte l'appel vers le prestataire Mobile Money configure.
- `stripeService.js`: cree les sessions Stripe Checkout test et verifie les signatures webhook lorsque `STRIPE_WEBHOOK_SECRET` est disponible.
- `clientLoyaltyService.js`: gere la fidelisation: email unique du prospect sans achat, relance des clients inactifs, recommandations dans le chat et notification de tous les clients confirmes quand un nouveau produit arrive en stock.

Le schema d'execution cree aussi `chat_conversations`, `chat_messages`, `demandes_paiement_mobile`, `paiement_stripe_sessions`, `public_contacts`, `prospect_email_campaigns` et `crm_email_campaigns` lorsqu'elles sont absentes.

## Cycle CRM email

Les emails sont declenches par des evenements precis:

- inscription: code de verification puis email de bienvenue apres confirmation;
- commande client: confirmation de reception;
- changement de statut: information au client;
- conversion en facture: email indiquant que la facture est disponible;
- prospect sans achat: email apres `PROSPECT_FOLLOWUP_HOURS`;
- client inactif: relance apres `INACTIVE_CLIENT_EMAIL_DAYS`, basee sur les categories deja achetees;
- nouveau produit: email automatique a tous les clients actifs dont l'email est confirme, avec protection anti-doublon par produit.

Les tables `prospect_email_campaigns` et `crm_email_campaigns` evitent les doublons.

## Role dans l'architecture

Un service ne represente pas une route. Il represente une logique reutilisable. Si deux controllers ont besoin de la meme operation, cette operation doit plutot etre placee dans un service.

## Exemple

La verification du schema permet de deployer plus facilement sur Render ou sur une nouvelle base, car l'API peut completer certaines colonnes attendues sans refaire toute l'installation manuellement.
