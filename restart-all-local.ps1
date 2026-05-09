# Reinicia: cierra puertos, abre Medusa (turbo) y el sitio Moncatu en :5500 en ventanas nuevas.
# Uso: .\restart-all-local.ps1
# Opcional: .\restart-all-local.ps1 -SkipMedusa   (solo servidor estatico)

param([switch]$SkipMedusa)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$MedusaRoot = "C:\tmp\moncatu-medusa-yarn"

Write-Host ""
Write-Host "[1] Deteniendo puertos 9000, 8000, 5500" -ForegroundColor Cyan
& "$here\stop-medusa-local.ps1"

if (-not $SkipMedusa -and (Test-Path $MedusaRoot)) {
  Write-Host ""
  Write-Host "[2] Medusa: nueva ventana (turbo dev)" -ForegroundColor Cyan
  $Turbo = Join-Path $MedusaRoot "node_modules\.bin\turbo.cmd"
  if (Test-Path $Turbo) {
    $cmd = "Set-Location `"$MedusaRoot`"; & `"$Turbo`" dev"
    Start-Process -FilePath "powershell.exe" -ArgumentList @(
      "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $cmd
    ) -WindowStyle Normal
    Write-Host "Esperando http://127.0.0.1:9000/health (max 40 s)..." -ForegroundColor Gray
    $ok = $false
    for ($i = 0; $i -lt 20; $i++) {
      Start-Sleep -Seconds 2
      try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:9000/health" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $ok = $true; break }
      } catch { }
    }
    if ($ok) { Write-Host "Medusa: health OK." -ForegroundColor Green }
    else { Write-Host "Medusa: sin health aun (normal si Postgres/Redis tardan). Mira la otra ventana." -ForegroundColor Yellow }
  } else {
    Write-Warning "No existe $Turbo - ejecuta yarn install en $MedusaRoot"
  }
} elseif (-not $SkipMedusa) {
  Write-Warning "No existe $MedusaRoot - omite Medusa o instala el monorepo ahi."
}

Write-Host ""
Write-Host "[3] Moncatu: nueva ventana en http://localhost:5500" -ForegroundColor Cyan
$pyCmd = $null
foreach ($name in @('py', 'python', 'python3')) {
  if (Get-Command $name -ErrorAction SilentlyContinue) { $pyCmd = $name; break }
}
if ($pyCmd) {
  Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$here\serve-moncatu-web.ps1"
  ) -WindowStyle Normal
  Write-Host "Abre: http://localhost:5500/colecciones.html" -ForegroundColor Green
} else {
  Write-Warning "Python no encontrado. Instala Python o ejecuta serve-moncatu-web.ps1 a mano."
}

Write-Host ""
Write-Host "Detener todo: .\stop-medusa-local.ps1" -ForegroundColor Cyan
Write-Host ""
