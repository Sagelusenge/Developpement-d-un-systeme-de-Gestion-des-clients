# Fonctionnement detaille de l application

Ce guide explique comment les modules travaillent ensemble depuis la connexion jusqu aux rapports.

## Connexion et session
- L utilisateur saisit son email et son mot de passe.
- Le backend verifie les identifiants et renvoie un jeton JWT.
- Le frontend garde le jeton dans le stockage local pour les appels suivants.
- Chaque appel API protege envoie le jeton dans l entete Authorization.
- Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
- Le role contenu dans le jeton sert a autoriser ou refuser les actions.
- Le profil permet de modifier certaines informations personnelles.
- La deconnexion supprime la session du navigateur.
1. L utilisateur saisit son email et son mot de passe.
1. Le backend verifie les identifiants et renvoie un jeton JWT.
1. Le frontend garde le jeton dans le stockage local pour les appels suivants.
1. Chaque appel API protege envoie le jeton dans l entete Authorization.
1. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
1. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
1. Le profil permet de modifier certaines informations personnelles.
1. La deconnexion supprime la session du navigateur.
2. L utilisateur saisit son email et son mot de passe.
2. Le backend verifie les identifiants et renvoie un jeton JWT.
2. Le frontend garde le jeton dans le stockage local pour les appels suivants.
2. Chaque appel API protege envoie le jeton dans l entete Authorization.
2. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
2. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
2. Le profil permet de modifier certaines informations personnelles.
2. La deconnexion supprime la session du navigateur.
3. L utilisateur saisit son email et son mot de passe.
3. Le backend verifie les identifiants et renvoie un jeton JWT.
3. Le frontend garde le jeton dans le stockage local pour les appels suivants.
3. Chaque appel API protege envoie le jeton dans l entete Authorization.
3. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
3. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
3. Le profil permet de modifier certaines informations personnelles.
3. La deconnexion supprime la session du navigateur.
4. L utilisateur saisit son email et son mot de passe.
4. Le backend verifie les identifiants et renvoie un jeton JWT.
4. Le frontend garde le jeton dans le stockage local pour les appels suivants.
4. Chaque appel API protege envoie le jeton dans l entete Authorization.
4. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
4. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
4. Le profil permet de modifier certaines informations personnelles.
4. La deconnexion supprime la session du navigateur.
5. L utilisateur saisit son email et son mot de passe.
5. Le backend verifie les identifiants et renvoie un jeton JWT.
5. Le frontend garde le jeton dans le stockage local pour les appels suivants.
5. Chaque appel API protege envoie le jeton dans l entete Authorization.
5. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
5. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
5. Le profil permet de modifier certaines informations personnelles.
5. La deconnexion supprime la session du navigateur.
6. L utilisateur saisit son email et son mot de passe.
6. Le backend verifie les identifiants et renvoie un jeton JWT.
6. Le frontend garde le jeton dans le stockage local pour les appels suivants.
6. Chaque appel API protege envoie le jeton dans l entete Authorization.
6. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
6. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
6. Le profil permet de modifier certaines informations personnelles.
6. La deconnexion supprime la session du navigateur.
7. L utilisateur saisit son email et son mot de passe.
7. Le backend verifie les identifiants et renvoie un jeton JWT.
7. Le frontend garde le jeton dans le stockage local pour les appels suivants.
7. Chaque appel API protege envoie le jeton dans l entete Authorization.
7. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
7. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
7. Le profil permet de modifier certaines informations personnelles.
7. La deconnexion supprime la session du navigateur.
8. L utilisateur saisit son email et son mot de passe.
8. Le backend verifie les identifiants et renvoie un jeton JWT.
8. Le frontend garde le jeton dans le stockage local pour les appels suivants.
8. Chaque appel API protege envoie le jeton dans l entete Authorization.
8. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
8. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
8. Le profil permet de modifier certaines informations personnelles.
8. La deconnexion supprime la session du navigateur.
9. L utilisateur saisit son email et son mot de passe.
9. Le backend verifie les identifiants et renvoie un jeton JWT.
9. Le frontend garde le jeton dans le stockage local pour les appels suivants.
9. Chaque appel API protege envoie le jeton dans l entete Authorization.
9. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
9. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
9. Le profil permet de modifier certaines informations personnelles.
9. La deconnexion supprime la session du navigateur.
10. L utilisateur saisit son email et son mot de passe.
10. Le backend verifie les identifiants et renvoie un jeton JWT.
10. Le frontend garde le jeton dans le stockage local pour les appels suivants.
10. Chaque appel API protege envoie le jeton dans l entete Authorization.
10. Si le jeton est absent ou invalide, l utilisateur doit se reconnecter.
10. Le role contenu dans le jeton sert a autoriser ou refuser les actions.
10. Le profil permet de modifier certaines informations personnelles.
10. La deconnexion supprime la session du navigateur.

## Gestion des produits
- Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
- Le prix d achat courant sert au calcul du cout des produits vendus.
- Le prix de vente HT sert au calcul du gain.
- La photo peut venir d une URL ou d une image importee.
- Si aucune photo n existe, l interface affiche une image de secours.
- Le stock initial peut etre saisi a la creation du produit.
- Le seuil d alerte indique quand le produit doit etre surveille.
- Le statut de stock peut etre OK, ALERTE ou RUPTURE.
1. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
1. Le prix d achat courant sert au calcul du cout des produits vendus.
1. Le prix de vente HT sert au calcul du gain.
1. La photo peut venir d une URL ou d une image importee.
1. Si aucune photo n existe, l interface affiche une image de secours.
1. Le stock initial peut etre saisi a la creation du produit.
1. Le seuil d alerte indique quand le produit doit etre surveille.
1. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
2. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
2. Le prix d achat courant sert au calcul du cout des produits vendus.
2. Le prix de vente HT sert au calcul du gain.
2. La photo peut venir d une URL ou d une image importee.
2. Si aucune photo n existe, l interface affiche une image de secours.
2. Le stock initial peut etre saisi a la creation du produit.
2. Le seuil d alerte indique quand le produit doit etre surveille.
2. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
3. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
3. Le prix d achat courant sert au calcul du cout des produits vendus.
3. Le prix de vente HT sert au calcul du gain.
3. La photo peut venir d une URL ou d une image importee.
3. Si aucune photo n existe, l interface affiche une image de secours.
3. Le stock initial peut etre saisi a la creation du produit.
3. Le seuil d alerte indique quand le produit doit etre surveille.
3. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
4. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
4. Le prix d achat courant sert au calcul du cout des produits vendus.
4. Le prix de vente HT sert au calcul du gain.
4. La photo peut venir d une URL ou d une image importee.
4. Si aucune photo n existe, l interface affiche une image de secours.
4. Le stock initial peut etre saisi a la creation du produit.
4. Le seuil d alerte indique quand le produit doit etre surveille.
4. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
5. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
5. Le prix d achat courant sert au calcul du cout des produits vendus.
5. Le prix de vente HT sert au calcul du gain.
5. La photo peut venir d une URL ou d une image importee.
5. Si aucune photo n existe, l interface affiche une image de secours.
5. Le stock initial peut etre saisi a la creation du produit.
5. Le seuil d alerte indique quand le produit doit etre surveille.
5. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
6. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
6. Le prix d achat courant sert au calcul du cout des produits vendus.
6. Le prix de vente HT sert au calcul du gain.
6. La photo peut venir d une URL ou d une image importee.
6. Si aucune photo n existe, l interface affiche une image de secours.
6. Le stock initial peut etre saisi a la creation du produit.
6. Le seuil d alerte indique quand le produit doit etre surveille.
6. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
7. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
7. Le prix d achat courant sert au calcul du cout des produits vendus.
7. Le prix de vente HT sert au calcul du gain.
7. La photo peut venir d une URL ou d une image importee.
7. Si aucune photo n existe, l interface affiche une image de secours.
7. Le stock initial peut etre saisi a la creation du produit.
7. Le seuil d alerte indique quand le produit doit etre surveille.
7. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
8. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
8. Le prix d achat courant sert au calcul du cout des produits vendus.
8. Le prix de vente HT sert au calcul du gain.
8. La photo peut venir d une URL ou d une image importee.
8. Si aucune photo n existe, l interface affiche une image de secours.
8. Le stock initial peut etre saisi a la creation du produit.
8. Le seuil d alerte indique quand le produit doit etre surveille.
8. Le statut de stock peut etre OK, ALERTE ou RUPTURE.
9. Un produit contient un nom, une reference, une categorie, une unite, une photo, un prix de vente et un prix d achat.
9. Le prix d achat courant sert au calcul du cout des produits vendus.
9. Le prix de vente HT sert au calcul du gain.
9. La photo peut venir d une URL ou d une image importee.
9. Si aucune photo n existe, l interface affiche une image de secours.
9. Le stock initial peut etre saisi a la creation du produit.
9. Le seuil d alerte indique quand le produit doit etre surveille.
9. Le statut de stock peut etre OK, ALERTE ou RUPTURE.

## Approvisionnement
- Un approvisionnement ajoute une quantite au stock.
- Le magasinier choisit le produit concerne.
- Le magasinier choisit le fournisseur.
- Le magasinier saisit le prix d achat unitaire de la livraison.
- Le systeme calcule le total achat de la livraison.
- Le systeme met a jour le cout moyen pondere du produit.
- Le mouvement de stock garde la trace de l operation.
- La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
1. Un approvisionnement ajoute une quantite au stock.
1. Le magasinier choisit le produit concerne.
1. Le magasinier choisit le fournisseur.
1. Le magasinier saisit le prix d achat unitaire de la livraison.
1. Le systeme calcule le total achat de la livraison.
1. Le systeme met a jour le cout moyen pondere du produit.
1. Le mouvement de stock garde la trace de l operation.
1. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
2. Un approvisionnement ajoute une quantite au stock.
2. Le magasinier choisit le produit concerne.
2. Le magasinier choisit le fournisseur.
2. Le magasinier saisit le prix d achat unitaire de la livraison.
2. Le systeme calcule le total achat de la livraison.
2. Le systeme met a jour le cout moyen pondere du produit.
2. Le mouvement de stock garde la trace de l operation.
2. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
3. Un approvisionnement ajoute une quantite au stock.
3. Le magasinier choisit le produit concerne.
3. Le magasinier choisit le fournisseur.
3. Le magasinier saisit le prix d achat unitaire de la livraison.
3. Le systeme calcule le total achat de la livraison.
3. Le systeme met a jour le cout moyen pondere du produit.
3. Le mouvement de stock garde la trace de l operation.
3. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
4. Un approvisionnement ajoute une quantite au stock.
4. Le magasinier choisit le produit concerne.
4. Le magasinier choisit le fournisseur.
4. Le magasinier saisit le prix d achat unitaire de la livraison.
4. Le systeme calcule le total achat de la livraison.
4. Le systeme met a jour le cout moyen pondere du produit.
4. Le mouvement de stock garde la trace de l operation.
4. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
5. Un approvisionnement ajoute une quantite au stock.
5. Le magasinier choisit le produit concerne.
5. Le magasinier choisit le fournisseur.
5. Le magasinier saisit le prix d achat unitaire de la livraison.
5. Le systeme calcule le total achat de la livraison.
5. Le systeme met a jour le cout moyen pondere du produit.
5. Le mouvement de stock garde la trace de l operation.
5. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
6. Un approvisionnement ajoute une quantite au stock.
6. Le magasinier choisit le produit concerne.
6. Le magasinier choisit le fournisseur.
6. Le magasinier saisit le prix d achat unitaire de la livraison.
6. Le systeme calcule le total achat de la livraison.
6. Le systeme met a jour le cout moyen pondere du produit.
6. Le mouvement de stock garde la trace de l operation.
6. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
7. Un approvisionnement ajoute une quantite au stock.
7. Le magasinier choisit le produit concerne.
7. Le magasinier choisit le fournisseur.
7. Le magasinier saisit le prix d achat unitaire de la livraison.
7. Le systeme calcule le total achat de la livraison.
7. Le systeme met a jour le cout moyen pondere du produit.
7. Le mouvement de stock garde la trace de l operation.
7. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
8. Un approvisionnement ajoute une quantite au stock.
8. Le magasinier choisit le produit concerne.
8. Le magasinier choisit le fournisseur.
8. Le magasinier saisit le prix d achat unitaire de la livraison.
8. Le systeme calcule le total achat de la livraison.
8. Le systeme met a jour le cout moyen pondere du produit.
8. Le mouvement de stock garde la trace de l operation.
8. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.
9. Un approvisionnement ajoute une quantite au stock.
9. Le magasinier choisit le produit concerne.
9. Le magasinier choisit le fournisseur.
9. Le magasinier saisit le prix d achat unitaire de la livraison.
9. Le systeme calcule le total achat de la livraison.
9. Le systeme met a jour le cout moyen pondere du produit.
9. Le mouvement de stock garde la trace de l operation.
9. La page fournisseurs affiche les coordonnees et le nombre d approvisionnements.

## Vente et facture
- La vente commence par le choix du client.
- La recherche client aide a trouver rapidement un client existant.
- Le vendeur ajoute les produits vendus.
- Chaque ligne contient une quantite et un prix de vente unitaire.
- Le systeme calcule le total de chaque ligne.
- Le systeme diminue le stock quand la vente est validee.
- La facture peut etre imprimee.
- La facture peut rester non payee ou partiellement payee.
1. La vente commence par le choix du client.
1. La recherche client aide a trouver rapidement un client existant.
1. Le vendeur ajoute les produits vendus.
1. Chaque ligne contient une quantite et un prix de vente unitaire.
1. Le systeme calcule le total de chaque ligne.
1. Le systeme diminue le stock quand la vente est validee.
1. La facture peut etre imprimee.
1. La facture peut rester non payee ou partiellement payee.
2. La vente commence par le choix du client.
2. La recherche client aide a trouver rapidement un client existant.
2. Le vendeur ajoute les produits vendus.
2. Chaque ligne contient une quantite et un prix de vente unitaire.
2. Le systeme calcule le total de chaque ligne.
2. Le systeme diminue le stock quand la vente est validee.
2. La facture peut etre imprimee.
2. La facture peut rester non payee ou partiellement payee.
3. La vente commence par le choix du client.
3. La recherche client aide a trouver rapidement un client existant.
3. Le vendeur ajoute les produits vendus.
3. Chaque ligne contient une quantite et un prix de vente unitaire.
3. Le systeme calcule le total de chaque ligne.
3. Le systeme diminue le stock quand la vente est validee.
3. La facture peut etre imprimee.
3. La facture peut rester non payee ou partiellement payee.
4. La vente commence par le choix du client.
4. La recherche client aide a trouver rapidement un client existant.
4. Le vendeur ajoute les produits vendus.
4. Chaque ligne contient une quantite et un prix de vente unitaire.
4. Le systeme calcule le total de chaque ligne.
4. Le systeme diminue le stock quand la vente est validee.
4. La facture peut etre imprimee.
4. La facture peut rester non payee ou partiellement payee.
5. La vente commence par le choix du client.
5. La recherche client aide a trouver rapidement un client existant.
5. Le vendeur ajoute les produits vendus.
5. Chaque ligne contient une quantite et un prix de vente unitaire.
5. Le systeme calcule le total de chaque ligne.
5. Le systeme diminue le stock quand la vente est validee.
5. La facture peut etre imprimee.
5. La facture peut rester non payee ou partiellement payee.
6. La vente commence par le choix du client.
6. La recherche client aide a trouver rapidement un client existant.
6. Le vendeur ajoute les produits vendus.
6. Chaque ligne contient une quantite et un prix de vente unitaire.
6. Le systeme calcule le total de chaque ligne.
6. Le systeme diminue le stock quand la vente est validee.
6. La facture peut etre imprimee.
6. La facture peut rester non payee ou partiellement payee.
7. La vente commence par le choix du client.
7. La recherche client aide a trouver rapidement un client existant.
7. Le vendeur ajoute les produits vendus.
7. Chaque ligne contient une quantite et un prix de vente unitaire.
7. Le systeme calcule le total de chaque ligne.
7. Le systeme diminue le stock quand la vente est validee.
7. La facture peut etre imprimee.
7. La facture peut rester non payee ou partiellement payee.
8. La vente commence par le choix du client.
8. La recherche client aide a trouver rapidement un client existant.
8. Le vendeur ajoute les produits vendus.
8. Chaque ligne contient une quantite et un prix de vente unitaire.
8. Le systeme calcule le total de chaque ligne.
8. Le systeme diminue le stock quand la vente est validee.
8. La facture peut etre imprimee.
8. La facture peut rester non payee ou partiellement payee.
9. La vente commence par le choix du client.
9. La recherche client aide a trouver rapidement un client existant.
9. Le vendeur ajoute les produits vendus.
9. Chaque ligne contient une quantite et un prix de vente unitaire.
9. Le systeme calcule le total de chaque ligne.
9. Le systeme diminue le stock quand la vente est validee.
9. La facture peut etre imprimee.
9. La facture peut rester non payee ou partiellement payee.

## Paiement et caisse
- Un paiement est lie a une facture existante.
- Le montant paye ne doit pas depasser le reste a payer.
- Les modes prevus sont especes, carte, virement et mobile money.
- Mobile Money demande une reference et un numero.
- La caisse regroupe les paiements par date et par mode.
- Le filtre journalier montre la caisse du jour.
- Le filtre hebdomadaire montre la caisse de la semaine.
- Le filtre personnalise montre la caisse entre deux dates.
1. Un paiement est lie a une facture existante.
1. Le montant paye ne doit pas depasser le reste a payer.
1. Les modes prevus sont especes, carte, virement et mobile money.
1. Mobile Money demande une reference et un numero.
1. La caisse regroupe les paiements par date et par mode.
1. Le filtre journalier montre la caisse du jour.
1. Le filtre hebdomadaire montre la caisse de la semaine.
1. Le filtre personnalise montre la caisse entre deux dates.
2. Un paiement est lie a une facture existante.
2. Le montant paye ne doit pas depasser le reste a payer.
2. Les modes prevus sont especes, carte, virement et mobile money.
2. Mobile Money demande une reference et un numero.
2. La caisse regroupe les paiements par date et par mode.
2. Le filtre journalier montre la caisse du jour.
2. Le filtre hebdomadaire montre la caisse de la semaine.
2. Le filtre personnalise montre la caisse entre deux dates.
3. Un paiement est lie a une facture existante.
3. Le montant paye ne doit pas depasser le reste a payer.
3. Les modes prevus sont especes, carte, virement et mobile money.
3. Mobile Money demande une reference et un numero.
3. La caisse regroupe les paiements par date et par mode.
3. Le filtre journalier montre la caisse du jour.
3. Le filtre hebdomadaire montre la caisse de la semaine.
3. Le filtre personnalise montre la caisse entre deux dates.
4. Un paiement est lie a une facture existante.
4. Le montant paye ne doit pas depasser le reste a payer.
4. Les modes prevus sont especes, carte, virement et mobile money.
4. Mobile Money demande une reference et un numero.
4. La caisse regroupe les paiements par date et par mode.
4. Le filtre journalier montre la caisse du jour.
4. Le filtre hebdomadaire montre la caisse de la semaine.
4. Le filtre personnalise montre la caisse entre deux dates.
5. Un paiement est lie a une facture existante.
5. Le montant paye ne doit pas depasser le reste a payer.
5. Les modes prevus sont especes, carte, virement et mobile money.
5. Mobile Money demande une reference et un numero.
5. La caisse regroupe les paiements par date et par mode.
5. Le filtre journalier montre la caisse du jour.
5. Le filtre hebdomadaire montre la caisse de la semaine.
5. Le filtre personnalise montre la caisse entre deux dates.
6. Un paiement est lie a une facture existante.
6. Le montant paye ne doit pas depasser le reste a payer.
6. Les modes prevus sont especes, carte, virement et mobile money.
6. Mobile Money demande une reference et un numero.
6. La caisse regroupe les paiements par date et par mode.
6. Le filtre journalier montre la caisse du jour.
6. Le filtre hebdomadaire montre la caisse de la semaine.
6. Le filtre personnalise montre la caisse entre deux dates.
7. Un paiement est lie a une facture existante.
7. Le montant paye ne doit pas depasser le reste a payer.
7. Les modes prevus sont especes, carte, virement et mobile money.
7. Mobile Money demande une reference et un numero.
7. La caisse regroupe les paiements par date et par mode.
7. Le filtre journalier montre la caisse du jour.
7. Le filtre hebdomadaire montre la caisse de la semaine.
7. Le filtre personnalise montre la caisse entre deux dates.
8. Un paiement est lie a une facture existante.
8. Le montant paye ne doit pas depasser le reste a payer.
8. Les modes prevus sont especes, carte, virement et mobile money.
8. Mobile Money demande une reference et un numero.
8. La caisse regroupe les paiements par date et par mode.
8. Le filtre journalier montre la caisse du jour.
8. Le filtre hebdomadaire montre la caisse de la semaine.
8. Le filtre personnalise montre la caisse entre deux dates.
9. Un paiement est lie a une facture existante.
9. Le montant paye ne doit pas depasser le reste a payer.
9. Les modes prevus sont especes, carte, virement et mobile money.
9. Mobile Money demande une reference et un numero.
9. La caisse regroupe les paiements par date et par mode.
9. Le filtre journalier montre la caisse du jour.
9. Le filtre hebdomadaire montre la caisse de la semaine.
9. Le filtre personnalise montre la caisse entre deux dates.

## Rapports et lecture des chiffres
- Le rapport facture liste les ventes sur la periode choisie.
- Le rapport dettes montre les factures avec un reste a payer.
- Le livre de caisse montre les paiements reels.
- Le bilan compare les ventes HT au cout d achat.
- Le journal liste les operations importantes.
- L inventaire montre le stock courant.
- Le top clients aide a identifier les bons acheteurs.
- Les impressions utilisent des tableaux lisibles.
1. Le rapport facture liste les ventes sur la periode choisie.
1. Le rapport dettes montre les factures avec un reste a payer.
1. Le livre de caisse montre les paiements reels.
1. Le bilan compare les ventes HT au cout d achat.
1. Le journal liste les operations importantes.
1. L inventaire montre le stock courant.
1. Le top clients aide a identifier les bons acheteurs.
1. Les impressions utilisent des tableaux lisibles.
2. Le rapport facture liste les ventes sur la periode choisie.
2. Le rapport dettes montre les factures avec un reste a payer.
2. Le livre de caisse montre les paiements reels.
2. Le bilan compare les ventes HT au cout d achat.
2. Le journal liste les operations importantes.
2. L inventaire montre le stock courant.
2. Le top clients aide a identifier les bons acheteurs.
2. Les impressions utilisent des tableaux lisibles.
3. Le rapport facture liste les ventes sur la periode choisie.
3. Le rapport dettes montre les factures avec un reste a payer.
3. Le livre de caisse montre les paiements reels.
3. Le bilan compare les ventes HT au cout d achat.
3. Le journal liste les operations importantes.
3. L inventaire montre le stock courant.
3. Le top clients aide a identifier les bons acheteurs.
3. Les impressions utilisent des tableaux lisibles.
4. Le rapport facture liste les ventes sur la periode choisie.
4. Le rapport dettes montre les factures avec un reste a payer.
4. Le livre de caisse montre les paiements reels.
4. Le bilan compare les ventes HT au cout d achat.
4. Le journal liste les operations importantes.
4. L inventaire montre le stock courant.
4. Le top clients aide a identifier les bons acheteurs.
4. Les impressions utilisent des tableaux lisibles.
5. Le rapport facture liste les ventes sur la periode choisie.
5. Le rapport dettes montre les factures avec un reste a payer.
5. Le livre de caisse montre les paiements reels.
5. Le bilan compare les ventes HT au cout d achat.
5. Le journal liste les operations importantes.
5. L inventaire montre le stock courant.
5. Le top clients aide a identifier les bons acheteurs.
5. Les impressions utilisent des tableaux lisibles.
6. Le rapport facture liste les ventes sur la periode choisie.
6. Le rapport dettes montre les factures avec un reste a payer.
6. Le livre de caisse montre les paiements reels.
6. Le bilan compare les ventes HT au cout d achat.
6. Le journal liste les operations importantes.
6. L inventaire montre le stock courant.
6. Le top clients aide a identifier les bons acheteurs.
6. Les impressions utilisent des tableaux lisibles.
7. Le rapport facture liste les ventes sur la periode choisie.
7. Le rapport dettes montre les factures avec un reste a payer.
7. Le livre de caisse montre les paiements reels.
7. Le bilan compare les ventes HT au cout d achat.
7. Le journal liste les operations importantes.
7. L inventaire montre le stock courant.
7. Le top clients aide a identifier les bons acheteurs.
7. Les impressions utilisent des tableaux lisibles.
8. Le rapport facture liste les ventes sur la periode choisie.
8. Le rapport dettes montre les factures avec un reste a payer.
8. Le livre de caisse montre les paiements reels.
8. Le bilan compare les ventes HT au cout d achat.
8. Le journal liste les operations importantes.
8. L inventaire montre le stock courant.
8. Le top clients aide a identifier les bons acheteurs.
8. Les impressions utilisent des tableaux lisibles.
9. Le rapport facture liste les ventes sur la periode choisie.
9. Le rapport dettes montre les factures avec un reste a payer.
9. Le livre de caisse montre les paiements reels.
9. Le bilan compare les ventes HT au cout d achat.
9. Le journal liste les operations importantes.
9. L inventaire montre le stock courant.
9. Le top clients aide a identifier les bons acheteurs.
9. Les impressions utilisent des tableaux lisibles.

- Note 1: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 2: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 3: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 4: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 5: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 6: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 7: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 8: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 9: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 10: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 11: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 12: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 13: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 14: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 15: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 16: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 17: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 18: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 19: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 20: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 21: fonctionnement application doit rester simple, verifiable et utile pour un utilisateur non technique.

## Parcours actuels ajoutes - 21 juin 2026

### Creation d'un compte client

1. Le visiteur ouvre Inscription depuis l'accueil.
2. Il saisit son identite, telephone, Gmail et mot de passe.
3. Le backend envoie un code de confirmation professionnel valable pendant une duree limitee.
4. Le client saisit le code; son compte devient utilisable et une session est ouverte.
5. Au prochain acces, il utilise la meme page de connexion que l'equipe; le serveur detecte son role.

### Commande et securite du montant

1. Le catalogue ne montre que les produits disponibles dont le prix de vente couvre le cout d'achat.
2. Le client selectionne produit et quantite.
3. Le frontend affiche une estimation avec `prix_ht` et TVA.
4. Le backend relit le produit et recalcule le montant; il n'accepte pas un prix fourni librement par le navigateur.
5. La commande est transmise a l'equipe et peut devenir une facture lors de la conversion autorisee.

### Paiement Mobile Money

1. Depuis Mes achats, le client choisit une facture avec un reste a payer.
2. Il selectionne M-Pesa, Airtel Money ou Orange Money.
3. Il effectue le transfert depuis son telephone et fournit la reference recue.
4. Le systeme enregistre une demande `en_attente`, sans augmenter la caisse.
5. Le manager peut consulter la demande; le vendeur compare la transaction et la confirme ou la rejette.
6. En cas de confirmation, le backend reverifie le solde puis cree le paiement Mobile Money.

### Conversation client-manager

1. Le client envoie un message; celui-ci apparait immediatement sans ecran de chargement.
2. Le backend le sauvegarde et diffuse un evenement temps reel.
3. Le bot repond aux questions fiables, y compris les references de commande et facture appartenant au client.
4. Pour une question complexe, le bot annonce le transfert en quelques minutes.
5. Le manager recoit une notification dans l'application et un email indiquant client, conversation et question.
6. Sa reponse est diffusee instantanement au client et reste conservee dans l'historique.

### Notifications et navigation

Cliquer sur une notification de commande, reclamation ou chat ouvre directement la page concernee avec sa reference. La notification lue est retiree de la cloche pour garder une liste utile.

### Responsabilites finales

- Manager: supervision et traitement; il ne cree pas une vente ou un encaissement.
- Vendeur: ventes, factures, encaissements et validation Mobile Money.
- Magasinier: fournisseurs, categories, produits, approvisionnements et stock.
- Client: commandes, achats, paiements soumis, reclamations et assistance.

## Correctifs de parcours - 21 juin 2026

- Actualisation: la regle `/* /index.html 200` renvoie `/about`, `/contact`, `/connexion`, `/inscription` et `/app` vers React.
- Commentaire: le backend valide, stocke, notifie le manager, puis le manager classe le message lu ou traite.
- Stock: les approvisionnements sont des entrees; chaque ligne de facture devient une sortie avec facture, produit, quantite, cout historique et date.
- Prospect: apres confirmation de l'email, le client recoit un accueil personnalise. La relance attend sept jours et ne depasse pas une fois par semaine.
- Prospect sans achat: apres 24 heures en environnement de test, il recoit une seule fois un email de presentation avec trois produits disponibles. En production, le delai recommande est 168 heures.
- Chat: MySQL fournit les prix et stocks faisant autorite; OpenAI complete seulement les questions generales lorsque la cle serveur est configuree.

## Fidelisation CRM et IA - 25 juin 2026

### Assistant intelligent

1. Le chat comprend les salutations, remerciements et petites fautes courantes sans transferer inutilement au manager.
2. Pour les prix, stocks, commandes et factures, le backend consulte d'abord MySQL.
3. OpenAI est utilise ensuite pour formuler une reponse naturelle lorsque la question reste dans le cadre autorise.
4. Le manager n'est sollicite que pour les questions complexes, sensibles ou sans contexte fiable.
5. L'IA ne doit jamais inventer un prix, une disponibilite, un statut ou une information client.

### Emails transactionnels

1. Creation du compte: code de verification, puis email de bienvenue apres confirmation.
2. Commande client: email de confirmation indiquant que la commande est recue.
3. Statut de commande: email lorsque l'equipe marque la commande comme confirmee, preparee, livree, annulee ou rejetee.
4. Facture: email lorsque la commande est transformee en facture.

### Emails de fidelisation

1. Prospect sans achat: email unique apres le delai configure avec trois produits en stock.
2. Client inactif: email apres `INACTIVE_CLIENT_EMAIL_DAYS`, base sur les categories deja achetees.
3. Nouveau produit: email cible aux clients ayant deja achete dans la meme categorie.
4. Les tables `prospect_email_campaigns` et `crm_email_campaigns` empechent les doublons.

