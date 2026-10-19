/** Domain unions mirroring the string columns in Prisma (SQLite has no native enum). */

export const ROLES = ["SUPER_ADMIN", "CLUB_ADMIN", "EDITOR", "MEMBER"] as const;
export type Role = (typeof ROLES)[number];

export const MEMBERSHIP_ROLES = ["PRESIDENT", "MANAGER", "MEMBER"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const MEMBERSHIP_STATUSES = ["ACTIVE", "PENDING", "BLOCKED"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const JOIN_REQUEST_STATUSES = ["NEW", "IN_REVIEW", "APPROVED", "REJECTED"] as const;
export type JoinRequestStatus = (typeof JOIN_REQUEST_STATUSES)[number];

export const BOOK_STATUSES = ["PLANNED", "READING", "FINISHED", "ARCHIVED"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const THREAD_KINDS = ["DISCUSSION", "QUESTION", "ANNOUNCEMENT"] as const;
export type ThreadKind = (typeof THREAD_KINDS)[number];

export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED", "FINISHED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const RSVP_STATUSES = ["GOING", "MAYBE", "CANCELLED"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const NEWS_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type NewsStatus = (typeof NEWS_STATUSES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Platform administrator",
  CLUB_ADMIN: "Klub boshqaruvchisi",
  EDITOR: "Kontent muharriri",
  MEMBER: "A'zo",
};

export const JOIN_STATUS_LABELS: Record<JoinRequestStatus, string> = {
  NEW: "Yangi",
  IN_REVIEW: "Ko‘rib chiqilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  GOING: "Boraman",
  MAYBE: "Ehtimol",
  CANCELLED: "Bormayman",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
