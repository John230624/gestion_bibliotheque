import Link from "next/link";

const steps = [
  {
    index: "01",
    title: "Chercher un livre",
    body: "Par categorie, recherche rapide ou catalogue complet selon votre besoin.",
  },
  {
    index: "02",
    title: "Ouvrir la fiche",
    body: "Verifier la disponibilite, les details du livre et les informations utiles avant emprunt.",
  },
  {
    index: "03",
    title: "Emprunter ou reserver",
    body: "Si le livre est disponible, l usager peut lancer sa demande depuis sa fiche dediee.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="journey-section" data-animate="fade">
      <div className="journey-head">
        <span className="eyebrow">Comment Emprunter</span>
        <h2>Un parcours simple, pense pour aller du choix au livre sans friction.</h2>
      </div>

      <div className="journey-grid">
        {steps.map((step, index) => (
          <article
            key={step.index}
            className="journey-card"
            data-animate="lift"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="journey-index">{step.index}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <div className="journey-actions">
        <Link href="/catalog" className="hero-login-button">
          Ouvrir le catalogue
        </Link>
      </div>
    </section>
  );
}
