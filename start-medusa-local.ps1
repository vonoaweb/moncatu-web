# Arranca backend + storefront Medusa desde C:\tmp\moncatu-medusa-yarn
# Usa yarn si está en PATH; si no, turbo local (no hace falta yarn global).

$MedusaRoot = "C:\tmp\moncatu-medusa-yarn"
if (-not (Test-Path $MedusaRoot)) {
  Write-Error "No existe $MedusaRoot. Ajusta la ruta en este script."
  exit 1
}
Set-Location $MedusaRoot
$Turbo = Join-Path $MedusaRoot "node_modules\.bin\turbo.cmd"

if (Get-Command yarn -ErrorAction SilentlyContinue) {
  Write-Host "Medusa: yarn dev" -ForegroundColor Green
  yarn dev
} elseif (Test-Path $Turbo) {
  Write-Host "Medusa: turbo dev (yarn no está en PATH)" -ForegroundColor Green
  & $Turbo dev
} else {
  Write-Error "No se encontró yarn ni $Turbo. Ejecuta yarn install en $MedusaRoot."
  exit 1
}
