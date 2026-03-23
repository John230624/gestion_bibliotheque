"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { clearSession } from "@/lib/session";
import { User } from "@/lib/types";

export function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const dashboardHref = user.roles.includes("ROLE_ADMIN") ? "/admin" : "/dashboard";
  const accountLabel = user.roles.includes("ROLE_ADMIN") ? "Tableau de bord" : "Compte";
  const openLabel = user.roles.includes("ROLE_ADMIN") ? "Tableau de bord" : "Mes infos";

  return (
    <div className={`account-menu ${open ? "is-open" : ""}`} ref={rootRef}>
      <button className="hero-login-button account-menu-trigger" type="button" onClick={() => setOpen((value) => !value)}>
        <span>{accountLabel}</span>
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open ? (
        <div className="account-menu-panel">
          <div className="account-menu-user">
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
          </div>
          <Link href={dashboardHref} onClick={() => setOpen(false)}>
            {openLabel}
          </Link>
          <Link href="/catalog" onClick={() => setOpen(false)}>
            Catalogue
          </Link>
          <button
            type="button"
            onClick={() => {
              clearSession();
              window.location.href = "/";
            }}
          >
            Deconnexion
          </button>
        </div>
      ) : null}
    </div>
  );
}
