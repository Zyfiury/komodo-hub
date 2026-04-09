import { redirect } from "next/navigation";
import type { SessionPayload } from "@/lib/auth/session";
import { UserRole, type UserRoleValue } from "@/lib/constants";

export function dashboardPathForRole(role: UserRoleValue): string {
  switch (role) {
    case UserRole.FOUNDATION_ADMIN:
      return "/dashboard/foundation";
    case UserRole.SCHOOL_ADMIN:
      return "/dashboard/school";
    case UserRole.TEACHER:
      return "/dashboard/teacher";
    case UserRole.STUDENT:
      return "/dashboard/student";
    case UserRole.COMMUNITY_ADMIN:
    case UserRole.COMMUNITY_MEMBER:
      return "/dashboard/community";
    default:
      return "/login";
  }
}

export function requireSession(s: SessionPayload | null): asserts s is SessionPayload {
  if (!s) redirect("/login");
}

export function requireRoles(s: SessionPayload | null, roles: UserRoleValue[]): SessionPayload {
  requireSession(s);
  if (!roles.includes(s.role)) {
    redirect(dashboardPathForRole(s.role));
  }
  return s;
}

export function requireSameOrganisation(s: SessionPayload, orgId: string): void {
  if (s.organisationId !== orgId) redirect(dashboardPathForRole(s.role));
}
