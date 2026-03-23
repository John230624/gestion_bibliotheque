"use client";

import { useEffect, useState } from "react";

export function useRevealOnScroll() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY < 24) {
        setVisible(true);
      } else if (delta > 6) {
        setVisible(false);
      } else if (delta < -6) {
        setVisible(true);
      }

      lastY = currentY;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}
