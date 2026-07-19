#!/usr/bin/env python3
"""Generate SEO landing pages for Rapid Capital Solutions."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "https://rapidcapitalsolutions.com"

PRODUCT_PAGES = [
    {
        "slug": "term-business-loan",
        "eyebrow": "Term Business Loan",
        "title": "Term Business Loans | Fixed-Rate Small Business Funding",
        "h1": "Term business loans with predictable monthly payments",
        "intro": "Fixed-rate term loans for expansion, acquisition, equipment, and major capital projects. Longer repayment schedules than MCA — ideal when you need structure and lower total cost on strong credit files.",
        "meta": "Term business loans for U.S. companies — fixed monthly payments, $25K–$5M, 12–60 months. Rapid Capital Solutions nationwide.",
        "service_type": "Term Business Loan",
        "sections": [
            ("what-is", "What is a term business loan?", "A term business loan provides a lump sum repaid in fixed monthly installments over a set period — typically 12 to 60 months. Unlike merchant cash advances, payments don't fluctuate with daily deposits, making cash flow planning easier."),
            ("uses", "Common uses for term loans", None),
            ("uses_list", None, [
                "Business expansion or second location build-out",
                "Equipment and fleet purchases",
                "Debt consolidation at better rates",
                "Acquisition financing",
                "Major marketing or rebranding campaigns",
            ]),
            ("qualify", "Who qualifies for term loans?", "Term products generally require 1+ years in business, 650+ FICO, and consistent profitability on bank statements. We also offer <a href=\"bad-credit-business-funding.html\">alternative programs</a> when credit is challenged but revenue is strong."),
        ],
        "related": ["working-capital.html", "business-line-of-credit.html", "equipment-financing.html", "services.html"],
    },
    {
        "slug": "equipment-financing",
        "eyebrow": "Equipment Financing",
        "title": "Equipment Financing & Business Equipment Loans | Rapid Capital Solutions",
        "h1": "Equipment financing for trucks, machinery, and more",
        "intro": "Finance vehicles, restaurant equipment, medical devices, construction machinery, and other assets. The equipment often secures the deal — which can improve approval odds and terms.",
        "meta": "Equipment financing for U.S. businesses — trucks, machinery, restaurant and medical equipment. $10K–$500K+. Rapid Capital Solutions.",
        "service_type": "Equipment Financing",
        "sections": [
            ("what-is", "What is equipment financing?", "Equipment financing uses the asset you're buying as collateral. Lenders finance a percentage of the purchase price; you repay over 24–72 months with fixed payments on most programs."),
            ("assets", "Equipment we help finance", None),
            ("assets_list", None, [
                "Commercial trucks and trailers",
                "Construction and landscaping machinery",
                "Restaurant kitchen and POS systems",
                "Medical and dental equipment",
                "Manufacturing and warehouse equipment",
            ]),
            ("vs-mca", "Equipment loan vs. merchant cash advance", "MCAs fund quickly based on revenue but cost more over time. Equipment loans may take slightly longer but offer lower rates when the asset secures the file. We compare both so you pick what fits."),
        ],
        "related": ["term-business-loan.html", "merchant-cash-advance.html", "construction-business-funding.html", "services.html"],
    },
    {
        "slug": "invoice-financing",
        "eyebrow": "Invoice Financing",
        "title": "Invoice Financing & AR Factoring | B2B Working Capital",
        "h1": "Invoice financing — get paid before your customers do",
        "intro": "B2B businesses waiting 30, 60, or 90 days on receivables can unlock cash today. Invoice financing and AR factoring convert outstanding invoices into working capital.",
        "meta": "Invoice financing and accounts receivable factoring for B2B businesses. Unlock cash from unpaid invoices. Rapid Capital Solutions nationwide.",
        "service_type": "Invoice Financing",
        "sections": [
            ("what-is", "What is invoice financing?", "Invoice financing advances a percentage of your outstanding B2B invoices — typically 80–90% — so you can cover payroll and operations while customers pay on their terms."),
            ("who", "Best fit for invoice programs", None),
            ("who_list", None, [
                "Staffing and professional services firms",
                "Wholesale and distribution companies",
                "Manufacturers selling on net terms",
                "Government or commercial contractors",
            ]),
            ("compare", "Invoice financing vs. working capital", "General <a href=\"working-capital.html\">working capital</a> works for any use. Invoice programs specifically leverage your receivables — often better rates when AR quality is strong."),
        ],
        "related": ["working-capital.html", "professional-services-business-funding.html", "wholesale-business-funding.html", "services.html"],
    },
    {
        "slug": "bridge-funding",
        "eyebrow": "Bridge Funding",
        "title": "Bridge Loans & Short-Term Business Funding | Rapid Capital Solutions",
        "h1": "Bridge funding for urgent capital needs",
        "intro": "Short-term bridge loans and fast funding for time-sensitive opportunities — inventory buys, contract mobilization, payroll gaps, or emergency repairs. Funding in 24–48 hours on many programs.",
        "meta": "Short-term bridge funding and fast business loans — 3–24 month terms, funding in 24–48 hours. Rapid Capital Solutions nationwide.",
        "service_type": "Bridge Financing",
        "sections": [
            ("what-is", "What is bridge funding?", "Bridge financing covers a short gap until longer-term funding, a receivable, or seasonal revenue arrives. Terms are typically 3–24 months with flexible early payoff on select programs."),
            ("when", "When businesses use bridge capital", None),
            ("when_list", None, [
                "Contract start-up costs before first payment",
                "Emergency equipment or facility repairs",
                "Inventory opportunities with tight deadlines",
                "Payroll during unexpected slowdowns",
                "Gap between closing on a deal and permanent financing",
            ]),
            ("speed", "How fast can bridge funding close?", "Many bridge and <a href=\"working-capital.html\">working capital</a> files fund in 24–48 hours after documents are received. Larger amounts may take slightly longer."),
        ],
        "related": ["working-capital.html", "merchant-cash-advance.html", "term-business-loan.html", "services.html"],
    },
]

INDUSTRY_PAGES = [
    ("construction-business-funding", "Construction & Contractors", "Construction Business Funding", "construction and contractor businesses", "Contractors, subs, and construction companies need capital for mobilization, materials, payroll between draws, and equipment. We place MCA, working capital, and equipment programs built for job-based cash flow.", ["Job mobilization and bonding support", "Materials and supplier payments", "Payroll between progress payments", "Fleet and heavy equipment", "Seasonal crew scaling"], "Construction files often show lumpy deposits tied to draws — we match funders who underwrite contractor bank statements correctly."),
    ("trucking-business-funding", "Trucking & Logistics", "Trucking Business Funding", "trucking and logistics companies", "Trucking companies face fuel, maintenance, insurance, and driver payroll before loads pay. We fund owner-operators and fleets nationwide with revenue-based and equipment programs.", ["Fuel and maintenance reserves", "Driver payroll between settlements", "Trailer and tractor purchases", "Insurance down payments", "Fleet expansion"], "Strong weekly deposits make many trucking companies excellent MCA candidates. Equipment financing works well for tractor and trailer purchases."),
    ("retail-business-funding", "Retail", "Retail Business Funding", "retail stores and shops", "Retailers need inventory capital before holidays, POS upgrades, and cash for slow seasons. We fund brick-and-mortar and omnichannel retail nationwide.", ["Seasonal inventory buys", "Store remodels and fixtures", "Marketing and loyalty programs", "Multi-location expansion", "E-commerce integration costs"], "Retailers with consistent card volume often qualify for <a href=\"merchant-cash-advance.html\">merchant cash advance</a> programs with fast turnaround."),
    ("healthcare-business-funding", "Healthcare & Medical", "Healthcare Business Funding", "healthcare and medical practices", "Medical practices, dental offices, clinics, and healthcare services need working capital for payroll, equipment, and patient volume swings. We place programs that understand healthcare billing cycles.", ["Medical and dental equipment", "Staffing and locum costs", "Office expansion or build-out", "Billing gap bridge financing", "Technology and EHR upgrades"], "Healthcare deposits may be irregular due to insurance remittance — we match funders experienced with medical office files."),
    ("auto-services-business-funding", "Auto Services", "Auto Repair & Service Funding", "auto repair shops and service businesses", "Auto repair, body shops, tire dealers, and quick-lube businesses need parts inventory, bay equipment, and payroll funding. Revenue-based programs fit shops with steady daily card sales.", ["Parts and inventory stocking", "Lift and bay equipment", "Marketing and customer acquisition", "Second location build-out", "Working capital for slow weeks"], "Auto service businesses with $15K+ monthly deposits often fund within 1–3 business days."),
    ("professional-services-business-funding", "Professional Services", "Professional Services Business Funding", "professional services firms", "Law firms, accounting practices, consultancies, and agencies need capital for hiring, technology, and client acquisition — without waiting on net-30 receivables.", ["Hiring and contractor scaling", "Software and infrastructure", "Office expansion", "Marketing and business development", "Invoice gap bridge financing"], "B2B firms with strong receivables may also qualify for <a href=\"invoice-financing.html\">invoice financing</a>."),
    ("beauty-wellness-business-funding", "Beauty & Wellness", "Salon & Spa Business Funding", "salons, spas, and wellness businesses", "Salons, med spas, barbershops, and wellness studios need equipment, inventory, and marketing capital. Card-heavy businesses often qualify quickly on revenue-based programs.", ["Salon build-out and stations", "Med spa equipment", "Product inventory", "Marketing and membership launches", "Additional location deposits"], "Beauty and wellness businesses with consistent daily card sales are strong MCA candidates."),
    ("manufacturing-business-funding", "Manufacturing", "Manufacturing Business Funding", "manufacturing companies", "Manufacturers need raw materials, payroll, and equipment capital before finished goods ship and customers pay. We place working capital, equipment, and invoice programs for production businesses.", ["Raw materials and supplier payments", "Production equipment upgrades", "Payroll during large orders", "Warehouse and logistics expansion", "AR bridge on net-term customers"], "Manufacturers with B2B receivables should explore <a href=\"invoice-financing.html\">invoice financing</a> alongside working capital options."),
    ("technology-business-funding", "Technology", "Technology Business Funding", "technology and SaaS companies", "Tech consultancies, MSPs, and software services firms need capital for contractors, licenses, and client project ramp-up before invoices clear.", ["Contractor and offshore team scaling", "Software licensing and infrastructure", "Sales and marketing campaigns", "Project mobilization costs", "Bridge until enterprise clients pay"], "Tech services with recurring revenue deposits may qualify for <a href=\"business-line-of-credit.html\">lines of credit</a> or revenue-based products."),
    ("ecommerce-business-funding", "E-Commerce", "E-Commerce Business Funding", "e-commerce and online retail businesses", "Online sellers need inventory capital before peak seasons, ad spend, and fulfillment scaling. We fund Amazon sellers, Shopify stores, and DTC brands nationwide.", ["Inventory before Q4 and Prime Day", "Paid ads and customer acquisition", "3PL and fulfillment setup", "SKU expansion", "Returns and chargeback reserves"], "E-commerce businesses with consistent processor deposits often qualify for fast working capital programs."),
    ("salon-spa-business-funding", "Salons & Spas", "Salon & Spa Funding", "salon and spa businesses", "Same as beauty/wellness — dedicated page for salon/spa search terms. Fund build-outs, equipment, inventory, and marketing for hair, nail, med spa, and day spa businesses.", ["Station and suite build-outs", "Med spa devices and lasers", "Retail product lines", "Grand opening marketing", "Staff hiring and training"], "See also <a href=\"beauty-wellness-business-funding.html\">beauty &amp; wellness funding</a> for related programs."),
    ("landscaping-business-funding", "Landscaping", "Landscaping Business Funding", "landscaping and lawn care companies", "Landscaping companies face seasonal revenue swings, equipment costs, and crew payroll before contracts pay. Spring ramp-up often requires upfront capital.", ["Mower, truck, and trailer purchases", "Spring crew hiring and payroll", "Fuel and supply stocking", "Commercial contract mobilization", "Off-season bridge capital"], "Seasonal businesses benefit from <a href=\"merchant-cash-advance.html\">MCA</a> remittance that scales with busy-season deposits."),
    ("hospitality-business-funding", "Hospitality", "Hospitality Business Funding", "hotels, motels, and hospitality businesses", "Hotels, motels, B&Bs, and hospitality operators need renovation capital, staffing, and seasonal bridge funding. See also <a href=\"restaurant-business-funding.html\">restaurant funding</a> for food service.", ["Property renovations and FF&E", "Staffing for peak season", "Marketing and OTA strategy", "Pool, amenity, and compliance upgrades", "Bridge during occupancy dips"], "Hospitality files vary widely — a specialist reviews your deposit pattern before matching programs."),
    ("wholesale-business-funding", "Wholesale", "Wholesale Business Funding", "wholesale and distribution businesses", "Wholesalers and distributors tie up cash in inventory and net-term receivables. Invoice and working capital programs unlock cash tied in the supply chain.", ["Large inventory purchases", "Warehouse and logistics expansion", "Supplier payment terms bridge", "Sales team scaling", "AR financing on net-30 accounts"], "<a href=\"invoice-financing.html\">Invoice financing</a> is often the best fit for established wholesale operations."),
    ("staffing-business-funding", "Staffing", "Staffing Agency Funding", "staffing and recruiting agencies", "Staffing agencies pay employees weekly while clients pay on net 30–60. Payroll gap financing and invoice programs are built for this model.", ["Weekly payroll before client payment", "Recruiting technology and job boards", "Office expansion", "Temp worker onboarding costs", "Invoice advance on placed accounts"], "Staffing is one of the strongest use cases for <a href=\"invoice-financing.html\">invoice financing</a>."),
    ("real-estate-business-funding", "Real Estate", "Real Estate Business Funding", "real estate investors and businesses", "Real estate investors, property managers, and brokerages need capital for marketing, renovations, and operational gaps. Select programs available for qualifying real estate businesses.", ["Fix-and-flip bridge (select programs)", "Property management operating capital", "Marketing and lead generation", "Office and team expansion", "Renovation before lease-up"], "Real estate files are reviewed individually — disclose entity structure and revenue sources upfront."),
]

FOOTER_GUIDES = """        <div class="footer-col">
          <h4>Funding Guides</h4>
          <ul>
            <li><a href="merchant-cash-advance.html">Merchant Cash Advance</a></li>
            <li><a href="working-capital.html">Working Capital</a></li>
            <li><a href="business-line-of-credit.html">Line of Credit</a></li>
            <li><a href="bad-credit-business-funding.html">Bad Credit Funding</a></li>
            <li><a href="term-business-loan.html">Term Business Loans</a></li>
            <li><a href="equipment-financing.html">Equipment Financing</a></li>
            <li><a href="invoice-financing.html">Invoice Financing</a></li>
            <li><a href="bridge-funding.html">Bridge Funding</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Industries</h4>
          <ul>
            <li><a href="restaurant-business-funding.html">Restaurants</a></li>
            <li><a href="construction-business-funding.html">Construction</a></li>
            <li><a href="trucking-business-funding.html">Trucking</a></li>
            <li><a href="healthcare-business-funding.html">Healthcare</a></li>
            <li><a href="retail-business-funding.html">Retail</a></li>
            <li><a href="industries.html">All industries →</a></li>
          </ul>
        </div>"""

HEADER = """  <header class="site-header">
    <div class="container nav-inner">
      <a href="index.html" class="logo">
        <div class="logo-mark">R</div>
        <div class="logo-text">Rapid Capital Solutions<span>Business Funding &amp; Working Capital</span></div>
      </a>
      <nav>
        <ul class="nav-links">
          <li><a href="about.html">About</a></li>
          <li><a href="services.html">Programs</a></li>
          <li><a href="team.html">Team</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </nav>
      <div class="nav-cta">
        <a href="tel:+18885550100" class="btn btn-outline">Call Us</a>
        <a href="apply.html" class="btn btn-primary">Get Funded</a>
        <button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>"""

FOOTER = f"""  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo" style="color:#fff">
            <div class="logo-mark">R</div>
            <div class="logo-text">Rapid Capital Solutions<span>Business Funding &amp; Working Capital</span></div>
          </a>
          <p>We help small and mid-sized businesses access working capital, lines of credit, and growth financing — fast, flexible, and nationwide.</p>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="team.html">Our Team</a></li>
            <li><a href="services.html">Programs</a></li>
            <li><a href="careers.html">Careers</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
{FOOTER_GUIDES}
        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms of Use</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:info@rapidcapitalsolutions.com">info@rapidcapitalsolutions.com</a></li>
            <li><a href="mailto:submissions@rapidcapitalsolutions.com">submissions@rapidcapitalsolutions.com</a></li>
            <li><a href="tel:+18885550100">(888) 555-0100</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Rapid Capital Solutions. All rights reserved.</span>
        <span><a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms &amp; Conditions</a></span>
      </div>
    </div>
  </footer>
  <script src="js/main.js"></script>"""


def render_product(page: dict) -> str:
    slug = page["slug"]
    url = f"{DOMAIN}/{slug}.html"
    toc = []
    body_parts = []
    for sec in page["sections"]:
        sid, heading, content = sec
        if sid.endswith("_list"):
            items = content
            body_parts.append(f"          <ul>\n" + "\n".join(f"            <li>{i}</li>" for i in items) + "\n          </ul>")
            continue
        toc.append((sid, heading.replace("What is a ", "").replace("What is ", "").split(" —")[0][:40]))
        body_parts.append(f'          <h2 id="{sid}">{heading}</h2>')
        if content:
            body_parts.append(f"          <p>{content}</p>")

    related = "\n".join(f'            <a href="{r}">{Path(r).stem.replace("-", " ").title()}</a>' for r in page["related"])
    toc_html = "\n".join(f'            <li><a href="#{sid}">{label}</a></li>' for sid, label in toc)

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                    {"@type": "ListItem", "position": 2, "name": page["eyebrow"], "item": url},
                ],
            },
            {
                "@type": "FinancialService",
                "name": f"{page['eyebrow']} — Rapid Capital Solutions",
                "url": url,
                "description": page["meta"],
                "areaServed": "US",
                "serviceType": page["service_type"],
            },
        ],
    }
    schema_json = json.dumps(schema, indent=2)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{page['meta']}">
  <title>{page['title']} | Rapid Capital Solutions</title>
  <link rel="canonical" href="{url}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Rapid Capital Solutions">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{page['title']} | Rapid Capital Solutions">
  <meta property="og:description" content="{page['intro'][:160]}">
  <meta property="og:image" content="{DOMAIN}/og-image.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <script type="application/ld+json">
{schema_json}
  </script>
</head>
<body>
{HEADER}
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="eyebrow">{page['eyebrow']}</div>
        <h1>{page['h1']}</h1>
        <p>{page['intro']}</p>
        <div style="margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap">
          <a href="apply.html" class="btn btn-copper">Apply Now</a>
          <a href="tel:+18885550100" class="btn btn-outline">Speak With a Specialist</a>
        </div>
      </div>
    </section>
    <section>
      <div class="container seo-layout">
        <article class="seo-prose">
{chr(10).join(body_parts)}
          <div class="funding-cta-bar">
            <div>
              <strong style="font-size:1.25rem;display:block;margin-bottom:0.35rem">Ready to explore your options?</strong>
              <p>Free pre-qualification. Soft credit pull on many programs. No obligation to accept an offer.</p>
            </div>
            <a href="apply.html" class="btn btn-copper">Start Application</a>
          </div>
          <div class="related-funding">
{related}
          </div>
        </article>
        <aside class="content-toc" aria-label="Table of contents">
          <h2>On this page</h2>
          <ol>
{toc_html}
          </ol>
        </aside>
      </div>
    </section>
  </main>
{FOOTER}
</body>
</html>
"""


def render_industry(slug, eyebrow, title, h1_suffix, intro, uses, extra) -> str:
    url = f"{DOMAIN}/{slug}.html"
    name = title.replace(" Funding", "").replace(" Business", "")
    uses_html = "\n".join(f"            <li>{u}</li>" for u in uses)
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                    {"@type": "ListItem", "position": 2, "name": name, "item": url},
                ],
            },
            {
                "@type": "FinancialService",
                "name": f"{title} — Rapid Capital Solutions",
                "url": url,
                "description": intro[:200],
                "areaServed": "US",
                "serviceType": title,
            },
        ],
    }
    schema_json = json.dumps(schema, indent=2)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{title} for U.S. businesses — working capital, MCA, and equipment programs. Fast funding nationwide. Rapid Capital Solutions.">
  <title>{title} | Rapid Capital Solutions</title>
  <link rel="canonical" href="{url}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta name="robots" content="index, follow">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{title} | Rapid Capital Solutions">
  <meta property="og:description" content="{intro[:160]}">
  <meta property="og:image" content="{DOMAIN}/og-image.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <script type="application/ld+json">
{schema_json}
  </script>
</head>
<body>
{HEADER}
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="eyebrow">{eyebrow}</div>
        <h1>{title} for {h1_suffix}</h1>
        <p>{intro}</p>
        <div style="margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap">
          <a href="apply.html" class="btn btn-copper">Apply for {eyebrow} Funding</a>
          <a href="tel:+18885550100" class="btn btn-outline">Speak With a Specialist</a>
        </div>
      </div>
    </section>
    <section>
      <div class="container seo-layout">
        <article class="seo-prose">
          <h2 id="uses">Common funding uses</h2>
          <ul>
{uses_html}
          </ul>
          <h2 id="programs">Programs for {eyebrow.lower()}</h2>
          <p>{extra}</p>
          <p>Explore <a href="merchant-cash-advance.html">merchant cash advance</a>, <a href="working-capital.html">working capital</a>, and <a href="equipment-financing.html">equipment financing</a> — or view <a href="services.html">all programs</a>.</p>
          <div class="funding-cta-bar">
            <div>
              <strong style="font-size:1.25rem;display:block;margin-bottom:0.35rem">Get matched to the right funder</strong>
              <p>One application — we shop multiple programs for {eyebrow.lower()} files every day.</p>
            </div>
            <a href="apply.html" class="btn btn-copper">Apply Now</a>
          </div>
          <div class="related-funding">
            <a href="bad-credit-business-funding.html">Bad Credit Funding</a>
            <a href="business-line-of-credit.html">Line of Credit</a>
            <a href="industries.html">All Industries</a>
            <a href="services.html">All Programs</a>
          </div>
        </article>
        <aside class="content-toc" aria-label="Table of contents">
          <h2>On this page</h2>
          <ol>
            <li><a href="#uses">Funding uses</a></li>
            <li><a href="#programs">Programs</a></li>
          </ol>
        </aside>
      </div>
    </section>
  </main>
{FOOTER}
</body>
</html>
"""


def main():
    created = []
    for page in PRODUCT_PAGES:
        path = ROOT / f"{page['slug']}.html"
        path.write_text(render_product(page), encoding="utf-8")
        created.append(path.name)

    for args in INDUSTRY_PAGES:
        slug = args[0]
        path = ROOT / f"{slug}.html"
        path.write_text(render_industry(*args), encoding="utf-8")
        created.append(path.name)

    print(f"Created/updated {len(created)} landing pages")
    for name in sorted(created):
        print(f"  {name}")


if __name__ == "__main__":
    main()
