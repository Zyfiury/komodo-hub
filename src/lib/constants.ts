/** Stored in DB as plain strings (SQLite). */

export const OrgType = {
  FOUNDATION: "FOUNDATION",
  SCHOOL: "SCHOOL",
  COMMUNITY: "COMMUNITY",
} as const;

export const OrgStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  SUSPENDED: "SUSPENDED",
} as const;

export const UserRole = {
  FOUNDATION_ADMIN: "FOUNDATION_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  COMMUNITY_ADMIN: "COMMUNITY_ADMIN",
  COMMUNITY_MEMBER: "COMMUNITY_MEMBER",
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const PublicationState = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  FLAGGED: "FLAGGED",
  REJECTED: "REJECTED",
} as const;

export const SightingState = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const CampaignStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CLOSED: "CLOSED",
} as const;

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELLED: "CANCELLED",
  TRIAL: "TRIAL",
} as const;

export const LibraryItemType = {
  ARTICLE: "ARTICLE",
  ESSAY: "ESSAY",
  REPORT: "REPORT",
  UPLOAD: "UPLOAD",
  CONTRIBUTION: "CONTRIBUTION",
} as const;

export const LibraryAudience = {
  PUBLIC: "PUBLIC",
  SCHOOL_PUBLIC: "SCHOOL_PUBLIC",
  ORG_INTERNAL: "ORG_INTERNAL",
} as const;

export const SubmissionReviewState = {
  PENDING: "PENDING",
  REVIEWED: "REVIEWED",
  NEEDS_REVISION: "NEEDS_REVISION",
} as const;

export const SESSION_COOKIE = "kh_session";
