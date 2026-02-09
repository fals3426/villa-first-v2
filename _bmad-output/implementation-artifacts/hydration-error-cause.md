# Origine de l'erreur d'hydratation (body / className)

**Date :** 28 janvier 2026  
**Fichier concerné :** `src/app/layout.tsx` (ligne 33, balise `<body>`)

---

## Symptôme

Erreur Next.js : *"A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"*

- **Emplacement :** `<body>` dans `RootLayout`
- **Attributs en cause :** `className` et/ou attributs ajoutés côté client

---

## Causes identifiées

### 1. Extension navigateur (cause principale)

L’attribut **`cz-shortcut-listen="true"`** visible dans le `<body>` est **injecté par une extension** (souvent **ColorZilla** ou une extension de raccourcis/clavier).

- **Côté serveur :** le HTML ne contient pas cet attribut.
- **Côté client :** l’extension modifie le DOM **avant** que React n’hydrate la page.
- **Résultat :** le HTML du client ne correspond plus à celui du serveur → erreur d’hydratation.

Ce n’est **pas un bug de votre code**, mais une modification du DOM par un tiers (l’extension).

### 2. next/font (Geist) et className

Les classes **`_variable_188709`** et **`_variable_580fd3`** viennent de **next/font** (Geist). En théorie, elles sont stables entre serveur et client. Si une extension ou un script modifie aussi les attributs ou le contenu du `body`, la différence peut être signalée sur la balise entière, y compris le `className`.

---

## Solution appliquée

Dans **`src/app/layout.tsx`** :

- **`suppressHydrationWarning`** a été ajouté sur `<html>` et `<body>`.

C’est la solution recommandée par React/Next.js quand la différence serveur/client est **hors de notre contrôle** (extensions, scripts tiers, etc.). React ne lève plus d’erreur d’hydratation pour ces nœuds, tout en continuant à hydrater le reste de l’arbre.

---

## Que faire côté utilisateur / test

1. **Pour confirmer la cause :** tester en **navigation privée** ou avec **toutes les extensions désactivées**. Si l’erreur disparaît, c’est bien une extension.
2. **En développement :** garder `suppressHydrationWarning` pour ne pas être bloqué par des extensions.
3. **En production :** le même correctif évite l’erreur pour les visiteurs qui ont des extensions modifiant le DOM.

---

## Références

- [Next.js - React Hydration Error](https://nextjs.org/docs/messages/react-hydration-error)
- [React - suppressHydrationWarning](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors)
