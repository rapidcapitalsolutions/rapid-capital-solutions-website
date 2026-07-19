# Rapid Capital Solutions — Email signatures

Outlook signatures (Fidelity-style stack: logo → name → title → contact → company). RCS ink + copper.

## Titles (current)

| Person / mailbox | Title |
|------------------|--------|
| Vincent Maccarone (`Vincent@`) | **Chief Executive Officer** |
| Nicholas Gianni (`nicky@`) | **Chief Executive Officer** |
| New advisors / other people | **Funding Advisor** |
| Shared (`info@`, `submissions@`, `admin@`) | Funding Team (shared inbox) |

## How compose signatures work (the method that works)

Microsoft Graph / `m365` **cannot** set signatures. New Outlook / OWA only inject the sig **in compose** when:

1. Org: `Set-OrganizationConfig -PostponeRoamingSignaturesUntilLater $true`
2. Per mailbox: `Set-MailboxMessageConfiguration` with `SignatureHtml` + `SignatureHtmlBody` + `AutoAddSignature $true`

**Do not** set Postpone to `$false` — that makes Outlook ignore PowerShell signatures (compose goes blank).

**Judge success by New mail**, not Settings → Signatures (that roaming page often stays empty).

## Deploy all (or after editing HTML)

```powershell
cd C:\Users\Vinny\Documents\Work
.\Deploy-RcsComposeSignatures.ps1
```

Sign in as `Vincent@` when prompted (`-DisableWAM` avoids device-reg hang).

## New employee (custom tailored)

1. Create mailbox + license in M365.
2. Copy `email-signatures\template.html` → `firstname.html`.
3. Fill **name**, title (**Funding Advisor** unless CEO), email, Direct phone.
4. Add a row to `$map` in `Deploy-RcsComposeSignatures.ps1` (and `Set-RcsEmailSignatures.ps1` if still used).
5. Run `.\Deploy-RcsComposeSignatures.ps1` (or `-Mailbox` if you add that param later — currently deploys all).
6. New hire: hard refresh Outlook → **New mail** — sig should already be at the bottom.

Full checklist also lives in `Documents\Work\RAPID-CAPITAL-SOLUTIONS-PROGRESS.md` → **Email signatures (compose)**.

## Files

| File | Use |
|------|-----|
| `vincent.html` | Vincent@ — CEO + Direct (718) 814-8874 |
| `nicholas.html` | nicky@ — CEO |
| `shared-inbox.html` | info@ / submissions@ / admin@ |
| `template.html` | New hires (default title: Funding Advisor) |
| `..\Deploy-RcsComposeSignatures.ps1` | **Canonical deploy** (compose injection) |
| `..\Set-RcsEmailSignatures.ps1` | Older deploy script (same EXO approach) |

Hosted logo: `https://rapidcapitalsolutions.com/assets/email/rcs-logo.png`

Transport rules `RCS Signature - external/internal` append after send as backup (recipients always get branding even if a client fails).
