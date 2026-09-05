$ErrorActionPreference = 'Stop'
$taskDocPath = 'C:\PG2_CeroFallas\deliverables\segunda_entrega\CeroFallas_Segunda_Entrega.docx'
$taskPdfPath = 'C:\PG2_CeroFallas\deliverables\segunda_entrega\CeroFallas_Segunda_Entrega.pdf'
$taskWord = $null
$taskDoc = $null
try {
    $taskWord = New-Object -ComObject Word.Application
    $taskWord.Visible = $false
    $taskWord.DisplayAlerts = 0
    $taskDoc = $taskWord.Documents.Open($taskDocPath, $false, $false)
    $taskDoc.Fields.Update() | Out-Null
    $taskDoc.Repaginate()
    $taskDoc.Save()
    $taskDoc.ExportAsFixedFormat($taskPdfPath, 17)
    Write-Output ('Exportado: ' + $taskPdfPath)
    Write-Output ('Paginas: ' + $taskDoc.ComputeStatistics(2))
} finally {
    if ($null -ne $taskDoc) { $taskDoc.Close(0) }
    if ($null -ne $taskWord) { $taskWord.Quit() }
}
