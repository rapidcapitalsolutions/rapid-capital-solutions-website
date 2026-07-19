@echo off
set GIT="C:\Program Files\Git\bin\git.exe"
set GH="C:\Program Files\GitHub CLI\gh.exe"

if not exist %GIT% (
  echo Install Git first: https://git-scm.com/download/win
  pause
  exit /b 1
)

cd /d "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website"

if not exist .git (
  %GIT% init
  %GIT% branch -M main
  %GIT% remote add origin https://github.com/rapidcapitalsolutions/rapid-capital-solutions-website.git
)

%GIT% add .
%GIT% commit -m "Update site" 2>nul
if errorlevel 1 (
  echo Nothing new to commit, or set your git identity:
  echo   git config --global user.email "you@rapidcapitalsolutions.com"
  echo   git config --global user.name "Vincent Maccarone"
)

echo.
echo Pushing to GitHub... You may be asked to log in in the browser.
%GIT% push -u origin main

echo.
echo Next: GitHub repo - Settings - Pages - main branch - root folder
echo Custom domain should read rapidcapitalsolutions.com from CNAME file
pause
