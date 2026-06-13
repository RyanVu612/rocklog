import { type SendType, type Visibility } from "@prisma/client";

/** Send types and their human labels (spec requirement 3). */
export const SEND_TYPES: { value: SendType; label: string; hint: string }[] = [
  { value: "FLASH", label: "Flash", hint: "Sent first try" },
  { value: "SEND", label: "Send", hint: "Redpoint — sent after attempts" },
  { value: "PROJECT", label: "Project", hint: "Attempted, not yet sent" },
];

export const SEND_TYPE_LABELS: Record<SendType, string> = {
  FLASH: "Flash",
  SEND: "Send",
  PROJECT: "Project",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PRIVATE: "Private",
  PUBLIC: "Public",
};

/** Common gym color labels offered as suggestions (free text still allowed). */
export const COLOR_LABELS: string[] = [
  "Yellow",
  "Green",
  "Blue",
  "Red",
  "Purple",
  "Pink",
  "Orange",
  "Black",
  "White",
  "Teal",
];

/**
 * Media upload limits (spec Constraints). Enforced client-side before upload
 * and documented for the Supabase bucket file-size limit.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];
