export const MemberRoles = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    STAFF: 'STAFF',
};
export function isMemberRole(value) {
    return value === MemberRoles.OWNER || value === MemberRoles.MANAGER || value === MemberRoles.STAFF;
}
