# Forfactor corporate website

Production website for **FORFACTOR PTY LTD** (ACN 704 173 624), built as a fully static Astro site for GitHub Pages.

Official URL: <https://www.forfactor.com>

## Local development

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

- `npm run check` — type-checks, builds and validates routes, canonical URLs, internal links, robots and sitemap.
- `npm run build` — type-checks and creates the static site in `dist/`.
- `npm run preview` — serves the production build locally.

The site has no server runtime, database, API dependency or paid infrastructure.

## GitHub Pages deployment

`.github/workflows/deploy.yml` runs on every push to `main`, installs locked dependencies, validates the project, uploads `dist/` and deploys it to GitHub Pages.

In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. Under **Custom domain**, enter `www.forfactor.com`. Enable **Enforce HTTPS** after GitHub provisions the certificate.

Before pointing DNS to GitHub, verify the domain in **GitHub account Settings → Pages → Add a domain** and add the unique TXT record GitHub provides. Do not invent or reuse a verification token.

## DNS: current state and required change

Live DNS observed on 17 November 2026:

- `forfactor.com` has GoDaddy parking A records `15.197.225.128` and `3.33.251.168`.
- `www.forfactor.com` is a CNAME to `forfactor.com`.
- Mail currently uses Zoho MX records and a Zoho SPF record.

Do not delete or replace mail records as part of the website cutover. No DNS change has been made by this repository.

### Option A — keep DNS at GoDaddy

After the repository exists and its Pages custom domain is set, use these records. For a repository under `knpelectronics`, the CNAME target is `knpelectronics.github.io`.

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 1 hour |
| A | `@` | `185.199.109.153` | 1 hour |
| A | `@` | `185.199.110.153` | 1 hour |
| A | `@` | `185.199.111.153` | 1 hour |
| CNAME | `www` | `knpelectronics.github.io` | 1 hour |

Remove only the two existing GoDaddy parking A records when adding GitHub's four A records. Replace `www → forfactor.com` with `www → knpelectronics.github.io`. Do not add the repository name to the CNAME. Keep all MX/TXT records until an email migration is deliberately performed.

With `www.forfactor.com` configured as the Pages custom domain and both hostnames pointed to Pages, GitHub redirects the apex to `https://www.forfactor.com`. GitHub also redirects the default Pages URL to the configured custom domain. HTTPS may take up to 24 hours to become available.

### Option B — move DNS management to Cloudflare

Cloudflare DNS is the simplest route if free Cloudflare Email Routing is required. This changes authoritative DNS management, not the registrar: the domain remains registered at GoDaddy.

1. Add `forfactor.com` to Cloudflare and let it import the current zone.
2. Compare every imported A, CNAME, MX and TXT record with GoDaddy. Correct omissions before continuing.
3. At GoDaddy, replace only the domain's nameservers with the two nameservers Cloudflare assigns.
4. Wait until Cloudflare reports the zone active.
5. Add the same four GitHub A records for `@` and the `www` CNAME shown above. Use **DNS only** (grey cloud) while GitHub verifies and provisions HTTPS.
6. Keep mail records unchanged unless completing the separate email migration below.

Do not run both GoDaddy and Cloudflare as authoritative DNS. The nameservers decide which zone is active.

## Email forwarding

The public address is `hello@forfactor.com`. Never publish its private forwarding destination.

### Important: current Zoho configuration

The domain currently has three Zoho MX records (`mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`) and a Zoho SPF TXT record. An active mail configuration may already exist. Test it and inspect the Zoho account before changing anything. Duplicate MX providers or multiple SPF records can break delivery.

### Cloudflare Email Routing migration

Cloudflare Email Routing requires Cloudflare authoritative DNS. Perform this only after approval and after confirming Zoho is no longer needed.

1. Complete the Cloudflare nameserver migration above without changing mail records.
2. In Cloudflare, open **Email → Email Routing** and onboard the domain.
3. Add the private destination Gmail address, open Cloudflare's verification email in Gmail and select **Verify email address**.
4. Create a routing rule for custom address `hello` to that verified destination.
5. Review the exact MX, SPF and DKIM records Cloudflare proposes.
6. In one controlled change, remove the three Zoho MX records and existing Zoho SPF record, then allow Cloudflare to add its current MX/SPF/DKIM records. Use the values shown for the zone rather than copied examples.
7. Confirm there is exactly one SPF TXT record at the root. Preserve unrelated website and verification records.
8. Send tests from two external providers. Confirm inbox arrival, sender identity, spam placement and reasonable delivery time.

Replying normally sends from Gmail, not `hello@forfactor.com`. Sending *as* that address requires a separate authenticated outbound SMTP/mail provider and can be added later.

## Google Search Console

1. Add a **Domain property** for `forfactor.com` and publish Google's unique DNS TXT record.
2. Optionally add URL-prefix properties for `https://www.forfactor.com/` and `https://forfactor.com/`.
3. Submit `https://www.forfactor.com/sitemap-index.xml` under **Sitemaps**.
4. Inspect the homepage and representative product pages. Confirm Google's selected canonical is the matching `www` URL, then request indexing.
5. Monitor **Page indexing**, **Core Web Vitals**, **HTTPS** and **Performance**.

No verification token is committed; add one only after Google provides it.

## Keenout domain strategy

Live checks on 17 November 2026 showed both `keenout.com` and `keenout.com.au` redirecting permanently to `https://www.keenout.com.au/`. This is consistent with `.com.au` as the primary site. Forfactor links to `https://keenout.com.au`, which resolves to that canonical destination.

This confirms public redirect behaviour, not legal ownership. Do not change either domain or DNS without explicit approval. Keep one content origin, permanent redirects from the secondary domain, a self-referencing canonical on the primary site, and consistent link destinations to consolidate search signals.

## SEO maintenance

- Keep titles and descriptions unique and factual.
- Add genuinely useful pages; do not publish placeholders or duplicate product-site copy.
- Link products contextually using descriptive anchor text.
- Optimise future images and provide useful alt text.
- Run `npm run check` before merging.
- Re-inspect significant updates in Search Console.
- Never promise rankings or create artificial backlink exchanges.

## Adding a product

1. Add `src/pages/products/<slug>.astro`.
2. Add a card to the products page and, if featured, the homepage.
3. Add navigation/footer links where useful.
4. Include factual copy and `BreadcrumbList` structured data.
5. Add the route to `scripts/validate-build.mjs`.
6. Run `npm run check` and review the generated page.

## Updating company information

Organization data lives in `src/layouts/BaseLayout.astro`. Footer details live in `src/components/Footer.astro`; facts also appear on About and Contact. Update every factual occurrence and do not add an ABN until confirmed.

## External launch checklist

- [ ] GitHub domain ownership verified with the unique TXT token.
- [ ] Pages source set to GitHub Actions and custom domain set to `www.forfactor.com`.
- [ ] DNS change approved and applied using one option above.
- [ ] HTTPS enforced after certificate issuance.
- [ ] Apex, HTTP and default Pages URLs redirect to canonical HTTPS `www`.
- [ ] Mail delivery tested before and after any mail migration.
- [ ] Search Console property verified and sitemap submitted.
- [ ] Public company name, ACN, country and contact email rechecked for Apple Developer organisation enrolment. The site supports legitimacy checks but cannot guarantee approval.
