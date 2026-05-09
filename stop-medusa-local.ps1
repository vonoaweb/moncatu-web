# Libera puertos usados por Medusa (9000, 8000) y el servidor estático Moncatu (5500).

$ports = @(9000, 8000, 5500)
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  if ($conns) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
      try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        Write-Host "Proceso $procId (puerto $port) detenido." -ForegroundColor Yellow
      } catch {
        Write-Host "No se pudo detener PID $procId (puerto $port): $_" -ForegroundColor Red
      }
    }
  } else {
    Write-Host "Nada en puerto $port." -ForegroundColor Gray
  }
}
