import { z } from "zod";
import { DateTime } from "luxon";

export const LoginRequestSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password can be at most 100 characters long"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const SimpleResponseSchema = z.object({
  message: z.string().trim(),
});
export type SimpleResponse = z.infer<typeof SimpleResponseSchema>;

export const GetKeyResponseSchema = z.object({
  key: z.string(),
  updated_at: z
    .object({
      seconds: z.number(),
      nanos: z.number(),
    })
    .transform((value) =>
      DateTime.fromSeconds(value.seconds, {
        zone: "Asia/Kolkata",
      }).toLocaleString(DateTime.DATETIME_MED),
    ),
});
export type GetKeyResponse = z.infer<typeof GetKeyResponseSchema>;

export const RequestMethodSchema = z.enum(["GET", "POST"]);
export type RequestMethod = z.infer<typeof RequestMethodSchema>;

export const ServiceListSchema = z.enum(["auth", "manager"]);
export type ServiceList = z.infer<typeof ServiceListSchema>;

export const ServiceApiMappingSchema = z.record(ServiceListSchema, z.string());
export type ServiceApiMapping = z.infer<typeof ServiceApiMappingSchema>;

export const AppListSchema = z.enum(["Portfolio", "Manager"]);
export type AppList = z.infer<typeof AppListSchema>;

export const AppUrlMappingSchema = z.object({
  name: AppListSchema,
  url: z.url(),
  description: z.string(),
  rel: z.string().optional(),
});
export type AppUrlMapping = z.infer<typeof AppUrlMappingSchema>;

export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
