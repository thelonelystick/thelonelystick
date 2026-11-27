create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (
    char_length(email) <= 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.contact_messages enable row level security;

drop policy if exists "Visitors can submit contact messages" on public.contact_messages;
create policy "Visitors can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 100
    and char_length(email) <= 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and char_length(message) between 1 and 4000
    and read_at is null
  );

drop policy if exists "Portfolio owner can read contact messages" on public.contact_messages;
create policy "Portfolio owner can read contact messages"
  on public.contact_messages for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin');

drop policy if exists "Portfolio owner can update contact messages" on public.contact_messages;
create policy "Portfolio owner can update contact messages"
  on public.contact_messages for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin');

drop policy if exists "Portfolio owner can delete contact messages" on public.contact_messages;
create policy "Portfolio owner can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin');

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
