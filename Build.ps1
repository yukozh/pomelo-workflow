$root = Get-Location
$binPath = Join-Path $root 'bin'
If (Test-Path $binPath) {
    Remove-Item -Path $binPath -Recurse -Force
}
New-Item $binPath -ItemType Directory
$srcPath = Join-Path $root src
$corePath = Join-Path $srcPath 'Pomelo.Workflow.Core'
Set-Location $corePath
$distPath = Join-Path $corePath 'dist'
If (Test-Path $distPath) {
    Remove-Item -Path $distPath -Recurse -Force
}
npm run build
$binCorePath = Join-Path $binPath 'core'
[System.IO.Directory]::Move($distPath, $binCorePath);

$binVuePath = Join-Path $binPath 'pomelo-vue'
New-Item -Path $binVuePath -ItemType Directory
$vueSource = Join-Path $srcPath 'Pomelo.Workflow.Web/wwwroot/components/pomelo-workflow'
$vueAsset = Join-Path $vueSource 'pomelo-workflow-core'
If (Test-Path $vueAsset) {
    Remove-Item -Path $vueAsset -Recurse -Force
}

Copy-Item -Path $binCorePath -Recurse -Destination $vueAsset
Copy-Item -Path ($vueSource + '/*') -Recurse -Destination $binVuePath

$toolsPath = Join-Path $root 'tools'
$corePackageJson = Join-Path $toolsPath 'package.core.json'
$binCorePackageJson = Join-Path $binCorePath 'package.json'
Copy-Item -Path $corePackageJson -Destination $binCorePackageJson
$vuePackageJson = Join-Path $toolsPath 'package.vue.json'
$binVuePackageJson = Join-path $binVuePath 'package.json'
Copy-Item -Path $vuePackageJson -Destination $binVuePackageJson

$dotnetPath = Join-Path $srcPath 'Pomelo.Workflow'
Set-Location $dotnetPath
$version = 'r' + [System.DateTime]::UtcNow.ToString("yyyyMMddHHmmss")
dotnet pack --version-suffix $version -c Release
$nupkgPath = 'bin/Release/Pomelo.Workflow.1.0.0-' + $version + '.nupkg'
Copy-Item $nupkgPath $binPath

Set-Location $root