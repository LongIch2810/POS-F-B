param([ValidateSet('baseline', 'final')][string]$Phase, [switch]$CompareOnly)
$ErrorActionPreference = 'Stop'
function Compare-Evidence {
  $baseline = Get-Content -Raw (Join-Path $PSScriptRoot 'baseline-metadata.json') | ConvertFrom-Json | ConvertTo-Json -Depth 30 -Compress
  $final = Get-Content -Raw (Join-Path $PSScriptRoot 'final-metadata.json') | ConvertFrom-Json | ConvertTo-Json -Depth 30 -Compress
  $metadataEqual = $baseline -ceq $final
  $dbEqual = (Get-Content -Raw (Join-Path $PSScriptRoot 'final-db-before.json')) -ceq (Get-Content -Raw (Join-Path $PSScriptRoot 'final-db-after.json'))
  $testResult = Get-Content -Raw (Join-Path $PSScriptRoot 'final-result.json') | ConvertFrom-Json
  $comparison = @{ metadataAndMigrationHashesEqual = $metadataEqual; testDatabaseInventoryEqual = $dbEqual;
    testsPassed = ($testResult.testExitCode -eq 0 -and $testResult.counts.tests -gt 0 -and $testResult.counts.fail -eq 0 -and $testResult.counts.skipped -eq 0) }
  $comparison | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $PSScriptRoot 'final-comparison.json')
  $comparison | ConvertTo-Json
  if (-not $metadataEqual -or -not $dbEqual -or -not $comparison.testsPassed) { throw 'Comparison/count check failed' }
}
if ($CompareOnly) { Compare-Evidence; exit 0 }
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$apiRoot = Join-Path $repoRoot 'POS_API'
$distRoot = Join-Path $apiRoot 'dist'
$sourceRoot = Join-Path $apiRoot 'src'
function Save-NodeOutput([string]$Mode, [string]$Label) {
  $command = 'node "{0}" {1} 1> "{2}" 2> "{3}"' -f (Join-Path $PSScriptRoot 'metadata.cjs'), $Mode, (Join-Path $PSScriptRoot "$Phase-$Label.json"), (Join-Path $PSScriptRoot "$Phase-$Label.stderr.log")
  cmd /d /c $command
  return $LASTEXITCODE
}
$containerInfo = (docker inspect pos_infra-postgres-1 | ConvertFrom-Json)[0]
$settings = @{}
foreach ($entry in $containerInfo.Config.Env) {
  $pair = $entry.Split('=', 2)
  $settings[$pair[0]] = $pair[1]
}
$dbPort = $containerInfo.NetworkSettings.Ports.'5432/tcp'[0].HostPort
$env:DATABASE_URL = 'postgres://{0}:{1}@127.0.0.1:{2}/{3}' -f [uri]::EscapeDataString($settings.POSTGRES_USER), [uri]::EscapeDataString($settings.POSTGRES_PASSWORD), $dbPort, $settings.POSTGRES_DB
$env:JWT_SECRET = 'j' * 32
$env:CSRF_SECRET = 'c' * 32
$env:PUBLIC_ORIGIN = 'http://localhost:5173'
$started = (Get-Date).ToUniversalTime().ToString('o')
$revision = (git -C $repoRoot rev-parse HEAD).Trim()
$status = @(git -C $repoRoot status --short)
$orphans = @(Get-ChildItem -LiteralPath $distRoot -Recurse -File -Filter '*.js' | Where-Object {
  $relative = $_.FullName.Substring($distRoot.Length + 1)
  -not (Test-Path -LiteralPath (Join-Path $sourceRoot ([IO.Path]::ChangeExtension($relative, '.ts'))))
})
ConvertTo-Json -InputObject @($orphans | ForEach-Object { $_.FullName }) | Set-Content -Encoding UTF8 (Join-Path $PSScriptRoot "$Phase-orphaned-build.json")
foreach ($file in $orphans) {
  $resolved = (Resolve-Path -LiteralPath $file.FullName).Path
  if (-not $resolved.StartsWith($distRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Build artifact outside dist' }
  Remove-Item -LiteralPath $resolved
}
$manifest = @(Get-ChildItem -LiteralPath $sourceRoot -Recurse -File | ForEach-Object {
  @{ path = $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/'); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
})
ConvertTo-Json -InputObject $manifest | Set-Content -Encoding UTF8 (Join-Path $PSScriptRoot "$Phase-source-manifest.json")
Push-Location $apiRoot
try {
  $dbBeforeExit = Save-NodeOutput 'db' 'db-before'
  if ($dbBeforeExit -ne 0) { throw 'DB snapshot before failed' }
  cmd /d /c 'npm test' 1> (Join-Path $PSScriptRoot "$Phase-test.log") 2> (Join-Path $PSScriptRoot "$Phase-test.stderr.log")
  $testExit = $LASTEXITCODE
  $metadataExit = Save-NodeOutput '' 'metadata'
  $dbExit = Save-NodeOutput 'db' 'db-after'
} finally { Pop-Location }
$log = Get-Content -Raw (Join-Path $PSScriptRoot "$Phase-test.log")
$counts = @{}
foreach ($key in @('tests', 'pass', 'fail', 'skipped')) {
  $match = [regex]::Match($log, "(?m)^# $key (\d+)")
  $counts[$key] = if ($match.Success) { [int]$match.Groups[1].Value } else { $null }
}
$result = @{ command = 'npm test'; cwd = $apiRoot; commit = $revision; status = $status;
  startedUtc = $started; finishedUtc = (Get-Date).ToUniversalTime().ToString('o');
  testExitCode = $testExit; metadataExitCode = $metadataExit; dbAfterExitCode = $dbExit; counts = $counts;
  node = (node --version); npm = (npm --version); evidence = 'local do agent chay' }
$result | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $PSScriptRoot "$Phase-result.json")
$result | ConvertTo-Json -Depth 5
if ($testExit -ne 0 -or $metadataExit -ne 0 -or $dbExit -ne 0) { throw 'Verification failed; inspect original output files' }
if ($Phase -eq 'final') {
  Compare-Evidence
}
