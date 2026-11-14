import { supabase } from "@/lib/supabaseClient";

export type AdminLogAction = "added" | "edited" | "deleted" | "activated" | "deactivated";
export type AdminLogEntity = "subject" | "question" | "resource";

export interface AdminLogInput {
  action: AdminLogAction;
  entityType: AdminLogEntity;
  /** Short name shown in the log, for example "NDA 2027" or "Question #45 in Algebra". */
  label: string;
  /** Anything extra worth keeping, such as what changed. */
  details?: Record<string, unknown>;
}

/**
 * Writes one row to admin_logs. The database fills in admin_id and the time, and
 * only an approved admin can write. It never throws: a failed log must not stop
 * the admin's real work, so the result is just true or false.
 */
export async function logAdminAction({ action, entityType, label, details }: AdminLogInput): Promise<boolean> {
  try {
    const { error } = await supabase.from("admin_logs").insert({
      action,
      entity_type: entityType,
      details: { label, ...details },
    });
    return !error;
  } catch {
    return false;
  }
}

export interface AdminLogRow {
  id: string;
  action: AdminLogAction;
  entity_type: AdminLogEntity;
  details: { label?: string; [key: string]: unknown };
  created_at: string;
  admin_profiles: { full_name: string | null; email: string | null } | null;
}

const PHRASES: Record<AdminLogAction, string> = {
  added: "added new",
  edited: "edited",
  deleted: "deleted",
  activated: "activated",
  deactivated: "deactivated",
};

const ENTITY_NAMES: Record<AdminLogEntity, string> = {
  subject: "subject",
  question: "question",
  resource: "study material",
};

/** "Admin Sanket added new subject: NDA 2027" */
export function describeLog(row: AdminLogRow): string {
  const who = row.admin_profiles?.full_name?.trim().split(/\s+/)[0] || row.admin_profiles?.email?.split("@")[0];
  const label = row.details?.label ?? "(no name)";
  return `${who ? `Admin ${who}` : "An admin"} ${PHRASES[row.action]} ${ENTITY_NAMES[row.entity_type] ?? row.entity_type}: ${label}`;
}
