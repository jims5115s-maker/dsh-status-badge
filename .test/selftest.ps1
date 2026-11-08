$ErrorActionPreference = 'Continue'
Set-Location (Join-Path $PSScriptRoot '..')
$web = $args[0]
if (-not $web) { throw 'usage: selftest.ps1 http://127.0.0.1:<web port>' }

function Hit($path, $method, $body) {
  try {
    if ($method -eq 'POST') {
      return (Invoke-WebRequest ($web + $path) -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 25).Content
    }
    return (Invoke-WebRequest ($web + $path) -UseBasicParsing -TimeoutSec 20).Content
  } catch {
    return 'ERR ' + $_.Exception.Message
  }
}

$rows = @()
function Row($name, $value) { $script:rows += [pscustomobject]@{ Test = $name; Result = $value } }

Row 'close'      (Hit '/status-badge/window/action' 'POST' '{"action":"close"}')
Start-Sleep -Milliseconds 900
Row 'state(shut)' (Hit '/status-badge/window/state' 'GET' $null)
Row 'open'       (Hit '/status-badge/open' 'POST' '{}')
Start-Sleep -Seconds 3
Row 'reset'      (Hit '/status-badge/window/reset' 'POST' '{}')
Start-Sleep -Milliseconds 700
Row 'dragstart'  (Hit '/status-badge/window/dragstart' 'POST' '{"x":1200,"y":700}')
Start-Sleep -Milliseconds 500
Row 'maximize-1' (Hit '/status-badge/window/action' 'POST' '{"action":"maximize"}')
Start-Sleep -Milliseconds 500
Row 'maximize-2' (Hit '/status-badge/window/action' 'POST' '{"action":"maximize"}')
Start-Sleep -Milliseconds 500
Row 'layer-top'  (Hit '/status-badge/window/ctl?path=layer&value=top' 'GET' $null)
Row 'layer-norm' (Hit '/status-badge/window/ctl?path=layer&value=normal' 'GET' $null)
Row 'alpha-60'   (Hit '/status-badge/window/alpha?value=60' 'GET' $null)
Row 'alpha-100'  (Hit '/status-badge/window/alpha?value=100' 'GET' $null)
Row 'pass-1'     (Hit '/status-badge/window/ctl?path=passthrough&value=1' 'GET' $null)
Row 'pass-0'     (Hit '/status-badge/window/ctl?path=passthrough&value=0' 'GET' $null)

$live = Hit '/status-badge/live' 'GET' $null
if ($live -notlike 'ERR*') {
  $j = $live | ConvertFrom-Json
  Row 'live.status' "$($j.status) running=$($j.running) nodes=$($j.stats.nodes)"
  Row 'live.feed'   "thinking=$($j.thinking.Length) tool=[$($j.tool)] lines=$($j.lines.Count) paths=$($j.paths.Count)"
  Row 'live.usage'  ($j.usage | ConvertTo-Json -Compress)
} else { Row 'live' $live }

$m = Hit '/status-badge/metrics' 'GET' $null
if ($m -notlike 'ERR*') {
  $k = $m | ConvertFrom-Json
  Row 'metrics.gpu'  (($k.gpu.list | ForEach-Object { "$($_.name):$($_.pct)%" }) -join ' | ')
  Row 'metrics.disk' "$($k.slow.diskId) free=$([math]::Round($k.slow.diskFree/1GB))GB"
  Row 'metrics.net'  "in=$($k.slow.netIn)B/s out=$($k.slow.netOut)B/s procs=$($k.slow.procs.Count)"
} else { Row 'metrics' $m }

Row 'balance' (Hit '/status-badge/balance' 'GET' $null)

$rows | Format-Table -AutoSize -Wrap
