grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, delete on public.task_comments to authenticated;
grant select on public.task_status_history to authenticated;
grant select, insert, update, delete on public.task_attachments to authenticated;

grant usage, select on sequence public.task_code_seq to authenticated;
