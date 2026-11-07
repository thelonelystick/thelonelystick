create table if not exists public.portfolio_content (
  id text primary key default 'published' check (id = 'published'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "Public can read published portfolio" on public.portfolio_content;
create policy "Public can read published portfolio"
  on public.portfolio_content for select
  to anon, authenticated
  using (id = 'published');

drop policy if exists "Portfolio owner can insert published portfolio" on public.portfolio_content;
create policy "Portfolio owner can insert published portfolio"
  on public.portfolio_content for insert
  to authenticated
  with check (id = 'published' and (select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com');

drop policy if exists "Portfolio owner can update published portfolio" on public.portfolio_content;
create policy "Portfolio owner can update published portfolio"
  on public.portfolio_content for update
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com')
  with check (id = 'published' and (select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com');

grant select on public.portfolio_content to anon, authenticated;
grant insert, update on public.portfolio_content to authenticated;

insert into public.portfolio_content (id, content)
values (
  'published',
  $portfolio$
  {
    "heroTitle": "Building my skills.<br>Bringing ideas <span class=\"gold-text\">to life.</span>",
    "heroLead": "I'm Bhawishya, a student developer exploring web technologies, AI-powered tools, and digital products. I learn by building — one idea, one experiment, and one project at a time.",
    "heroImage": "",
    "profilePhotos": [],
    "contact": {
      "email": "sooryavanshibhawishya@gmail.com",
      "message": "Have a project idea, a suggestion, or an opportunity to learn and collaborate? I'd be glad to hear from you."
    },
    "links": [
      {"label": "GitHub", "url": "https://github.com/thelonelystick", "type": "Code"},
      {"label": "YouTube", "url": "", "type": "Video"},
      {"label": "Instagram", "url": "", "type": "Social"}
    ],
    "projects": [
      {
        "title": "AstroGPT",
        "description": "An educational Jyotisha-inspired web experience combining traditional interpretations with a modern interface and calculation-focused exploration.",
        "kind": "astro",
        "meta": "WEB PROJECT · INTERACTIVE EXPERIENCE",
        "tags": ["Web Development", "UI Design", "Research"],
        "url": "https://astro-gpt-rho.vercel.app",
        "image": "",
        "visible": true
      },
      {
        "title": "SCARLET",
        "description": "A personal assistant concept for voice and text conversations, task management, routines, and monthly budgeting.",
        "kind": "scarlet",
        "meta": "AI CONCEPT · PRODUCTIVITY",
        "tags": ["AI Assistants", "Product Thinking"],
        "url": "",
        "image": "",
        "visible": true
      },
      {
        "title": "PurpleDevs",
        "description": "A digital services brand concept for websites, customized web tools, social media support, and AI solutions.",
        "kind": "purpledevs",
        "meta": "BRAND CONCEPT · DIGITAL SERVICES",
        "tags": ["Web Services", "Branding", "AI Tools"],
        "url": "",
        "image": "",
        "visible": true
      },
      {
        "title": "FUZION COACHING INSTITUTE",
        "description": "A coaching management system concept for organizing student learning, teacher workflows, parent visibility, and administration.",
        "kind": "fuzion",
        "meta": "EDTECH CONCEPT · DASHBOARD",
        "tags": ["EdTech", "Dashboard UX", "Firebase"],
        "url": "",
        "image": "",
        "visible": true
      }
    ]
  }
  $portfolio$::jsonb
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read portfolio media" on storage.objects;
create policy "Public can read portfolio media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Portfolio owner can upload portfolio media" on storage.objects;
create policy "Portfolio owner can upload portfolio media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com'
  );

drop policy if exists "Portfolio owner can update portfolio media" on storage.objects;
create policy "Portfolio owner can update portfolio media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com'
  )
  with check (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com'
  );

drop policy if exists "Portfolio owner can delete portfolio media" on storage.objects;
create policy "Portfolio owner can delete portfolio media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() ->> 'email') = 'sooryavanshibhawishya@gmail.com'
  );
