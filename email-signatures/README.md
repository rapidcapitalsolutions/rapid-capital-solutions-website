# Rapid Capital Solutions — Email signatures

Outlook / Microsoft 365 signatures inspired by the Fidelity Funding stacked layout (logo → name → title → contact → company → website), restyled for RCS (ink + copper).

**Not settable via `m365` CLI** — install once per mailbox in Outlook (web or desktop).

## Files

| File | Use |
|------|-----|
| `vincent.html` | Vincent@rapidcapitalsolutions.com |
| `nicholas.html` | nicky@rapidcapitalsolutions.com |
| `shared-inbox.html` | info@ / submissions@ |
| `template.html` | Blank for new hires (add Direct phone when you have one) |

Hosted logo (required for images to show):  
`https://rapidcapitalsolutions.com/assets/email/rcs-logo.png`

## Install in Outlook on the web (recommended)

1. Open the HTML file in Chrome/Edge (double-click).
2. Select the signature block (logo through website line).
3. Copy (`Ctrl+C`).
4. Go to https://outlook.office.com → **Settings** (gear) → **Account** → **Signatures**  
   (or Mail → Compose and reply → Email signature).
5. **New signature** → name it `RCS` → paste (`Ctrl+V`).
6. Set as default for new messages and replies.
7. Save.

## Install in Outlook desktop (Windows)

1. Open the HTML in a browser → copy the signature block.
2. Outlook → **File** → **Options** → **Mail** → **Signatures**.
3. New → paste → OK.

## After you get a business phone

Edit the signature and add a line under Email:

```html
<span style="color:#5a6577;">Direct:</span> (XXX) XXX-XXXX
```

Same stack Fidelity used (`Direct:` / company / site).

## Brand notes

- Colors: ink `#0c1222`, copper `#b87333`, mist `#5a6577`
- Copper left rule = RCS accent (Fidelity used plain stack + logo)
- No fax line (Fidelity had fax; we skip it)
- Phone omitted until a real business number exists
