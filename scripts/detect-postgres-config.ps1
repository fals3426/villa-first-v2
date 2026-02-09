# Script PowerShell pour detecter automatiquement la configuration PostgreSQL
# et mettre a jour .env.local

Write-Host "Diagnostic de la configuration PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Verifier si psql est disponible
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "psql trouve" -ForegroundColor Green
} catch {
    Write-Host "psql n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "   Veuillez installer PostgreSQL ou ajouter psql au PATH" -ForegroundColor Yellow
    exit 1
}

# Configurations communes a tester
$configs = @(
    @{ user = "postgres"; password = ""; host = "localhost"; port = "5432"; database = "villa_first_v2" },
    @{ user = "postgres"; password = "postgres"; host = "localhost"; port = "5432"; database = "villa_first_v2" },
    @{ user = "postgres"; password = "admin"; host = "localhost"; port = "5432"; database = "villa_first_v2" },
    @{ user = "postgres"; password = "root"; host = "localhost"; port = "5432"; database = "villa_first_v2" },
    @{ user = "postgres"; password = "password"; host = "localhost"; port = "5432"; database = "villa_first_v2" }
)

$envLocalPath = Join-Path $PSScriptRoot "..\.env.local"
$found = $false

foreach ($cfg in $configs) {
    $passwordDisplay = if ($cfg.password) { $cfg.password } else { "(aucun mot de passe)" }
    Write-Host "Test: $($cfg.user) / $passwordDisplay..." -NoNewline
    
    # Construire l'URL de connexion
    if ($cfg.password) {
        $connectionString = "postgresql://$($cfg.user):$($cfg.password)@$($cfg.host):$($cfg.port)/$($cfg.database)"
    } else {
        $connectionString = "postgresql://$($cfg.user)@$($cfg.host):$($cfg.port)/$($cfg.database)"
    }
    
    # Tester la connexion
    $testCmd = "psql `"$connectionString`" -c `"SELECT 1;`" 2>&1"
    try {
        $result = Invoke-Expression $testCmd 2>&1
        if ($LASTEXITCODE -eq 0 -or $result -match "1 row") {
            Write-Host " Connexion reussie !" -ForegroundColor Green
            
            # Mettre a jour .env.local
            $databaseUrl = "$connectionString?schema=public"
            
            if (Test-Path $envLocalPath) {
                $content = Get-Content $envLocalPath -Raw
                $content = $content -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""
                Set-Content -Path $envLocalPath -Value $content -NoNewline
            } else {
                # Creer le fichier
                $content = @"
# Database
DATABASE_URL="$databaseUrl"

# NextAuth
NEXTAUTH_SECRET="jxqUiK7L7ZZfxyGlM9uiiutY4lHM7MBP+sNW2r4FJlI="
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optionnel pour le seed, necessaire pour les paiements)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Redis (optionnel)
REDIS_URL=""

# Encryption (pour stockage securise KYC - optionnel pour le seed)
ENCRYPTION_KEY=""
"@
                Set-Content -Path $envLocalPath -Value $content
            }
            
            Write-Host ""
            Write-Host "Fichier .env.local mis a jour automatiquement !" -ForegroundColor Green
            Write-Host "   DATABASE_URL configure avec : $($cfg.user)@$($cfg.host):$($cfg.port)/$($cfg.database)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Vous pouvez maintenant executer : npm run seed" -ForegroundColor Green
            $found = $true
            break
        }
    } catch {
        Write-Host " Echec" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "Aucune configuration automatique trouvee." -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez modifier manuellement .env.local avec votre configuration PostgreSQL." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Format attendu :" -ForegroundColor Cyan
    Write-Host '   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"' -ForegroundColor White
    Write-Host ""
    Write-Host "Pour trouver votre mot de passe PostgreSQL :" -ForegroundColor Cyan
    Write-Host "   1. Ouvrez pgAdmin ou un autre outil de gestion PostgreSQL" -ForegroundColor White
    Write-Host "   2. Verifiez les parametres de connexion" -ForegroundColor White
    Write-Host "   3. Ou essayez de vous connecter avec : psql -U postgres" -ForegroundColor White
}
