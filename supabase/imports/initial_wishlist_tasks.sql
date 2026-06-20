-- One-time initial Turtle wishlist import.
-- Run manually after migrations. This inserts directly into public.tasks.
-- No import batch table is used.

insert into public.tasks (
  title,
  epic,
  priority,
  status,
  review_status,
  requester,
  details,
  environment
)
select
  imported.title,
  imported.epic,
  imported.priority,
  'Backlog',
  'Needs Review',
  imported.requester,
  imported.details,
  'NA'
from (
  values
    (
      'Add No Damage checkbox',
      'Data Entry Interface',
      'P3',
      'Turtle Team',
      'Original wishlist text: Add a checkbox for "No Damage" in the damage section.'
    ),
    (
      'Add No Tag Scar checkbox',
      'Data Entry Interface',
      'P3',
      'Turtle Team',
      'Original wishlist text: Add a checkbox for "No Tag Scar".'
    ),
    (
      'Support more than 2 PIT tags',
      'Database Backend',
      'P3',
      'Turtle Team',
      'Original wishlist text: Add support for recording more than two PIT tags.'
    ),
    (
      'Fix GPS format issue',
      'Bugs',
      'P1',
      'Turtle Team',
      'Original wishlist text: GPS values can appear in an incorrect long numeric format after entry.'
    ),
    (
      'Improve filtered data downloads',
      'Data Downloads',
      'P3',
      'Turtle Team',
      'Original wishlist text: Allow users to download filtered task and project data.'
    ),
    (
      'Improve validation for required turtle fields',
      'Data Entry Validation',
      'P3',
      'Turtle Team',
      'Original wishlist text: Add clearer validation for required turtle data entry fields.'
    ),
    (
      'Add QA/QC review view',
      'QA/QC Page',
      'P3',
      'Turtle Team',
      'Original wishlist text: Add a simple QA/QC page for reviewing entered turtle records.'
    ),
    (
      'Review security and access roles',
      'Security / Access',
      'P3',
      'Turtle Team',
      'Original wishlist text: Review user access levels and permissions for the Turtle tools.'
    )
) as imported(title, epic, priority, requester, details)
where not exists (
  select 1
  from public.tasks
  where tasks.title = imported.title
);
