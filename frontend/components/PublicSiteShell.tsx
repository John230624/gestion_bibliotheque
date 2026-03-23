"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/session";
import { User } from "@/lib/types";
import { HeroQuickSearch } from "@/components/HeroQuickSearch";
import { LandingFooter } from "@/components/LandingFooter";
import { useRevealOnScroll } from "@/components/useRevealOnScroll";
import { AccountMenu } from "@/components/AccountMenu";

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const topbarVisible = useRevealOnScroll();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <div className="public-shell">
      <header className={`public-topbar ${topbarVisible ? "is-visible" : "is-hidden"}`}>
        <div className="public-topbar-inner">
          <Link href="/" className="hero-badge public-brand">
            <span className="hero-badge-stripes" aria-hidden="true" />
            <strong>
              <span>Biblio</span>
            </strong>
          </Link>

          <div className="hero-nav-wrap">
            <HeroQuickSearch />

            <nav className="hero-menu" aria-label="Navigation publique">
              <Link href="/">Accueil</Link>
              <Link href="/catalog">Catalogue</Link>
              {user && !user.roles.includes("ROLE_ADMIN") ? <Link href="/dashboard">Compte</Link> : null}
            </nav>

            {user ? (
              <div className="header-actions">
                <AccountMenu user={user} />
              </div>
            ) : (
              <div className="header-actions">
                <Link href="/login" className="hero-login-button">
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="public-content">{children}</main>

      <section className="catalog-flow">
        <section className="catalog-band">
          <LandingFooter />
        </section>
      </section>
    </div>
  );
}
