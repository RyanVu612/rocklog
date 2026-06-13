import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "~/env.js";

/**
 * Server-only Supabase client using the service-role key. NEVER import this into
 * client components. Used to mint signed upload URLs, sign download URLs, and
 * delete media objects (spec requirement 8 & Constraints).
 */
let _admin: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _admin;
}

const BUCKET = env.SUPABASE_MEDIA_BUCKET;

export type MediaKind = "photo" | "video";

/**
 * Create a signed upload URL the browser can POST a file to directly (keeps
 * large videos off the serverless function). Returns the storage path and a
 * one-time token used with `uploadToSignedUrl`.
 */
export async function createSignedUpload(
  userId: string,
  kind: MediaKind,
  ext: string,
): Promise<{ path: string; token: string; bucket: string }> {
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${userId}/${kind}/${unique}.${safeExt}`;

  const { data, error } = await admin()
    .storage.from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL: ${error?.message}`);
  }
  return { path: data.path, token: data.token, bucket: BUCKET };
}

/**
 * Sign a short-lived download URL for displaying a private media object.
 * Returns null if no path or signing fails (the UI falls back to a placeholder).
 */
export async function signDownloadUrl(
  path: string | null | undefined,
  expiresInSeconds = 60 * 60,
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await admin()
    .storage.from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Remove media objects from storage. Tolerant of errors (logs and continues) so
 * a storage hiccup never leaves the DB inconsistent (spec edge case).
 */
export async function removeMedia(
  paths: (string | null | undefined)[],
): Promise<void> {
  const toRemove = paths.filter((p): p is string => !!p);
  if (toRemove.length === 0) return;
  const { error } = await admin().storage.from(BUCKET).remove(toRemove);
  if (error) {
    console.error("Failed to remove media objects:", toRemove, error.message);
  }
}
