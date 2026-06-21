begin;

alter table public.tasks
  add column if not exists implementation_plan text,
  add column if not exists completion_notes text;

commit;
