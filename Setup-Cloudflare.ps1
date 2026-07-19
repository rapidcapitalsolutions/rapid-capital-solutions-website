# Configure Cloudflare DNS + HTTPS for rapidcapitalsolutions.com (GitHub Pages + M365 email)
# Usage:
#   $env:CLOUDFLARE_API_TOKEN = "your-token"
#   .\Setup-Cloudflare.ps1
# Or put token on first line of .cloudflare-token.local (gitignored)

$ErrorActionPreference = "Stop"
$Domain = "rapidcapitalsolutions.com"

function Get-CfToken {
    if ($env:CLOUDFLARE_API_TOKEN) { return $env:CLOUDFLARE_API_TOKEN.Trim() }
    $local = Join-Path $PSScriptRoot ".cloudflare-token.local"
    if (Test-Path $local) {
        $t = (Get-Content $local -Raw).Trim()
        if ($t) { return $t }
    }
    throw "Set CLOUDFLARE_API_TOKEN or create .cloudflare-token.local with your API token."
}

function Invoke-CfApi {
    param([string]$Method, [string]$Path, $Body = $null)
    $headers = @{
        Authorization = "Bearer $(Get-CfToken)"
        "Content-Type" = "application/json"
    }
    $uri = "https://api.cloudflare.com/client/v4$Path"
    if ($Body) {
        return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
    }
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
}

function Set-CfSetting {
    param([string]$ZoneId, [string]$Id, $Value)
    $r = Invoke-CfApi -Method PATCH -Path "/zones/$ZoneId/settings/$Id" -Body @{ value = $Value }
    if (-not $r.success) { throw "Failed setting $Id : $($r.errors | ConvertTo-Json)" }
    Write-Host "  OK $Id = $Value"
}

function Ensure-DnsRecord {
    param(
        [string]$ZoneId,
        [string]$Type,
        [string]$Name,
        [string]$Content,
        [int]$Priority = 0,
        [bool]$Proxied = $false,
        [int]$Ttl = 1
    )
    $fullName = if ($Name -eq "@") { $Domain } else { "$Name.$Domain" }
    $existing = Invoke-CfApi -Method GET -Path "/zones/$ZoneId/dns_records?type=$Type&name=$fullName"
    $body = @{
        type    = $Type
        name    = $Name
        content = $Content
        ttl     = $Ttl
        proxied = $Proxied
    }
    if ($Type -eq "MX") { $body.priority = $Priority }

    $existing = Invoke-CfApi -Method GET -Path "/zones/$ZoneId/dns_records?type=$Type&name=$fullName"
    $match = $existing.result | Where-Object { $_.content -eq $Content } | Select-Object -First 1
    if (-not $match -and $existing.result.Count -eq 1) { $match = $existing.result[0] }

    if ($match) {
        $id = $match.id
        $r = Invoke-CfApi -Method PUT -Path "/zones/$ZoneId/dns_records/$id" -Body $body
    } else {
        $r = Invoke-CfApi -Method POST -Path "/zones/$ZoneId/dns_records" -Body $body
    }
    if (-not $r.success) { throw "DNS $Type $Name failed: $($r.errors | ConvertTo-Json)" }
    $proxy = if ($Proxied) { "proxied" } else { "DNS only" }
    Write-Host "  OK $Type $Name -> $Content ($proxy)"
}

Write-Host "=== Cloudflare setup: $Domain ===" -ForegroundColor Cyan

$zones = Invoke-CfApi -Method GET -Path "/zones?name=$Domain"
if ($zones.result.Count -eq 0) {
    throw "Zone $Domain not found in Cloudflare. Add the site in dash.cloudflare.com first."
}
$zone = $zones.result[0]
$zoneId = $zone.id
Write-Host "Zone ID: $zoneId  Status: $($zone.status)"

Write-Host "`n--- Email records (DNS only - do not proxy) ---"
Ensure-DnsRecord -ZoneId $zoneId -Type MX -Name '@' -Content "rapidcapitalsolutions-com.mail.protection.outlook.com" -Priority 0 -Proxied $false
Ensure-DnsRecord -ZoneId $zoneId -Type TXT -Name '@' -Content "v=spf1 include:spf.protection.outlook.com -all" -Proxied $false
Ensure-DnsRecord -ZoneId $zoneId -Type TXT -Name '@' -Content "MS=ms11145329" -Proxied $false
Ensure-DnsRecord -ZoneId $zoneId -Type CNAME -Name "autodiscover" -Content "autodiscover.outlook.com" -Proxied $false

Write-Host "`n--- Website records (proxied through Cloudflare) ---"
foreach ($ip in @("185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153")) {
    Ensure-DnsRecord -ZoneId $zoneId -Type A -Name '@' -Content $ip -Proxied $true
}
Ensure-DnsRecord -ZoneId $zoneId -Type CNAME -Name "www" -Content "rapidcapitalsolutions.github.io" -Proxied $true

Write-Host "`n--- SSL / HTTPS ---"
Set-CfSetting -ZoneId $zoneId -Id "ssl" -Value "full"
Set-CfSetting -ZoneId $zoneId -Id "always_use_https" -Value "on"

Write-Host "`n--- Nameservers (paste these at Namecheap) ---"
$ns = Invoke-CfApi -Method GET -Path "/zones/$zoneId"
foreach ($n in $ns.result.name_servers) {
    Write-Host "  $n" -ForegroundColor Yellow
}

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Next: Namecheap -> Domain -> Nameservers -> Custom DNS -> paste the 2 Cloudflare NS above."
Write-Host "GitHub Pages: enable Enforce HTTPS in repo Settings > Pages after DNS is grey-clouded and cert checkmark appears."
Write-Host "Cloudflare SSL must be Full (not Flexible) once GitHub has issued its certificate."
Write-Host "Test in ~15 min: https://$Domain"
