import { supabase, isSupabaseConfigured } from './supabase';

export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export class EvidenceUploadError extends Error {}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new EvidenceUploadError('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function validate(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new EvidenceUploadError('Please attach a JPG, PNG, WEBP, or GIF image.');
  }
  if (file.size > MAX_EVIDENCE_BYTES) {
    throw new EvidenceUploadError('Image is too large — please attach something under 5MB.');
  }
}

/**
 * Uploads an evidence photo and returns a public URL to store on the
 * issue / maintenance record.
 *
 * - Real Supabase mode: uploads to the `evidence` storage bucket (see
 *   sql-patches/5-evidence-storage-bucket.sql) and returns the public URL.
 * - Demo mode (no Supabase configured): inlines the image as a base64
 *   data URL so the field still round-trips through localStorage — fine
 *   for local evaluation, not meant for production use.
 */
export async function uploadEvidence(file: File, folder: 'issues' | 'maintenance'): Promise<string> {
  validate(file);

  if (!isSupabaseConfigured) {
    return fileToDataUrl(file);
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('evidence').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new EvidenceUploadError(`Evidence upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from('evidence').getPublicUrl(path);
  return data.publicUrl;
}