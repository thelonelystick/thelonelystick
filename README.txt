BHAWISHYA KUMAR SOORYAVANSHI — PERSONAL PORTFOLIO

The public portfolio is built with index.html, style.css, and script.js.
The authenticated admin dashboard is admin.html, admin.css, and admin.js.
Portfolio content and media are stored in Supabase; edits are published from
the admin dashboard and are not saved to browser storage.

SUPABASE SETUP

In the Supabase SQL Editor, run these migrations in order:
1. supabase/migrations/20261108010000_portfolio_content_and_media.sql
2. supabase/migrations/20261108022000_portfolio_site_copy.sql
3. supabase/migrations/20261108032000_whatsapp_contact.sql
4. supabase/migrations/20261108040900_organic_web_domains.sql

The fourth migration adds the initial eight organic-web domains only when a
web configuration does not already exist. It preserves all other published
content. Re-running the migrations does not overwrite later database edits.
Image uploads are limited to 8 MB per JPEG, PNG, WebP, or GIF.

DEPLOYMENT

Deploy the site, including vercel.json, so /domains/<slug> resolves to the
database-rendered domain page. Configure Google OAuth and the Supabase redirect
URL for the deployed admin page. Publishing and media changes are restricted
by the existing Supabase policies to the authorized owner account.

No build step or package installation is required. Google Fonts require an
internet connection.
