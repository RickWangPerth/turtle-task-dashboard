# Turtle Team Delivery Board Implementation Plan

## Phase 6-9 Implementation Update

Phases 6-9 refactor the MVP from Turtle Wishlist Tracker into Turtle Team Delivery Board.

Delivered scope:

- Navigation is Backlog, Board, and Reports.
- `/dashboard`, `/tasks`, and `/kanban` remain as compatibility redirects.
- Dashboard metrics are moved into Reports.
- Delivery statuses are simplified to `Backlog`, `Ready`, `In Progress`, `Review/UAT`, `Blocked`, and `Done`.
- Existing task statuses are mapped safely in a database migration.
- `task_status_history` is preserved unchanged as audit history.
- Sprint support is added with `sprints`, `tasks.sprint_id`, and `tasks.assignee_id`.
- `owner_id` remains intact for backwards compatibility.
- Board shows selected/current sprint work when a sprint exists, and otherwise falls back to all non-Done tasks, including Backlog.
- Reports remain query-based and do not use separate report tables.
- Internal role values and RLS stay unchanged; UI labels use Lead, Developer, Reporter, and Stakeholder.
- Public self-registration remains disabled through Supabase Auth settings, not app code.

Migration added:

- `supabase/migrations/202606200001_delivery_board_refactor.sql`

Deferred from this refactor:

- Admin UI
- Drag-and-drop
- Notifications
- File uploads
- Advanced reporting/charts

## Post-MVP Revised Direction

The MVP validated the core task workflow: authentication, task CRUD, comments, status history, Kanban, reports, and exports. The next stage changes the product from a generic wishlist tracker into a lightweight Turtle Team Delivery Board that better matches how the team will actually work.

New product name:

- Turtle Team Delivery Board

Primary workflow:

- Ellie and Jade create incoming work, questions, and issues in Backlog.
- Rick reviews Backlog items, checks whether information is complete, sets priority, handles dependencies, and assigns work to Rick or Liz.
- Liz works on assigned sprint tasks with Rick's guidance.
- Rick and Liz move work through development, Review/UAT, and Done.
- Sab and Scott mainly view progress through Reports and Board.

The app should stay lightweight. This is still not Jira. The task record remains the source of truth, and reports/board/backlog must derive from task, sprint, comment, and status-history data.

## Revised Navigation

Replace the current navigation:

- Dashboard
- Tasks
- Kanban
- Reports

With:

- Backlog
- Board
- Reports

Dashboard should be removed as a standalone page. The summary cards currently on Dashboard should move to the top of Reports.

## Revised Page Direction

### Backlog

Backlog replaces the current Tasks page and should be the main place for incoming and planned work.

Backlog should show:

- All tasks by default, with unfinished tasks emphasized.
- Completed/Done tasks visually de-emphasized or crossed out.
- Filters for status, priority, epic, owner/assignee, and environment.
- Create new task button.
- Export CSV and JSON buttons.

Backlog should be where requester-created work lands first. It should support Rick's triage workflow without adding a heavy review module.

### Board

Board replaces/refines the current Kanban page. It should focus on active delivery work, not every raw Backlog item.

Delivery statuses:

- Backlog
- Ready
- In Progress
- Review/UAT
- Blocked
- Done

Board columns:

- Ready
- In Progress
- Review/UAT
- Blocked
- Done

Backlog-status tasks should live on the Backlog page and should not clutter the Board once sprint execution is in use. Board shows selected/current sprint tasks when a sprint exists. If no Active sprint exists, Board falls back to all non-Done tasks, including Backlog, so the team can keep working during setup or low-process periods.

Drag-and-drop remains optional. Use status select + save unless drag-and-drop can be added simply, reliably, and accessibly.

### Reports

Reports should include the old Dashboard cards at the top:

- Total tasks
- Open tasks
- Current sprint tasks
- Blocked tasks
- Completed tasks

Report sections:

- Current sprint summary
- Tasks by status
- Tasks by epic
- Tasks by assignee
- Blocked / needs info tasks
- Recently completed tasks

Reports must remain query-based. Do not create report snapshot tables or separate report tables.

### Admin

Admin should initially be minimal.

For this next stage:

- Do not build a full user management UI unless it stays very small.
- Document how Rick creates users manually in Supabase Auth.
- Admin can later expose simple sprint creation and user overview if needed.

## Revised Roles

Business-friendly roles:

- Lead: Rick, can manage everything.
- Developer: Liz, can update assigned tasks, comment, and change status.
- Reporter: Ellie/Jade, can create tasks and comment.
- Stakeholder: Sab/Scott, read-only.

Internal role mapping for safety:

- `admin` = Lead
- `developer` = Developer
- `team` = Reporter
- `viewer` = Stakeholder

Recommendation: keep existing internal role values for now to avoid risky role migrations. Update UI labels and documentation to use the business-friendly names. Revisit a database role-name migration only if there is a strong reason after the workflow stabilizes.

## Revised Auth Direction

Login should be invitation/admin-created only.

Rules:

- No public self-registration through the app.
- Users should be created manually in Supabase Auth by Rick for this phase.
- Login can remain email/password and magic link.
- Unknown users should not be able to self-sign up through the app.
- Document the manual Supabase user creation process.

Implementation notes:

- Supabase email/password sign-in and magic-link sign-in can remain.
- Do not add an in-app sign-up form.
- Confirm Supabase Auth settings disable public signup where possible.
- Keep `profiles` automation for admin-created Auth users.

## Sprint Support

Add lightweight sprint support.

New table: `sprints`

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `goal text`
- `start_date date`
- `end_date date`
- `status text check in ('Planning', 'Active', 'Completed')`
- `created_at timestamptz default now()`

Add to `tasks`:

- `sprint_id uuid null references sprints(id)`
- `assignee_id uuid null references profiles(id)`

Ownership guidance:

- Do not break existing `owner_id` behavior.
- Prefer adding `assignee_id` and gradually updating UI to use Assignee.
- Keep `owner_id` available for backward compatibility until all pages and exports have been reviewed.
- If a task has no `assignee_id`, UI can fall back to `owner_id`.

Sprint MVP:

- Lead can create a sprint.
- Task can be assigned to a sprint.
- Board can filter by sprint.
- Reports can show a current sprint summary.

## Proposed Migration Plan

### Migration 1: Add Delivery Status Support Safely

Goal: Replace the old workflow statuses with simplified delivery statuses without losing tasks.

Plan:

1. Add a compatibility migration that updates the `tasks.status` check constraint to allow the new statuses:
   - `Backlog`
   - `Ready`
   - `In Progress`
   - `Review/UAT`
   - `Blocked`
   - `Done`
2. Map existing task statuses:
   - `To Do` -> `Backlog`
   - `Info Needed` -> `Backlog`
   - `In Progress` -> `In Progress`
   - `Under Test` -> `Review/UAT`
   - `Go Prod` -> `Done`
   - `Done` -> `Done`
   - `Closed` -> `Done`
3. Recreate the `tasks.status` check constraint with only the new status values after data is migrated.
4. Keep `task_status_history` untouched as historical audit data. Old status names in history are acceptable and useful.

Safety notes:

- Run a pre-migration count grouped by old status.
- Run the data update in a transaction.
- Run a post-migration count grouped by new status.
- Do not delete or rewrite status-history rows.

### Migration 2: Add Sprints And Assignment

Goal: Add sprint planning without disrupting existing tasks.

Plan:

1. Create `sprints`.
2. Add `tasks.sprint_id`.
3. Add `tasks.assignee_id`.
4. Add indexes for `tasks.sprint_id`, `tasks.assignee_id`, and `sprints.status`.
5. Add RLS policies for `sprints`:
   - Authenticated users can read sprints.
   - Lead/admin can create, update, and delete sprints.
   - Developers can read sprints.
   - Requesters and stakeholders can read sprints.
6. Update grants for authenticated access.

Safety notes:

- Both new task columns are nullable.
- No existing task rows need immediate sprint assignment.
- Existing `owner_id` remains intact.

### Migration 3: Auth And Role Hardening

Goal: keep invitation/admin-created access.

Plan:

1. Document Supabase Auth settings for disabling public signup.
2. Keep profile auto-creation for Auth users created by admin.
3. Keep existing internal role values unless a later migration is approved.
4. Add helper UI labels mapping internal roles to Lead/Developer/Reporter/Stakeholder.

## UI Change Plan

### Navigation

- Rename `Tasks` nav item to `Backlog`.
- Rename `Kanban` nav item to `Board`.
- Remove `Dashboard` from primary navigation.
- Redirect `/dashboard` to `/reports`.
- Keep old paths temporarily if useful:
  - `/tasks` can redirect to `/backlog`.
  - `/kanban` can redirect to `/board`.

Recommendation: add new routes and redirects rather than breaking existing URLs immediately.

### Backlog UI

- Move current task list experience to `/backlog`.
- Show new status options.
- De-emphasize Done tasks using muted text, reduced opacity, or line-through on title.
- Keep export buttons.
- Keep create task button.
- Rename Owner display to Assignee where `assignee_id` exists, with fallback to `owner_id`.

### Board UI

- Move current Kanban experience to `/board`.
- Use columns Ready, In Progress, Review/UAT, Blocked, Done.
- Exclude Backlog tasks by default.
- Add sprint filter once sprint table exists.
- Continue with status select + save on cards.
- Keep card click-through to task detail.

### Task Forms And Detail

- Replace old status options with new delivery statuses.
- Add sprint selector.
- Add assignee selector.
- Keep requester, details, decision needed, acceptance criteria, environment, dates, URLs, version, and commit URL.
- Preserve comments and status history.

### Reports UI

- Move dashboard cards to top of Reports.
- Add sprint summary once sprint support exists.
- Add grouped sections by status, epic, and assignee.
- Keep CSV/JSON exports.

### Admin UI

Admin UI is deferred for this refactor.

- Document how to create users manually in Supabase Auth.
- Keep role mapping in docs.
- Do not build a broad user-management interface yet.

## Risks And Rollback Notes

### Status Migration Risk

Risk: Updating status values can disrupt filters, board grouping, reports, and status-history assumptions.

Mitigation:

- Update shared status constants in the same implementation phase as the migration.
- Keep status-history rows unchanged.
- Verify task counts before and after migration.
- Keep old route compatibility redirects temporarily.

Rollback:

- Restore the previous status constraint.
- Map new values back only if absolutely required:
  - `Backlog` -> `To Do`
  - `Ready` -> `To Do`
  - `Review/UAT` -> `Under Test`
  - `Done` -> `Done`
- Keep a database backup before applying remote migration.

### Role Naming Risk

Risk: Renaming internal role values can break RLS policies.

Mitigation:

- Keep existing internal roles.
- Map labels in UI only.
- Update RLS behavior only where needed, not role strings.

Rollback:

- Revert UI label mapping. No data rollback needed if internal roles remain unchanged.

### Sprint Scope Risk

Risk: Sprint support can expand into sprint planning, velocity, estimates, and complex agile features.

Mitigation:

- Add only `sprints`, `tasks.sprint_id`, `tasks.assignee_id`.
- No estimates, story points, capacity planning, or sprint ceremonies in this stage.
- Board sprint filter and Reports sprint summary are enough.

Rollback:

- Because sprint fields are nullable, UI can ignore them if needed.
- Do not delete sprint tables or columns unless a later cleanup is explicitly approved.

### Auth Risk

Risk: Public sign-up remains enabled in Supabase settings even if the app has no sign-up page.

Mitigation:

- Document required Supabase Auth setting.
- Test unknown-user sign-in behavior.
- Do not add app-level sign-up.

Rollback:

- Re-enable prior login behavior if admin-created user flow blocks the team, but keep no public sign-up UI.

## Revised Phase Breakdown

### Phase 6: Navigation And Compatibility

Goal: move users to the Delivery Board navigation while preserving old URLs.

Milestones:

- Update product copy and route naming.
- Add role label mapping helper.
- Add manual user creation documentation.
- Redirect `/dashboard`, `/tasks`, and `/kanban`.

Exit criteria:

- Backlog, Board, and Reports are the only primary nav items.
- Old MVP routes remain compatible through redirects.
- Lint/build pass.

### Phase 7: Workflow Simplification

Goal: safely move from old statuses to the new delivery workflow.

Milestones:

- Add status migration.
- Update shared status constants.
- Rename Tasks to Backlog in navigation.
- Add `/backlog` route.
- Rename Kanban to Board in navigation.
- Add `/board` route.
- Move Dashboard cards to Reports and redirect `/dashboard`.
- Update filters, forms, cards, reports, exports, and tests for new statuses.

Exit criteria:

- Existing tasks are preserved and mapped.
- Backlog and Board render correctly.
- Status changes still create status-history rows.
- Lint/build pass.

### Phase 8: Sprint And Assignment Foundation

Goal: add sprint and assignee data model safely.

Milestones:

- Add `sprints` table.
- Add `tasks.sprint_id`.
- Add `tasks.assignee_id`.
- Add RLS/grants for sprints.
- Add sprint query helpers.
- Update task forms to assign sprint and assignee.
- Update task detail to display sprint and assignee.

Exit criteria:

- Tasks can be assigned to a sprint and assignee.
- Existing owner data remains intact.
- Lint/build pass.

### Phase 9: Board Sprint Filter And Reports

Goal: make sprint data useful without adding heavy agile features.

Milestones:

- Add sprint filter to Board.
- Default Board to Active sprint if one exists.
- Otherwise show all non-Done tasks, including Backlog.
- Add Reports sprint summary.
- Add tasks by assignee report.
- Add current sprint task and completed task metrics.

Exit criteria:

- Board supports sprint-focused delivery.
- Reports answer current sprint progress questions.
- Lint/build pass.

### Iteration 1 Validation Hold

After the Board fallback refinement, stop feature development. Create Iteration 1 and use the system with real work for at least one week before introducing additional features. The priority is validating the workflow, not adding complexity.

### Deferred: Minimal Admin

Goal: support Rick's lead workflow later without building enterprise admin.

Milestones:

- Add `/admin` only if manual Supabase setup becomes a bottleneck.
- Add manual Supabase user creation instructions.
- Display role mapping.
- Optionally add simple sprint create/edit form if still needed.

Exit criteria:

- Rick can operate the app with manual user creation and lightweight sprint setup.
- No public self-registration is exposed.

## Purpose

This document converts `AGENTS.md` and `DESIGN.md` into a practical MVP delivery plan for a small internal Turtle Research Team app.

The guiding constraint is simplicity. The app should replace duplicate manual updates across Word sections by making `tasks` the single source of truth. Backlog, Board, Reports, and exports must all derive from the same task records, with comments and status history providing the activity trail.

## Product Review

### Core User Need

The team needs a lightweight place to log, update, test, and close Turtle Wishlist work items without manually keeping a job list, Kanban board, work log, and UAT notes in sync.

### MVP Success Criteria

- Authenticated users can access the app.
- Users can create tasks.
- Users can edit task details.
- Users can change task status.
- Backlog, Board, Reports, and exports reflect the same task table.
- Comments are saved against tasks.
- Status changes are recorded in `task_status_history`.
- JSON and CSV export work.
- Supabase migrations are included.
- The app can be deployed to Vercel.

### Product Principles

- The task record is the source of truth.
- Do not duplicate task state into separate report, work log, Kanban, or dashboard tables.
- Prefer server-rendered pages and simple forms.
- Use client components only for interactive controls that need them.
- Avoid Jira-style workflow configuration, heavyweight sprint planning, automation rules, custom field builders, or enterprise permission systems.

## Architecture Review

### Proposed Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- React Server Components where appropriate

This stack is appropriate for the product size. Supabase should own authentication, persistence, and authorization. Next.js should provide route protection, server-rendered data views, form actions, and export endpoints.

### Recommended Architecture

- Use Supabase as the only database and auth provider.
- Use a small typed data access layer for task queries and mutations.
- Use server actions for create, update, comment, and status-change operations.
- Use route handlers only where a downloadable response is needed, such as CSV or JSON export.
- Use shared constants for statuses, priorities, environments, and epics.
- Keep UI components small and boring: badges, cards, tables, forms, filters, and layout.

### Avoided Architecture

- No Redux.
- No separate API backend.
- No job queue.
- No event bus.
- No separate reporting database.
- No drag-and-drop dependency for MVP.
- No generalized workflow engine.
- No custom permissions framework beyond Supabase RLS and a few helper checks.

## Risks And Ambiguities

### Authentication And Profiles

Risk: Supabase Auth creates users, but the app also needs profile rows and roles.

Decision for MVP: Add a `handle_new_user` trigger to create a `profiles` row on signup with role `team` by default. Rick/admin role can be assigned directly in Supabase for MVP, with an optional simple users page later.

### Role Enforcement

Risk: Detailed role rules can consume disproportionate time and create RLS bugs.

Decision for MVP: Implement simple readable RLS policies:

- Authenticated users can read tasks, comments, status history, attachments, and profiles.
- Admin and developer can insert/update/delete all tasks.
- Team can insert tasks and update tasks where `created_by = auth.uid()`.
- Team can comment on any task.
- Viewer can read only.
- Only admin can update profile roles.

### Task Code Generation

Risk: Generating sequential `T001` codes in application code can race.

Decision for MVP: Generate `task_code` in the database using a sequence-backed function or trigger. This keeps the code readable and avoids client-side collisions.

### Status History

Risk: If status history is written only by UI code, future updates may bypass it.

Decision for MVP: Use a database trigger to insert status history when `tasks.status` changes. Application code can stay simple and all status changes are captured.

### Updated Timestamp

Risk: Manually updating `updated_at` in every action is easy to miss.

Decision for MVP: Use a database trigger to set `updated_at` on task updates.

### Attachments

Risk: `task_attachments` exists in the required schema, but MVP fields already include `related_url` and `screenshot_url`.

Decision for MVP: Create the table for schema completeness, but do not build attachment UI in the first day.

### Reports Page

Risk: Reports can expand into a large feature set.

Decision for MVP: Keep reports to simple server-rendered summaries based on existing task queries. Markdown summary export is deferred unless core features are finished early.

### Kanban Interaction

Risk: Drag and drop is useful but can add client complexity and accessibility concerns.

Decision for MVP: Use a status select or menu on each card. Defer drag and drop.

### Settings And User Management

Risk: A complete `/settings/users` page is not required to prove MVP value.

Decision for MVP: Defer user management UI. Profiles and roles must exist in the database. Role updates can initially be handled by admin SQL or Supabase dashboard.

### Local Development And Deployment

Risk: The repository currently has only planning documents, so project setup, package choices, and environment examples must be created from scratch.

Decision for MVP: Scaffold a minimal Next.js app with clear `.env.example`, Supabase migration files, and Vercel-compatible configuration.

## Simplified 1-Day MVP Scope

### Build In MVP

- Next.js project scaffold with TypeScript and Tailwind.
- Supabase browser/server clients.
- Supabase migrations for required tables, enums/checks, triggers, and RLS.
- Email magic-link login page.
- Auth-protected app layout.
- Dashboard summary cards.
- Task list with practical filters.
- New task form.
- Task detail and edit form.
- Status change from task detail.
- Kanban board with status menu/select on cards.
- Comments on task detail.
- Status history display on task detail.
- JSON export for all or filtered tasks.
- CSV export for filtered tasks.
- Seed SQL for example Turtle Wishlist tasks.
- Deployment notes.

### Defer From MVP

- Drag-and-drop Kanban.
- Full `/settings/users` role management UI.
- Attachment management UI.
- File uploads or Supabase Storage.
- Markdown report export.
- Email notifications.
- GitHub commit integration beyond storing `commit_url`.
- Release note generator.
- AI summarisation.
- Public read-only dashboard.
- Advanced audit log beyond status history and comments.
- Complex saved filters.
- Pagination unless data volume makes it necessary.
- Offline support.
- Sprint planning, estimates, labels, dependencies, or custom workflows.

## Implementation Phases

### Phase 0: Project Setup

Goal: Create a deployable foundation.

Milestones:

- Scaffold Next.js App Router project.
- Configure TypeScript, Tailwind, ESLint, and app metadata.
- Add Supabase dependencies.
- Add `.env.example`.
- Add basic app shell and navigation.
- Confirm `npm run lint` and `npm run build` work.

Exit criteria:

- App starts locally.
- Empty authenticated shell can be deployed to Vercel.

### Phase 1: Database And Auth

Goal: Establish the data model, authentication, and role foundation.

Milestones:

- Add Supabase migrations for `profiles`, `tasks`, `task_comments`, `task_status_history`, and `task_attachments`.
- Add task code generation.
- Add `updated_at` trigger.
- Add status-history trigger.
- Add profile creation trigger for new auth users.
- Add simple RLS policies.
- Add seed data.
- Add login and logout flows.
- Protect app routes from unauthenticated access.

Exit criteria:

- Authenticated user can reach the app.
- Unauthenticated user is redirected to `/login`.
- Seed tasks exist.
- RLS allows the expected MVP operations.

### Phase 2: Task CRUD

Goal: Make the task record usable as the source of truth.

Milestones:

- Build `/tasks` table view.
- Add filters for status, priority, epic, owner, environment, and search.
- Build `/tasks/new`.
- Build `/tasks/[id]` detail page.
- Support editing required MVP fields.
- Support status changes from detail page.
- Display owner and creator profile data where available.

Exit criteria:

- Users can create tasks.
- Users can edit permitted tasks.
- Task updates appear immediately in list and detail views.
- Status changes create status-history rows.

### Phase 3: Comments And Activity

Goal: Preserve discussion and task movement history.

Milestones:

- Add comment form to task detail.
- Display comments in reverse chronological order.
- Display status history in reverse chronological order.
- Keep activity read-only except adding comments.

Exit criteria:

- Comments persist.
- Status history is visible.
- No separate work log table or duplicated activity state exists.

### Phase 4: Kanban And Dashboard

Goal: Provide team-friendly progress views derived from tasks.

Milestones:

- Build `/kanban` grouped by the seven statuses.
- Add status change control to each Kanban card.
- Build `/dashboard` summary cards.
- Add small recent activity sections if time allows: recent comments and recently moved tasks.

Exit criteria:

- Kanban updates after status changes.
- Dashboard counts reflect current task data.
- No Kanban-specific task duplication exists.

### Phase 5: Export And Reports

Goal: Enable practical reporting without manual copy/paste.

Milestones:

- Add CSV export route for filtered tasks.
- Add JSON export route for filtered or all tasks.
- Add `/reports` with simple grouped summaries:
  - Open P1/P2 tasks
  - Info Needed tasks
  - Under Test tasks
  - Go Prod tasks
  - Tasks grouped by epic
  - Tasks grouped by status
- Add deployment notes.

Exit criteria:

- Exported CSV opens cleanly in spreadsheet software.
- Exported JSON contains task records from the current filters.
- Reports are generated from task queries.

### Phase 6: Hardening

Goal: Stabilize MVP before any nonessential feature work.

Milestones:

- Check form validation and error states.
- Check empty states.
- Check mobile layout for list, detail, dashboard, and Kanban.
- Verify role behavior for admin/developer/team/viewer.
- Verify Vercel deployment requirements.
- Run lint and build.

Exit criteria:

- Core workflow is stable.
- Known limitations are documented.
- No deferred feature has been half-built.

## Required Database Tables

### `profiles`

Purpose: Store user display information and role.

Required fields:

- `id`
- `email`
- `display_name`
- `role`
- `created_at`

### `tasks`

Purpose: Store the canonical task record.

Required fields:

- `id`
- `task_code`
- `title`
- `epic`
- `priority`
- `status`
- `requester`
- `owner_id`
- `details`
- `decision_needed`
- `acceptance_criteria`
- `client_comment`
- `environment`
- `related_url`
- `screenshot_url`
- `start_date`
- `due_date`
- `uat_date`
- `prod_date`
- `version`
- `commit_url`
- `created_by`
- `created_at`
- `updated_at`

### `task_comments`

Purpose: Store comments on a task.

Required fields:

- `id`
- `task_id`
- `author_id`
- `body`
- `created_at`

### `task_status_history`

Purpose: Store status transitions.

Required fields:

- `id`
- `task_id`
- `from_status`
- `to_status`
- `changed_by`
- `changed_at`

### `task_attachments`

Purpose: Store future external references and attachment links.

Required fields:

- `id`
- `task_id`
- `label`
- `url`
- `created_by`
- `created_at`

MVP note: create the table, defer UI.

## Required Pages

- `/login`: Supabase email magic-link login.
- `/dashboard`: Summary counts and recent activity.
- `/tasks`: Filterable task table.
- `/tasks/new`: Create task form.
- `/tasks/[id]`: Task detail, edit form, comments, and status history.
- `/kanban`: Status-column board derived from tasks.
- `/reports`: Simple grouped task summaries and export links.

Deferred page:

- `/settings/users`: Defer full role management UI from MVP.

## Required Components

### Layout

- `AppShell`
- `MainNav`
- `UserMenu`
- `PageHeader`

### Auth

- `LoginForm`
- `SignOutButton`

### Task UI

- `TaskForm`
- `TaskTable`
- `TaskFilters`
- `TaskCard`
- `TaskDetailSections`
- `StatusSelect`
- `PriorityBadge`
- `StatusBadge`
- `EnvironmentBadge`

### Activity

- `CommentList`
- `CommentForm`
- `StatusHistoryList`

### Dashboard And Reports

- `SummaryCard`
- `RecentComments`
- `RecentStatusChanges`
- `ReportSection`
- `ExportButtons`

### Shared

- `EmptyState`
- `SubmitButton`
- `FormField`
- `ErrorMessage`

## Required Server Actions And APIs

### Server Actions

- `createTask`
- `updateTask`
- `updateTaskStatus`
- `createComment`
- `signOut`

### Route Handlers

- `GET /api/exports/tasks.json`
- `GET /api/exports/tasks.csv`

### Supabase Helpers

- Server client helper for RSC and actions.
- Browser client helper for client components if needed.
- Current user/profile helper.
- Role helper for server-side UI decisions.
- Task query helper that accepts filters and returns joined owner/profile fields.

## Data And Validation Rules

### Statuses

- `To Do`
- `Info Needed`
- `In Progress`
- `Under Test`
- `Done`
- `Go Prod`
- `Closed`

### Priorities

- `P1`
- `P2`
- `P3`

### Environments

- `NA`
- `Local`
- `UAT`
- `PROD`

### Initial Epics

- `Data Entry Interface`
- `Data Entry Validation`
- `Bugs`
- `QA/QC Page`
- `Database Backend`
- `Security / Access`
- `Data Downloads`
- `General`
- `ODK`
- `Reporting`
- `Curation`

MVP note: epics can be text with suggested options. Do not create a separate `epics` table for MVP.

## Architecture Decisions

### ADR-001: Use Tasks As The Source Of Truth

All views query `tasks`. Status history and comments provide activity context only. No separate Kanban, dashboard, UAT, PROD, or work-log tables will be created.

### ADR-002: Use Database Triggers For Task Code, Updated Timestamp, And Status History

These behaviors are data integrity concerns and should work regardless of which app surface updates the task.

### ADR-003: Defer Drag And Drop

Kanban status changes will use a select/menu in MVP. Drag and drop is optional polish and should not block core workflow delivery.

### ADR-004: Defer User Management UI

Profiles and roles are required. A full admin settings page is not required to validate the core task workflow.

### ADR-005: Keep Reports Query-Based

Reports should be simple database query results rendered in the app or exported. No report snapshots or generated report tables in MVP.

## Detailed Build Checklist

### Foundation

- Create app scaffold.
- Add dependencies.
- Configure Tailwind.
- Add app layout.
- Add navigation.
- Add environment example.

### Supabase

- Create migrations.
- Create RLS policies.
- Create profile trigger.
- Create task code function/trigger.
- Create updated timestamp trigger.
- Create status history trigger.
- Create seed data.

### Authentication

- Create `/login`.
- Add magic-link request.
- Add auth callback route if required by Supabase SSR package.
- Protect app routes.
- Add logout.

### Tasks

- Create task query helpers.
- Build task list.
- Build filters.
- Build create form.
- Build detail page.
- Build edit handling.
- Build status update handling.

### Activity

- Build comments.
- Build status history display.

### Views

- Build dashboard.
- Build Kanban.
- Build reports.

### Export

- Implement CSV export.
- Implement JSON export.

### Quality

- Add basic validation.
- Add empty states.
- Add loading and error states where useful.
- Run lint.
- Run build.
- Manually test core workflow.
- Document deployment steps.

## What Should Not Be Built In MVP

- Jira-like issue configuration.
- Sprint boards.
- Backlog grooming tools.
- Story points.
- Complex workflow transitions.
- Custom fields.
- Saved views.
- Drag-and-drop Kanban.
- File uploads.
- Supabase Storage.
- GitHub API integration.
- Email notifications.
- AI summaries.
- Markdown release-note generation unless all core work is already stable.
- Public dashboards.
- Advanced analytics.
- Multi-team tenancy.
- Granular per-epic permissions.
- Full admin user-management screen.
- Separate work log table.
- Separate UAT or PROD tracking tables.

## Approval Gate

Implementation should not begin until this plan is approved.

After approval:

1. Create `docs/TASK_BREAKDOWN.md` in GitHub Issues style.
2. Start Phase 0.
3. Keep phase work small and stable.
4. Update `docs/TASK_BREAKDOWN.md` after each phase.
5. Record new architecture decisions in the task breakdown or a dedicated ADR section.
6. Do not start the next phase until the current phase passes its exit criteria.
