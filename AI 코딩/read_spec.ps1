[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$tmp = "$env:TEMP\spec.xlsx"
$src = Get-ChildItem -Path "C:\Users\정혜리\Desktop\AI 코딩\사례 1 로그인 페이지\로그인페이지 디베롧\" -Filter "*.xlsx" | Select-Object -First 1 -ExpandProperty FullName
Write-Output "Found: $src"
Copy-Item -LiteralPath $src -Destination $tmp -Force

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($tmp)

$ssEntry = $zip.Entries | Where-Object { $_.FullName -eq 'xl/sharedStrings.xml' } | Select-Object -First 1
if ($ssEntry) {
    $sr = New-Object System.IO.StreamReader($ssEntry.Open(), [System.Text.Encoding]::UTF8)
    $ss = $sr.ReadToEnd(); $sr.Close()
    Write-Output "=SS="; Write-Output $ss
}

$sh = $zip.Entries | Where-Object { $_.FullName -eq 'xl/worksheets/sheet1.xml' } | Select-Object -First 1
if ($sh) {
    $sr2 = New-Object System.IO.StreamReader($sh.Open(), [System.Text.Encoding]::UTF8)
    $xml = $sr2.ReadToEnd(); $sr2.Close()
    Write-Output "=SHEET="; Write-Output $xml
}
$zip.Dispose()
