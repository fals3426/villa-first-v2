# Health Check Script for Windows PowerShell
# Usage: .\scripts\health-check.ps1 [URL]

param(
    [string]$URL = "http://localhost:3000",
    [int]$MaxResponseTime = 2000 # 2 seconds
)

try {
    $response = Invoke-WebRequest -Uri $URL -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $responseTime = $response.Headers.'X-Response-Time'
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check PASSED (Status: $($response.StatusCode))" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ Health check FAILED (HTTP: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Health check FAILED (Error: $($_.Exception.Message))" -ForegroundColor Red
    exit 1
}
