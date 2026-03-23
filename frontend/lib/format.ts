export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRole(roles: string[]): string {
  return roles.includes("ROLE_ADMIN") ? "Administrateur" : "Usager";
}
