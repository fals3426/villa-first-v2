# Recommandations – Page détail d’annonce

## Contexte
La page `/listings/[id]` affiche déjà titre, prix, description, règles, hôte et CTA, mais tout est placé **sous** la galerie. Sur un grand écran ou sans scroll, l’utilisateur ne voit que le lien « Retour » et les images, ce qui donne une impression de page vide.

---

## 1. **Priorité haute – Visible sans scroll**

### 1.1 Bloc titre / prix / lieu au-dessus de la galerie ou en overlay
- **Problème** : Titre, prix et lieu sont après la grande image et la grille de photos.
- **Recommandation** : Afficher un bloc compact **au-dessus** de l’image principale (ou en overlay en bas de l’image) avec :
  - Titre de l’annonce
  - Prix (€/mois)
  - Lieu (ville/zone)
  - Badge vérifié + vibes
- **Effet** : L’utilisateur sait immédiatement de quelle annonce il s’agit sans scroller.

### 1.2 CTA principal toujours visible (sticky)
- **Problème** : Les boutons « Voir les disponibilités » et « Autres annonces » sont tout en bas de la page.
- **Recommandation** :
  - **Desktop** : Colonne latérale droite fixe (sticky) avec prix + « Réserver » / « Demander à réserver ».
  - **Mobile** : Barre fixe en bas avec un seul bouton principal (ex. « Réserver » ou « Demander à réserver »).
- **Effet** : Action de réservation toujours accessible.

---

## 2. **Priorité moyenne – Contenu et confiance**

### 2.1 Description au-dessus du pli (résumé)
- Afficher les 2–3 premières lignes de la description juste sous le bloc titre/prix/lieu, avec un « Lire la suite » qui scroll vers la section Description.
- Évite l’impression de page uniquement visuelle.

### 2.2 Hôte plus visible
- Photo de profil de l’hôte (si `profilePictureUrl`), nom, et court texte du type « Hébergé par [Prénom] ».
- Lien ou bouton « Contacter l’hôte » (vers chat ou formulaire) à côté du bloc CTA.

### 2.3 Équipements / commodités
- Si le modèle de données le permet (champ dédié ou règles structurées), afficher des icônes (Wi‑Fi, lave-linge, piscine, etc.).
- Sinon, prévoir un champ `amenities` ou extraire des mots-clés depuis `rules` / `charter` pour afficher des pastilles.

### 2.4 Règles : affichage lisible
- Remplacer l’affichage brut `JSON.stringify(listing.rules)` par une liste ou des lignes « Règle : valeur » pour une lecture plus naturelle.

---

## 3. **Priorité basse – Engagement et conversion**

### 3.1 Galerie cliquable (lightbox)
- Au clic sur une photo (principale ou vignettes), ouvrir une lightbox avec navigation entre les images.
- Améliore l’expérience sur mobile et desktop.

### 3.2 Carte (géolocalisation)
- Le modèle `Listing` a `latitude` et `longitude`. Afficher une petite carte (ex. intégration Leaflet ou Google Maps) avec un marqueur pour la zone, sans adresse exacte si besoin de confidentialité.

### 3.3 Calendrier des disponibilités
- Afficher un calendrier (mois en cours + suivant) avec les créneaux disponibles (données `availability`), même en lecture seule.
- Lien « Choisir des dates » qui mène vers la réservation ou une page dédiée.

### 3.4 Avis / notation
- Si un modèle Avis existe plus tard : bloc « Avis » avec note et derniers commentaires pour renforcer la confiance.

### 3.5 Vidéo
- Le champ `videoUrl` existe : si renseigné, afficher un lecteur (embed YouTube/Vimeo ou player HTML5) dans une section « Vidéo de la coloc ».

---

## 4. **Résumé des actions proposées**

| Priorité | Action |
|----------|--------|
| Haute    | Bloc titre / prix / lieu / vibes au-dessus ou en overlay sur l’image principale |
| Haute    | CTA principal sticky (barre bas mobile, colonne droite desktop) |
| Moyenne  | Extrait de description + « Lire la suite » visible sans scroll |
| Moyenne  | Bloc hôte avec photo + « Contacter l’hôte » |
| Moyenne  | Règles affichées en liste lisible (pas du JSON brut) |
| Basse    | Lightbox sur la galerie photos |
| Basse    | Carte si latitude/longitude présents |
| Basse    | Calendrier des dispos (lecture seule) |
| Basse    | Section vidéo si `videoUrl` présent |
| Utilisateur | Galerie photos swipeable (carousel) |
| Utilisateur | Améliorer design et écriture de la section « Règles et charte » |

Ces changements rendront la page plus informative dès le premier écran et faciliteront la réservation (CTA toujours visible).

---

## 5. **Recommandations utilisateur**

### 5.1 Swiper les photos du logement
- **Objectif** : Permettre de faire défiler les photos du logement par swipe (mobile) ou glissement (desktop).
- **Recommandation** : Mettre en place un carousel/galerie avec :
  - Défilement horizontal natif (scroll-snap) ou composant dédié (ex. indicateurs de slide, flèches prev/next).
  - Support du swipe tactile sur mobile et du drag à la souris sur desktop.
- **Effet** : Expérience plus fluide et intuitive pour découvrir toutes les photos sans quitter la page.

### 5.2 Améliorer la partie « Règles et charte de la coloc »
- **Objectif** : Améliorer le design et l’écriture de cette section.
- **Recommandation** :
  - **Design** : Hiérarchie visuelle plus claire (titres, séparateurs, icônes), fond ou bordure légère pour délimiter la section, espacement et typo cohérents.
  - **Écriture** : Titre et textes d’intro plus engageants (ex. « Comment on vit ici », « Ce qui fait la vie de la coloc »), formulation des règles en phrases courtes et lisibles plutôt qu’en listes techniques.
- **Effet** : Section plus lisible, rassurante et alignée avec le ton de la plateforme.
