# Alice Tan Real Estate — Website

Static, mobile-first real estate agent website scaffold.

## Next inputs needed
- Domain choice + registrar (recommended: Cloudflare Registrar)
- Headshot image (prefer: 2000px wide JPG/WEBP)
- Logo (prefer: SVG or transparent PNG)
- Brokerage name + office address (if applicable)
- Preferred primary cities/ZIPs served

## Deploy targets
- Cloudflare Pages (recommended)
- Netlify / Vercel (also fine)

## Contact form (email)
The contact form posts to a Cloudflare Pages Function at `POST /api/contact`.

### Configure (Cloudflare Pages)
In **Pages → Settings → Environment variables**, add:
- `RESEND_API_KEY` (required)
- `CONTACT_TO_EMAIL` (optional; defaults to `homesbyalicetan@gmail.com`)
- `CONTACT_FROM_EMAIL` (optional; defaults to `onboarding@resend.dev`)

Notes:
- For production, you should verify a domain in Resend and set `CONTACT_FROM_EMAIL` to something like `contact@homesbyalicetan.com`.
- `reply_to` is set to the visitor’s email, so Alice can hit “Reply” in Gmail.

## Pages planned
- Home
- Property Search (IDX placeholder)
- Featured Listings
- Sold Listings
- About Alice Tan
- Buying
- Selling
- Testimonials
- Areas Served
- Contact
- Privacy
