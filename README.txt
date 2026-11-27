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
5. supabase/migrations/20261122000000_admin_role.sql
6. supabase/migrations/20261128000000_contact_inbox.sql

For a fresh database, run the migrations in order. For an existing deployment
that already has the first five migrations, apply only the new contact-inbox
migration. Do not rerun the admin-role migration on a live site: it resets the
published contact email while updating owner policies.

The organic-web migration adds the initial eight domains only when a web
configuration does not already exist, preserving other published content.
The contact inbox migration creates the public message-submission table; only
the authorized portfolio owner can read or manage submitted messages. Set the
authorized owner's Supabase app_metadata role to portfolio_admin as described
in the admin-role migration. Image uploads are limited to 8 MB per JPEG, PNG,
WebP, or GIF.

The public contact form and admin inbox both use the configured Supabase
project. Admin content updates, domain assignments, and inbox reads require
the runtime Supabase URL and publishable key described below.

DEPLOYMENT

Deploy the site, including vercel.json, so /domains/<slug> resolves to the
database-rendered domain page. Configure Google OAuth and the Supabase redirect
URL for the deployed admin page. Publishing and media changes are restricted
by the existing Supabase policies to the authorized owner account.

No build step or package installation is required. Google Fonts require an
internet connection.
