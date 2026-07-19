@echo off
title Rapid Capital Solutions - GitHub Setup
echo.
echo === Step 1: Login to GitHub (browser will open) ===
gh auth login -w -p https
if errorlevel 1 (
  echo.
  echo gh auth failed. Install GitHub CLI from https://cli.github.com/
  pause
  exit /b 1
)

echo.
echo === Step 2: Create repo and push site ===
cd /d "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website"

git init
git add .
git commit -m "Initial commit: Rapid Capital Solutions website"

gh repo create rapid-capital-solutions-website --private --source=. --remote=origin --push

echo.
echo === Done! ===
echo Repo URL will show above.
echo.
echo === Step 3: Enable GitHub Pages (browser) ===
echo Repo - Settings - Pages - Branch main - folder root
echo Custom domain: rapidcapitalsolutions.com
echo See GITHUB-SETUP.md for Namecheap DNS (keep email MX records!)
echo.
pause
