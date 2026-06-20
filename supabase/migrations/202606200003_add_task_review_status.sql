begin;

alter table public.tasks
  add column if not exists review_status text not null default 'Needs Review';

alter table public.tasks drop constraint if exists tasks_review_status_check;

alter table public.tasks
  add constraint tasks_review_status_check
  check (review_status in (
    'Needs Review',
    'Reviewed',
    'Needs More Info',
    'Rejected',
    'Duplicate'
  ));

create index if not exists tasks_review_status_idx on public.tasks(review_status);

commit;
