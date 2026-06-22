export const ROLE_LABELS = {
  admin: "Lead",
  developer: "Developer",
  team: "Reporter",
  viewer: "Project Manager",
} as const;

export type AppRole = keyof typeof ROLE_LABELS;

export function friendlyRoleLabel(role: string | null | undefined) {
  if (role && role in ROLE_LABELS) {
    return ROLE_LABELS[role as AppRole];
  }

  return null;
}

export function canSeeDeliveryFields(role: string | null | undefined) {
  return role === "admin" || role === "developer";
}
