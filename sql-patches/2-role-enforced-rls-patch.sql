-- ============================================================
-- ROLE-ENFORCED RLS PATCH — run this after your existing schema.sql
-- Tightens "any authenticated user can do anything" into real
-- role-based authorization (admin vs technician).
-- ============================================================

-- Safe helper: looks up the current user's role WITHOUT re-triggering RLS
-- (a policy on `profiles` querying `profiles` directly causes Postgres to
-- raise "infinite recursion detected in policy").
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ASSETS: only admin can create/edit/delete; anyone authenticated can read
drop policy if exists "authenticated manage assets" on assets;

create policy "authenticated read assets"
on assets for select
to authenticated
using (true);

create policy "admin insert assets"
on assets for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "admin update assets"
on assets for update
to authenticated
using (public.current_user_role() = 'admin');

create policy "admin delete assets"
on assets for delete
to authenticated
using (public.current_user_role() = 'admin');

-- ISSUES: admin can update any; technician only their assigned issue
drop policy if exists "authenticated manage issues" on issues;

create policy "admin and assigned technician update issues"
on issues for update
to authenticated
using (
  public.current_user_role() = 'admin'
  or assigned_technician = auth.uid()
);

create policy "authenticated read issues"
on issues for select
to authenticated
using (true);

-- MAINTENANCE RECORDS: admin, or the technician assigned to that issue
drop policy if exists "authenticated manage maintenance" on maintenance_records;

create policy "authenticated read maintenance"
on maintenance_records for select
to authenticated
using (true);

create policy "admin and assigned technician insert maintenance"
on maintenance_records for insert
to authenticated
with check (
  public.current_user_role() = 'admin'
  or exists (
    select 1 from issues
    where issues.id = issue_id and issues.assigned_technician = auth.uid()
  )
);
