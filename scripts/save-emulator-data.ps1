$ErrorActionPreference = 'Stop'
$workspacePath = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$targetPath = Join-Path $workspacePath 'emulator-data'
$stagingPath = Join-Path $workspacePath 'emulator-data-staging'
$startedAt = Get-Date

if (Test-Path -LiteralPath $stagingPath) {
  $stalePath = Join-Path $workspacePath ("emulator-data-stale-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
  Move-Item -LiteralPath $stagingPath -Destination $stalePath
}

& node (Join-Path $workspacePath 'node_modules/firebase-tools/lib/bin/firebase.js') emulators:export $stagingPath --project demo-cerofallas --force
$exportExitCode = $LASTEXITCODE

$candidatePath = if (Test-Path -LiteralPath (Join-Path $stagingPath 'firebase-export-metadata.json')) {
  $stagingPath
} else {
  Get-ChildItem -LiteralPath $workspacePath -Directory -Filter 'firebase-export-*' |
    Where-Object { $_.LastWriteTime -ge $startedAt -and (Test-Path -LiteralPath (Join-Path $_.FullName 'firebase-export-metadata.json')) } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}

if (-not $candidatePath) { throw "No se encontró una exportación válida. Firebase finalizó con código $exportExitCode." }
$resolvedCandidate = (Resolve-Path -LiteralPath $candidatePath).Path
if (-not $resolvedCandidate.StartsWith($workspacePath + '\')) { throw 'La exportación quedó fuera del proyecto.' }

$backupPath = $null
if (Test-Path -LiteralPath $targetPath) {
  $backupPath = Join-Path $workspacePath ("emulator-data-backup-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
  Move-Item -LiteralPath $targetPath -Destination $backupPath
}
Move-Item -LiteralPath $resolvedCandidate -Destination $targetPath

Write-Host 'Estado local guardado correctamente en emulator-data.'
if ($backupPath) { Write-Host "Copia anterior conservada en $([System.IO.Path]::GetFileName($backupPath))." }
