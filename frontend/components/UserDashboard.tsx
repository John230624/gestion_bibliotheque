"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { clearSession, getStoredUser, getToken, saveSession } from "@/lib/session";
import { BorrowRequest, User } from "@/lib/types";

type UserTab = "overview" | "requests" | "account";

export function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserTab>("overview");
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState({ fullName: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    const cachedUser = getStoredUser();

    if (!token || !cachedUser) {
      router.push("/login");
      return;
    }

    setUser(cachedUser);
    setProfile({ fullName: cachedUser.fullName, phone: cachedUser.phone ?? "", password: "" });

    Promise.all([api.me(token), api.borrowRequests(token)])
      .then(([freshUser, userRequests]) => {
        saveSession(token, freshUser);
        setUser(freshUser);
        setRequests(userRequests.items);
        setProfile({ fullName: freshUser.fullName, phone: freshUser.phone ?? "", password: "" });
      })
      .catch((error: Error) => {
        setMessage(error.message);
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const requestSummary = useMemo(() => {
    return {
      pending: requests.filter((request) => request.status === "PENDING").length,
      approved: requests.filter((request) => request.status === "APPROVED").length,
      returned: requests.filter((request) => request.status === "RETURNED").length,
    };
  }, [requests]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      setSaving(true);
      const response = await api.updateMe(token, profile);
      saveSession(token, response.user);
      setUser(response.user);
      setMessage(response.message);
      setProfile((current) => ({ ...current, password: "" }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise a jour impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className="catalog-empty-state">Chargement ...</section>;
  }

  return (
    <div className="stack-lg user-dashboard-shell">
      <section className="dashboard-dark-panel stack-md" data-animate="soft">
        <div className="section-heading">
          <span className="eyebrow">Mon compte</span>
          <h1>Mes emprunts et mes demandes.</h1>
        </div>
        <p className="dashboard-dark-copy">
          Retrouvez ici uniquement les informations utiles: les livres empruntes, les demandes
          envoyees a l administration et vos informations personnelles.
        </p>
        {message ? <p className="status-line dashboard-dark-status">{message}</p> : null}
      </section>

      <section className="dashboard-tab-strip">
        <button
          type="button"
          className={`dashboard-tab ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Vue d ensemble
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === "requests" ? "is-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Mes demandes
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === "account" ? "is-active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Profil
        </button>
      </section>

      {activeTab === "overview" ? (
        <>
          <section className="dashboard-summary-grid">
            <article className="dashboard-stat-card" data-animate="lift">
              <small>Livres empruntes</small>
              <strong>{requestSummary.approved}</strong>
              <p>Demandes validees par l administrateur.</p>
            </article>
            <article className="dashboard-stat-card" data-animate="lift">
              <small>Demandes envoyees</small>
              <strong>{requestSummary.pending}</strong>
              <p>Demandes en attente de retour.</p>
            </article>
          </section>

          <section className="dashboard-info-grid">
            <article className="dashboard-dark-card stack-md" data-animate="soft">
              <span className="eyebrow">Informations</span>
              <h2>{user?.fullName}</h2>
              <p>{user?.email}</p>
              <p>{user?.phone ?? "Aucun telephone renseigne."}</p>
            </article>

            <article className="dashboard-dark-card stack-md" data-animate="soft">
              <span className="eyebrow">Statuts</span>
              <h2>Livres et demandes</h2>
              <div className="dashboard-list dashboard-list-dark">
                {requests.slice(0, 4).map((request) => (
                  <div key={request.id} className="dashboard-list-row">
                    <div>
                      <strong>{request.book.title}</strong>
                      <span>{formatDate(request.requestedAt)}</span>
                    </div>
                    <span className={`availability ${request.status === "APPROVED" ? "available" : "unavailable"}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
                {requests.length === 0 ? <p>Aucune demande d emprunt pour le moment.</p> : null}
              </div>
            </article>
          </section>
        </>
      ) : null}

      {activeTab === "requests" ? (
        <section className="dashboard-dark-card">
          <div className="section-heading">
            <span className="eyebrow">Demandes d emprunt</span>
            <h2>Historique complet</h2>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Livre</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.book.title}</td>
                    <td>{formatDate(request.requestedAt)}</td>
                    <td>{request.status}</td>
                    <td>{request.note ?? "Aucune note"}</td>
                  </tr>
                ))}
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Aucune demande enregistree pour le moment.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === "account" ? (
        <section className="dashboard-info-grid">
          <form className="dashboard-dark-card stack-md" onSubmit={updateProfile}>
            <span className="eyebrow">Profil</span>
            <h2>Modifier mes informations</h2>
            <label className="field auth-field">
              Nom complet
              <input
                className="input auth-input"
                value={profile.fullName}
                onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
              />
            </label>
            <label className="field auth-field">
              Telephone
              <input
                className="input auth-input"
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              />
            </label>
            <label className="field auth-field">
              Nouveau mot de passe
              <input
                className="input auth-input"
                type="password"
                value={profile.password}
                onChange={(event) => setProfile({ ...profile, password: event.target.value })}
              />
            </label>
            <button className="form-action-button" type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Mettre a jour"}
            </button>
          </form>

          <article className="dashboard-dark-card stack-md">
            <span className="eyebrow">Compte</span>
            <h2>Etat du compte</h2>
            <p>Livres empruntes: {requestSummary.approved}</p>
            <p>Demandes envoyees: {requestSummary.pending}</p>
            <p>Livres retournes: {requestSummary.returned}</p>
          </article>
        </section>
      ) : null}
    </div>
  );
}
