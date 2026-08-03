drop index if exists public.biloo_role_applications_status_created_idx;

create index if not exists biloo_role_applications_reviewed_by_idx
  on public.biloo_role_applications (reviewed_by)
  where reviewed_by is not null;
