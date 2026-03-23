"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { HeroQuickSearch } from "@/components/HeroQuickSearch";
import { useRevealOnScroll } from "@/components/useRevealOnScroll";
import { getStoredUser } from "@/lib/session";
import { User } from "@/lib/types";
import { AccountMenu } from "@/components/AccountMenu";

export function LandingHero() {
  const topbarVisible = useRevealOnScroll();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <section className="hero-stage-full">
      <div className="hero-stage-inner">
        <div className={`hero-topbar ${topbarVisible ? "is-visible" : "is-hidden"}`} data-animate="fade">
          <div className="hero-badge">
            <span className="hero-badge-stripes" aria-hidden="true" />
            <strong>
              <span>Biblio</span>
            </strong>
          </div>

          <div className="hero-nav-wrap">
            <HeroQuickSearch />

            <nav className="hero-menu" aria-label="Navigation principale du hero">
              <Link href="/catalog">Catalogue</Link>
            </nav>

            {user ? (
              <AccountMenu user={user} />
            ) : (
              <Link href="/login" className="hero-login-button">
                <span>Connexion</span>
                <ArrowUpRight size={18} strokeWidth={2.25} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        <div className="hero-scene">
          <div className="hero-stage-grid">
            <div className="hero-copy" data-animate="rise">
              <span className="eyebrow hero-kicker">Autonomiser notre communaute</span>
              <h1>Bibliotheque publique, services de lecture et gestion moderne.</h1>
              <p>
                Une experience editoriale immersive qui met en avant la recherche, les
                demandes d emprunt, l espace usager et l administration du catalogue dans
                une seule plateforme.
              </p>
            </div>

            <aside className="hero-info-rail" data-animate="fade">
              <article className="hero-info-block">
                <span className="hero-info-icon">
                  <MapPin size={24} strokeWidth={2} aria-hidden="true" />
                </span>
                <div>
                  <strong>1650 E. Stagecoach Run</strong>
                  <p>Eagle Mountain, UT 84005</p>
                </div>
              </article>

              <article className="hero-info-block">
                <span className="hero-info-icon">
                  <Clock3 size={24} strokeWidth={2} aria-hidden="true" />
                </span>
                <div>
                  <strong>Lundi - Jeudi : 10H - 20H</strong>
                  <p>Vendredi : 10H - 18H · Samedi : 10H - 14H</p>
                </div>
              </article>

              <article className="hero-info-text">
                <p>
                  Des services sur place et en ligne pour l inscription, la recherche,
                  les demandes d emprunt, le suivi des statuts et l administration du
                  catalogue.
                </p>
              </article>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
