Write-Host 'Compiling typescript...'

$path = $PSScriptRoot
Set-Location $path

While (-not (Test-Path (Join-Path $path 'src'))) {
    $path = Join-Path $path '..'
}

$output = Join-Path $PSScriptRoot 'pomelo.workflow.core.js'
$pue = Join-Path $path 'src/Pomelo.Workflow.Pue/wwwroot/assets/js/pomelo.workflow.core.js'
$path = Join-Path $path 'src/Pomelo.Workflow.Core' -Resolve

Write-Host 'Typescript source:' $path

./Pomelo.Workflow.TypeScriptCompiler.exe $path

tsc --build

Write-Host 'Copying' $output 'to' $pue '...'
Copy-Item $output -Destination $pue