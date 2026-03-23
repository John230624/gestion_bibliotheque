"use client";

import { LandingCatalogue } from "@/components/LandingCatalogue";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHero } from "@/components/LandingHero";
import { LandingHowItWorks } from "@/components/LandingHowItWorks";
import { LandingInfoStrip } from "@/components/LandingInfoStrip";
import { LandingMostRead } from "@/components/LandingMostRead";
import { LandingNewsletter } from "@/components/LandingNewsletter";

export function LandingPage() {
  return (
    <div className="home-shell stack-xl">
      <LandingHero />

      <section className="catalog-flow">
        <section className="catalog-band">
          <LandingCatalogue />
        </section>

        <section className="catalog-band most-read-band">
          <LandingMostRead />
        </section>

        <section className="catalog-band">
          <LandingHowItWorks />
        </section>

        <section className="catalog-band">
          <LandingInfoStrip />
        </section>

        <section className="catalog-band">
          <LandingNewsletter />
        </section>

        <section className="catalog-band">
          <LandingFooter />
        </section>
      </section>
    </div>
  );
}
