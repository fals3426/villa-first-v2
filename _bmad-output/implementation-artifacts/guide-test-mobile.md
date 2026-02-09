# Guide de Test sur Mobile - Villa First V2

**Date :** 2026-01-28  
**Objectif :** Tester l'application sur appareils mobiles réels

---

## 🎯 Méthodes de Test Mobile

### Méthode 1 : DevTools Navigateur (Rapide) ⚡

**Avantages :** Rapide, pas besoin d'appareil physique  
**Inconvénients :** Simulation, pas exactement comme un vrai mobile

#### Étapes :

1. **Démarrer le serveur de développement**
   ```powershell
   npm run dev
   ```

2. **Ouvrir Chrome ou Edge**
   - Aller sur : `http://localhost:3000`
   - Appuyer sur `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Cliquer sur l'icône de téléphone 📱 (Toggle device toolbar) ou `Ctrl+Shift+M`
   - Choisir un appareil dans la liste (iPhone 12 Pro, Galaxy S20, etc.)

3. **Tester la navigation mobile**
   - Vérifier que le menu hamburger apparaît
   - Cliquer sur le menu hamburger
   - Vérifier que le menu slide-in fonctionne
   - Tester la navigation bottom bar
   - Vérifier les touch targets (≥44px)

**Résultat attendu :** Menu hamburger visible, navigation fonctionnelle

---

### Méthode 2 : Vrai Appareil Mobile (Recommandé) 📱

**Avantages :** Test réel, comportement authentique  
**Inconvénients :** Nécessite que le téléphone soit sur le même réseau WiFi

#### Prérequis :

- ✅ Téléphone et ordinateur sur le **même réseau WiFi**
- ✅ Serveur Next.js démarré
- ✅ Firewall Windows autorise les connexions sur le port 3000

#### Étapes :

1. **Vérifier l'adresse IP locale**
   ```powershell
   ipconfig | findstr /i "IPv4"
   ```
   
   **Votre IP locale :** `192.168.1.127` ✅

2. **Démarrer le serveur Next.js**
   ```powershell
   npm run dev
   ```
   
   **Important :** Next.js écoute déjà sur toutes les interfaces (`0.0.0.0`) par défaut, donc accessible depuis le réseau local.

3. **Vérifier le firewall Windows**
   
   Si ça ne fonctionne pas, autoriser le port 3000 dans le firewall :
   ```powershell
   # Ouvrir PowerShell en administrateur
   New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

4. **Accéder depuis le téléphone**
   - Ouvrir le navigateur sur votre téléphone (Chrome, Safari, etc.)
   - Aller sur : `http://192.168.1.127:3000`
   - ✅ L'application devrait s'afficher !

5. **Tester la navigation mobile**
   - Vérifier que le menu hamburger apparaît en haut à droite
   - Cliquer sur le menu hamburger
   - Vérifier que le menu slide-in depuis la droite fonctionne
   - Tester la navigation bottom bar en bas
   - Vérifier les touch targets (doivent être ≥44px)
   - Tester sur différentes orientations (portrait/paysage)

**Résultat attendu :** Application accessible et navigation mobile fonctionnelle

---

### Méthode 3 : Outils MCP Browser (Si Disponible) 🌐

Si vous avez les outils MCP browser activés, je peux tester directement depuis le navigateur automatisé.

---

## 📋 Checklist de Test Mobile

### Navigation Mobile

- [ ] **Menu Hamburger**
  - [ ] Visible sur mobile (< 768px)
  - [ ] Caché sur desktop (≥ 768px)
  - [ ] Animation slide-in fonctionne
  - [ ] Overlay avec backdrop blur fonctionne
  - [ ] Fermeture au clic sur overlay fonctionne
  - [ ] Fermeture au clic sur lien fonctionne
  - [ ] Bouton fermer (X) fonctionne

- [ ] **Navigation Bottom Bar**
  - [ ] Visible sur mobile (< 768px)
  - [ ] Cachée sur desktop (≥ 768px)
  - [ ] Items de navigation corrects selon userType
  - [ ] État actif fonctionne (highlight)
  - [ ] Touch targets ≥ 44px
  - [ ] Safe area pour iPhone (notch) respectée

### Responsive Design

- [ ] **Mobile (< 640px)**
  - [ ] Layout adapté
  - [ ] Textes lisibles
  - [ ] Boutons accessibles
  - [ ] Images responsives

- [ ] **Tablette (640px - 1024px)**
  - [ ] Layout adapté
  - [ ] Navigation fonctionnelle

- [ ] **Desktop (≥ 1024px)**
  - [ ] Navigation desktop visible
  - [ ] Menu hamburger caché

### Fonctionnalités

- [ ] **Page d'accueil**
  - [ ] Hero section responsive
  - [ ] Stats affichées correctement
  - [ ] Cards villas responsive

- [ ] **Page Liste Villas**
  - [ ] Filtres accessibles
  - [ ] Cards villas responsive
  - [ ] Pagination fonctionnelle

- [ ] **Dashboard**
  - [ ] Cards responsive
  - [ ] Navigation fonctionnelle

### Accessibilité Mobile

- [ ] **Touch Targets**
  - [ ] Tous les boutons ≥ 44px
  - [ ] Espacement suffisant entre éléments

- [ ] **Navigation Clavier**
  - [ ] Menu hamburger accessible au clavier
  - [ ] Focus visible

- [ ] **Contraste**
  - [ ] Texte blanc sur fond noir lisible
  - [ ] Contrastes WCAG AA respectés

---

## 🔧 Dépannage

### Problème : Impossible d'accéder depuis le téléphone

**Solutions :**

1. **Vérifier que le téléphone est sur le même WiFi**
   - Vérifier le réseau WiFi sur le téléphone
   - Vérifier le réseau WiFi sur l'ordinateur
   - Ils doivent être identiques

2. **Vérifier le firewall Windows**
   ```powershell
   # Vérifier les règles de firewall
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Next.js*"}
   
   # Si aucune règle, créer une :
   New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

3. **Vérifier que Next.js écoute sur toutes les interfaces**
   - Par défaut, Next.js écoute sur `0.0.0.0:3000`
   - Vérifier dans les logs : `- Network: http://192.168.1.127:3000`

4. **Essayer avec l'adresse IP alternative**
   - Si `192.168.1.127` ne fonctionne pas, essayer `100.120.47.204`
   - URL : `http://100.120.47.204:3000`

### Problème : Menu hamburger ne s'affiche pas

**Solutions :**

1. **Vérifier la taille de l'écran**
   - Le menu hamburger est caché sur desktop (`md:hidden`)
   - Utiliser DevTools avec mode mobile activé

2. **Vérifier que le composant est importé**
   - Vérifier `src/components/navigation/MainNavigation.tsx`
   - Vérifier que `<MobileNavigation />` est présent

3. **Vérifier les logs de la console**
   - Ouvrir DevTools (F12)
   - Vérifier s'il y a des erreurs JavaScript

### Problème : Navigation bottom bar ne s'affiche pas

**Solutions :**

1. **Vérifier que le layout protégé inclut le composant**
   - Vérifier `src/app/(protected)/layout.tsx`
   - Vérifier que `<MobileBottomNavigation />` est présent

2. **Vérifier la condition d'affichage**
   - Le composant ne s'affiche que si l'utilisateur est connecté
   - Vérifier que vous êtes bien connecté

---

## 📱 Appareils Recommandés pour Test

### iOS
- iPhone 12 Pro / 13 Pro (375px)
- iPhone 14 Pro Max (430px)
- iPad (768px)

### Android
- Galaxy S20 (360px)
- Pixel 5 (393px)
- Galaxy Tab (800px)

### Navigateurs à Tester
- Chrome Mobile (Android)
- Safari Mobile (iOS)
- Firefox Mobile (optionnel)

---

## 🎯 Points Clés à Tester

### 1. Menu Hamburger
- ✅ Apparaît sur mobile
- ✅ Animation slide-in fluide
- ✅ Overlay fonctionne
- ✅ Fermeture fonctionne

### 2. Navigation Bottom Bar
- ✅ Visible sur mobile
- ✅ Items corrects selon userType
- ✅ État actif fonctionne
- ✅ Touch targets suffisants

### 3. Responsive Design
- ✅ Layout adapté à toutes les tailles
- ✅ Textes lisibles
- ✅ Images responsives
- ✅ Espacements cohérents

### 4. Performance
- ✅ Chargement rapide
- ✅ Animations fluides
- ✅ Pas de lag

---

## ✅ Résultat Attendu

Après les tests, vous devriez avoir :

- ✅ Application accessible depuis mobile
- ✅ Menu hamburger fonctionnel
- ✅ Navigation bottom bar fonctionnelle
- ✅ Design responsive sur toutes les tailles
- ✅ Expérience utilisateur fluide

---

## 📝 Notes

- **IP Locale :** `192.168.1.127`
- **Port :** `3000`
- **URL Mobile :** `http://192.168.1.127:3000`
- **URL Desktop :** `http://localhost:3000`

---

**Document créé le :** 2026-01-28  
**Dernière mise à jour :** 2026-01-28  
**Version :** 1.0
