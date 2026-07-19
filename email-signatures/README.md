# Rapid Capital Solutions — Email signatures

Outlook signatures inspired by Fidelity’s stacked layout (logo → name → title → Direct → email → company → website), restyled for RCS (ink + copper).

## Can `m365` CLI set signatures?

**No.** Microsoft Graph / `m365 outlook mailbox settings` has **no signature field**.  
Signatures for Outlook on the web are set with **Exchange Online PowerShell**:

```powershell
Set-MailboxMessageConfiguration -Identity user@... -SignatureHtml '...' -AutoAddSignature $true
```

## Push via PowerShell (one command)

1. Open **Windows PowerShell** on this PC (not the agent — needs your browser login).
2. Run:

```powershell
cd C:\Users\Vinny\Documents\Work
.\Set-RcsEmailSignatures.ps1
```

Sign in as `Vincent@rapidcapitalsolutions.com` when the Microsoft login window appears.

That script will:
- Postpone roaming signatures (so admin HTML applies)
- Set signatures on Vincent, nicky, info, submissions, admin

## Files

| File | Use |
|------|-----|
| `vincent.html` | Vincent@ — includes Direct **(718) 814-8874** from M365 profile |
| `nicholas.html` | nicky@ |
| `shared-inbox.html` | info@ / submissions@ / admin@ |
| `template.html` | New hires |
| `..\Set-RcsEmailSignatures.ps1` | Apply all via Exchange Online |

Hosted logo: `https://rapidcapitalsolutions.com/assets/email/rcs-logo.png`

## Scope note

Exchange `SignatureHtml` applies to **Outlook on the web** (and New Outlook when roaming is postponed). Classic Outlook desktop may still need one paste, or it may pick up the roaming/OWA signature after sync.
