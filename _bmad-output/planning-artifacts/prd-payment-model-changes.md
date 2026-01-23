# Changements du Modèle de Paiement - PRD Update

**Date:** 2026-01-19  
**Auteur:** Falsone  
**Type de modification:** Changement de modèle économique et processus de paiement

---

## Résumé Exécutif des Changements

**Ancien modèle :**
- Frais fixes 25€ (non remboursables) pour débloquer mise en relation
- Préautorisation 20-25% du loyer (min 30€) posée à la réservation
- Capture automatique de la préautorisation après confirmation

**Nouveau modèle :**
- **Paiement unique de 25€** pour réserver une place dans une villa
- **Préautorisation uniquement** : aucun débit tant que la colocation n'est pas validée
- **Capture conditionnelle** : les 25€ sont capturés uniquement après validation explicite de la colocation par le propriétaire

---

## Détails du Nouveau Modèle

### 1. Processus de Réservation et Paiement

**Étape 1 : Réservation par le locataire**
- Le locataire réserve une place dans une villa
- **Préautorisation de 25€** est effectuée sur son compte
- Aucun montant n'est débité à ce stade
- Le locataire a une réservation "en attente de validation"

**Étape 2 : Constitution de la colocation**
- D'autres locataires peuvent réserver des places (préautorisations multiples)
- Le propriétaire peut voir l'état de remplissage (ex. 2/4 places réservées)

**Étape 3 : Validation par le propriétaire**
- Le propriétaire valide la colocation manuellement OU
- Validation automatique si toutes les conditions sont remplies (villa complète + règles propriétaire)
- **Conditions de validation :**
  - Villa complète (toutes places réservées) OU
  - Nombre minimum de locataires défini par le propriétaire OU
  - Validation manuelle du propriétaire à tout moment

**Étape 4 : Capture du paiement**
- **Seulement après validation explicite** : les 25€ sont capturés pour chaque locataire ayant une préautorisation active
- La réservation devient ferme
- Le locataire accède au chat privé de la colocation

**Étape 5 : Si non validée**
- Les préautorisations expirent automatiquement
- Aucun paiement n'est capturé
- Les réservations sont annulées sans action du locataire
- Aucun frais pour le locataire

### 2. Règles de Validation par le Propriétaire

**Options de validation :**
- **Validation uniquement si villa complète** : le propriétaire exige que toutes les places soient réservées
- **Validation partielle possible** : le propriétaire peut valider même si la villa n'est pas complète (ex. 3/4 places)
- **Validation manuelle à tout moment** : le propriétaire peut valider la colocation manuellement, indépendamment des conditions initiales

**Flexibilité :**
- Le propriétaire peut modifier ses règles de validation à tout moment
- Le propriétaire conserve toujours la possibilité de valider manuellement

### 3. Gestion des Préautorisations

**Durée de validité :**
- Alignée sur la période de constitution de la colocation
- Jusqu'à X jours avant le check-in OU validation manuelle
- Expiration automatique si la colocation n'est pas validée

**Expiration :**
- Si la colocation n'est pas validée : préautorisation expire, aucun débit, réservation annulée
- Le locataire n'a aucune démarche à faire

**Multiples préautorisations :**
- Un locataire peut avoir plusieurs préautorisations actives pour différentes villas
- Chaque préautorisation est indépendante

### 4. Modèle Économique

**Revenus Villa First :**
- **Uniquement frais de mise en relation** : 25€ par locataire (capturé après validation)
- **Aucune commission sur le loyer** : Villa First ne prélève rien sur les loyers
- **Aucun frais côté propriétaire** : le propriétaire ne paie rien
- **Aucune facturation cachée** : modèle 100% transparent

**Ce que couvrent les 25€ :**
- Accès à une colocation sécurisée et vérifiée
- Mise en relation avec les autres colocataires
- Accès au chat privé de la villa
- Validation et coordination avec le propriétaire
- Badge "Annonce vérifiée" et système de confiance

**Positionnement :**
- Villa First = **facilitateur de colocation**, pas un intermédiaire financier sur les loyers
- Tarification simple et transparente
- Adoption facilitée côté propriétaires (pas de frais)

### 5. Gestion des Edge Cases

**Annulation avant validation :**
- Le locataire annule sa réservation → préautorisation annulée, aucun débit

**Validation avec villa partiellement remplie :**
- Propriétaire valide avec 3/4 places → préautorisations des 3 locataires sont capturées
- La colocation devient ferme selon la décision du propriétaire
- Les 2 places restantes peuvent rester ouvertes ou être fermées selon les règles

**No-show :**
- Risque limité car la capture intervient uniquement après validation explicite
- La responsabilité opérationnelle reste alignée avec les règles définies par le propriétaire

**Carte expirée entre préaut et capture :**
- Si la carte expire avant la capture : notification au locataire, nouvelle préautorisation requise
- Si la capture échoue : notification, possibilité de mettre à jour le moyen de paiement

**Villa ne se remplit pas :**
- Préautorisations expirent automatiquement
- Aucun revenu pour Villa First (pas de capture)
- Les locataires ne sont pas débités

---

## Sections du PRD à Modifier

### 1. Executive Summary

**Modèle économique :**
- **AVANT :** "Frais de mise en relation fixes (25 €) + préautorisation (20-25% du loyer, min 30 €)"
- **APRÈS :** "Frais de mise en relation unique de 25 € par locataire, capturé uniquement après validation de la colocation par le propriétaire"

### 2. Functional Requirements - Section Booking & Payment

**FR32 - Paiement frais de mise en relation :**
- **AVANT :** "Les locataires peuvent payer les frais de mise en relation (25 €)"
- **APRÈS :** "Les locataires peuvent effectuer une préautorisation de 25 € pour réserver une place dans une colocation"

**FR33 - Préautorisation :**
- **AVANT :** "Le système peut préautoriser un montant (20-25% du loyer, min 30 €)"
- **APRÈS :** "Le système peut préautoriser 25 € lors de la réservation d'une place, sans débit tant que la colocation n'est pas validée"

**FR34 - Capture automatique :**
- **AVANT :** "Le système peut capturer automatiquement la préautorisation après confirmation"
- **APRÈS :** "Le système peut capturer les 25 € uniquement après validation explicite de la colocation par le propriétaire"

**Nouveaux FRs à ajouter :**
- **FR59 :** "Le propriétaire peut définir ses règles de validation (villa complète uniquement, validation partielle possible, validation manuelle)"
- **FR60 :** "Le propriétaire peut valider manuellement une colocation à tout moment, indépendamment des conditions initiales"
- **FR61 :** "Le système peut expirer automatiquement les préautorisations si la colocation n'est pas validée"
- **FR62 :** "Le système peut capturer les préautorisations de tous les locataires ayant une réservation active lors de la validation de la colocation"
- **FR63 :** "Le système peut gérer l'expiration automatique des préautorisations sans débit si la colocation n'est pas validée"

### 3. User Journeys

**Locataire - Happy Path :**
- **Modifier :** Le parcours doit refléter la préautorisation (pas de débit immédiat) et l'attente de validation
- **Ajouter :** Étape de notification quand la colocation est validée et que le paiement est capturé

**Hôte/Mandataire - Publication et gestion :**
- **Ajouter :** Parcours de validation de la colocation (règles de validation, validation manuelle)
- **Ajouter :** Vue de l'état de remplissage de la villa (ex. 2/4 places réservées)

### 4. Project Scoping & Phased Development

**MVP Feature Set - Conversion & Paiement :**
- **Modifier :** Remplacer "Préautorisation 20-25% (min 30 €)" par "Préautorisation 25€ avec capture conditionnelle après validation"
- **Ajouter :** "Système de validation de colocation par le propriétaire (règles configurables)"

### 5. Domain-Specific Requirements

**Technical Constraints - Paiements :**
- **Modifier :** Mettre à jour les contraintes techniques pour refléter le nouveau modèle (préautorisation unique, capture conditionnelle)

### 6. Non-Functional Requirements

**Performance - Response Times :**
- **Vérifier :** Les temps de réponse pour la préautorisation et la capture conditionnelle sont appropriés

**Security - Payment Integration :**
- **Vérifier :** La gestion des préautorisations multiples et leur expiration est sécurisée

---

## Impact sur les Autres Sections

### Success Criteria

**Business Success :**
- **Vérifier :** Les critères de conversion doivent être ajustés (conversion préaut → capture dépend maintenant de la validation propriétaire)

### Risk Mitigation Strategy

**Risques techniques :**
- **Ajouter :** Gestion de l'expiration des préautorisations
- **Ajouter :** Gestion des échecs de capture après validation (carte expirée, etc.)

**Risques marché :**
- **Ajouter :** Risque que les villas ne se remplissent pas (pas de revenus si pas de validation)
- **Ajouter :** Risque que les propriétaires ne valident pas rapidement (frustration locataires)

---

## Questions à Clarifier (Optionnel)

1. **Durée de validité des préautorisations :** Combien de jours avant le check-in les préautorisations expirent-elles si non validées ?

2. **Notification des locataires :** Comment notifier les locataires quand la colocation est validée et que leur paiement est capturé ?

3. **Gestion des places restantes :** Si un propriétaire valide avec 3/4 places, les 2 places restantes restent-elles ouvertes avec préautorisations ou la colocation est-elle fermée ?

4. **Incitations propriétaires :** Y a-t-il des incitations pour que les propriétaires valident rapidement (bonus visibilité, priorité support) ?

5. **Date limite de validation :** Y a-t-il une date limite au-delà de laquelle la colocation ne peut plus être validée (ex. 7 jours avant check-in) ?

---

## Notes pour l'Édition

- **Priorité :** Changements critiques - impactent le modèle économique et les FRs de paiement
- **Complexité :** Moyenne - nécessite des modifications dans plusieurs sections
- **Dépendances :** Les changements impactent les User Journeys, les FRs, et le modèle économique
- **Validation requise :** Après édition, relancer la validation PRD pour vérifier la cohérence

---

**Document créé le :** 2026-01-19  
**Prêt pour :** Workflow Edit PRD
