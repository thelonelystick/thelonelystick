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
