#!/usr/bin/env python3
"""Regenerate sitemap.xml with all public HTML pages."""
from pathlib import Path
import re
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "https://rapidcapitalsolutions.com"

PRIORITY = {
    "index.html": 1.0,
    "apply.html": 0.95,
    "contact.html": 0.9,
    "services.html": 0.85,
    "about.html": 0.8,
    "funding-guides.html": 0.85,
    "industries.html": 0.85,
}

PRODUCT_SLUGS = {
    "merchant-cash-advance.html", "working-capital.html", "business-line-of-credit.html",
    "bad-credit-business-funding.html", "term-business-loan.html", "equipment-financing.html",
    "invoice-financing.html", "bridge-funding.html",
}

INDUSTRY_SLUGS = {p.name for p in ROOT.glob("*-business-funding.html")} - PRODUCT_SLUGS
INDUSTRY_SLUGS.add("restaurant-business-funding.html")


def priority_for(name: str) -> str:
    if name in PRIORITY:
        return f"{PRIORITY[name]:.2f}"
    if name in PRODUCT_SLUGS:
        return "0.88"
    if name in INDUSTRY_SLUGS:
        return "0.82"
    if name in ("team.html", "careers.html"):
        return "0.55"
    return "0.3"


def changefreq_for(name: str) -> str:
    if name == "index.html":
        return "weekly"
    if name in ("privacy.html", "terms.html"):
        return "yearly"
    return "monthly"


def main():
    pages = sorted(p.name for p in ROOT.glob("*.html"))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for name in pages:
        loc = f"{DOMAIN}/" if name == "index.html" else f"{DOMAIN}/{name}"
        lines.append(f"  <url><loc>{loc}</loc><changefreq>{changefreq_for(name)}</changefreq><priority>{priority_for(name)}</priority></url>")
    lines.append("</urlset>")
    lines.append("")
    out = ROOT / "sitemap.xml"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(pages)} URLs to {out}")


if __name__ == "__main__":
    main()
