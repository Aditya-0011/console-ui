import { DateTime, Settings } from "luxon";

export const TIME_ZONE = "Asia/Kolkata";

// Every Luxon use goes through this module, so the zone is set before any
// DateTime is created even though luxon itself is loaded lazily.
Settings.defaultZone = TIME_ZONE;

/** protojson Timestamp: an RFC3339 string. */
export type GrpcTimestamp = string;

export function fromGrpcTime(value: GrpcTimestamp): DateTime {
  return DateTime.fromISO(value, { zone: TIME_ZONE });
}

export function toGrpcTime(value: DateTime): GrpcTimestamp {
  const iso = value.toUTC().toISO();
  if (!iso) throw new Error(`Invalid date: ${value.invalidReason}`);
  return iso;
}

export function grpcTimeMillis(
  value: GrpcTimestamp | null | undefined,
): number {
  return value ? fromGrpcTime(value).toMillis() : 0;
}

export function formatTimestamp(
  value: GrpcTimestamp | null | undefined,
  format: Intl.DateTimeFormatOptions = DateTime.DATETIME_MED,
): string {
  if (!value) return "";
  return fromGrpcTime(value).toLocaleString(format);
}
