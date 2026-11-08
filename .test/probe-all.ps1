$c = Get-Counter -Counter '\GPU Engine(*)\Utilization Percentage','\GPU Adapter Memory(*)\Dedicated Usage' -ErrorAction SilentlyContinue
$an = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\DirectX' -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue; if ($p.AdapterLuid) { [ordered]@{ luid = (($p.AdapterLuid | ForEach-Object { $_.ToString('x2') }) -join ''); name = $p.Description; vendor = [double]$p.VendorId } } }
$d = Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object DeviceID, FreeSpace, Size
$pr = Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 5 Name, WorkingSet64
$rx = (Get-NetAdapterStatistics -ErrorAction SilentlyContinue | Measure-Object -Property ReceivedBytes -Sum).Sum
$tx = (Get-NetAdapterStatistics -ErrorAction SilentlyContinue | Measure-Object -Property SentBytes -Sum).Sum
$bt = (Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object -First 1).EstimatedChargeRemaining
$o = [ordered]@{ samples = @($c.CounterSamples | ForEach-Object { [ordered]@{ path = $_.Path; inst = $_.InstanceName; val = [double]$_.CookedValue } }); adapters = @($an); disks = @($d | ForEach-Object { [ordered]@{ id = $_.DeviceID; free = [double]$_.FreeSpace; total = [double]$_.Size } }); procs = @($pr | ForEach-Object { [ordered]@{ name = $_.Name; mem = [double]$_.WorkingSet64 } }); netRx = $(if ($rx) { [double]$rx } else { 0 }); netTx = $(if ($tx) { [double]$tx } else { 0 }); battery = $(if ($bt) { [double]$bt } else { -1 }) }
$o | ConvertTo-Json -Compress -Depth 4
