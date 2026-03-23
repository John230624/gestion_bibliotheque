import { User } from "@/lib/types";

const TOKEN_KEY = "gestion_bibliotheque_token";
const USER_KEY = "gestion_bibliotheque_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function saveSession(token: string, user: User): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
