# Deploy RCS apply + e-sign Worker
# Prerequisites: Cloudflare login, Resend API key (for email to submissions@)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== RCS Apply Worker deploy ===" -ForegroundColor Cyan

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "Node/npx required. Install Node.js first."
}

Write-Host "`n1) Creating KV namespace RCS_APPS (ignore error if it already exists)..."
$kvOut = npx --yes wrangler kv namespace create RCS_APPS 2>&1 | Out-String
Write-Host $kvOut

$idMatch = [regex]::Match($kvOut, 'id\s*=\s*"([a-f0-9]+)"')
if (-not $idMatch.Success) {
  $idMatch = [regex]::Match($kvOut, '([a-f0-9]{32})')
}
if ($idMatch.Success) {
  $kvId = $idMatch.Groups[1].Value
  $toml = Get-Content .\wrangler.toml -Raw
  $toml = $toml -replace 'REPLACE_WITH_KV_NAMESPACE_ID', $kvId
  Set-Content .\wrangler.toml -Value $toml -NoNewline
  Write-Host "  KV id written to wrangler.toml: $kvId" -ForegroundColor Green
} else {
  Write-Host "  Could not parse KV id. Paste it into wrangler.toml manually, then re-run deploy." -ForegroundColor Yellow
}

Write-Host "`n2) Set secrets (RESEND_API_KEY and FROM_EMAIL)..."
Write-Host "  Run these if not already set:"
Write-Host "  npx wrangler secret put RESEND_API_KEY"
Write-Host "  npx wrangler secret put FROM_EMAIL"

$deploy = Read-Host "Deploy worker now? (y/n)"
if ($deploy -eq 'y') {
  npx --yes wrangler deploy
  Write-Host "`nNext: Cloudflare dashboard → Worker rcs-apply → Triggers → Add route:" -ForegroundColor Cyan
  Write-Host "  rapidcapitalsolutions.com/api/*"
}

Write-Host "`nDone. Test: https://rapidcapitalsolutions.com/apply.html" -ForegroundColor Green
