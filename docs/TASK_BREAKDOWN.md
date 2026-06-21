# Turtle Wishlist Tracker Task Breakdown

## Phase 0: Project Setup

### Issue 1: Scaffold minimal Next.js app

Status: Done

Tasks:

- [x] Add package manifest and framework configuration.
- [x] Add TypeScript configuration.
- [x] Add Tailwind configuration and global styles.
- [x] Add minimal App Router structure.

### Issue 2: Add shared app shell

Status: Done

Tasks:

- [x] Add authenticated layout.
- [x] Add simple navigation.
- [x] Add sign-out control.

## Phase 1: Database And Auth

### Issue 3: Add Supabase schema migrations

Status: Done

Tasks:

- [x] Create `profiles`.
- [x] Create `tasks`.
- [x] Create `task_comments`.
- [x] Create `task_status_history`.
- [x] Create `task_attachments`.
- [x] Add task code generation.
- [x] Add `updated_at` trigger.
- [x] Add database-level status history trigger on `tasks.status` changes.
- [x] Add new auth user profile trigger.
- [x] Add simple RLS policies.
- [x] Add authenticated role grants for app table access.

### Issue 4: Add seed data

Status: Done

Tasks:

- [x] Add Turtle Wishlist example tasks.
- [x] Keep seed data in SQL, not hardcoded in components.

### Issue 5: Add Supabase auth integration

Status: Done

Tasks:

- [x] Add server Supabase client helper.
- [x] Add middleware session refresh and route protection.
- [x] Add magic-link login page.
- [x] Add email/password login for local MVP testing.
- [x] Add auth callback route.
- [x] Add logout server action.

### Issue 6: Verify Phase 1 stability

Status: Done

Tasks:

- [x] Install dependencies.
- [x] Run lint.
- [x] Run build.
- [x] Configure `.env.local` with Supabase URL and keys.
- [x] Verify Supabase API connectivity.
- [x] Apply migrations to a Supabase project.
- [x] Verify database tables.
- [x] Verify seed tasks.
- [x] Verify task code generation trigger.
- [x] Verify `updated_at` trigger.
- [x] Verify status history trigger.
- [x] Manually test auth login.
- [x] Create a test admin account.
- [x] Verify login.
- [x] Verify logout.
- [x] Verify profile creation trigger.
- [x] Manually assign admin role.
- [x] Verify protected routes.

Verification:

- Phase 1 was approved after Supabase project linking, migration, seed, auth, protected routes, dashboard/tasks/kanban/reports routes, and database triggers were verified.

Notes:

- The app now supports `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from `.env.local`.
- Remote migration and seed were completed with `npx supabase db reset --linked`.

## Phase 2: Task CRUD And Dashboard

### Issue 7: Dashboard cards from real data

Status: Done

Tasks:

- [x] Replace placeholder dashboard count with real summary cards.
- [x] Use Supabase task queries only.
- [x] Show total tasks, P1 tasks, In Progress, Under Test, Go Prod, and Info Needed.

### Issue 8: Task list page

Status: Done

Tasks:

- [x] Load tasks from Supabase.
- [x] Add filters for status, priority, epic, owner, environment, and search.
- [x] Show task code, title, epic, priority, status, requester, owner, environment, due date, and updated date.
- [x] Link each row to task detail.

### Issue 9: Create task page

Status: Done

Tasks:

- [x] Add `/tasks/new`.
- [x] Add create task server action.
- [x] Use database task code trigger, not client-generated codes.
- [x] Redirect to detail after create.

### Issue 10: Task detail page

Status: Done

Tasks:

- [x] Add `/tasks/[id]`.
- [x] Show task summary and field sections.
- [x] Link to edit page.
- [x] Keep comments out of Phase 2.

### Issue 11: Edit task page

Status: Done

Tasks:

- [x] Add `/tasks/[id]/edit`.
- [x] Add update task server action.
- [x] Allow status updates through the edit form.
- [x] Rely on database trigger for status history.

### Issue 12: Verify Phase 2 stability

Status: Done

Tasks:

- [x] Run lint.
- [x] Run build.
- [x] Apply non-destructive grants migration with `npx supabase db push --linked`.
- [x] Verify dashboard loads real counts.
- [x] Verify task list loads real Supabase rows.
- [x] Verify create task flow with `T007`.
- [x] Verify task detail page.
- [x] Verify edit task flow and status update.
- [x] Verify dashboard and list reflect edited task.

## Phase 3: Comments And Activity

### Issue 13: Add comments to task detail

Status: Done

Tasks:

- [x] Add comment server action using `task_comments`.
- [x] Add comment form on `/tasks/[id]`.
- [x] Display existing task comments from Supabase.
- [x] Revalidate task detail after comment submit.

### Issue 14: Add status history to task detail

Status: Done

Tasks:

- [x] Query `task_status_history` for the task.
- [x] Display status changes in the activity section.
- [x] Keep status history read-only.

### Issue 15: Add quick status update on task detail

Status: Done

Tasks:

- [x] Add quick status update server action.
- [x] Add status select/control to task detail page.
- [x] Continue relying on database trigger for history rows.
- [x] Revalidate dashboard, task list, and task detail after status change.

### Issue 16: Verify Phase 3 stability

Status: In Progress

Tasks:

- [x] Run lint.
- [x] Run build.
- [ ] Browser-verify adding a comment through the textarea form.
- [x] Browser-verify quick status update.
- [x] Browser-verify activity section shows comments and status changes.

Notes:

- Browser automation could not type into the comment textarea because the in-app browser virtual clipboard is unavailable.
- Comment display was verified with a real `task_comments` row on `T007`.
- Quick status update was verified through the task detail page form, moving `T007` from `Under Test` to `Done`.

## Phase 4: Kanban Board

### Issue 17: Build real-data Kanban columns

Status: Done

Tasks:

- [x] Load tasks from Supabase.
- [x] Group tasks by the seven status columns.
- [x] Show task code, title, priority, epic, and owner/requester on each card.
- [x] Link cards to task detail.

### Issue 18: Add Kanban status controls

Status: Done

Tasks:

- [x] Add simple status select per card.
- [x] Reuse existing status update server action.
- [x] Continue relying on database trigger for status history.
- [x] Do not add drag-and-drop.

### Issue 19: Verify Phase 4 stability

Status: Done

Tasks:

- [x] Run lint.
- [x] Run build.
- [x] Browser-verify Kanban columns load real tasks.
- [x] Browser-verify card opens task detail.
- [x] Browser-verify card status update.

Notes:

- Browser verification moved `T007` to `Go Prod` through the Kanban card status control.

## Phase 5: Reports And Exports

### Issue 20: Build query-based reports page

Status: Done

Tasks:

- [x] Load report data from Supabase tasks.
- [x] Add Open P1/P2 tasks section.
- [x] Add Info Needed tasks section.
- [x] Add Under Test tasks section.
- [x] Add Go Prod tasks section.
- [x] Add Recently completed tasks section.
- [x] Add tasks grouped by Epic.
- [x] Add tasks grouped by Status.
- [x] Do not create report tables.

### Issue 21: Add task exports

Status: Done

Tasks:

- [x] Add filtered CSV export endpoint.
- [x] Add filtered JSON export endpoint.
- [x] Add export links using current filters.
- [x] Keep exports sourced from `tasks`.

### Issue 22: Verify Phase 5 stability

Status: Done

Tasks:

- [x] Run lint.
- [x] Run build.
- [x] Browser-verify reports page.
- [x] Browser-verify CSV export.
- [x] Browser-verify JSON export.

Notes:

- Reports and exports are generated from `tasks`; no report tables were added.
- CSV export supports `inline=1` only for browser verification; normal export links still return CSV attachment responses.

## Next Stage: Turtle Team Delivery Board

### Issue 23: Approve revised Delivery Board direction

Status: Done

Tasks:

- [x] Document move from Wishlist Tracker to Turtle Team Delivery Board.
- [x] Document real team workflow for Ellie/Jade, Rick, Liz, Sab, and Scott.
- [x] Document revised navigation: Backlog, Board, Reports.
- [x] Document removal of standalone Dashboard.
- [x] Document invitation/admin-created login direction.
- [x] Approve revised plan before implementation.

### Issue 24: Plan safe status workflow migration

Status: Done

Tasks:

- [x] Document new delivery statuses: Backlog, To Do, In Progress, Review/UAT, Blocked, Done.
- [x] Document old-to-new status mapping.
- [x] Document that `task_status_history` should remain unchanged.
- [x] Document rollback mapping and backup requirement.
- [x] Implement migration after approval.

### Issue 25: Plan Backlog and Board route changes

Status: Done

Tasks:

- [x] Plan Tasks rename to Backlog.
- [x] Plan Kanban rename to Board.
- [x] Plan Dashboard summary cards moving into Reports.
- [x] Plan compatibility redirects or aliases for old routes.
- [x] Implement route changes after approval.

### Issue 26: Plan sprint and assignment support

Status: Done

Tasks:

- [x] Document new `sprints` table.
- [x] Document nullable `tasks.sprint_id`.
- [x] Document nullable `tasks.assignee_id`.
- [x] Document keeping `owner_id` for backward compatibility.
- [x] Document sprint MVP: create sprint, assign task, board filter, report summary.
- [x] Implement sprint migration after approval.

### Issue 27: Plan revised roles and auth hardening

Status: Done

Tasks:

- [x] Document business role labels: Lead, Developer, Reporter, Stakeholder.
- [x] Document internal role mapping: admin, developer, team, viewer.
- [x] Document no public self-registration.
- [x] Document manual Supabase user creation for this phase.
- [x] Implement UI label changes and auth documentation after approval.

### Issue 28: Revised implementation phases

Status: Done

Tasks:

- [x] Phase 6: Planning and compatibility.
- [x] Phase 7: Status migration and route rename.
- [x] Phase 8: Sprint and assignment foundation.
- [x] Phase 9: Board sprint filter and reports.
- [x] Defer Admin UI.
- [x] Begin Phase 6 only after approval.

### Issue 29: Phase 6 navigation refactor

Status: Done

Tasks:

- [x] Replace primary navigation with Backlog, Board, and Reports.
- [x] Hide Dashboard from navigation.
- [x] Redirect `/dashboard` to `/reports`.
- [x] Redirect `/tasks` to `/backlog`.
- [x] Redirect `/kanban` to `/board`.
- [x] Update product label to Turtle Team Delivery Board.

### Issue 30: Phase 7 workflow simplification

Status: Done

Tasks:

- [x] Add migration `202606200001_delivery_board_refactor.sql`.
- [x] Map current task statuses to Backlog, To Do, In Progress, Review/UAT, Blocked, and Done.
- [x] Preserve `task_status_history` rows unchanged.
- [x] Update app constants, badges, forms, and status controls.
- [x] Update seed data to use `Backlog`.

### Issue 31: Phase 8 sprint and assignment support

Status: Done

Tasks:

- [x] Add `sprints` table with Planning, Active, and Completed statuses.
- [x] Add nullable `tasks.sprint_id`.
- [x] Add nullable `tasks.assignee_id`.
- [x] Keep `owner_id` intact for backwards compatibility.
- [x] Add sprint and assignee fields to task create/edit.
- [x] Add sprint and assignee visibility to task detail.

### Issue 32: Phase 9 board and reports refactor

Status: Done

Tasks:

- [x] Add `/backlog` page with filters and exports.
- [x] Add `/board` page filtered by selected or active sprint.
- [x] Use Board columns To Do, In Progress, Review/UAT, Blocked, and Done.
- [x] Keep status select controls; no drag-and-drop.
- [x] Move dashboard metrics into `/reports`.
- [x] Add report sections for sprint, status, epic, assignee, blocked tasks, and completed tasks.
- [x] Keep report data query-based; no report tables.

### Issue 33: Phase 6-9 verification

Status: Done

Tasks:

- [x] Run lint.
- [x] Run build.
- [x] Push migration to linked Supabase project.

### Issue 34: Board fallback when no Active sprint exists

Status: Done

Tasks:

- [x] If an Active sprint exists, show tasks for the Active sprint by default.
- [x] If no Active sprint exists, show all non-Done tasks, including Backlog.
- [x] Keep manual sprint filtering available.
- [x] Do not require sprints before the Board is useful.

### Iteration 1 Validation Hold

Status: Superseded By Admin Setup

Tasks:

- [x] Stop feature development after the Board fallback refinement.
- [ ] Create Iteration 1 after Admin UI is verified.
- [ ] Use the system with real work for at least one week.
- [ ] Validate Backlog, Board, Reports, comments, status history, and exports with real team workflow.
- [ ] Record workflow friction before adding more features.

## Admin UI Phase

### Issue 35: Add admin route access

Status: Done

Tasks:

- [x] Add `/admin` page.
- [x] Show Admin navigation only to internal `admin` users.
- [x] Redirect non-admin users away from `/admin`.
- [x] Keep auth and RLS unchanged.

### Issue 36: Manage existing profiles

Status: Done

Tasks:

- [x] List profiles.
- [x] Show email, display name, role, and created date.
- [x] Allow admin to update display name.
- [x] Allow admin to update role.
- [x] Use friendly role labels.
- [x] Do not implement password reset.
- [x] Do not implement public signup.

### Issue 37: Manage iterations

Status: Done

Tasks:

- [x] List iterations.
- [x] Create iteration.
- [x] Edit iteration.
- [x] Set iteration Active.
- [x] Mark iteration Completed.
- [x] Clear other Active iterations before setting one Active.

### Issue 38: Add task setup helper

Status: Done

Tasks:

- [x] Show active tasks missing assignee or iteration.
- [x] Allow admin to assign assignee.
- [x] Allow admin to assign iteration.
- [x] Link to task detail.

### Issue 39: Admin verification

Status: Pending Browser Verification

Tasks:

- [x] Run lint.
- [x] Run build.
- [ ] Browser-test admin access.
- [ ] Browser-test non-admin redirect.
- [ ] Browser-test creating an iteration.
- [ ] Browser-test updating a user role.
- [ ] Browser-test assigning a task to iteration/assignee.

### Feature Hold After Admin

Status: Active

Tasks:

- [x] Stop after Admin UI.
- [ ] Do not implement notifications.
- [ ] Enter initial real tasks.
- [ ] Use workflow before adding complexity.

### Issue 40: Rename Ready status to To Do

Status: Done

Tasks:

- [x] Add migration `202606200002_ready_to_todo_status.sql`.
- [x] Map existing `Ready` tasks to `To Do`.
- [x] Update task status constraint.
- [x] Update status constants, Supabase types, badges, and docs.
- [x] Apply migration to linked Supabase project.

### Issue 41: Add save confirmation feedback

Status: Done

Tasks:

- [x] Add reusable save notice component.
- [x] Show success notice after task create/update.
- [x] Show success notice after task status update.
- [x] Show success notice after comment creation.
- [x] Show success notice after Admin user, iteration, and task setup updates.
- [x] Browser-verify notice rendering.

### Issue 42: Add minimal task review tracking

Status: Done

Tasks:

- [x] Add `tasks.review_status`.
- [x] Add allowed review values: Needs Review, Reviewed, Needs More Info, Rejected, Duplicate.
- [x] Add Backlog review status filter.
- [x] Show review status badge in Backlog.
- [x] Highlight Needs Review tasks.
- [x] Allow admin/developer to update review status from Backlog.
- [x] Do not add import batch tables.

### Issue 43: Add one-time wishlist import SQL

Status: Done

Tasks:

- [x] Add `supabase/imports/initial_wishlist_tasks.sql`.
- [x] Insert directly into `public.tasks`.
- [x] Use `status = Backlog`.
- [x] Use `review_status = Needs Review`.
- [x] Use `priority = P3` unless urgent.
- [x] Use `environment = NA`.
- [x] Use `requester = Turtle Team` where requester is not known.

### Issue 44: Add lightweight delivery planning fields

Status: Done

Tasks:

- [x] Add `tasks.implementation_plan`.
- [x] Add `tasks.completion_notes`.
- [x] Display Implementation Plan on task detail.
- [x] Display Completion Notes on task detail.
- [x] Allow editing both fields from task edit form.
- [x] Keep existing task edit permissions.
- [x] Do not add subtasks, dependencies, checklist tables, workflow engines, story points, or velocity tracking.

## Architecture Decisions

### ADR-001: Database trigger owns status history

Status transitions are enforced by a trigger on `tasks.status` changes. UI and server actions should update `tasks.status`; the database records history.

### ADR-002: Manual admin assignment for MVP

Profiles and roles exist, but there is no user management interface in MVP. Admin role can be assigned manually in Supabase.

### ADR-003: No uploads in MVP

The schema includes `task_attachments` for future compatibility, but the MVP uses only `related_url` and `screenshot_url` fields.

### ADR-004: No drag-and-drop in MVP

Status changes will use buttons or select controls. Drag-and-drop is deferred.

### ADR-005: Keep internal role values during Delivery Board transition

Use business-friendly UI labels while keeping existing database role values: `admin` as Lead, `developer` as Developer, `team` as Reporter, and `viewer` as Stakeholder. This avoids unnecessary RLS churn.

### ADR-006: Preserve status history during status migration

Task current statuses can be mapped to the new delivery workflow, but historical status rows should remain unchanged as audit history.

### ADR-007: Add sprint support with nullable fields

Sprint support should add `sprints`, `tasks.sprint_id`, and `tasks.assignee_id` without removing or repurposing `owner_id` in the first migration.

### ADR-008: Backlog owns planning and Board owns iteration execution

Backlog shows all tasks and supports triage, filtering, creation, and export. Board is intentionally narrower when sprint context exists and uses execution statuses. If an Active or selected sprint exists, Board shows sprint tasks. If no Active sprint exists, Board falls back to all non-Done tasks, including Backlog, so the team can work without sprint setup.

### ADR-009: Keep Dashboard as a redirect only

Dashboard is no longer a standalone surface. Its metrics live at the top of Reports, and `/dashboard` redirects to `/reports` for backwards compatibility.

### ADR-010: No Admin UI in this refactor

User creation and role assignment remain in Supabase for now. The app only shows friendly role labels while keeping the existing internal role values and RLS unchanged.

### ADR-011: Validate Iteration 1 before adding features

After the Board fallback refinement, feature development stops. The team should create Iteration 1 and use the system with real work for at least one week before introducing additional features.

### ADR-012: Minimal Admin UI Uses Existing RLS

Admin UI manages existing profiles, iterations, and task setup using server actions with the signed-in user's Supabase session. It does not use a client-side service-role key and does not implement password reset or public signup. If future user creation is needed inside the app, it should use a server-only service role path after a separate security review.

### ADR-013: Notifications Remain Deferred

Notifications are not part of this phase. They should not be implemented until initial tasks have been entered and the team has validated the workflow with real work.

### ADR-014: Use Page-Level Save Notices

Save and update actions redirect back to the relevant page with a `saved` query parameter. Pages show a clear success notice near the top instead of using blocking modals or adding a toast library. This keeps feedback visible while avoiding extra client-side state.

### ADR-015: One-Time Import Uses Task Review Status

Initial wishlist import is a one-time SQL script that inserts directly into `public.tasks`. Imported tasks are marked with `review_status = 'Needs Review'`. No import batch table, dependency model, voting system, notification workflow, upload flow, or automatic AI classification is added.

### ADR-016: Delivery Planning Stays On The Task

Implementation planning and completion tracking are stored directly on `tasks` as `implementation_plan` and `completion_notes`. This supports Rick's review/planning workflow and Liz's completion handoff without adding subtasks, dependency tables, checklist tables, story points, velocity tracking, or workflow engines.
