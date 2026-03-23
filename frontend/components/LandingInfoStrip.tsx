const infoItems = [
  {
    label: "Adresse",
    value: "1650 E. Stagecoach Run, Eagle Mountain",
  },
  {
    label: "Horaires",
    value: "Lun - Jeu 10H - 20H · Ven 10H - 18H · Sam 10H - 14H",
  },
  {
    label: "Services",
    value: "Consultation, emprunt, espace usager, administration",
  },
];

export function LandingInfoStrip() {
  return (
    <section className="info-strip" data-animate="fade">
      {infoItems.map((item, index) => (
        <div
          key={item.label}
          className="info-strip-item"
          data-animate="lift"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
