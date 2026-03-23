export function LandingNewsletter() {
  return (
    <section className="newsletter-band" data-animate="soft">
      <div className="newsletter-copy">
        <span className="eyebrow">Newsletter</span>
        <h2>Rester informe.</h2>
        <p>Nouveautes, selections et temps forts de la bibliotheque, dans un seul email.</p>
      </div>

      <form className="newsletter-form">
        <input type="email" placeholder="Votre adresse email" aria-label="Votre adresse email" />
        <button type="submit" className="hero-login-button newsletter-submit">
          S abonner
        </button>
      </form>
    </section>
  );
}
