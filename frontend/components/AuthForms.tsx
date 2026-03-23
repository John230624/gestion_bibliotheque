"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";

type AuthFormProps = {
  embedded?: boolean;
  switchHref?: string;
};

export function LoginForm({ embedded = false, switchHref = "/register" }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const login = await api.login({ username: email, password });
      const user = await api.me(login.token);
      saveSession(login.token, user);
      router.push(user.roles.includes("ROLE_ADMIN") ? "/admin" : "/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  const formMarkup = (
    <form className={`auth-panel stack-md ${embedded ? "auth-panel-embedded" : ""}`} onSubmit={onSubmit}>
        <Link href="/" className="hero-badge auth-brand">
          <span className="hero-badge-stripes" aria-hidden="true" />
          <strong>
            <span>Biblio</span>
          </strong>
        </Link>
        <div className="auth-panel-head stack-sm">
          <span className="eyebrow">Connexion</span>
          <h1>Se connecter</h1>
        </div>
        <label className="field auth-field">
          Adresse email
          <input
            className="input auth-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="field auth-field">
          Mot de passe
          <div className="password-field-row">
            <input
              className="input auth-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Masquer" : "Afficher"}
            </button>
          </div>
        </label>
        {message ? <p className="status-line catalog-status-line">{message}</p> : null}
        <button className="form-action-button auth-submit" disabled={loading} type="submit">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="auth-helper">
          Pas encore de compte ? <Link href={switchHref}>S inscrire</Link>
        </p>
      </form>
  );

  if (embedded) {
    return formMarkup;
  }

  return (
    <section className="auth-stage" data-animate="soft">
      {formMarkup}
    </section>
  );
}

export function RegisterForm({ embedded = false, switchHref = "/login" }: AuthFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.register(form);
      router.push("/login");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  const formMarkup = (
    <form className={`auth-panel stack-md ${embedded ? "auth-panel-embedded" : ""}`} onSubmit={onSubmit}>
        <Link href="/" className="hero-badge auth-brand">
          <span className="hero-badge-stripes" aria-hidden="true" />
          <strong>
            <span>Biblio</span>
          </strong>
        </Link>
        <div className="auth-panel-head stack-sm">
          <span className="eyebrow">Inscription</span>
          <h1>Creer un compte</h1>
        </div>
        <div className="two-col-grid auth-grid">
          <label className="field auth-field">
            Nom complet
            <input
              className="input auth-input"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              required
            />
          </label>
          <label className="field auth-field">
            Adresse email
            <input
              className="input auth-input"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label className="field auth-field">
            Telephone
            <input
              className="input auth-input"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </label>
          <label className="field auth-field">
            Mot de passe
            <div className="password-field-row">
              <input
                className="input auth-input"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </label>
        </div>
        {message ? <p className="status-line catalog-status-line">{message}</p> : null}
        <button className="form-action-button auth-submit" disabled={loading} type="submit">
          {loading ? "Creation..." : "Creer mon compte"}
        </button>
        <p className="auth-helper">
          Vous avez deja un compte ? <Link href={switchHref}>Connexion</Link>
        </p>
      </form>
  );

  if (embedded) {
    return formMarkup;
  }

  return (
    <section className="auth-stage" data-animate="soft">
      {formMarkup}
    </section>
  );
}
