# Subpath Laboratory

Company and product website for Subpath Laboratory. Korean and English, static HTML/CSS, no client-side dependencies, analytics, ads or forms.

## Development

Node.js 20 or newer. No package installation is required.

```sh
npm run build
npm test
```

Edit `tools/content.mjs`, `tools/build.mjs` and `assets/styles.css`. The root HTML, CNAME, robots and sitemap are generated. Open `index.html` locally for a preview.

## Deployment

The existing GitHub Pages repository publishes the `main` branch root. The production domain is set in `tools/content.mjs` and must match DNS and the GitHub Pages custom domain. Do not change MX, mail-verification TXT or unrelated subdomain records.

`subpathlabo.com` is the intended canonical domain. Until Cloudflare access and HTTPS readiness are verified, this checkout retains the working `subpathlaboratory.com` CNAME. After migration, the long domain should permanently redirect to the canonical site through Cloudflare; old blog paths should not serve the retired blog content.

The old blog is preserved in Git history. The operator also has a byte-verified local backup outside the public website repository. Do not publish backups, credentials, business identity documents or home-address information.

## Content and assets

- Byeongyeokfit: pre-release military-life organizer. Screenshots are the project's September 28, 2026 QA/demo images, not live personal information.
- Freeze Tag: Penguins vs Seals: pre-release multiplayer game. Actual gameplay image from `https://superjumpchallenger.com/img/shot-1.webp`, accessed October 8, 2026.
- Product dates, store availability, subscriptions, unverified statistics and unnamed projects are deliberately omitted.
- Existing company artwork has not yet been located. The site uses the company name as text; no replacement logo is presented as official artwork.
- Privacy statement reference: GitHub Pages documentation, https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection.

Public business contact: jaesic@subpathlabo.com.
