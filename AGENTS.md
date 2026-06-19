# AGENTS.md

## Project

Turtle Wishlist Tracker

A lightweight task tracking web app for the Turtle Research Team. It replaces the current Word-based "Turtles Wishlist Jobs" template and avoids duplicated manual updates across Job List, Kanban, Work Log, UAT notes, and release tracking.

This is not intended to be a Jira clone. Keep the app simple, practical, and field-team friendly.

## Goal

Build a small team collaboration app where users can:

* Log in
* Create tasks
* Edit tasks
* Move tasks through status columns
* Comment on tasks
* Track UAT / PROD progress
* Export task data
* Generate simple project summaries

## Tech Stack

Use:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase

  * Supabase Auth
  * Supabase Postgres
  * Row Level Security
* React Server Components where appropriate
* Client components only where interactivity is needed

Avoid unnecessary complexity.

Do not introduce Redux unless clearly required.

## Main Users

* Rick: developer / admin
* Turtle team members: create, edit, comment, test
* Viewers: read-only access if needed

## Core Workflow

Task status flow:

1. To Do
2. Info Needed
3. In Progress
4. Under Test
5. Done
6. Go Prod
7. Closed

The app should support changing status from the task detail page and from the Kanban board.

## MVP Features

Implement these first:

### Authentication

* Supabase email login / magic link
* Only authenticated users can access the app
* User profile table with role

Roles:

* admin
* developer
* team
* viewer

### Dashboard

Show summary cards:

* Total tasks
* P1 tasks
* In Progress
* Under Test
* Go Prod
* Blocked / Info Needed

### Kanban Board

Columns:

* To Do
* Info Needed
* In Progress
* Under Test
* Done
* Go Prod
* Closed

Each card should show:

* Task code
* Title
* Priority
* Epic
* Assignee
* Last updated

### Task List

Table view with filters:

* Status
* Priority
* Epic
* Owner
* Requester
* Environment
* Search by title/details/task code

### Task Detail

Fields:

* Task code
* Title
* Epic
* Priority
* Status
* Requester
* Owner
* Details
* Decision needed
* Acceptance criteria
* Client comment
* Environment
* Related URL
* Screenshot URL
* Start date
* Due date
* UAT date
* PROD date
* Version
* Commit URL
* Created at
* Updated at

### Comments

Users can add comments to a task.

### Status History

Whenever status changes, insert a row into task_status_history.

### Export

Add export buttons:

* Export all tasks as JSON
* Export filtered tasks as CSV

## Database Tables

Create SQL migrations for:

### profiles

* id uuid primary key references auth.users
* email text
* display_name text
* role text check role in ('admin', 'developer', 'team', 'viewer')
* created_at timestamptz default now()

### tasks

* id uuid primary key default gen_random_uuid()
* task_code text unique not null
* title text not null
* epic text
* priority text check priority in ('P1', 'P2', 'P3')
* status text check status in ('To Do', 'Info Needed', 'In Progress', 'Under Test', 'Done', 'Go Prod', 'Closed')
* requester text
* owner_id uuid references profiles(id)
* details text
* decision_needed text
* acceptance_criteria text
* client_comment text
* environment text check environment in ('Local', 'UAT', 'PROD', 'NA')
* related_url text
* screenshot_url text
* start_date date
* due_date date
* uat_date date
* prod_date date
* version text
* commit_url text
* created_by uuid references profiles(id)
* created_at timestamptz default now()
* updated_at timestamptz default now()

### task_comments

* id uuid primary key default gen_random_uuid()
* task_id uuid references tasks(id) on delete cascade
* author_id uuid references profiles(id)
* body text not null
* created_at timestamptz default now()

### task_status_history

* id uuid primary key default gen_random_uuid()
* task_id uuid references tasks(id) on delete cascade
* from_status text
* to_status text
* changed_by uuid references profiles(id)
* changed_at timestamptz default now()

### task_attachments

* id uuid primary key default gen_random_uuid()
* task_id uuid references tasks(id) on delete cascade
* label text
* url text not null
* created_by uuid references profiles(id)
* created_at timestamptz default now()

## Permissions

Use Supabase RLS.

Suggested rules:

* Authenticated users can read all tasks.
* admin and developer can insert/update/delete all tasks.
* team users can insert tasks and update tasks they created.
* team users can comment on any task.
* viewer can only read.
* Only admin can change roles.

For MVP, keep permissions simple and readable.

## UI Style

Keep the UI clean and government-friendly.

Use:

* White background
* Clear cards
* Simple tables
* Status badges
* Priority badges
* Minimal animation
* Good spacing
* Responsive layout

Avoid playful or overly decorative UI.

## Important Product Rules

* The task record is the single source of truth.
* Do not duplicate task data in multiple places.
* Kanban, List, Dashboard, and Export must all derive from the same tasks table.
* Avoid hardcoding example task data in components. Use seed files or Supabase data.
* Prefer small reusable components.

## Suggested Pages

* `/login`
* `/dashboard`
* `/tasks`
* `/tasks/new`
* `/tasks/[id]`
* `/kanban`
* `/reports`
* `/settings/users`

## Seed Data

Create seed tasks based on the Turtle Wishlist categories:

* Data Entry Interface
* Validation
* Bugs
* QA/QC
* Database Backend
* Security / Access
* Data Downloads
* General

Example task:

* T001 - Add No Damage checkbox
* Priority: P2
* Status: To Do
* Epic: Data Entry Interface

## Definition of Done

The MVP is done when:

* Users can log in
* Users can create a task
* Users can edit a task
* Users can move a task across statuses
* Kanban updates automatically
* Task list updates automatically
* Dashboard summary updates automatically
* Comments work
* Status history works
* Export JSON works
* Export CSV works
* App can be deployed to Vercel
* Supabase migrations are included
