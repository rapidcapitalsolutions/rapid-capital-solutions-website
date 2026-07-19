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

## Outlook iOS (phone app)

Microsoft **does not** sync OWA/PowerShell signatures into the Outlook iOS app. Paste once:

1. Open the matching file: `vincent-ios.txt` / `nicholas-ios.txt` / `shared-ios.txt`
2. iPhone Outlook → **Settings** → **Signature** → turn on **Per Account Signature** if needed
3. Paste into the account’s signature field

Outbound mail from iOS still gets the full HTML branding via Exchange transport rules (recipients see it even if compose only shows the short text).

## New employee (custom tailored)

1. Create mailbox + license in M365.
2. Copy `email-signatures\template.html` → `firstname.html` (+ `firstname-ios.txt` for iPhone paste).
3. Fill **name**, title (**Funding Advisor** unless CEO), email, Direct phone.
4. Add a row to `$map` in `Deploy-RcsComposeSignatures.ps1`.
5. Run `.\Deploy-RcsComposeSignatures.ps1`.
6. New hire: hard refresh Outlook web → **New mail**; on iPhone paste from `*-ios.txt`.

Full checklist: `Documents\Work\RAPID-CAPITAL-SOLUTIONS-PROGRESS.md` → **Email signatures (compose)**.

## Files

| File | Use |
|------|-----|
| `vincent.html` | Vincent@ — CEO + Direct (718) 814-8874 |
| `nicholas.html` | nicky@ — CEO |
| `shared-inbox.html` | info@ / submissions@ / admin@ |
| `template.html` | New hires (default title: Funding Advisor) |
| `vincent-ios.txt` / `nicholas-ios.txt` / `shared-ios.txt` | Paste into Outlook iOS Signature |
| `..\Deploy-RcsComposeSignatures.ps1` | **Canonical deploy** (compose injection) |

Hosted logo: `https://rapidcapitalsolutions.com/assets/email/rcs-logo.png?v=2`

Transport rules `RCS Signature - external/internal` append after send as backup (recipients always get branding even if a client fails).
