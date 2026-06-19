create extension if not exists pgcrypto;

create sequence if not exists public.task_code_seq start with 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'team' check (role in ('admin', 'developer', 'team', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text unique not null,
  title text not null,
  epic text,
  priority text not null default 'P2' check (priority in ('P1', 'P2', 'P3')),
  status text not null default 'To Do' check (status in ('To Do', 'Info Needed', 'In Progress', 'Under Test', 'Done', 'Go Prod', 'Closed')),
  requester text,
  owner_id uuid references public.profiles(id),
  details text,
  decision_needed text,
  acceptance_criteria text,
  client_comment text,
  environment text not null default 'NA' check (environment in ('Local', 'UAT', 'PROD', 'NA')),
  related_url text,
  screenshot_url text,
  start_date date,
  due_date date,
  uat_date date,
  prod_date date,
  version text,
  commit_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  from_status text,
  to_status text,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  label text,
  url text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
create index if not exists tasks_epic_idx on public.tasks(epic);
create index if not exists tasks_owner_id_idx on public.tasks(owner_id);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists task_comments_task_id_idx on public.task_comments(task_id);
create index if not exists task_status_history_task_id_idx on public.task_status_history(task_id);

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.set_task_code()
returns trigger
language plpgsql
as $$
begin
  if new.task_code is null or btrim(new.task_code) = '' then
    new.task_code := 'T' || lpad(nextval('public.task_code_seq')::text, 3, '0');
  end if;

  return new;
end;
$$;

create or replace function public.set_task_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  if new.requester is null then
    select coalesce(display_name, email)
    into new.requester
    from public.profiles
    where id = auth.uid();
  end if;

  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.record_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.task_status_history (
      task_id,
      from_status,
      to_status,
      changed_by
    )
    values (
      new.id,
      old.status,
      new.status,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'team'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists set_task_code_before_insert on public.tasks;
create trigger set_task_code_before_insert
before insert on public.tasks
for each row execute function public.set_task_code();

drop trigger if exists set_task_defaults_before_insert on public.tasks;
create trigger set_task_defaults_before_insert
before insert on public.tasks
for each row execute function public.set_task_defaults();

drop trigger if exists set_tasks_updated_at_before_update on public.tasks;
create trigger set_tasks_updated_at_before_update
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists record_task_status_change_after_update on public.tasks;
create trigger record_task_status_change_after_update
after update of status on public.tasks
for each row execute function public.record_task_status_change();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_status_history enable row level security;
alter table public.task_attachments enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "Authenticated users can read tasks"
on public.tasks for select
to authenticated
using (true);

create policy "Admin and developer can insert tasks"
on public.tasks for insert
to authenticated
with check (public.current_user_role() in ('admin', 'developer'));

create policy "Team users can insert tasks"
on public.tasks for insert
to authenticated
with check (public.current_user_role() = 'team' and created_by = auth.uid());

create policy "Admin and developer can update tasks"
on public.tasks for update
to authenticated
using (public.current_user_role() in ('admin', 'developer'))
with check (public.current_user_role() in ('admin', 'developer'));

create policy "Team users can update tasks they created"
on public.tasks for update
to authenticated
using (public.current_user_role() = 'team' and created_by = auth.uid())
with check (public.current_user_role() = 'team' and created_by = auth.uid());

create policy "Admin and developer can delete tasks"
on public.tasks for delete
to authenticated
using (public.current_user_role() in ('admin', 'developer'));

create policy "Authenticated users can read comments"
on public.task_comments for select
to authenticated
using (true);

create policy "Admin developer and team users can comment"
on public.task_comments for insert
to authenticated
with check (public.current_user_role() in ('admin', 'developer', 'team') and author_id = auth.uid());

create policy "Admin and developer can delete comments"
on public.task_comments for delete
to authenticated
using (public.current_user_role() in ('admin', 'developer'));

create policy "Authenticated users can read status history"
on public.task_status_history for select
to authenticated
using (true);

create policy "Authenticated users can read attachments"
on public.task_attachments for select
to authenticated
using (true);

create policy "Admin and developer can insert attachments"
on public.task_attachments for insert
to authenticated
with check (public.current_user_role() in ('admin', 'developer') and created_by = auth.uid());

create policy "Team users can insert attachments for their tasks"
on public.task_attachments for insert
to authenticated
with check (
  public.current_user_role() = 'team'
  and created_by = auth.uid()
  and exists (
    select 1 from public.tasks
    where tasks.id = task_attachments.task_id
    and tasks.created_by = auth.uid()
  )
);
