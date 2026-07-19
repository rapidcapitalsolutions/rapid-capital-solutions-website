# Point rapidcapitalsolutions.com to your website (Namecheap)

**Keep all Microsoft 365 email records.** Only ADD the website records below.

## Step 1 — Deploy site to Netlify (free)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and sign up/log in (use Google or email).
2. Drag the entire `rapid-capital-solutions-website` folder onto the page.
3. Netlify gives you a URL like `random-name-123.netlify.app` — copy it.
4. In Netlify: **Site configuration → Domain management → Add a domain → `rapidcapitalsolutions.com`**
5. Netlify shows DNS records to add — use the ones below if they match.

## Step 2 — Namecheap Advanced DNS

1. [namecheap.com](https://www.namecheap.com) → **Domain List** → **Manage** → **Advanced DNS**
2. **Do not delete** existing MX / Microsoft verification TXT records.
3. Add or update these for the **website**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `75.2.60.5` | Automatic |
| **CNAME** | `www` | `YOUR-SITE.netlify.app` | Automatic |

Replace `YOUR-SITE.netlify.app` with your actual Netlify subdomain.

4. Remove any old **URL Redirect** or **Parking** records on `@` if they conflict with the A record.
5. Wait 15 minutes–2 hours for DNS to propagate.

## Step 3 — HTTPS

In Netlify → Domain management → enable **HTTPS** (Let's Encrypt, automatic).

## Step 4 — Verify

- https://rapidcapitalsolutions.com
- https://www.rapidcapitalsolutions.com (Netlify can redirect www → apex in domain settings)

## Email stays on Microsoft 365

These records must **remain** (yours should already look like this):

| Type | Host | Value |
|------|------|-------|
| MX | `@` | `rapidcapitalsolutions-com.mail.protection.outlook.com` (priority 0) |
| TXT | `@` | SPF include for Microsoft |
| CNAME | `autodiscover` | `autodiscover.outlook.com` |

Website A record + email MX can coexist on the same domain.
