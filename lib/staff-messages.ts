/**
 * lib/staff-messages.ts
 *
 * Types and shared plumbing for staff-to-staff messaging.
 *
 * Contract: FRONTEND_NOTE_staff-messaging.md in the API repo (Session 97).
 *
 * One thing to keep in mind everywhere in this feature: the API returns an
 * absolute `download_url` pointing straight at `api.okelcor.com`. The browser
 * must never use it — it has no bearer token. Always go through the Next proxy
 * (`attachmentUrl()` below), same as every other admin call in this codebase.
 */

export type StaffPerson = {
  id: number | null;
  name: string;
  email: string | null;
  kind?: "to" | "cc";
  read_at?: string | null;
  /** Only ever populated for the sender of the message. */
  email_status?: "sent" | "failed" | null;
};

export type StaffMessageAttachment = {
  name: string | null;
  mime: string | null;
  size: number | null;
  /** Absolute API URL — do NOT fetch directly, see attachmentUrl(). */
  download_url: string;
};

export type StaffMessageRow = {
  id: number;
  thread_id: string;
  subject: string;
  preview: string;
  sender: StaffPerson;
  recipients: StaffPerson[];
  is_forward: boolean;
  has_attachments: boolean;
  unread: boolean;
  created_at: string;
};

export type StaffMessage = {
  id: number;
  thread_id: string;
  subject: string;
  body: string;
  sender: StaffPerson;
  sent_by_me: boolean;
  recipients: StaffPerson[];
  attachments: StaffMessageAttachment[];
  is_forward: boolean;
  forwarded_from: {
    communication_id: number | null;
    customer_id: number | null;
    quote_request_id: number | null;
    action_url: string | null;
  } | null;
  in_reply_to_id: number | null;
  unread: boolean;
  created_at: string;
};

export type StaffColleague = {
  id: number;
  name: string;
  email: string;
  job_title: string | null;
  role: string;
};

export const MAX_RECIPIENTS = 10;
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx", "csv"];

/** Route an attachment through the proxy, never at the API host directly. */
export function attachmentUrl(messageId: number, index: number): string {
  return `/api/admin/staff-messages/${messageId}/attachments/${index}/download`;
}

/**
 * Validate files against the same limits the API enforces.
 * Returns an error string, or null when everything is acceptable.
 */
export function validateFiles(existing: File[], incoming: File[]): string | null {
  if (existing.length + incoming.length > MAX_ATTACHMENTS) {
    return `Maximum ${MAX_ATTACHMENTS} attachments.`;
  }
  for (const file of incoming) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type ".${ext}" isn't allowed. Use: ${ALLOWED_EXTENSIONS.join(", ")}.`;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return `"${file.name}" is over 10 MB.`;
    }
  }
  return null;
}

/** "Ada Okafor, Ben Adeyemi and 2 others" */
export function describeRecipients(people: StaffPerson[]): string {
  const names = people.map((p) => p.name);
  if (names.length === 0) return "nobody";
  if (names.length <= 2) return names.join(" and ");
  return `${names[0]}, ${names[1]} and ${names.length - 2} other${names.length - 2 === 1 ? "" : "s"}`;
}
