# BLOC 1 — PROGRAMMATION ET CONCEPTION (300 lignes)
Objectif : préparer les questions techniques sur le code et l’architecture.
Contexte : CRM Quincaillerie Centrale, React, Express et MySQL.
---
## P01. Quel problème votre application résout-elle ?
Réponse : Elle centralise clients, produits, stock, ventes, commandes, paiements, réclamations et communications.
À retenir : Un seul système remplace plusieurs suivis manuels dispersés.
---
## P02. Quelle architecture avez-vous utilisée ?
Réponse : Une architecture client-serveur avec frontend React, API REST Express et base MySQL.
À retenir : Chaque couche possède une responsabilité clairement définie.
---
## P03. Pourquoi avoir séparé frontend et backend ?
Réponse : La séparation facilite la maintenance, la sécurité, les tests et l’évolution vers une application mobile.
À retenir : Le mobile pourra réutiliser la même API.
---
## P04. Pourquoi React ?
Réponse : React permet de construire une interface dynamique à partir de composants réutilisables et d’états contrôlés.
À retenir : Les tableaux, formulaires et fenêtres modales partagent des composants communs.
---
## P05. Pourquoi Express ?
Réponse : Express fournit un serveur HTTP léger, flexible et adapté à la création d’API REST avec Node.js.
À retenir : Les routes et middlewares rendent le backend modulaire.
---
## P06. Pourquoi MySQL ?
Réponse : Les données commerciales sont structurées et relationnelles ; MySQL assure contraintes, jointures et transactions.
À retenir : Une vente relie notamment client, lignes, produits et paiements.
---
## P07. Qu’est-ce qu’une API REST ?
Réponse : C’est une interface HTTP organisée autour de ressources manipulées avec GET, POST, PUT, PATCH et DELETE.
À retenir : Le frontend ne dialogue jamais directement avec MySQL.
---
## P08. Comment les routes sont-elles organisées ?
Réponse : Chaque domaine possède ses routes, son contrôleur et ses règles : clients, produits, ventes ou paiements.
À retenir : Cette organisation évite un fichier backend monolithique.
---
## P09. Quel est le rôle d’un contrôleur ?
Réponse : Il valide la requête, applique la logique métier, interroge la base et construit la réponse HTTP.
À retenir : Une route choisit l’action ; le contrôleur l’exécute.
---
## P10. Quel est le rôle d’un middleware ?
Réponse : Il traite une requête avant le contrôleur, par exemple pour authentifier, auditer ou gérer les erreurs.
À retenir : Une règle transversale est écrite une seule fois.
---
## P11. Comment gérez-vous l’état dans React ?
Réponse : useState stocke les données locales et useEffect synchronise les chargements ou effets nécessaires.
À retenir : L’interface se met à jour lorsque l’état change.
---
## P12. À quoi sert useMemo ?
Réponse : Il mémorise un calcul dérivé pour éviter de le refaire inutilement à chaque rendu.
À retenir : Il est utile pour les filtrages ou agrégations coûteuses.
---
## P13. Qu’est-ce qu’un composant réutilisable ?
Réponse : C’est une unité d’interface paramétrable utilisée à plusieurs endroits, comme Table, Modal ou Input.
À retenir : La réutilisation améliore cohérence et maintenance.
---
## P14. Comment fonctionne votre composant Table ?
Réponse : Il reçoit les en-têtes et lignes, puis gère affichage, pagination et adaptation responsive.
À retenir : Les pages bénéficient automatiquement des mêmes règles.
---
## P15. Pourquoi ajouter la pagination ?
Réponse : Elle limite les lignes visibles à 10, 20 ou 50 pour garder les tableaux lisibles.
À retenir : Elle réduit aussi le travail de rendu du navigateur.
---
## P16. Comment gérez-vous les formulaires ?
Réponse : Les champs sont contrôlés par l’état React puis envoyés à l’API après validation.
À retenir : La validation existe côté interface et côté serveur.
---
## P17. Pourquoi valider aussi côté backend ?
Réponse : Un utilisateur peut contourner le frontend et appeler directement l’API.
À retenir : Le backend reste l’autorité de validation.
---
## P18. Comment traitez-vous les erreurs ?
Réponse : Les contrôleurs renvoient des statuts précis et un middleware central transforme les erreurs en réponses cohérentes.
À retenir : Le client reçoit un message exploitable sans détails sensibles.
---
## P19. Que signifie le statut HTTP 200 ?
Réponse : Il indique qu’une requête a été traitée avec succès.
À retenir : Le corps contient généralement les données demandées.
---
## P20. Que signifie le statut HTTP 201 ?
Réponse : Il indique qu’une nouvelle ressource a été créée avec succès.
À retenir : Il convient aux créations de client, commande ou produit.
---
## P21. Que signifie le statut HTTP 400 ?
Réponse : La requête est invalide, incomplète ou ne respecte pas une règle attendue.
À retenir : Le client doit corriger les données envoyées.
---
## P22. Que signifie le statut HTTP 401 ?
Réponse : L’utilisateur n’est pas authentifié ou son jeton est invalide.
À retenir : Il doit se reconnecter.
---
## P23. Que signifie le statut HTTP 403 ?
Réponse : L’utilisateur est identifié mais son rôle n’autorise pas l’action.
À retenir : Authentification et autorisation sont différentes.
---
## P24. Que signifie le statut HTTP 404 ?
Réponse : La route ou la ressource demandée n’existe pas.
À retenir : Une référence inconnue doit produire cette réponse.
---
## P25. Que signifie le statut HTTP 500 ?
Réponse : Une erreur interne inattendue est survenue sur le serveur.
À retenir : Le détail technique doit rester dans les journaux.
---
## P26. Comment identifiez-vous les ressources ?
Réponse : Des identifiants métier préfixés distinguent clients, produits, commandes, factures et utilisateurs.
À retenir : Une référence lisible facilite le support et l’audit.
---
## P27. Comment calculez-vous le montant d’une commande ?
Réponse : Le backend multiplie quantité et prix de vente applicable pour chaque ligne puis additionne les résultats.
À retenir : Le prix d’achat ne doit jamais devenir le prix client.
---
## P28. Comment gérez-vous la TVA ?
Réponse : Elle n’est appliquée que lorsque le produit est explicitement soumis à la TVA.
À retenir : Sans TVA choisie, prix HT et prix TTC restent identiques.
---
## P29. Pourquoi enregistrer le prix dans la ligne de vente ?
Réponse : Cela conserve le prix historique même si le catalogue change après la transaction.
À retenir : Une ancienne facture doit rester inchangée.
---
## P30. Comment calculez-vous le bénéfice ?
Réponse : Il correspond aux ventes hors taxe diminuées du coût d’achat des quantités vendues.
À retenir : Le chiffre d’affaires n’est pas le bénéfice.
---
## P31. Comment évitez-vous une vente au mauvais prix ?
Réponse : Le serveur récupère et valide le prix de vente officiel au lieu de faire confiance au navigateur.
À retenir : La logique financière critique appartient au backend.
---
## P32. Qu’est-ce qu’une transaction SQL ?
Réponse : C’est un ensemble d’opérations validées ensemble par COMMIT ou annulées ensemble par ROLLBACK.
À retenir : Elle protège la cohérence d’une vente et de son stock.
---
## P33. Où utilisez-vous une transaction ?
Réponse : Lorsqu’une opération crée plusieurs lignes liées ou modifie simultanément vente, paiement et stock.
À retenir : Une panne intermédiaire ne doit pas laisser des données partielles.
---
## P34. Qu’est-ce qu’une clé étrangère ?
Réponse : C’est une contrainte reliant une colonne à la clé d’une autre table.
À retenir : Elle empêche par exemple une vente liée à un client inexistant.
---
## P35. Qu’est-ce qu’un index SQL ?
Réponse : C’est une structure accélérant les recherches, tris et jointures sur certaines colonnes.
À retenir : Trop d’index ralentissent cependant les écritures.
---
## P36. Qu’est-ce qu’une vue SQL ?
Réponse : C’est une requête enregistrée présentée comme une table virtuelle.
À retenir : Elle simplifie certains rapports sans dupliquer les données.
---
## P37. Qu’est-ce qu’un trigger ?
Réponse : C’est un traitement exécuté automatiquement lors d’un INSERT, UPDATE ou DELETE.
À retenir : Il convient aux règles proches des données, avec prudence.
---
## P38. Qu’est-ce qu’une procédure stockée ?
Réponse : C’est un programme SQL nommé exécuté directement par le serveur de base de données.
À retenir : Elle centralise certaines opérations complexes ou répétitives.
---
## P39. Comment gérez-vous le stock ?
Réponse : Chaque entrée ou sortie crée un mouvement traçable et met à jour la quantité disponible.
À retenir : Le stock courant et son historique doivent rester cohérents.
---
## P40. Pourquoi conserver les mouvements de stock ?
Réponse : Ils expliquent l’origine de chaque variation : approvisionnement, vente, correction ou retour.
À retenir : Une quantité seule ne suffit pas pour auditer.
---
## P41. Comment empêchez-vous un stock négatif ?
Réponse : Le backend vérifie la quantité disponible avant de confirmer la sortie.
À retenir : La vérification doit être faite dans la transaction.
---
## P42. Comment sont traitées les commandes client ?
Réponse : Elles passent par des statuts contrôlés jusqu’à préparation, confirmation, facturation ou annulation.
À retenir : Un statut décrit l’étape réelle du processus.
---
## P43. Quelle différence entre commande et vente ?
Réponse : Une commande exprime une demande ; la vente ou facture constate l’opération commerciale finalisée.
À retenir : Toutes les commandes ne deviennent pas forcément des ventes.
---
## P44. Comment gérez-vous un paiement partiel ?
Réponse : Chaque paiement est enregistré et le reste correspond au total de facture moins les paiements validés.
À retenir : Plusieurs paiements peuvent solder une facture.
---
## P45. Comment Stripe est-il intégré ?
Réponse : Le backend crée la session de paiement et reçoit ensuite une confirmation signée par webhook.
À retenir : Le frontend ne valide jamais lui-même un paiement.
---
## P46. Pourquoi utiliser un webhook ?
Réponse : Stripe peut informer directement le serveur même si le client ferme sa page.
À retenir : Le webhook constitue la confirmation fiable.
---
## P47. Qu’est-ce que l’idempotence ?
Réponse : Une même notification répétée ne doit produire qu’un seul effet en base.
À retenir : Elle évite les paiements ou écritures en double.
---
## P48. Comment gérez-vous les emails ?
Réponse : Nodemailer envoie des modèles professionnels selon les événements métier et les tâches planifiées.
À retenir : Chaque email répond à un événement utile.
---
## P49. Comment évitez-vous le harcèlement par email ?
Réponse : Des délais, catégories de messages et traces d’envoi empêchent les répétitions excessives.
À retenir : La fidélisation doit rester pertinente et mesurée.
---
## P50. Comment fonctionne le chat ?
Réponse : Les messages sont stockés, affichés chronologiquement et peuvent recevoir une réponse automatique ou humaine.
À retenir : L’historique reste disponible comme dans une messagerie.
---
## P51. Quel est le rôle de l’intelligence artificielle ?
Réponse : Elle comprend les formulations libres, exploite le contexte autorisé et rédige une réponse naturelle.
À retenir : Elle complète la logique métier sans remplacer les contrôles.
---
## P52. Que se passe-t-il si l’IA est indisponible ?
Réponse : Le système conserve ses réponses métier essentielles et permet le transfert vers un responsable.
À retenir : Une dépendance externe ne doit pas bloquer tout le CRM.
---
## P53. Comment l’IA connaît-elle les produits ?
Réponse : Le backend lui fournit uniquement les données pertinentes et actuelles récupérées dans la base.
À retenir : Le modèle ne doit pas inventer prix ou stock.
---
## P54. Comment gérez-vous les notifications ?
Réponse : Elles sont créées par événement, associées à une référence et marquées lues après consultation.
À retenir : Un clic conduit directement à l’élément concerné.
---
## P55. Comment fonctionne la recherche ?
Réponse : Les pages filtrent les collections chargées ou interrogent l’API selon le volume et le besoin.
À retenir : Les champs pertinents sont combinés et normalisés.
---
## P56. Pourquoi utiliser async et await ?
Réponse : Ils rendent lisibles les opérations asynchrones comme les requêtes HTTP et SQL.
À retenir : await suspend la fonction, pas tout le serveur Node.js.
---
## P57. Qu’est-ce qu’une Promise ?
Réponse : C’est un objet représentant un résultat futur, réussi ou échoué.
À retenir : Les appels réseau et base retournent souvent des promesses.
---
## P58. Comment évitez-vous le code dupliqué ?
Réponse : Les composants, fonctions utilitaires, middlewares et services regroupent les comportements communs.
À retenir : Une correction centrale bénéficie à plusieurs pages.
---
## P59. Pourquoi utiliser des variables d’environnement ?
Réponse : Elles séparent les secrets et paramètres de déploiement du code source.
À retenir : Clés API et mots de passe ne doivent pas être committés.
---
## P60. Qu’est-ce que Vite ?
Réponse : C’est l’outil de développement et de compilation utilisé pour l’application React.
À retenir : Il fournit un serveur rapide et produit les fichiers optimisés.
---
## P61. Que fait npm run build ?
Réponse : Il compile le frontend et génère les ressources statiques de production dans dist.
À retenir : Une compilation réussie détecte de nombreuses erreurs.
---
## P62. Comment gérez-vous le responsive design ?
Réponse : Des grilles flexibles et media queries adaptent navigation, tableaux, graphiques et formulaires.
À retenir : Le contenu doit rester utilisable sans dézoomer.
---
## P63. Pourquoi éviter des largeurs fixes ?
Réponse : Elles débordent sur les petits écrans et s’adaptent mal aux résolutions variées.
À retenir : minmax, pourcentages et clamp sont plus souples.
---
## P64. Comment rendez-vous un tableau utilisable sur mobile ?
Réponse : Les colonnes peuvent défiler horizontalement ou se présenter en cartes avec leurs libellés.
À retenir : Aucune donnée importante ne doit disparaître.
---
## P65. Comment testez-vous les modifications ?
Réponse : Nous compilons le frontend, vérifions la syntaxe backend et testons les parcours métier critiques.
À retenir : Paiement, vente et stock exigent des tests renforcés.
---
## P66. Qu’est-ce qu’un test unitaire ?
Réponse : Il vérifie isolément une fonction ou une petite unité de code.
À retenir : Il convient aux calculs de montants et validations.
---
## P67. Qu’est-ce qu’un test d’intégration ?
Réponse : Il vérifie la collaboration de plusieurs composants, par exemple route, contrôleur et base.
À retenir : Il détecte les erreurs de contrat entre couches.
---
## P68. Qu’est-ce qu’un test end-to-end ?
Réponse : Il reproduit un parcours complet dans l’application comme le ferait un utilisateur.
À retenir : Exemple : inscription, commande, paiement puis facture.
---
## P69. Comment gérez-vous Git ?
Réponse : Les changements sont versionnés par commits explicites puis poussés vers un dépôt GitHub.
À retenir : Git conserve l’historique et facilite la collaboration.
---
## P70. Qu’est-ce qu’une branche Git ?
Réponse : C’est une ligne de développement isolée permettant de travailler sans perturber la version stable.
À retenir : Elle est fusionnée après validation.
---
## P71. Comment documentez-vous l’API ?
Réponse : Les fichiers Markdown précisent routes, méthodes, authentification, corps, réponses et erreurs.
À retenir : Une documentation claire facilite le mobile et les tests.
---
## P72. Comment préparez-vous l’évolution mobile ?
Réponse : L’application mobile consommera les mêmes endpoints sécurisés que le frontend web.
À retenir : La logique métier reste centralisée dans l’API.
---
## P73. Quelle amélioration programmeriez-vous ensuite ?
Réponse : Nous renforcerions les tests automatisés, files d’emails, supervision et stockage objet des fichiers.
À retenir : La priorité dépend du risque métier et du volume réel.
---
## P74. Quelle est la principale force du code ?
Réponse : Il relie interface, règles commerciales, traçabilité et communications dans une architecture évolutive.
À retenir : La valeur vient de la cohérence globale, pas d’une page isolée.
---
# BLOC 2 — RÉSEAUX ET COMMUNICATIONS (300 lignes)
Objectif : expliquer comment les composants communiquent sur le réseau.
Contexte : navigateur, API HTTPS, MySQL, Stripe, email et services externes.
---
## R01. Avez-vous utilisé TCP ?
Réponse : Oui. HTTP/HTTPS, MySQL et SMTP reposent généralement sur TCP dans notre architecture.
À retenir : TCP fournit une communication fiable, ordonnée et avec contrôle d’erreurs.
---
## R02. Qu’est-ce que TCP ?
Réponse : TCP est un protocole de transport orienté connexion qui confirme et remet en ordre les données.
À retenir : Un segment perdu est retransmis.
---
## R03. Pourquoi TCP convient-il au CRM ?
Réponse : Une commande, un paiement ou un email ne doit pas arriver incomplet ou désordonné.
À retenir : La fiabilité est prioritaire sur quelques millisecondes gagnées.
---
## R04. Qu’est-ce qu’UDP ?
Réponse : UDP transmet sans connexion, confirmation ni retransmission automatique.
À retenir : Il est rapide mais moins fiable que TCP.
---
## R05. Pourquoi ne pas utiliser UDP pour les ventes ?
Réponse : Une perte de paquet pourrait rendre une transaction incomplète sans correction automatique.
À retenir : UDP convient davantage au temps réel tolérant des pertes.
---
## R06. Qu’est-ce que l’IP ?
Réponse : Internet Protocol adresse les machines et achemine les paquets entre réseaux.
À retenir : TCP assure le transport ; IP assure le routage.
---
## R07. Qu’est-ce qu’une adresse IP ?
Réponse : C’est un identifiant réseau permettant de joindre une machine ou une interface.
À retenir : Une IP publique expose un service à Internet.
---
## R08. Quelle différence entre IPv4 et IPv6 ?
Réponse : IPv4 utilise 32 bits ; IPv6 utilise 128 bits et offre beaucoup plus d’adresses.
À retenir : IPv6 répond à l’épuisement d’IPv4.
---
## R09. Qu’est-ce qu’un port réseau ?
Réponse : C’est un numéro qui identifie un service sur une machine.
À retenir : Une IP localise la machine ; le port localise l’application.
---
## R10. Quels ports sont courants dans votre système ?
Réponse : HTTPS utilise 443, HTTP 80, MySQL 3306 et SMTP plusieurs ports selon le fournisseur.
À retenir : Seuls les ports nécessaires doivent être ouverts.
---
## R11. Qu’est-ce que HTTP ?
Réponse : HTTP est le protocole applicatif utilisé pour échanger requêtes et réponses web.
À retenir : Il transporte les appels de l’interface vers l’API.
---
## R12. Qu’est-ce que HTTPS ?
Réponse : HTTPS est HTTP protégé par TLS, qui chiffre et authentifie la communication.
À retenir : Les identifiants ne circulent pas en clair.
---
## R13. Pourquoi HTTPS est-il obligatoire ?
Réponse : Le CRM échange mots de passe, jetons, clients, commandes et paiements.
À retenir : HTTP seul expose les données aux interceptions.
---
## R14. Qu’est-ce que TLS ?
Réponse : TLS négocie un canal chiffré et vérifie l’identité du serveur par certificat.
À retenir : Il protège confidentialité et intégrité en transit.
---
## R15. Qu’est-ce qu’un certificat TLS ?
Réponse : C’est un document numérique liant un domaine à une clé publique.
À retenir : Une autorité reconnue signe généralement le certificat.
---
## R16. Comment se déroule une requête API ?
Réponse : Le navigateur résout le domaine, établit TLS/TCP, envoie HTTP puis reçoit la réponse JSON.
À retenir : Plusieurs couches coopèrent.
---
## R17. Qu’est-ce que DNS ?
Réponse : DNS traduit un nom de domaine lisible en adresse IP.
À retenir : Il évite aux utilisateurs de mémoriser une IP.
---
## R18. Pourquoi préférer un domaine à une IP ?
Réponse : Le domaine reste stable même si le serveur change d’adresse.
À retenir : Il simplifie aussi certificats et image professionnelle.
---
## R19. Qu’est-ce qu’une URL ?
Réponse : Elle indique protocole, hôte, port éventuel, chemin et paramètres d’une ressource.
À retenir : `/api/clients` désigne une ressource de l’API.
---
## R20. Qu’est-ce qu’un endpoint ?
Réponse : C’est une combinaison méthode HTTP et chemin exposant une opération.
À retenir : GET et POST sur le même chemin ont des rôles différents.
---
## R21. Qu’est-ce que JSON ?
Réponse : JSON est un format texte structuré utilisé pour les échanges entre frontend et backend.
À retenir : Il représente objets, tableaux et valeurs simples.
---
## R22. Pourquoi JSON ?
Réponse : Il est léger, lisible et directement manipulable en JavaScript.
À retenir : Il convient bien aux API REST.
---
## R23. Qu’est-ce qu’un en-tête HTTP ?
Réponse : C’est une métadonnée décrivant la requête ou réponse.
À retenir : Authorization et Content-Type sont essentiels ici.
---
## R24. À quoi sert Content-Type ?
Réponse : Il indique le format du corps, par exemple `application/json`.
À retenir : Le serveur sait ainsi comment interpréter les octets.
---
## R25. À quoi sert Authorization ?
Réponse : Il transporte le jeton permettant au serveur d’identifier l’appelant.
À retenir : Le backend contrôle ensuite son rôle.
---
## R26. Qu’est-ce qu’une requête GET ?
Réponse : Elle demande la lecture d’une ressource sans modifier son état.
À retenir : Exemple : consulter les clients.
---
## R27. Qu’est-ce qu’une requête POST ?
Réponse : Elle soumet des données pour créer une ressource ou lancer une opération.
À retenir : Exemple : créer une commande.
---
## R28. Qu’est-ce qu’une requête PUT ?
Réponse : Elle remplace généralement la représentation complète d’une ressource.
À retenir : Le contrat doit préciser les champs attendus.
---
## R29. Qu’est-ce qu’une requête PATCH ?
Réponse : Elle modifie partiellement une ressource.
À retenir : Exemple : changer uniquement un statut.
---
## R30. Qu’est-ce qu’une requête DELETE ?
Réponse : Elle demande la suppression logique ou physique d’une ressource.
À retenir : Les droits et dépendances doivent être contrôlés.
---
## R31. Qu’est-ce que CORS ?
Réponse : CORS contrôle quels sites peuvent appeler une API depuis un navigateur.
À retenir : Ce n’est pas un mécanisme d’authentification.
---
## R32. Comment configurez-vous CORS ?
Réponse : Le backend accepte seulement les origines listées dans FRONTEND_URL.
À retenir : Une origine inconnue est refusée.
---
## R33. Pourquoi localhost diffère-t-il de la production ?
Réponse : Domaine, ports, certificats et variables d’environnement changent.
À retenir : Les origines autorisées doivent suivre l’environnement.
---
## R34. Qu’est-ce que localhost ?
Réponse : C’est le nom de la machine locale, généralement associé à 127.0.0.1.
À retenir : Il n’est pas accessible publiquement.
---
## R35. Qu’est-ce que 0.0.0.0 ?
Réponse : Pour un serveur, cela signifie écouter sur toutes les interfaces disponibles.
À retenir : Utile en conteneur ou hébergement.
---
## R36. Qu’est-ce qu’une API publique ?
Réponse : Elle est joignable sur Internet, sans être nécessairement accessible sans authentification.
À retenir : Public réseau ne signifie pas public métier.
---
## R37. Qu’est-ce qu’un pare-feu ?
Réponse : Il autorise ou bloque les flux selon adresses, ports et protocoles.
À retenir : La base ne devrait pas être ouverte à tout Internet.
---
## R38. Quel port exposer publiquement ?
Réponse : Principalement 443 pour HTTPS, éventuellement 80 uniquement pour redirection.
À retenir : Les ports internes restent privés.
---
## R39. Où doit se trouver MySQL ?
Réponse : Sur un réseau privé ou limité aux serveurs applicatifs autorisés.
À retenir : Ne jamais exposer 3306 sans nécessité.
---
## R40. Qu’est-ce qu’un réseau privé ?
Réponse : C’est un espace réseau non directement accessible depuis Internet.
À retenir : Il réduit la surface d’attaque.
---
## R41. Qu’est-ce qu’un proxy inverse ?
Réponse : Il reçoit les requêtes publiques puis les transmet au serveur applicatif.
À retenir : Il peut gérer TLS, domaine et limitations.
---
## R42. Quel est le rôle de Nginx ?
Réponse : Il peut servir le frontend, terminer HTTPS et relayer `/api` vers Node.js.
À retenir : C’est un proxy inverse courant.
---
## R43. Qu’est-ce qu’un load balancer ?
Réponse : Il répartit les requêtes entre plusieurs instances d’un service.
À retenir : Il améliore capacité et disponibilité.
---
## R44. Votre application en a-t-elle besoin ?
Réponse : Pas nécessairement au volume actuel, mais l’architecture peut évoluer vers plusieurs instances.
À retenir : On dimensionne selon les mesures réelles.
---
## R45. Qu’est-ce que la latence ?
Réponse : C’est le délai entre émission d’une requête et début ou fin de réponse.
À retenir : Distance, réseau et traitement l’influencent.
---
## R46. Qu’est-ce que la bande passante ?
Réponse : C’est la quantité de données transmissible par unité de temps.
À retenir : Les images volumineuses la consomment rapidement.
---
## R47. Comment réduire les transferts ?
Réponse : Pagination, compression, images optimisées et réponses API limitées.
À retenir : Ne transmettre que les données utiles.
---
## R48. Qu’est-ce qu’un timeout ?
Réponse : C’est la durée maximale d’attente avant de considérer une opération échouée.
À retenir : Il évite les attentes infinies.
---
## R49. Comment gérer une coupure réseau ?
Réponse : Afficher une erreur claire, permettre une reprise et éviter les doubles soumissions.
À retenir : Le backend doit rester idempotent.
---
## R50. Pourquoi un message peut-il sembler lent ?
Réponse : Réseau, base, service IA, email ou serveur peuvent ajouter de la latence.
À retenir : Il faut mesurer chaque étape.
---
## R51. Comment rendre le chat instantané ?
Réponse : WebSocket ou Server-Sent Events peuvent pousser les nouveaux messages au navigateur.
À retenir : Le polling régulier reste une solution plus simple.
---
## R52. Qu’est-ce qu’un WebSocket ?
Réponse : C’est un canal bidirectionnel persistant entre client et serveur.
À retenir : Les deux côtés peuvent envoyer sans nouvelle requête HTTP.
---
## R53. Qu’est-ce que le polling ?
Réponse : Le client interroge périodiquement le serveur pour obtenir les nouveautés.
À retenir : Simple, mais moins immédiat et plus bavard.
---
## R54. Qu’est-ce que SSE ?
Réponse : Server-Sent Events permet au serveur de pousser un flux unidirectionnel au navigateur.
À retenir : Adapté aux notifications en direct.
---
## R55. Comment fonctionne SMTP ?
Réponse : SMTP est le protocole utilisé pour transmettre les emails entre client et serveur mail.
À retenir : TLS protège la connexion SMTP.
---
## R56. Que sont IMAP et POP ?
Réponse : Ce sont des protocoles de réception d’emails, contrairement à SMTP qui envoie.
À retenir : Le CRM utilise surtout SMTP pour les notifications.
---
## R57. Qu’est-ce qu’un webhook réseau ?
Réponse : C’est un appel HTTP envoyé automatiquement par un service externe à notre API.
À retenir : Stripe signale ainsi le résultat d’un paiement.
---
## R58. Pourquoi le webhook exige-t-il une URL publique ?
Réponse : Le serveur du prestataire doit pouvoir joindre l’endpoint depuis Internet.
À retenir : localhost ne peut pas recevoir un webhook externe.
---
## R59. Pourquoi le webhook utilise-t-il HTTPS ?
Réponse : HTTPS protège les données et authentifie le serveur destinataire.
À retenir : La signature complète cette protection.
---
## R60. Qu’est-ce qu’un paquet ?
Réponse : C’est une unité de données transmise sur un réseau.
À retenir : Les couches ajoutent leurs propres en-têtes.
---
## R61. Qu’est-ce qu’une trame ?
Réponse : C’est l’unité de données de la couche liaison, par exemple Ethernet.
À retenir : Elle transporte généralement un paquet IP localement.
---
## R62. Qu’est-ce que le modèle OSI ?
Réponse : C’est un modèle en sept couches décrivant les fonctions réseau.
À retenir : Il aide à localiser une panne.
---
## R63. À quelles couches appartiennent HTTP, TCP et IP ?
Réponse : HTTP est applicatif, TCP transport et IP réseau.
À retenir : Chaque couche fournit un service à la suivante.
---
## R64. Qu’est-ce que le handshake TCP ?
Réponse : SYN, SYN-ACK et ACK établissent la connexion avant l’échange.
À retenir : Les deux hôtes synchronisent leur communication.
---
## R65. Comment TCP garantit-il l’ordre ?
Réponse : Il numérote les segments et réassemble les données avant livraison.
À retenir : L’application reçoit un flux ordonné.
---
## R66. Comment TCP détecte-t-il une perte ?
Réponse : Les accusés de réception manquants déclenchent une retransmission.
À retenir : Cette fiabilité ajoute un coût.
---
## R67. Qu’est-ce que NAT ?
Réponse : NAT traduit des adresses privées en adresse publique et inversement.
À retenir : Plusieurs machines peuvent partager une IP publique.
---
## R68. Qu’est-ce qu’un sous-réseau ?
Réponse : C’est une subdivision logique d’un réseau IP.
À retenir : Il isole par exemple web, API et base.
---
## R69. Qu’est-ce qu’une passerelle ?
Réponse : C’est l’équipement qui achemine le trafic vers d’autres réseaux.
À retenir : Elle relie généralement le sous-réseau à Internet.
---
## R70. Comment diagnostiquer une API inaccessible ?
Réponse : Vérifier DNS, certificat, port, pare-feu, processus, proxy et journaux.
À retenir : Tester couche par couche.
---
## R71. À quoi sert ping ?
Réponse : Il teste la joignabilité IP avec ICMP lorsque celui-ci est autorisé.
À retenir : Un ping bloqué ne prouve pas que HTTPS est indisponible.
---
## R72. À quoi sert traceroute ?
Réponse : Il montre les sauts réseau empruntés jusqu’à une destination.
À retenir : Il aide à localiser un problème de routage.
---
## R73. À quoi sert curl ?
Réponse : Il envoie des requêtes HTTP depuis le terminal pour tester directement une API.
À retenir : Il sépare le diagnostic backend du frontend.
---
## R74. Comment résumer le réseau de votre système ?
Réponse : Des clients HTTPS communiquent avec une API qui dialogue avec base et services externes.
À retenir : TCP, TLS, filtrage et surveillance assurent le transport fiable.
---
# BLOC 3 — SÉCURISATION DU SYSTÈME (300 lignes)
Objectif : présenter les protections appliquées et les améliorations prévues.
Contexte : sécurité des comptes, API, données, paiements, fichiers et infrastructure.
---
## S01. Comment avez-vous sécurisé le système ?
Réponse : Par HTTPS, authentification JWT, rôles, validation, hachage, CORS, audit et secrets externes.
À retenir : La sécurité utilise plusieurs couches complémentaires.
---
## S02. Qu’est-ce que l’authentification ?
Réponse : Elle vérifie l’identité d’un utilisateur.
À retenir : Elle répond à « qui êtes-vous ? ».
---
## S03. Qu’est-ce que l’autorisation ?
Réponse : Elle vérifie les actions permises à l’utilisateur identifié.
À retenir : Elle répond à « que pouvez-vous faire ? ».
---
## S04. Comment les mots de passe sont-ils stockés ?
Réponse : Ils sont hachés avec bcrypt et jamais enregistrés en clair.
À retenir : Un hachage n’est pas un chiffrement réversible.
---
## S05. Pourquoi bcrypt ?
Réponse : Il est volontairement lent et intègre un sel unique.
À retenir : Il complique les attaques par force brute.
---
## S06. Qu’est-ce qu’un sel ?
Réponse : C’est une valeur aléatoire ajoutée avant hachage.
À retenir : Deux mots de passe identiques donnent des résultats différents.
---
## S07. Qu’est-ce que JWT ?
Réponse : C’est un jeton signé contenant des informations d’identité limitées.
À retenir : Le serveur vérifie sa signature et son expiration.
---
## S08. Un JWT chiffre-t-il son contenu ?
Réponse : Non, il est généralement encodé et signé, pas chiffré.
À retenir : Ne jamais y placer de secret.
---
## S09. Pourquoi faire expirer un jeton ?
Réponse : Cela limite la durée d’exploitation d’un jeton volé.
À retenir : Une nouvelle connexion renouvelle l’accès.
---
## S10. Comment gérez-vous les rôles ?
Réponse : Le backend autorise chaque route selon manager, vendeur, magasinier ou client.
À retenir : Masquer un bouton frontend ne suffit pas.
---
## S11. Qu’est-ce que le moindre privilège ?
Réponse : Chaque rôle reçoit uniquement les permissions nécessaires.
À retenir : Cela limite erreurs et compromissions.
---
## S12. Le manager crée-t-il les ventes ?
Réponse : La matrice métier réserve les opérations selon les responsabilités définies.
À retenir : Les contrôles sont appliqués côté serveur.
---
## S13. Comment sécurisez-vous les secrets ?
Réponse : Ils résident dans les variables d’environnement du backend.
À retenir : Aucun secret ne doit entrer dans Git.
---
## S14. Pourquoi la clé Stripe secrète reste-t-elle au backend ?
Réponse : Toute clé livrée au navigateur devient publiquement récupérable.
À retenir : Seule la clé publiable va au frontend.
---
## S15. Comment sécurisez-vous les webhooks Stripe ?
Réponse : Le backend vérifie la signature avec le secret du webhook.
À retenir : Une requête non signée est rejetée.
---
## S16. Pourquoi utiliser le corps brut du webhook ?
Réponse : La signature est calculée sur les octets originaux.
À retenir : Une transformation JSON invaliderait la vérification.
---
## S17. Comment évitez-vous les doubles paiements ?
Réponse : Une référence unique et l’idempotence empêchent de retraiter le même événement.
À retenir : Les webhooks peuvent être renvoyés.
---
## S18. Comment sécurisez-vous CORS ?
Réponse : Seules les origines configurées sont acceptées.
À retenir : CORS réduit les appels navigateur non souhaités.
---
## S19. CORS remplace-t-il l’authentification ?
Réponse : Non, un autre serveur peut appeler l’API hors navigateur.
À retenir : Chaque route sensible exige toujours un jeton.
---
## S20. Comment empêchez-vous l’injection SQL ?
Réponse : Les requêtes utilisent des paramètres séparés des valeurs.
À retenir : Ne jamais concaténer une saisie dans le SQL.
---
## S21. Qu’est-ce qu’une injection SQL ?
Réponse : Une entrée malveillante modifie le sens d’une requête SQL.
À retenir : Elle peut lire, altérer ou supprimer des données.
---
## S22. Comment empêchez-vous le XSS ?
Réponse : React échappe les textes et les contenus HTML non fiables sont évités.
À retenir : Une saisie ne doit pas devenir du code exécuté.
---
## S23. Qu’est-ce que le XSS ?
Réponse : C’est l’injection de script dans une page consultée par d’autres.
À retenir : Elle peut voler une session.
---
## S24. Qu’est-ce que CSRF ?
Réponse : Une page hostile force le navigateur authentifié à lancer une action.
À retenir : Cookies et jetons exigent une stratégie adaptée.
---
## S25. Comment limiter CSRF ?
Réponse : SameSite, jetons CSRF ou Authorization explicite réduisent le risque.
À retenir : La solution dépend du stockage de session.
---
## S26. Comment validez-vous les entrées ?
Réponse : Type, présence, format, longueur et règles métier sont vérifiés.
À retenir : Toute donnée externe est non fiable.
---
## S27. Pourquoi limiter la taille JSON ?
Réponse : Cela réduit les abus mémoire et requêtes surdimensionnées.
À retenir : Une limite adaptée est configurée.
---
## S28. Comment sécurisez-vous les uploads ?
Réponse : Vérifier type réel, taille, nom, extension et destination.
À retenir : Un fichier utilisateur ne doit jamais être exécuté.
---
## S29. Pourquoi renommer les fichiers ?
Réponse : Cela évite collisions, chemins malveillants et noms imprévisibles.
À retenir : Le nom original reste une métadonnée.
---
## S30. Où stocker les images en production ?
Réponse : Un stockage objet durable est préférable au disque éphémère.
À retenir : Sauvegarde et réplication deviennent plus fiables.
---
## S31. Comment protégez-vous les données personnelles ?
Réponse : Accès par rôle, HTTPS, minimisation, audit et sauvegardes protégées.
À retenir : Collecter uniquement ce qui est utile.
---
## S32. Qu’est-ce que la confidentialité ?
Réponse : Seules les personnes autorisées peuvent consulter les données.
À retenir : Chiffrement et permissions la soutiennent.
---
## S33. Qu’est-ce que l’intégrité ?
Réponse : Les données restent exactes et non modifiées illégitimement.
À retenir : Contraintes, transactions et audit la protègent.
---
## S34. Qu’est-ce que la disponibilité ?
Réponse : Le service et les données restent accessibles lorsque nécessaires.
À retenir : Sauvegardes et supervision y contribuent.
---
## S35. Qu’est-ce que la triade CIA ?
Réponse : Confidentialité, intégrité et disponibilité.
À retenir : Elle structure l’analyse de sécurité.
---
## S36. Comment fonctionne le journal d’audit ?
Réponse : Il enregistre utilisateur interne, action, module, référence et date.
À retenir : Les secrets sont masqués.
---
## S37. Pourquoi exclure les clients de l’audit interne ?
Réponse : Cette vue contrôle les opérations administratives de l’équipe.
À retenir : Les activités client peuvent avoir leur journal séparé.
---
## S38. Un audit empêche-t-il une attaque ?
Réponse : Pas directement, mais il détecte et explique les actions.
À retenir : Prévention et traçabilité sont complémentaires.
---
## S39. Comment protégez-vous les logs ?
Réponse : Accès restreint, masquage et conservation limitée.
À retenir : Un log peut contenir des informations sensibles.
---
## S40. Pourquoi masquer mots de passe et codes ?
Réponse : Ils ne doivent apparaître ni dans audit ni dans erreurs.
À retenir : Même le personnel n’en a pas besoin.
---
## S41. Comment sécurisez-vous la réinitialisation ?
Réponse : Code temporaire, expiration, usage unique et nouveau mot de passe haché.
À retenir : Ne jamais envoyer le mot de passe actuel.
---
## S42. Pourquoi vérifier l’email ?
Réponse : Cela confirme que l’inscrit contrôle l’adresse déclarée.
À retenir : Les communications atteignent le bon destinataire.
---
## S43. Comment limiter la force brute ?
Réponse : Limitation de tentatives, délais et surveillance des échecs.
À retenir : Ajouter un rate limiter en production.
---
## S44. Qu’est-ce qu’un rate limiter ?
Réponse : Il limite le nombre de requêtes par période.
À retenir : Il protège connexion, codes et endpoints coûteux.
---
## S45. Qu’est-ce qu’un CAPTCHA ?
Réponse : Il distingue approximativement humain et automatisation.
À retenir : À réserver aux flux exposés et abusés.
---
## S46. Comment sécuriser l’IA ?
Réponse : Limiter contexte, outils, données et actions autorisées.
À retenir : Une réponse IA ne valide pas une transaction.
---
## S47. Qu’est-ce que la prompt injection ?
Réponse : Un texte tente de détourner les instructions du modèle.
À retenir : Les permissions restent contrôlées hors IA.
---
## S48. L’IA peut-elle lire toute la base ?
Réponse : Non, le backend fournit seulement les données nécessaires.
À retenir : Appliquer minimisation et contrôle d’accès.
---
## S49. Comment éviter les hallucinations ?
Réponse : Ancrer la réponse sur données réelles et reconnaître l’incertitude.
À retenir : Prix et stock viennent de MySQL.
---
## S50. Comment sécuriser les emails ?
Réponse : TLS SMTP, secrets protégés et contenu sans données excessives.
À retenir : Un email peut être transféré.
---
## S51. Que sont SPF, DKIM et DMARC ?
Réponse : Ils authentifient le domaine expéditeur et réduisent l’usurpation.
À retenir : Ils améliorent confiance et délivrabilité.
---
## S52. Comment gérez-vous les erreurs en sécurité ?
Réponse : Message sobre au client, détail technique dans les logs.
À retenir : Ne pas révéler SQL, chemins ou secrets.
---
## S53. Pourquoi utiliser HTTPS partout ?
Réponse : Un seul appel HTTP peut exposer un jeton.
À retenir : Rediriger HTTP vers HTTPS.
---
## S54. Comment protéger MySQL ?
Réponse : Réseau privé, compte limité, mot de passe fort et sauvegardes.
À retenir : L’application ne doit pas utiliser root.
---
## S55. Qu’est-ce qu’un compte SQL limité ?
Réponse : Il possède seulement les droits nécessaires à l’application.
À retenir : Une compromission cause moins de dégâts.
---
## S56. Comment sécuriser une sauvegarde ?
Réponse : Chiffrement, contrôle d’accès, copies séparées et tests de restauration.
À retenir : Une sauvegarde inutilisable ne protège rien.
---
## S57. Qu’est-ce que le chiffrement au repos ?
Réponse : Les données stockées sont chiffrées sur disque ou objet.
À retenir : Il complète TLS en transit.
---
## S58. Comment supprimer un client ?
Réponse : Vérifier dépendances et préférer parfois anonymisation ou archivage.
À retenir : Une suppression ne doit pas casser la comptabilité.
---
## S59. Pourquoi utiliser des contraintes SQL ?
Réponse : Elles bloquent les états incohérents même en cas de bug applicatif.
À retenir : La base constitue une dernière défense.
---
## S60. Comment éviter une modification concurrente du stock ?
Réponse : Transaction, verrouillage adapté et vérification atomique.
À retenir : Deux ventes ne doivent pas consommer le même stock.
---
## S61. Qu’est-ce qu’une attaque DoS ?
Réponse : Elle surcharge un service pour le rendre indisponible.
À retenir : Limites, proxy et supervision réduisent l’impact.
---
## S62. Comment gérer les dépendances vulnérables ?
Réponse : Audit npm, mises à jour contrôlées et suivi des alertes.
À retenir : Les bibliothèques font partie de la surface d’attaque.
---
## S63. Pourquoi verrouiller les versions ?
Réponse : Le lockfile rend les installations reproductibles.
À retenir : Une mise à jour inattendue peut introduire un risque.
---
## S64. Qu’est-ce que la défense en profondeur ?
Réponse : Plusieurs contrôles indépendants protègent le même actif.
À retenir : Aucun mécanisme seul n’est parfait.
---
## S65. Comment gérez-vous une clé divulguée ?
Réponse : Révoquer, remplacer, auditer l’usage et corriger la source.
À retenir : Ne jamais seulement supprimer le texte du dépôt.
---
## S66. Pourquoi ne pas partager une clé API ?
Réponse : Toute personne la possédant peut consommer le service.
À retenir : Les clés exposées doivent être renouvelées.
---
## S67. Comment vérifier une autorisation ?
Réponse : À chaque requête sensible, avec identité et rôle du jeton.
À retenir : Ne jamais se fier au rôle envoyé dans le body.
---
## S68. Comment sécuriser l’impression ?
Réponse : Imprimer seulement les données autorisées et éviter les secrets.
À retenir : Un document papier reste une fuite possible.
---
## S69. Comment gérer une session sur appareil partagé ?
Réponse : Déconnexion claire, expiration et absence de secret persistant inutile.
À retenir : Fermer la session après utilisation.
---
## S70. Qu’est-ce qu’un test de sécurité ?
Réponse : Il vérifie authentification, permissions, entrées et configurations.
À retenir : Tester aussi les scénarios interdits.
---
## S71. Qu’est-ce qu’un pentest ?
Réponse : C’est une évaluation offensive contrôlée des vulnérabilités.
À retenir : Elle complète revue et scans automatisés.
---
## S72. Quelle faiblesse reste à améliorer ?
Réponse : Ajouter rate limiting, tests automatisés, stockage objet et supervision avancée.
À retenir : La sécurité est un processus continu.
---
## S73. Comment réagir à un incident ?
Réponse : Contenir, préserver les preuves, corriger, restaurer puis analyser.
À retenir : Un plan écrit accélère la réponse.
---
## S74. Comment résumer votre sécurité ?
Réponse : Identité, rôles, chiffrement, validation, traçabilité et infrastructure se complètent.
À retenir : Les contrôles critiques restent toujours côté serveur.
---
# BLOC 4 — DÉPLOIEMENT ET EXPLOITATION (300 lignes)
Objectif : expliquer la mise en production et le maintien du service.
Contexte : frontend compilé, API Node.js, MySQL, AWS/Render et services externes.
---
## D01. Qu’est-ce qu’un déploiement ?
Réponse : C’est la mise à disposition d’une version de l’application dans un environnement cible.
À retenir : Il inclut code, configuration et vérifications.
---
## D02. Quels composants déployez-vous ?
Réponse : Frontend statique, backend Node.js, base MySQL, fichiers et configurations.
À retenir : Chaque composant possède son cycle.
---
## D03. Quelle différence entre développement et production ?
Réponse : Le développement privilégie le diagnostic ; la production privilégie sécurité, stabilité et performance.
À retenir : Les configurations doivent être séparées.
---
## D04. Comment compilez-vous le frontend ?
Réponse : `npm run build` produit les ressources optimisées dans `dist`.
À retenir : La production ne sert pas le code source React brut.
---
## D05. Comment démarrez-vous le backend ?
Réponse : `npm start` exécute le serveur Node.js défini dans package.json.
À retenir : Le processus doit être supervisé.
---
## D06. Qu’est-ce qu’une variable d’environnement ?
Réponse : C’est une configuration injectée hors du code.
À retenir : URL, secrets et environnement y sont placés.
---
## D07. Quelles variables sont importantes ?
Réponse : Base, JWT, frontend, email, Stripe, OpenAI, port et limites.
À retenir : Leur nom exact est documenté.
---
## D08. Où configurer les variables sur Render ?
Réponse : Dans l’onglet Environment du service backend.
À retenir : Un redéploiement applique les changements.
---
## D09. Où configurer les variables sur AWS ?
Réponse : Dans le service choisi ou un gestionnaire de secrets.
À retenir : Éviter les secrets dans les fichiers publics.
---
## D10. Pourquoi `.env` n’est-il pas poussé ?
Réponse : Il contient des secrets propres à une installation.
À retenir : `.gitignore` doit l’exclure.
---
## D11. Comment configurez-vous le frontend ?
Réponse : L’URL publique de l’API est injectée lors du build.
À retenir : Une variable frontend n’est jamais secrète.
---
## D12. Qu’est-ce qu’AWS ?
Réponse : C’est une plateforme cloud proposant calcul, stockage, réseau et bases.
À retenir : Plusieurs architectures y sont possibles.
---
## D13. Qu’est-ce que Render ?
Réponse : C’est une plateforme gérée qui construit et exécute des services web.
À retenir : Elle simplifie le déploiement Node.js.
---
## D14. Pourquoi utiliser une plateforme gérée ?
Réponse : Elle automatise build, processus, HTTPS et redéploiement.
À retenir : L’équipe se concentre davantage sur l’application.
---
## D15. Qu’est-ce qu’une instance ?
Réponse : C’est une unité d’exécution du backend.
À retenir : Plusieurs instances peuvent partager la charge.
---
## D16. Qu’est-ce qu’un conteneur ?
Réponse : Il empaquette application et dépendances dans un environnement isolé.
À retenir : Il améliore la reproductibilité.
---
## D17. Utilisez-vous obligatoirement Docker ?
Réponse : Non, la plateforme peut construire directement le projet Node.js.
À retenir : Docker devient utile pour standardiser davantage.
---
## D18. Qu’est-ce qu’un pipeline CI/CD ?
Réponse : Il automatise tests, build et déploiement après modification.
À retenir : Il réduit les erreurs manuelles.
---
## D19. Qu’est-ce que CI ?
Réponse : L’intégration continue vérifie fréquemment le code partagé.
À retenir : Build et tests s’exécutent automatiquement.
---
## D20. Qu’est-ce que CD ?
Réponse : La livraison ou le déploiement continu prépare ou publie les versions.
À retenir : Une validation peut rester manuelle.
---
## D21. Quel rôle joue GitHub ?
Réponse : Il héberge le code et peut déclencher les builds.
À retenir : Les commits forment l’historique.
---
## D22. Comment déployer une nouvelle version ?
Réponse : Tester, committer, pousser, construire, migrer puis vérifier.
À retenir : Suivre une procédure répétable.
---
## D23. Qu’est-ce qu’une migration SQL ?
Réponse : C’est une modification versionnée du schéma ou des données.
À retenir : Elle accompagne la version du code.
---
## D24. Les migrations sont-elles automatiques ?
Réponse : Seulement si un outil ou pipeline les exécute explicitement.
À retenir : Un script SQL seul ne s’applique pas.
---
## D25. Pourquoi versionner les migrations ?
Réponse : Chaque environnement reçoit les changements dans le même ordre.
À retenir : On sait quel schéma est installé.
---
## D26. Faut-il exécuter le script complet à chaque fois ?
Réponse : Non, en production on applique uniquement les migrations nouvelles.
À retenir : Un reset détruirait les données.
---
## D27. Comment sauvegarder avant migration ?
Réponse : Produire un dump vérifié et stocké séparément.
À retenir : Tester aussi sa restauration.
---
## D28. Qu’est-ce qu’un rollback ?
Réponse : C’est le retour à une version stable après échec.
À retenir : Prévoir code et base.
---
## D29. Toutes les migrations sont-elles réversibles ?
Réponse : Non, surtout celles supprimant ou transformant des données.
À retenir : Préférer des changements compatibles.
---
## D30. Qu’est-ce qu’un déploiement blue-green ?
Réponse : Deux environnements permettent de basculer vers la nouvelle version.
À retenir : Le retour arrière est rapide.
---
## D31. Qu’est-ce qu’un déploiement rolling ?
Réponse : Les instances sont remplacées progressivement.
À retenir : Le service reste généralement disponible.
---
## D32. Qu’est-ce qu’un canary release ?
Réponse : Une petite part du trafic teste d’abord la nouvelle version.
À retenir : Le risque est limité.
---
## D33. Comment vérifier un déploiement ?
Réponse : Tester healthcheck, connexion, lectures et parcours critiques.
À retenir : Un build réussi ne suffit pas.
---
## D34. À quoi sert `/api/health` ?
Réponse : Il indique que l’API répond.
À retenir : Ajouter éventuellement un contrôle base.
---
## D35. Qu’est-ce qu’un healthcheck ?
Réponse : C’est une requête automatisée évaluant l’état d’un service.
À retenir : La plateforme peut redémarrer une instance défaillante.
---
## D36. Qu’est-ce que la supervision ?
Réponse : Elle observe disponibilité, erreurs, latence et ressources.
À retenir : Il faut détecter avant les utilisateurs.
---
## D37. Quelles métriques surveiller ?
Réponse : Temps de réponse, erreurs, CPU, mémoire, connexions et stockage.
À retenir : Ajouter aussi des métriques métier.
---
## D38. Qu’est-ce qu’un log de production ?
Réponse : C’est une trace horodatée des événements du service.
À retenir : Il ne doit contenir aucun secret.
---
## D39. Comment centraliser les logs ?
Réponse : Les envoyer vers un service de collecte consultable et alertable.
À retenir : Les instances éphémères ne suffisent pas.
---
## D40. Qu’est-ce qu’une alerte ?
Réponse : C’est une notification déclenchée lorsqu’un seuil est dépassé.
À retenir : Elle doit mener à une action claire.
---
## D41. Comment superviser les tâches email ?
Réponse : Journaliser succès, échec, tentative et prochain traitement.
À retenir : Une file dédiée améliore la fiabilité.
---
## D42. Qu’est-ce qu’un cron ?
Réponse : C’est un planificateur exécutant une tâche à intervalles définis.
À retenir : Il convient aux rappels périodiques.
---
## D43. Où exécuter le cron ?
Réponse : Sur un worker ou service planifié stable.
À retenir : Éviter plusieurs exécutions concurrentes.
---
## D44. Comment empêcher les emails en double ?
Réponse : Enregistrer une clé d’envoi unique avant ou pendant le traitement.
À retenir : La tâche doit être idempotente.
---
## D45. Qu’est-ce qu’un worker ?
Réponse : C’est un processus traitant les tâches asynchrones.
À retenir : Il sépare emails du temps de réponse HTTP.
---
## D46. Pourquoi utiliser une file de tâches ?
Réponse : Elle gère reprises, débit et pannes des services externes.
À retenir : L’utilisateur n’attend pas l’envoi.
---
## D47. Comment déployer les uploads ?
Réponse : Utiliser idéalement un stockage objet accessible par URL contrôlée.
À retenir : Le disque local peut disparaître.
---
## D48. Qu’est-ce que S3 ?
Réponse : C’est le service de stockage objet d’AWS.
À retenir : Il convient aux images et archives.
---
## D49. Comment protéger un bucket ?
Réponse : Accès privé, politiques minimales et URLs signées si nécessaire.
À retenir : Ne pas rendre tous les documents publics.
---
## D50. Qu’est-ce qu’une URL signée ?
Réponse : C’est un lien temporaire autorisant l’accès à un objet privé.
À retenir : Il expire automatiquement.
---
## D51. Comment déployer MySQL ?
Réponse : Utiliser une base gérée ou une instance correctement sauvegardée.
À retenir : Restreindre son réseau.
---
## D52. Qu’est-ce qu’une base gérée ?
Réponse : Le fournisseur gère infrastructure, sauvegardes et maintenance de base.
À retenir : La configuration applicative reste notre responsabilité.
---
## D53. Comment gérer les connexions SQL ?
Réponse : Utiliser un pool avec limites et délais.
À retenir : Une connexion par requête serait coûteuse.
---
## D54. Qu’est-ce qu’un pool de connexions ?
Réponse : C’est un ensemble réutilisable de connexions à la base.
À retenir : Il réduit le temps d’ouverture.
---
## D55. Comment dimensionner le pool ?
Réponse : Selon instances, capacité MySQL et charge mesurée.
À retenir : Trop de connexions saturent la base.
---
## D56. Comment gérer le domaine ?
Réponse : Configurer DNS vers l’hébergement puis activer le certificat.
À retenir : Prévoir sous-domaines web et API.
---
## D57. Comment obtenir HTTPS ?
Réponse : La plateforme ou Let’s Encrypt délivre un certificat TLS.
À retenir : Le renouvellement doit être automatique.
---
## D58. Pourquoi éviter une IP HTTPS directe ?
Réponse : Domaine, certificats et changements d’infrastructure sont mieux gérés avec DNS.
À retenir : Une IP reste utile au diagnostic.
---
## D59. Comment éviter Not Found après actualisation React ?
Réponse : Le serveur doit renvoyer `index.html` pour les routes frontend.
À retenir : C’est le fallback SPA.
---
## D60. Qu’est-ce qu’une SPA ?
Réponse : Une application monopage gère la navigation dans le navigateur.
À retenir : Le serveur sert un point d’entrée unique.
---
## D61. Comment configurer le webhook en production ?
Réponse : Enregistrer l’URL HTTPS exacte chez Stripe et configurer son secret.
À retenir : Sandbox et production ont des secrets distincts.
---
## D62. Comment changer l’URL backend ?
Réponse : Modifier les variables frontend, CORS et webhooks puis redéployer.
À retenir : Documenter tous les emplacements.
---
## D63. Comment passer Stripe du test au réel ?
Réponse : Activer le compte, remplacer clés et webhook, puis refaire les tests.
À retenir : Ne jamais mélanger test et production.
---
## D64. Comment gérer OpenAI en production ?
Réponse : Configurer clé, modèle, budget, délais et solution de repli.
À retenir : ChatGPT Plus ne paie pas l’API.
---
## D65. Comment limiter les coûts cloud ?
Réponse : Mesurer usage, dimensionner, compresser, archiver et fixer des alertes.
À retenir : Optimiser après observation.
---
## D66. Qu’est-ce que la scalabilité verticale ?
Réponse : Ajouter CPU ou mémoire à une instance.
À retenir : Simple mais limitée.
---
## D67. Qu’est-ce que la scalabilité horizontale ?
Réponse : Ajouter plusieurs instances derrière un répartiteur.
À retenir : L’application doit rester stateless.
---
## D68. Qu’est-ce qu’une application stateless ?
Réponse : Une requête peut être traitée par n’importe quelle instance.
À retenir : Sessions et fichiers sont externalisés.
---
## D69. Comment atteindre une haute disponibilité ?
Réponse : Multiplier instances, surveiller, sauvegarder et supprimer les points uniques.
À retenir : Cela augmente coût et complexité.
---
## D70. Qu’est-ce qu’un plan de reprise ?
Réponse : Il décrit restauration du service et des données après incident.
À retenir : Définir responsabilités et délais.
---
## D71. Que signifient RPO et RTO ?
Réponse : RPO est la perte acceptable ; RTO le temps acceptable de restauration.
À retenir : Ils guident les sauvegardes.
---
## D72. Que vérifier avant mise en production ?
Réponse : Secrets, HTTPS, migrations, sauvegarde, CORS, rôles, paiements et logs.
À retenir : Utiliser une checklist signée.
---
## D73. Que vérifier après mise en production ?
Réponse : Healthcheck, erreurs, parcours critiques, emails, webhook et performance mobile.
À retenir : Surveiller plus fortement au début.
---
## D74. Comment résumer votre déploiement ?
Réponse : Une chaîne reproductible construit, configure, migre, publie, vérifie et surveille le CRM.
À retenir : Déployer signifie aussi exploiter et pouvoir restaurer.
---

# ANNEXE — PROCESSUS GITHUB APPLIQUÉ AU PROJET

## 1. Pourquoi avons-nous utilisé Git et GitHub ?

Git enregistre localement l’historique des modifications du projet. GitHub conserve une copie distante du dépôt, facilite la collaboration, la sauvegarde du code et le déploiement depuis une branche contrôlée.

Dans notre projet :

- Git suit les fichiers utiles du frontend, du backend, du SQL et de la documentation ;
- GitHub héberge le dépôt distant ;
- la branche principale est `main` ;
- le dépôt distant est `https://github.com/Sagelusenge/Developpement-d-un-systeme-de-Gestion-des-clients.git` ;
- les secrets tels que `.env` ne sont pas envoyés vers GitHub.

## 2. Initialisation locale du dépôt

À la racine du projet, nous avons initialisé Git :

```bash
git init
```

Cette commande crée le dossier caché `.git`, qui contient l’historique, les références de branches et la configuration locale du dépôt.

Nous pouvons vérifier l’état du dépôt avec :

```bash
git status
```

## 3. Création et rôle du fichier `.gitignore`

Avant le premier commit, nous avons créé `.gitignore`. Son rôle est d’empêcher Git de suivre les fichiers générés, lourds ou secrets.

Contenu important utilisé dans notre projet :

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
*.log
*.err.log
```

Explication :

- `node_modules/` est recréé avec `npm install` et ne doit pas être poussé ;
- `dist/` est un résultat de compilation reproductible ;
- `.env` contient des clés et mots de passe privés ;
- `.env.*` ignore les variantes locales des environnements ;
- `!.env.example` permet de publier un exemple sans vraie valeur secrète ;
- les fichiers `*.log` et `*.err.log` sont des traces locales.

## 4. Pourquoi le fichier `.env` doit-il être ignoré ?

Le `.env` peut contenir :

- le mot de passe MySQL ;
- le secret JWT ;
- la clé secrète Stripe ;
- le secret du webhook Stripe ;
- la clé OpenAI ;
- les identifiants SMTP.

Pousser ce fichier exposerait les services et les données. Sur Render ou AWS, ces valeurs sont donc configurées dans les variables d’environnement de la plateforme, jamais dans GitHub.

Un fichier `.env.example` peut montrer uniquement les noms attendus :

```env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
FRONTEND_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY=
```

## 5. Ajout des fichiers à l’index Git

Après vérification du `.gitignore`, nous avons préparé les fichiers :

```bash
git add .
```

Cette commande place les changements utiles dans la zone de préparation. Avant de continuer, nous pouvons contrôler exactement ce qui sera committé :

```bash
git status
git diff --staged
```

Le `.env`, `node_modules` et les logs ne doivent pas apparaître.

## 6. Création du premier commit

Nous avons enregistré une première version cohérente :

```bash
git commit -m "Initialisation du projet CRM PME"
```

Un commit doit représenter un ensemble logique et posséder un message compréhensible. Il ne faut pas mélanger une correction de paiement avec des changements sans rapport.

## 7. Configuration de la branche principale

Nous avons utilisé `main` comme branche principale :

```bash
git branch -M main
```

La branche courante peut être vérifiée avec :

```bash
git branch --show-current
```

## 8. Liaison avec le dépôt GitHub

Après création du dépôt sur GitHub, nous avons ajouté son URL :

```bash
git remote add origin https://github.com/Sagelusenge/Developpement-d-un-systeme-de-Gestion-des-clients.git
```

Nous vérifions la liaison avec :

```bash
git remote -v
```

Si `origin` existe déjà mais possède une mauvaise adresse :

```bash
git remote set-url origin https://github.com/Sagelusenge/Developpement-d-un-systeme-de-Gestion-des-clients.git
```

## 9. Premier envoi vers GitHub

Nous avons poussé la branche principale :

```bash
git push -u origin main
```

L’option `-u` associe la branche locale `main` à `origin/main`. Les prochains envois peuvent ensuite utiliser simplement `git push`.

## 10. Procédure utilisée pour les modifications suivantes

Pour chaque correction :

```bash
git status
git diff
git add frontend/src/main.jsx frontend/styles.css
git commit -m "Correction du header public et du responsive"
git push origin main
```

Nous ajoutons uniquement les fichiers concernés lorsque cela permet de mieux contrôler le commit.

## 11. Procédure recommandée avec une branche de travail

Pour éviter de modifier directement `main` :

```bash
git switch main
git pull origin main
git switch -c feature/nom-fonctionnalite
```

Après développement et vérification :

```bash
git add .
git commit -m "Ajout de la fonctionnalite"
git push -u origin feature/nom-fonctionnalite
```

Une Pull Request permet alors de relire et tester avant fusion dans `main`.

## 12. Récupération des changements d’un collaborateur

Avant de commencer une nouvelle modification :

```bash
git switch main
git pull origin main
```

Cela réduit les conflits causés par une branche locale trop ancienne.

## 13. Gestion d’un conflit Git

Lorsqu’un même passage a été modifié différemment, Git marque le conflit dans le fichier. Nous devons choisir ou combiner les changements, supprimer les marqueurs, tester puis exécuter :

```bash
git add chemin/du/fichier
git commit
```

Un conflit ne doit jamais être résolu en supprimant aveuglément le travail de l’autre personne.

## 14. Vérifications avant chaque push

Checklist utilisée ou recommandée :

1. lancer `git status` ;
2. examiner `git diff` ;
3. confirmer que `.env` et les secrets sont absents ;
4. compiler le frontend avec `npm run build` ;
5. vérifier la syntaxe ou démarrer le backend ;
6. tester les parcours modifiés ;
7. créer un commit explicite ;
8. pousser la bonne branche.

## 15. Que faire si un secret a déjà été poussé ?

Le retirer du dernier fichier ne suffit pas, car il peut rester dans l’historique Git. Il faut :

1. révoquer immédiatement la clé chez le fournisseur ;
2. générer une nouvelle clé ;
3. placer la nouvelle valeur uniquement dans l’environnement sécurisé ;
4. supprimer le secret du code et, si nécessaire, nettoyer l’historique ;
5. auditer son utilisation passée.

La rotation du secret est prioritaire.

## 16. Relation entre GitHub et le déploiement

Render ou une chaîne AWS peut surveiller la branche `main`. Après un push :

1. la plateforme récupère le commit ;
2. elle installe les dépendances ;
3. elle exécute la commande de build ;
4. elle démarre la nouvelle version ;
5. le healthcheck confirme que le service répond.

Les variables d’environnement ne viennent pas du dépôt : elles restent configurées sur la plateforme.

## 17. Réponse courte possible pendant la soutenance

**Question : Comment avez-vous publié et versionné le projet ?**

**Réponse :** Nous avons initialisé Git à la racine, créé un `.gitignore` excluant notamment `.env`, `node_modules`, `dist` et les logs, puis créé des commits cohérents. Nous avons relié le dépôt local au dépôt GitHub avec un remote `origin` et poussé la branche `main`. Les secrets sont configurés directement sur Render ou AWS. Avant chaque push, nous vérifions le diff, compilons le frontend et testons les fonctions modifiées.
