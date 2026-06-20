begin;

create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  goal text,
  start_date date,
  end_date date,
  status text not null default 'Planning' check (status in ('Planning', 'Active', 'Completed')),
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists sprint_id uuid references public.sprints(id),
  add column if not exists assignee_id uuid references public.profiles(id);

create index if not exists sprints_status_idx on public.sprints(status);
create index if not exists tasks_sprint_id_idx on public.tasks(sprint_id);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);

alter table public.tasks drop constraint if exists tasks_status_check;

update public.tasks
set status = case status
  when 'To Do' then 'Backlog'
  when 'Info Needed' then 'Backlog'
  when 'In Progress' then 'In Progress'
  when 'Under Test' then 'Review/UAT'
  when 'Go Prod' then 'Done'
  when 'Done' then 'Done'
  when 'Closed' then 'Done'
  else status
end;

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('Backlog', 'Ready', 'In Progress', 'Review/UAT', 'Blocked', 'Done'));

alter table public.sprints enable row level security;

create policy "Authenticated users can read sprints"
on public.sprints for select
to authenticated
using (true);

create policy "Admins can insert sprints"
on public.sprints for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "Admins can update sprints"
on public.sprints for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "Admins can delete sprints"
on public.sprints for delete
to authenticated
using (public.current_user_role() = 'admin');

grant select, insert, update, delete on public.sprints to authenticated;

commit;
