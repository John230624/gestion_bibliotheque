"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { LoginForm, RegisterForm } from "@/components/AuthForms";

function buildHref(pathname: string, searchParams: URLSearchParams, mode?: "login" | "register") {
  const params = new URLSearchParams(searchParams.toString());

  if (mode) {
    params.set("auth", mode);
  } else {
    params.delete("auth");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function AuthModal() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("auth");

  if (mode !== "login" && mode !== "register") {
    return null;
  }

  const loginHref = buildHref(pathname, searchParams, "login");
  const registerHref = buildHref(pathname, searchParams, "register");
  const closeHref = buildHref(pathname, searchParams);

  return (
    <div className="auth-modal-shell">
      <button
        type="button"
        className="auth-modal-backdrop"
        aria-label="Fermer"
        onClick={() => router.replace(closeHref)}
      />

      <div className="auth-modal-dialog" role="dialog" aria-modal="true" aria-label="Authentification">
        <Link href={closeHref} className="auth-modal-close" aria-label="Fermer la fenetre">
          <X size={18} strokeWidth={2.2} aria-hidden="true" />
        </Link>

        {mode === "login" ? (
          <LoginForm embedded switchHref={registerHref} />
        ) : (
          <RegisterForm embedded switchHref={loginHref} />
        )}
      </div>
    </div>
  );
}
