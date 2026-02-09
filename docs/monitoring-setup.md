# Configuration Monitoring Disponibilité

## Option 1 : UptimeRobot (Recommandé pour MVP)

### Étapes
1. Créer compte sur https://uptimerobot.com (gratuit jusqu'à 50 monitors)
2. Ajouter monitor HTTP(s) :
   - URL: `https://votre-domaine.com`
   - Type: HTTP(s)
   - Interval: 5 minutes
   - Alertes: Email/SMS si disponibilité < 99%
3. Configurer alertes :
   - Email: votre-email@example.com
   - SMS: +33XXXXXXXXX (optionnel)
   - Seuil: Alert si < 99% disponibilité

### Dashboard Public (Optionnel)
- Activer dashboard public pour transparence
- URL: `https://stats.uptimerobot.com/XXXXX`

---

## Option 2 : Pingdom

### Étapes
1. Créer compte sur https://www.pingdom.com
2. Ajouter uptime check :
   - URL: `https://votre-domaine.com`
   - Interval: 1 minute
   - Alertes: Email/Slack si disponibilité < 99%
3. Configurer alertes Slack (optionnel)

---

## Option 3 : Health Check Local

### Script PowerShell (Windows)
```powershell
.\scripts\health-check.ps1 http://localhost:3000
```

### Script Bash (Linux/Mac)
```bash
bash scripts/health-check.sh http://localhost:3000
```

---

## Variables d'Environnement Requises

```bash
# Production
MONITORING_URL=https://votre-domaine.com
UPTIME_THRESHOLD=99
```

---

## Intégration CI/CD

Ajouter dans `.github/workflows/health-check.yml` :

```yaml
name: Health Check
on:
  schedule:
    - cron: '*/5 * * * *' # Toutes les 5 minutes

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Health Check
        run: bash scripts/health-check.sh ${{ secrets.MONITORING_URL }}
```

---

## Seuils PRD

- **Disponibilité:** ≥ 99% (heures ouvrées locales)
- **Alertes:** Si disponibilité < 99%
- **Response Time:** < 2 secondes

---

## Prochaines Étapes

1. Configurer UptimeRobot avec votre domaine production
2. Tester health check local
3. Configurer alertes email/SMS
4. Valider monitoring actif
