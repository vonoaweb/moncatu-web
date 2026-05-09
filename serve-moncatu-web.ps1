# Sirve esta carpeta en http://localhost:5500 (CORS con Medusa).
# Abre: http://localhost:5500/colecciones.html

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$pyCmd = $null
foreach ($name in @('py', 'python', 'python3')) {
  if (Get-Command $name -ErrorAction SilentlyContinue) { $pyCmd = $name; break }
}
if (-not $pyCmd) {
  Write-Error "No se encontró Python (py/python). Instálalo o abre el HTML con otro servidor estático."
  exit 1
}
Write-Host "Sirviendo $here en http://localhost:5500 ($pyCmd)" -ForegroundColor Green
& $pyCmd -m http.server 5500
