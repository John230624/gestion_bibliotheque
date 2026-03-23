"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRole } from "@/lib/format";
import { clearSession, getStoredUser } from "@/lib/session";
import { User } from "@/lib/types";
import { useRevealOnScroll } from "@/components/useRevealOnScroll";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const headerVisible = useRevealOnScroll();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <main className="page-shell">
      <header className={`site-header glass ${headerVisible ? "is-visible" : "is-hidden"}`}>
        <Link href="/" className="brand-mark">
          <span className="brand-seal" />
          <span>
            <strong>Biblio'</strong>
            <small>Catalogue, emprunts, tableau de bord</small>
          </span>
        </Link>

        <nav className="site-nav">
          <Link href="/">Accueil</Link>
          <Link href="/catalog">Catalogue</Link>
          {user && !user.roles.includes("ROLE_ADMIN") ? <Link href="/dashboard">Compte</Link> : null}
          {user?.roles.includes("ROLE_ADMIN") ? <Link href="/admin">Tableau de bord</Link> : null}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <div className="user-pill">
                <span>{user.fullName}</span>
                <small>{formatRole(user.roles)}</small>
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  clearSession();
                  window.location.href = "/";
                }}
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="button button-secondary">
                Connexion
              </Link>
              <Link href="/register" className="button button-primary">
                Inscription
              </Link>
            </>
          )}
        </div>
      </header>
      {children}
    </main>
  );
}
