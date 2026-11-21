-- Require an administrator role stored in Supabase app_metadata.
-- Set auth.users.app_metadata = jsonb_set(COALESCE(app_metadata, '{}'::jsonb), '{role}', '"portfolio_admin"', true)
-- for the authorized account in the Supabase dashboard or an administrative SQL session.

update public.portfolio_content
set content = jsonb_set(content, '{contact,email}', '""'::jsonb, true)
where id = 'published';

alter table public.portfolio_content enable row level security;

drop policy if exists "Portfolio owner can insert published portfolio" on public.portfolio_content;
create policy "Portfolio owner can insert published portfolio"
  on public.portfolio_content for insert
  to authenticated
  with check (
    id = 'published'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin'
  );

drop policy if exists "Portfolio owner can update published portfolio" on public.portfolio_content;
create policy "Portfolio owner can update published portfolio"
  on public.portfolio_content for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin')
  with check (
    id = 'published'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin'
  );

drop policy if exists "Portfolio owner can upload portfolio media" on storage.objects;
create policy "Portfolio owner can upload portfolio media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin'
  );

drop policy if exists "Portfolio owner can update portfolio media" on storage.objects;
create policy "Portfolio owner can update portfolio media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin'
  )
  with check (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin'
  );

drop policy if exists "Portfolio owner can delete portfolio media" on storage.objects;
create policy "Portfolio owner can delete portfolio media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin'
  );
