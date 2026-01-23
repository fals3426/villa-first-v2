---
guide_name: 'Guide Rapide - Validation Copywriting UX'
version: '1.0'
date: '2026-01-23'
for: 'UX Designer (Sally)'
---

# Guide Rapide : Validation Copywriting UX

## 🎯 Objectif

Valider que tous les textes de l'interface respectent les guidelines UX avant la review de code.

---

## ⚡ Processus Rapide

### 1. Recevoir la demande

**Scénarios possibles :**
- Story marquée "ready-for-ux-review" dans sprint-status.yaml
- Utilisateur demande explicitement : "Valider le copywriting de [story-key]"
- Agent Dev indique : "Ready for UX copywriting validation"

### 2. Charger le contexte

```bash
# Fichiers à lire :
1. Story complète : _bmad-output/implementation-artifacts/[story-key].md
2. Spécification UX : _bmad-output/planning-artifacts/ux-design-specification.md
3. Processus complet : _bmad-output/planning-artifacts/copywriting-process.md
```

### 3. Identifier les textes

**Où chercher les textes :**
- Composants React créés/modifiés (section File List de la story)
- Messages d'erreur dans les validations Zod
- Réponses API (messages d'erreur utilisateur)
- Labels de boutons et actions
- Placeholders de formulaires
- Messages de feedback (succès/erreur)

### 4. Valider contre les guidelines

**Checklist rapide :**
- ✅ Ton rassurant, jamais anxiogène ?
- ✅ Style moderne, clair, professionnel ?
- ✅ Longueur respectée (ex: titres max 60 caractères) ?
- ✅ Pas de jargon technique ?
- ✅ Message actionnable ?
- ✅ Cohérent avec le reste de l'app ?

### 5. Créer le rapport

**Format du rapport :**

```markdown
## UX Copywriting Validation Report

**Story :** [story-key]
**Date :** [date]
**Validateur :** UX Designer (Sally)

### ✅ Textes validés
- [Liste des textes approuvés avec emplacement]

### ⚠️ Textes à corriger
- **Fichier :** [chemin]
- **Ligne :** [numéro]
- **Texte actuel :** "[texte]"
- **Problème :** [explication]
- **Suggestion :** "[texte corrigé]"
- **Raison :** [référence aux guidelines]

### 💡 Recommandations
- [Suggestions d'amélioration optionnelles]
```

### 6. Décision finale

**Options :**
- ✅ **Approuvé** → Story peut passer en code review
- ⚠️ **Corrections requises** → Créer liste de corrections, story reste "ready-for-ux-review"
- 🔄 **Discussion nécessaire** → Si ambiguïté, discuter avec l'utilisateur

---

## 📋 Checklist de Validation

Pour chaque texte, cocher :

- [ ] **Ton** : Rassurant, jamais anxiogène ?
- [ ] **Clarté** : Compréhensible sans contexte technique ?
- [ ] **Longueur** : Respecte les limites définies ?
- [ ] **Actionnabilité** : L'utilisateur sait quoi faire ?
- [ ] **Cohérence** : Utilise les mêmes termes que le reste de l'app ?
- [ ] **Accessibilité** : Compréhensible pour tous les niveaux ?
- [ ] **Pas de jargon** : Évite les termes techniques inutiles ?

---

## 🎨 Guidelines de Référence Rapide

### ⚠️ MESSAGING PRINCIPAL (CRITICAL)
**Message principal :** "Trouve une villa qui correspond à tes vibes"
- **PRIORITÉ #1** : Vibes / critères personnels
- **PRIORITÉ #2** : Vérification comme garantie (pas la valeur principale)
- Voir `messaging-strategy.md` pour détails complets

### Ton Principal
- Rassurant, jamais anxiogène
- Bienveillant, pas de jugement
- Guidance claire sans pression

### Style
- Moderne, clair, rassurant
- Amical mais professionnel
- Messages actionnables et pédagogiques

### Exemples Concrets

**✅ Bon :**
- "✓ Annonce vérifiée"
- "Réserver cette annonce"
- "Une erreur est survenue. Veuillez réessayer."

**❌ À éviter :**
- "Erreur système 500"
- "Échec de la transaction"
- "Attention : risque de perte de données"

---

## 🔍 Comment Scanner les Fichiers

**Pour les composants React :**
```typescript
// Chercher :
- Strings entre guillemets dans JSX
- Messages dans les props (label, placeholder, errorMessage)
- Textes dans les composants de notification/toast
```

**Pour les validations Zod :**
```typescript
// Chercher :
- Messages d'erreur dans .min(), .max(), .email(), etc.
- Messages dans .refine() ou .superRefine()
```

**Pour les réponses API :**
```typescript
// Chercher :
- error.message dans les réponses d'erreur
- Messages dans les catch blocks qui sont retournés à l'utilisateur
```

---

## 📝 Template de Rapport

Copier-coller ce template :

```markdown
## UX Copywriting Validation Report

**Story :** [story-key]
**Date :** [date]
**Validateur :** UX Designer (Sally)

### ✅ Textes validés
1. [Texte] - [Fichier:Ligne]
2. [Texte] - [Fichier:Ligne]

### ⚠️ Textes à corriger

#### Correction 1
- **Fichier :** [chemin relatif]
- **Ligne :** [numéro]
- **Texte actuel :** "[texte]"
- **Problème :** [explication]
- **Suggestion :** "[texte corrigé]"
- **Raison :** [référence aux guidelines]

#### Correction 2
[...]

### 💡 Recommandations
- [Suggestions optionnelles]

### ✅ Décision
[ ] Approuvé - Story peut passer en code review
[ ] Corrections requises - Story reste "ready-for-ux-review"
[ ] Discussion nécessaire - [explication]
```

---

## 🚀 Commandes Utiles

**Pour l'utilisateur :**
- "Valider le copywriting de la story [story-key]"
- "Review UX textes pour [story-key]"
- "Vérifier les textes de [story-key]"

**Réponse type :**
"Je vais valider le copywriting de la story [story-key]. Laissez-moi examiner les textes contre nos guidelines UX..."

---

## 📚 Références Complètes

- **Stratégie de Messaging :** `_bmad-output/planning-artifacts/messaging-strategy.md` ⚠️ CRITICAL
- **Processus complet :** `_bmad-output/planning-artifacts/copywriting-process.md`
- **Spécification UX :** `_bmad-output/planning-artifacts/ux-design-specification.md`
- **Content Guidelines :** Sections "Content Guidelines" dans ux-design-specification.md

---

**Dernière mise à jour :** 2026-01-23
