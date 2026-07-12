-- Auto-create a profile row the instant a new auth user is created —
-- runs server-side via trigger, so it isn't blocked by RLS timing even
-- when email confirmation means there's no active session yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'technician')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill your existing account that got stuck (swap in your admin email
-- and desired role):
insert into public.profiles (id, full_name, role)
select id, email, 'admin'
from auth.users
where email = 'YOUR_ADMIN_EMAIL_HERE'
on conflict (id) do nothing;
