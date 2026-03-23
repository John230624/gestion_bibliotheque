"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const catalogueRows = [
  {
    title: "Romans",
    type: "Litterature",
    href: "/catalog?category=Romans",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    description:
      "Fictions contemporaines, classiques, romans historiques et coups de coeur du moment pour tous les lecteurs.",
  },
  {
    title: "Sciences",
    type: "Savoirs",
    href: "/catalog?category=Sciences",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    description:
      "Astronomie, biologie, technologie, medecine et ouvrages de vulgarisation pour apprendre et approfondir.",
  },
  {
    title: "Jeunesse",
    type: "Famille",
    href: "/catalog?category=Jeunesse",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",
    description:
      "Albums, premieres lectures, bandes dessinees et selections pedagogiques pour enfants et adolescents.",
  },
  {
    title: "Patrimoine",
    type: "Archives",
    href: "/catalog?category=Patrimoine",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
    description:
      "Fonds locaux, memoires, documents rares et collections de reference consultables dans l espace dedie.",
  },
];

export function LandingCatalogue() {
  return (
    <section className="catalog-feature" id="catalogue" data-animate="fade">
      <div className="catalog-feature-head">
        <div className="catalog-feature-title">
          <span className="catalog-feature-kicker">Catalogue</span>
        </div>
      </div>

      <div className="catalog-feature-table">
        {catalogueRows.map((row, index) => (
          <article
            key={row.title}
            className="catalog-row"
            data-animate="lift"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Link href={row.href} className="catalog-row-title">
              <h3>{row.title}</h3>
            </Link>

            <Link href={row.href} className="catalog-row-description">
              <p>{row.description}</p>
            </Link>

            <div className="catalog-row-action">
              <span className="catalog-row-line" aria-hidden="true" />
              <Link href={row.href}>
                <span>Explorer</span>
                <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>

            <Link href={row.href} className="catalog-row-visual">
              <img src={row.image} alt={row.title} />
              <span>{row.type}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
