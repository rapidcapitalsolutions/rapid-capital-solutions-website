# Fix HTTPS locally when VPN/ISP DNS still points at old GitHub IPs.
# Run as Administrator: Right-click PowerShell -> Run as administrator
#   cd "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website"
#   .\Fix-Https-Local.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Fix HTTPS for rapidcapitalsolutions.com ===" -ForegroundColor Cyan

# 1. Use Cloudflare + Google DNS (bypass stale NordVPN/ISP cache)
$dnsServers = @("1.1.1.1", "8.8.8.8")
foreach ($iface in @("NordLynx", "Ethernet", "Wi-Fi")) {
    if (Get-NetAdapter -Name $iface -ErrorAction SilentlyContinue) {
        try {
            Set-DnsClientServerAddress -InterfaceAlias $iface -ServerAddresses $dnsServers
            Write-Host "  DNS set on $iface -> $($dnsServers -join ', ')" -ForegroundColor Green
        } catch {
            Write-Host "  Skip $iface : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# 2. Flush cache
ipconfig /flushdns | Out-Null
Clear-DnsClientCache -ErrorAction SilentlyContinue
Write-Host "  DNS cache flushed" -ForegroundColor Green

# 3. Verify resolution
Write-Host "`n--- DNS check (should be 104.21.x.x or 172.67.x.x, NOT 185.199.x.x) ---"
$answers = Resolve-DnsName rapidcapitalsolutions.com -Type A -ErrorAction SilentlyContinue
$answers | ForEach-Object { Write-Host "  A -> $($_.IPAddress)" }

# 4. Test HTTPS
Write-Host "`n--- HTTPS test ---"
try {
    $r = Invoke-WebRequest -Uri "https://rapidcapitalsolutions.com/" -UseBasicParsing -TimeoutSec 20
    Write-Host "  HTTPS OK: $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  HTTPS still failing: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nIf you use NordVPN: App -> Settings -> DNS -> Custom DNS -> 1.1.1.1" -ForegroundColor Yellow
    Write-Host "Or disconnect VPN and retry." -ForegroundColor Yellow
}

Write-Host "`nDone. Open https://rapidcapitalsolutions.com in a new Incognito window." -ForegroundColor Cyan
