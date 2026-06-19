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

## Architecture Decisions

### ADR-001: Database trigger owns status history

Status transitions are enforced by a trigger on `tasks.status` changes. UI and server actions should update `tasks.status`; the database records history.

### ADR-002: Manual admin assignment for MVP

Profiles and roles exist, but there is no user management interface in MVP. Admin role can be assigned manually in Supabase.

### ADR-003: No uploads in MVP

The schema includes `task_attachments` for future compatibility, but the MVP uses only `related_url` and `screenshot_url` fields.

### ADR-004: No drag-and-drop in MVP

Status changes will use buttons or select controls. Drag-and-drop is deferred.
