/*
  Member photo storage, replacing the ImgBB third-party dependency.

  The bucket is public for reads (photos are served via plain <img> tags
  with no auth header, same as the ImgBB URLs they replace) but no INSERT/
  UPDATE/DELETE policy is granted to anon or authenticated - only the
  service-role key can write. The app's own /api/upload route is the only
  writer, and it checks the caller's session itself before uploading, so
  this is safer than the previous setup (which had no server-side auth
  check at all) while still being simple: no per-user storage RLS needed.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('member-photos', 'member-photos', true, 2097152, ARRAY['image/jpeg'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg'];
