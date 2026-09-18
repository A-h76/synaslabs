export const USER_ROLES = ["ADMIN", "TEAM_MEMBER", "CLIENT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TEAM_ROLES = ["ADMIN", "TEAM_MEMBER"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export function isTeamRole(role: UserRole): role is TeamRole {
  return role === "ADMIN" || role === "TEAM_MEMBER";
}

export function isClientRole(role: UserRole): boolean {
  return role === "CLIENT";
}
