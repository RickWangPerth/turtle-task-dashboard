begin;

alter table public.tasks drop constraint if exists tasks_status_check;

update public.tasks
set status = 'To Do'
where status = 'Ready';

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('Backlog', 'To Do', 'In Progress', 'Review/UAT', 'Blocked', 'Done'));

commit;
