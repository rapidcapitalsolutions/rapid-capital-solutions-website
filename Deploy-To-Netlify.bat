@echo off
echo Opening Netlify Drop and your website folder...
echo.
echo 1. Log in at Netlify if asked
echo 2. Drag ALL files from the folder onto the page (or use the zip on Documents\Work)
echo 3. After deploy: Domain management - add rapidcapitalsolutions.com
echo 4. Then follow NAMECHEAP-DNS.md for DNS records
echo.
start https://app.netlify.com/drop
start "" "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website"
start "" "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website\NAMECHEAP-DNS.md"
pause
