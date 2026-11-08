/**
 * Wire types shared with the gateway (protojson: snake_case, enums as
 * numbers, timestamps as RFC3339 strings). Kept free of zod so the eagerly
 * loaded auth/API layer doesn't pull the validation library into the entry.
 */
import type { GrpcTimestamp } from "@/lib/time";

export const PASSWORD_MAX_LENGTH = 128;
export const NEW_PASSWORD_MIN_LENGTH = 12;

/* ------------------------------------------------------------------ enums */

export const Role = { Admin: 1, Tenant: 2 } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = { Active: 1, Disabled: 2 } as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ProjectStatus = { Active: 1, Maintenance: 2, Hidden: 3 } as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: "Active",
  [ProjectStatus.Maintenance]: "Maintenance",
  [ProjectStatus.Hidden]: "Hidden",
};

/* ------------------------------------------------------- response shapes */

export type Identity = {
  user_id: number;
  email: string;
  role: Role;
  must_change_password: boolean;
  /** Slugs of the projects this user can open. */
  projects: string[];
};

export type SessionIdentity = Identity & { session_id: string };

export type Project = {
  id: number;
  slug: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  status: ProjectStatus;
  created_at: GrpcTimestamp;
  updated_at: GrpcTimestamp;
};

export type User = {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  must_change_password: boolean;
  project_ids: number[];
  created_at: GrpcTimestamp;
  last_login_at?: GrpcTimestamp;
};

export type DeviceSession = {
  id: string;
  current: boolean;
  created_at: GrpcTimestamp;
  last_seen_at: GrpcTimestamp;
  ip: string;
  user_agent: string;
};

export type SimpleResponse = { message: string };
export type ProjectsResponse = { projects: Project[] };
export type UsersResponse = { users: User[] };
export type SessionsResponse = { sessions: DeviceSession[] };
export type RecoveryCodesResponse = { codes: string[] };
export type RecoveryCodesStatus = {
  remaining: number;
  generated_at?: GrpcTimestamp;
};
/** protojson omits empty fields: no key_hint means no key yet. */
export type GetKeyResponse = {
  key_hint?: string;
  updated_at?: GrpcTimestamp;
  origins?: string[];
};
export type KeyOriginsResponse = { origins?: string[] };
export type RotateKeyResponse = { key: string; updated_at: GrpcTimestamp };
export type AddUserResponse = { user: User; temporary_password: string };
export type TemporaryPasswordResponse = { temporary_password: string };

export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FetchError";
    this.status = status;
  }
}
