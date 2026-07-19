# GitHub only — private repo + live website

Your **code stays private**. The **website** is still public at your domain.

## 1. Create private repo

1. **[github.com/new](https://github.com/new)**
2. Name: `rapid-capital-solutions-website`
3. **Private** ← use this
4. Create repository
5. **Upload files** → drag everything from this folder → Commit

Nobody can see your repo unless you invite them.

---

## 2. Turn on GitHub Pages (hosts the site — no Netlify)

1. Repo → **Settings** → **Pages**
2. **Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** → folder **/ (root)** → Save
3. Wait 1–2 min — site live at `https://YOURUSERNAME.github.io/rapid-capital-solutions-website/`

---

## 3. Custom domain (rapidcapitalsolutions.com)

Still in **Settings → Pages → Custom domain**:

Enter: `rapidcapitalsolutions.com` → Save → enable **Enforce HTTPS** when offered.

### Namecheap Advanced DNS

**Keep all Microsoft email records (MX, SPF, autodiscover).** Add/update for website:

| Type | Host | Value |
|------|------|-------|
| **A** | `@` | `185.199.108.153` |
| **A** | `@` | `185.199.109.153` |
| **A** | `@` | `185.199.110.153` |
| **A** | `@` | `185.199.111.153` |
| **CNAME** | `www` | `YOURUSERNAME.github.io` |

Replace `YOURUSERNAME` with your GitHub username.

**Note:** You can have GitHub **A** records and Microsoft **MX** on `@` at the same time — email and website both work.

---

## 4. After setup — how updates work

- I edit files locally → push to GitHub
- GitHub Pages redeploys automatically (~1 min)
- Repo stays **private**, site stays **public**

---

## Optional: push from PC (one-time login)

Install [Git](https://git-scm.com/) + [GitHub CLI](https://cli.github.com/), then:

```powershell
gh auth login
cd "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website"
git init
git add .
git commit -m "Initial commit"
gh repo create rapid-capital-solutions-website --private --source=. --push
```

Then enable Pages (step 2 above).
