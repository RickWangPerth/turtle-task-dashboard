insert into public.tasks (
  task_code,
  title,
  epic,
  priority,
  status,
  details,
  environment
)
values
  ('T001', 'Add No Damage checkbox', 'Data Entry Interface', 'P2', 'Backlog', 'Add a checkbox for "No Damage" in the damage section.', 'NA'),
  ('T002', 'Add No Tag Scar checkbox', 'Data Entry Interface', 'P2', 'Backlog', 'Add a checkbox for "No Tag Scar".', 'NA'),
  ('T003', 'Support more than 2 PIT tags', 'Database Backend', 'P2', 'Backlog', 'Add support for recording more than two PIT tags.', 'NA'),
  ('T004', 'Fix GPS format issue', 'Bugs', 'P1', 'Backlog', 'GPS values can appear in an incorrect long numeric format after entry.', 'NA'),
  ('T005', 'Improve filtered data downloads', 'Data Downloads', 'P3', 'Backlog', 'Allow users to download filtered task and project data.', 'NA')
on conflict (task_code) do update
set
  title = excluded.title,
  epic = excluded.epic,
  priority = excluded.priority,
  status = excluded.status,
  details = excluded.details,
  environment = excluded.environment;

select setval('public.task_code_seq', 5, true);
