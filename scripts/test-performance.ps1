# Script pour exécuter les tests de performance k6
# Ajoute k6 au PATH et exécute les tests

$k6Path = "C:\Program Files\k6"
if (Test-Path $k6Path) {
    $env:Path += ";$k6Path"
    Write-Host "✅ k6 ajouté au PATH" -ForegroundColor Green
} else {
    Write-Host "❌ k6 non trouvé dans $k6Path" -ForegroundColor Red
    exit 1
}

# Vérifier que k6 fonctionne
$k6Version = & k6 version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ k6 installé: $k6Version" -ForegroundColor Green
} else {
    Write-Host "❌ k6 non fonctionnel" -ForegroundColor Red
    exit 1
}

# Exécuter les tests
Write-Host "`n🚀 Exécution des tests de performance..." -ForegroundColor Cyan

# Construire la commande k6 avec tous les arguments
$k6Args = $args -join ' '
& k6 run $k6Args.Split(' ')
