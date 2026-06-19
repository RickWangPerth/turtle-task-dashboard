# Turtle Wishlist Tracker Implementation Plan

## Purpose

This document converts `AGENTS.md` and `DESIGN.md` into a practical MVP delivery plan for a small internal Turtle Research Team app.

The guiding constraint is simplicity. The app should replace duplicate manual updates across Word sections by making `tasks` the single source of truth. Dashboard, Kanban, list, reports, and exports must all derive from the same task records, with comments and status history providing the activity trail.

## Product Review

### Core User Need

The team needs a lightweight place to log, update, test, and close Turtle Wishlist work items without manually keeping a job list, Kanban board, work log, and UAT notes in sync.

### MVP Success Criteria

- Authenticated users can access the app.
- Users can create tasks.
- Users can edit task details.
- Users can change task status.
- Kanban, task list, dashboard, and exports reflect the same task table.
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
- Avoid Jira-style workflow configuration, sprint concepts, automation rules, custom field builders, or enterprise permission systems.

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
