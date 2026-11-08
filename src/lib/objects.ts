import { z } from "zod";

import {
  NEW_PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  ProjectStatus,
  type UserStatus,
} from "@/lib/types";

export * from "@/lib/types";

/* ------------------------------------------------------------ form rules */

const CurrentPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(
    PASSWORD_MAX_LENGTH,
    `Password can be at most ${PASSWORD_MAX_LENGTH} characters long`,
  );

const NewPasswordSchema = z
  .string()
  .min(
    NEW_PASSWORD_MIN_LENGTH,
    `Password must be at least ${NEW_PASSWORD_MIN_LENGTH} characters long`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password can be at most ${PASSWORD_MAX_LENGTH} characters long`,
  );

export const LoginRequestSchema = z.object({
  email: z.email("Invalid email address"),
  password: CurrentPasswordSchema,
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const FirstLoginFormSchema = z
  .object({
    new_password: NewPasswordSchema,
    confirm_password: z.string(),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  });
export type FirstLoginRequest = { new_password: string };

export const ChangePasswordFormSchema = z
  .object({
    current_password: CurrentPasswordSchema,
    new_password: NewPasswordSchema,
    confirm_password: z.string(),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((value) => value.new_password !== value.current_password, {
    error: "New password must differ from the current one",
    path: ["new_password"],
  });
export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export const PasswordConfirmFormSchema = z.object({
  password: CurrentPasswordSchema,
});
export type PasswordConfirmRequest = z.infer<typeof PasswordConfirmFormSchema>;

export const RECOVERY_CODE_PATTERN = /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/;

export const ResetPasswordFormSchema = z
  .object({
    email: z.email("Invalid email address"),
    recovery_code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(RECOVERY_CODE_PATTERN, "Use the format ABCD-EFGH-IJKL-MNOP"),
    new_password: NewPasswordSchema,
    confirm_password: z.string(),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  });
export type ResetPasswordRequest = {
  email: string;
  recovery_code: string;
  new_password: string;
};

export const AddUserFormSchema = z.object({
  email: z.email("Invalid email address"),
  project_ids: z.array(z.number()),
});
export type AddUserRequest = z.infer<typeof AddUserFormSchema>;

export type TargetUserRequest = { target_user_id: number };
export type UserStatusRequest = TargetUserRequest & { status: UserStatus };
export type UserProjectsRequest = TargetUserRequest & { project_ids: number[] };

export const PROJECT_SLUG_PATTERN = /^[a-z][a-z0-9-]{1,49}$/;

export const ProjectFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(
      PROJECT_SLUG_PATTERN,
      "2-50 chars: lowercase letters, digits and dashes, starting with a letter",
    ),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name can be at most 100 characters long"),
  description: z
    .string()
    .trim()
    .max(500, "Description can be at most 500 characters long"),
  url: z
    .url({ protocol: /^https?$/, error: "Must be an http(s) URL" })
    .max(255, "URL can be at most 255 characters long"),
  icon: z.string().min(1),
  status: z.union([
    z.literal(ProjectStatus.Active),
    z.literal(ProjectStatus.Maintenance),
    z.literal(ProjectStatus.Hidden),
  ]),
});
export type ProjectRequest = z.infer<typeof ProjectFormSchema>;
export type ProjectEditRequest = ProjectRequest & { id: number };
