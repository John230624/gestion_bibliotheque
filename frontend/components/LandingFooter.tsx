import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="site-footer" data-animate="soft">
      <div className="site-footer-brand">
        <div className="hero-badge site-footer-logo">
          <span className="hero-badge-stripes" aria-hidden="true" />
          <strong>
            <span>Biblio</span>
          </strong>
        </div>
        <p>Plateforme de lecture, de decouverte et de gestion moderne de bibliotheque.</p>
      </div>

      <div className="site-footer-links">
        <Link href="/">Accueil</Link>
        <Link href="/catalog">Catalogue</Link>
        <Link href="/login">Connexion</Link>
      </div>

      <div className="site-footer-meta">
        <span>Eagle Mountain, UT</span>
        <span>Lun - Jeu 10H - 20H</span>
      </div>
    </footer>
  );
}
