-- ============================================================
-- EVIDENCE STORAGE BUCKET — run this in Supabase SQL Editor
-- Creates a public bucket for issue/maintenance evidence photos,
-- with policies matching the brief's requirement that public
-- reporters can attach evidence but only authenticated users can
-- manage internal (maintenance) evidence.
-- ============================================================

-- Bucket: public read (so evidence photos display on dashboards
-- and the public asset page), but writes are gated below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Anyone (including anonymous public reporters) can read evidence —
-- needed so photos render on the public asset/issue tracking page.
create policy "public read evidence"
on storage.objects for select
using (bucket_id = 'evidence');

-- Anonymous + authenticated users can upload issue evidence
-- (public reporters attach photos when filing an issue).
create policy "anyone insert issue evidence"
on storage.objects for insert
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = 'issues'
);

-- Only authenticated users (admin/technician) can upload maintenance
-- evidence — that's logged internally during resolution, not by the public.
create policy "authenticated insert maintenance evidence"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = 'maintenance'
);

-- Only authenticated users can delete evidence (cleanup/moderation).
create policy "authenticated delete evidence"
on storage.objects for delete
to authenticated
using (bucket_id = 'evidence');