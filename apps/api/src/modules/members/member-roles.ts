export const MemberRoles = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const;

export type MemberRole = (typeof MemberRoles)[keyof typeof MemberRoles];

export function isMemberRole(value: unknown): value is MemberRole {
  return value === MemberRoles.OWNER || value === MemberRoles.MANAGER || value === MemberRoles.STAFF;
}
