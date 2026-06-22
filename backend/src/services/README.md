# Dossier backend/src/services

Ce dossier contient des fonctions partagees par plusieurs controllers.

Un service evite de dupliquer la meme logique dans plusieurs fichiers. Par exemple, `schemaService.js` verifie et complete certaines colonnes necessaires dans la base.

## Services utiles

- `schemaService.js`: verifie que certaines tables et colonnes existent.
- service mail: prepare l'envoi des emails et notifications quand la configuration SMTP est disponible.
- `chatRealtimeService.js`: conserve les connexions SSE par entreprise et diffuse `chat-update` apres chaque message.
- `mailService.js`: produit notamment l'alerte professionnelle envoyee au manager lors d'une escalade du chatbot.
- `openaiService.js`: appelle la Responses API pour le chat et l'analyse manager, uniquement si la cle serveur existe.
- `mobileMoneyService.js`: adapte l'appel vers le prestataire Mobile Money configure.
- `clientLoyaltyService.js`: prepare la recommandation hebdomadaire du client et l'email unique du prospect sans achat apres le delai configure.

Le schema d'execution cree aussi `chat_conversations`, `chat_messages`, `demandes_paiement_mobile`, `public_contacts` et `prospect_email_campaigns` lorsqu'elles sont absentes.

## Role dans l'architecture

Un service ne represente pas une route. Il represente une logique reutilisable. Si deux controllers ont besoin de la meme operation, cette operation doit plutot etre placee dans un service.

## Exemple

La verification du schema permet de deployer plus facilement sur Render ou sur une nouvelle base, car l'API peut completer certaines colonnes attendues sans refaire toute l'installation manuellement.
