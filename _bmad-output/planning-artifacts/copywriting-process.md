---
process_name: 'Copywriting Validation Process'
version: '1.0'
date: '2026-01-23'
owner: 'UX Designer (Sally)'
status: 'active'
---

# Processus de Validation du Copywriting

## Vue d'ensemble

**Objectif :** Assurer que tous les textes de l'interface utilisateur respectent les guidelines UX définies et maintiennent la cohérence du ton et du style dans toute l'application.

**Responsable :** UX Designer (Sally) - Gardien du contenu textuel

**Principe :** Tous les textes visibles par l'utilisateur doivent être validés par l'UX Designer avant la review de code finale.

---

## Workflow de Validation

### Étape 1 : Développement (Agent Dev)

**Responsabilités du développeur :**
- Implémenter les fonctionnalités selon les stories
- Utiliser les **Content Guidelines** de la spécification UX comme référence
- Inclure les textes dans le code en suivant les exemples fournis
- Marquer la story comme "ready-for-ux-review" une fois l'implémentation terminée

**Textes à inclure :**
- Labels de boutons et actions
- Messages d'erreur et de validation
- Textes de placeholder dans les formulaires
- Messages de succès et de feedback
- Tooltips et micro-copies
- Titres et descriptions d'interface
- Messages de notification

### Étape 2 : Validation UX (UX Designer)

**Quand déclencher :**
- Story marquée "ready-for-ux-review" dans le sprint-status.yaml
- Ou sur demande explicite du développeur/utilisateur

**Processus de validation :**

1. **Charger le contexte :**
   - Lire la story complète
   - Charger la spécification UX (`ux-design-specification.md`)
   - Examiner les fichiers modifiés (section File List de la story)

2. **Identifier tous les textes :**
   - Scanner les composants React créés/modifiés
   - Extraire tous les strings visibles par l'utilisateur
   - Vérifier les messages d'erreur dans les validations Zod
   - Examiner les réponses API (messages d'erreur utilisateur)

3. **Valider contre les guidelines :**
   - ✅ **Ton** : Rassurant, jamais anxiogène, bienveillant
   - ✅ **Style** : Moderne, clair, rassurant (amical mais professionnel)
   - ✅ **Longueur** : Respect des limites (ex: titres max 60 caractères)
   - ✅ **Clarté** : Pas de jargon technique, messages actionnables
   - ✅ **Cohérence** : Utilisation des mêmes termes dans toute l'app

4. **Créer le rapport de validation :**

```markdown
## UX Copywriting Validation Report

**Story :** [story-key]
**Date :** [date]
**Validateur :** UX Designer (Sally)

### Textes validés ✅
- [Liste des textes approuvés]

### Textes à corriger ⚠️
- **Fichier :** [chemin]
- **Ligne :** [numéro]
- **Texte actuel :** "[texte]"
- **Problème :** [explication]
- **Suggestion :** "[texte corrigé]"
- **Raison :** [référence aux guidelines]

### Recommandations 💡
- [Suggestions d'amélioration]
```

5. **Décision :**
   - ✅ **Approuvé** : Tous les textes respectent les guidelines → Story peut passer en code review
   - ⚠️ **Corrections requises** : Créer une liste de corrections → Story reste "ready-for-ux-review" jusqu'à correction
   - 🔄 **Discussion nécessaire** : Si ambiguïté sur les guidelines → Discuter avec l'utilisateur

### Étape 3 : Corrections (Agent Dev)

**Si corrections requises :**
- Le développeur applique les corrections suggérées
- Marque à nouveau la story comme "ready-for-ux-review"
- Le processus reprend à l'étape 2

### Étape 4 : Code Review

**Une fois validé par UX :**
- Story peut passer en code review technique
- Le validateur UX ajoute une note dans la story : "✅ Copywriting validé par UX Designer"

---

## Guidelines de Référence

### Messaging Principal (CRITICAL)

**Message principal :** "Trouve une villa qui correspond à tes vibes"
- **PRIORITÉ #1** : Mettre l'accent sur le matching vibes/critères
- **PRIORITÉ #2** : La vérification est une garantie de confiance, pas la valeur principale
- Voir `_bmad-output/planning-artifacts/messaging-strategy.md` pour détails complets

**Hiérarchie des messages :**
1. Vibes / critères personnels (message principal)
2. Vérification comme garantie (message secondaire)
3. Avantages fonctionnels (message tertiaire)

### Ton et Style (de ux-design-specification.md)

**Ton principal :**
- Rassurant, jamais anxiogène
- Bienveillant, pas de jugement
- Guidance claire sans pression

**Style :**
- Moderne, clair, rassurant
- Amical mais professionnel
- Messages actionnables et pédagogiques

### Exemples de Guidelines Spécifiques

**Badge vérifié :**
- ✅ "✓ Vérifié" ou "✓ Annonce vérifiée"
- ❌ Pas de jargon technique dans le badge principal

**Titres d'annonces :**
- ✅ Max 60 caractères, descriptifs mais concis
- ❌ Pas de titres trop longs ou vagues

**Messages d'erreur :**
- ✅ Clairs + solutions proposées, ton rassurant
- ❌ Messages techniques ou culpabilisants

**Labels vibes :**
- ✅ Max 12 caractères, intuitifs
- ❌ Labels trop longs ou ambigus

**Boutons CTA :**
- ✅ Actions claires : "Réserver", "Voir détails"
- ❌ Actions vagues : "Continuer", "Suivant" (sauf dans un flow)

---

## Checklist de Validation

Pour chaque texte, vérifier :

- [ ] **Ton** : Rassurant, jamais anxiogène ?
- [ ] **Clarté** : Compréhensible sans contexte technique ?
- [ ] **Longueur** : Respecte les limites définies ?
- [ ] **Actionnabilité** : L'utilisateur sait quoi faire après avoir lu ?
- [ ] **Cohérence** : Utilise les mêmes termes que le reste de l'app ?
- [ ] **Accessibilité** : Compréhensible pour tous les niveaux d'utilisateurs ?
- [ ] **Pas de jargon** : Évite les termes techniques inutiles ?

---

## Intégration dans les Stories

**Dans chaque story, ajouter une section :**

```markdown
## UX Copywriting Validation

**Status :** [pending/approved/corrections-required]
**Validated by :** [UX Designer name]
**Date :** [date]

### Textes inclus dans cette story :
- [Liste des textes avec leurs emplacements]

### Notes de validation :
[Commentaires du validateur UX]
```

---

## Commandes pour Déclencher la Validation

**Pour l'utilisateur :**
- "Valider le copywriting de la story [story-key]"
- "Review UX textes pour [story-key]"
- "Vérifier les textes de [story-key]"

**Pour l'agent Dev :**
- Marquer story comme "ready-for-ux-review" dans sprint-status.yaml
- Ajouter commentaire : "Ready for UX copywriting validation"

---

## Exceptions et Cas Particuliers

**Textes qui ne nécessitent PAS de validation UX :**
- Messages de log technique (console.log, etc.)
- Commentaires de code
- Noms de variables/fonctions
- Messages d'erreur techniques pour développeurs uniquement

**Textes qui nécessitent validation IMMÉDIATE :**
- Messages d'erreur visibles par l'utilisateur
- Messages de confirmation critiques (paiement, réservation)
- Textes de première impression (onboarding, landing page)

---

## Métriques de Qualité

**Objectifs :**
- 100% des stories avec textes validés avant code review
- <5% de corrections requises après première validation
- 0 message anxiogène ou culpabilisant en production

---

## Références

- **Stratégie de Messaging :** `_bmad-output/planning-artifacts/messaging-strategy.md` ⚠️ CRITICAL - Message principal centré sur vibes
- **Spécification UX complète :** `_bmad-output/planning-artifacts/ux-design-specification.md`
- **Content Guidelines :** Sections "Content Guidelines" dans ux-design-specification.md
- **Project Context :** `_bmad-output/project-context.md`

---

**Dernière mise à jour :** 2026-01-23
**Prochaine révision :** Après 10 stories validées
