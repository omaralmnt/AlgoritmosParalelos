param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("smoke", "load", "stress")]
    [string]$TestType = "load"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALB Load Testing - k6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptMap = @{
    "smoke"  = "smoke-test.js"
    "load"   = "alb-load-test.js"
    "stress" = "stress-test.js"
}

$script = $scriptMap[$TestType]
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resultsDir = "results"

if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

$jsonOutput = "$resultsDir/$TestType-test_$timestamp.json"
$summaryOutput = "$resultsDir/$TestType-test_$timestamp-summary.json"

Write-Host "Test Type: $TestType" -ForegroundColor Yellow
Write-Host "Script: $script" -ForegroundColor Yellow
Write-Host "Output: $jsonOutput" -ForegroundColor Yellow
Write-Host ""

if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: k6 no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalar con:" -ForegroundColor Yellow
    Write-Host "  choco install k6" -ForegroundColor White
    Write-Host "  O descargar de: https://k6.io/docs/get-started/installation/" -ForegroundColor White
    exit 1
}

Write-Host "Verificando endpoint ALB..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "ALB está respondiendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "ADVERTENCIA: No se pudo conectar al ALB" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $continue = Read-Host "¿Continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        exit 1
    }
}

Write-Host ""
Write-Host "Iniciando prueba de carga..." -ForegroundColor Green
Write-Host ""

Write-Host "IMPORTANTE: Mientras corre la prueba, abre AWS Console:" -ForegroundColor Yellow
Write-Host "  1. Lambda -> apiclientes-api -> Monitoring" -ForegroundColor White
Write-Host "  2. EC2 -> Load Balancers -> apiclientes-alb -> Monitoring" -ForegroundColor White
Write-Host "  3. CloudWatch -> Metrics" -ForegroundColor White
Write-Host ""

$startTime = Get-Date

k6 run $script --out json=$jsonOutput --summary-export=$summaryOutput

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Duración: $($duration.ToString('mm\:ss'))" -ForegroundColor Yellow
Write-Host "Resultados guardados en:" -ForegroundColor Yellow
Write-Host "  - $jsonOutput" -ForegroundColor White
Write-Host "  - $summaryOutput" -ForegroundColor White
Write-Host ""

if (Test-Path $summaryOutput) {
    Write-Host "Resumen de resultados:" -ForegroundColor Green
    $summary = Get-Content $summaryOutput | ConvertFrom-Json

    $totalRequests = $summary.metrics.http_reqs.values.count
    $failedRate = [math]::Round($summary.metrics.http_req_failed.values.rate * 100, 2)
    $avgDuration = [math]::Round($summary.metrics.http_req_duration.values.avg, 0)
    $p95Duration = [math]::Round($summary.metrics.http_req_duration.values.'p(95)', 0)

    Write-Host "  Total requests: $totalRequests" -ForegroundColor White
    Write-Host "  Tasa de fallos: $failedRate%" -ForegroundColor White
    Write-Host "  Tiempo promedio: ${avgDuration}ms" -ForegroundColor White
    Write-Host "  P95: ${p95Duration}ms" -ForegroundColor White
}

Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Revisar métricas en AWS CloudWatch" -ForegroundColor White
Write-Host "  2. Capturar screenshots para el PDF" -ForegroundColor White
Write-Host "  3. Analizar Auto Scaling de Lambda" -ForegroundColor White
Write-Host ""
