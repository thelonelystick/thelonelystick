<div align="center">

# thelonelystick

### Overview -> https://thelonelystick.vercel.app

</div>

## About

Hi, I'm **Bhawishya Kumar Sooryavanshi**.

I'm a Computer Science student specializing in Cybersecurity, passionate about building secure software, exploring offensive security, and continuously learning how systems work under the hood.

I enjoy turning ideas into practical projects while improving my skills in software engineering and security research.

---

## Currently Learning

- Application Security
- Offensive Security
- Linux
- System Design
- Cloud Computing
- Artificial Intelligence

---

## Tech Stack

**Languages**

```text
C++ • Python • JavaScript • TypeScript • SQL
```

**Frontend**

```text
React • Next.js • Vite • Tailwind CSS
```

**Backend**

```text
Node.js • Express • Firebase • PostgreSQL
```

**Security & Tools**

```text
Linux • Git • Docker • Burp Suite • Nmap • Wireshark
```

---

> **Turning Curiosity Into Capability.**

## Publishing portfolio content

The admin studio publishes through Supabase; it does not save portfolio content or media to browser storage. Run [`supabase/migrations/20261108010000_portfolio_content_and_media.sql`](./supabase/migrations/20261108010000_portfolio_content_and_media.sql), then [`supabase/migrations/20261108022000_portfolio_site_copy.sql`](./supabase/migrations/20261108022000_portfolio_site_copy.sql), in order in the Supabase SQL Editor for the project configured in `admin.js`. The first idempotent setup creates the public-readable, owner-writeable content table, inserts the initial projects only if no published record exists, and creates the public-read, owner-writeable `portfolio-media` image bucket. The second migration moves the existing homepage copy into the database and fills the database-backed page-copy fields without overwriting existing page-copy changes. Re-running the SQL does not overwrite your saved portfolio. Storage uploads are limited to 8 MB per JPEG, PNG, WebP, or GIF.

The migrations restrict publishing and media changes to `sooryavanshibhawishya@gmail.com`. Configure Google OAuth and the Supabase redirect URL for the deployed admin page as before. The public page renders its projects, profile information, and homepage copy from the published database record; it does not show hard-coded project/content fallbacks if the database is unavailable. The admin likewise requires published database content before allowing edits. If either migration has not been applied, apply both SQL scripts in order and reload the page. Subsequent code deployments and repeated migration runs leave the published database record intact.
