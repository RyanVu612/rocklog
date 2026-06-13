"use client";

import { useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "~/lib/constants";
import { getSupabaseBrowser } from "~/lib/supabase-browser";
import { api } from "~/trpc/react";

type Kind = "photo" | "video";

function humanSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function MediaUpload({
  kind,
  value,
  onChange,
}: {
  kind: Kind;
  /** Current storage path (or null). */
  value: string | null;
  onChange: (path: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const createUploadUrl = api.climb.createUploadUrl.useMutation();

  const maxBytes = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const acceptedTypes =
    kind === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;
  const accept = kind === "video" ? "video/*" : "image/*";

  async function handleFile(file: File) {
    setError(null);

    if (!acceptedTypes.includes(file.type)) {
      setError(`Unsupported ${kind} type: ${file.type || "unknown"}.`);
      return;
    }
    if (file.size > maxBytes) {
      setError(`File is too large. Max ${kind} size is ${humanSize(maxBytes)}.`);
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.includes(".")
        ? file.name.split(".").pop()!
        : kind === "video"
          ? "mp4"
          : "jpg";

      const { path, token, bucket } = await createUploadUrl.mutateAsync({
        kind,
        ext,
      });

      const supabase = getSupabaseBrowser();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setFileName(file.name);
      onChange(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      onChange(null);
    } finally {
      setBusy(false);
    }
  }

  const label = kind === "video" ? "Video" : "Photo";
  const hasMedia = !!value;

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}{" "}
          <span className="font-normal text-slate-400">
            (optional, max {humanSize(maxBytes)})
          </span>
        </span>
        {hasMedia && !busy && (
          <button
            type="button"
            onClick={() => {
              setFileName(null);
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-xs text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-slate-200"
      />

      {busy && <p className="mt-1 text-xs text-slate-500">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hasMedia && !busy && (
        <p className="mt-1 text-xs text-green-700">
          {fileName ? `Attached: ${fileName}` : "Media attached."}
        </p>
      )}
    </div>
  );
}
