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

function Test-ExportCandidate([string]$path) {
  if (-not $path -or -not (Test-Path -LiteralPath $path -PathType Container)) { return $false }
  $requiredFiles = @(
    'firebase-export-metadata.json',
    'auth_export/accounts.json',
    'auth_export/config.json',
    'firestore_export/firestore_export.overall_export_metadata',
    'firestore_export/all_namespaces/all_kinds/all_namespaces_all_kinds.export_metadata',
    'firestore_export/all_namespaces/all_kinds/output-0'
  )
  foreach ($relativePath in $requiredFiles) {
    $filePath = Join-Path $path $relativePath
    if (-not (Test-Path -LiteralPath $filePath -PathType Leaf) -or (Get-Item -LiteralPath $filePath).Length -le 0) { return $false }
  }
  try {
    $metadata = Get-Content -LiteralPath (Join-Path $path 'firebase-export-metadata.json') -Raw | ConvertFrom-Json
    return [bool]($metadata.firestore.path -and $metadata.auth.path)
  } catch { return $false }
}

$candidatePaths = @()
if (Test-Path -LiteralPath $stagingPath) { $candidatePaths += $stagingPath }
$candidatePaths += Get-ChildItem -LiteralPath $workspacePath -Directory -Filter 'firebase-export-*' |
  Where-Object { $_.LastWriteTime -ge $startedAt } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -ExpandProperty FullName
$candidatePath = $candidatePaths | Where-Object { Test-ExportCandidate $_ } | Select-Object -First 1

if (-not $candidatePath) { throw "No se encontró una exportación completa. Firebase finalizó con código $exportExitCode. No se reemplazó emulator-data." }
$resolvedCandidate = (Resolve-Path -LiteralPath $candidatePath).Path
if (-not $resolvedCandidate.StartsWith($workspacePath + '\')) { throw 'La exportación quedó fuera del proyecto.' }
if ($exportExitCode -ne 0) { Write-Warning "Firebase devolvió código $exportExitCode, pero se recuperó y validó estructuralmente la exportación completa generada por el emulador." }

$backupPath = $null
if (Test-Path -LiteralPath $targetPath) {
  $backupPath = Join-Path $workspacePath ("emulator-data-backup-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
  Move-Item -LiteralPath $targetPath -Destination $backupPath
}
Move-Item -LiteralPath $resolvedCandidate -Destination $targetPath

Write-Host 'Estado local guardado correctamente en emulator-data.'
if ($backupPath) { Write-Host "Copia anterior conservada en $([System.IO.Path]::GetFileName($backupPath))." }
