"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { clearSession, getStoredUser, getToken, saveSession } from "@/lib/session";
import { Book, BorrowRequest, BorrowRequestStatus, StatsResponse, User } from "@/lib/types";

const defaultBookForm = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  description: "",
  imageUrl: "",
  availableCopies: 1,
  publishedAt: "",
};

const defaultUserForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  roles: ["ROLE_USER"],
};

type AdminTab = "overview" | "books" | "users" | "requests";

const adminSections: Array<{ key: AdminTab; label: string; eyebrow: string }> = [
  { key: "overview", label: "Tableau de bord", eyebrow: "Vue globale" },
  { key: "books", label: "Gestion des livres", eyebrow: "Livres" },
  { key: "users", label: "Gestion des utilisateurs", eyebrow: "Utilisateurs" },
  { key: "requests", label: "Gestion des demandes", eyebrow: "Emprunts" },
];

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [stats, setStats] = useState<StatsResponse["stats"] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState(defaultBookForm);
  const [bookImageName, setBookImageName] = useState("");
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [requestEdits, setRequestEdits] = useState<Record<number, { status: BorrowRequestStatus; note: string }>>({});
  const [loading, setLoading] = useState(true);

  const requestSummary = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "PENDING").length,
      approved: requests.filter((request) => request.status === "APPROVED").length,
      rejected: requests.filter((request) => request.status === "REJECTED").length,
      returned: requests.filter((request) => request.status === "RETURNED").length,
    }),
    [requests],
  );

  async function loadAll(activeToken: string) {
    const [me, booksResponse, usersResponse, requestsResponse, statsResponse] = await Promise.all([
      api.me(activeToken),
      api.books(),
      api.users(activeToken),
      api.borrowRequests(activeToken),
      api.stats(activeToken),
    ]);

    if (!me.roles.includes("ROLE_ADMIN")) {
      clearSession();
      router.push("/login");
      return;
    }

    saveSession(activeToken, me);
    setUser(me);
    setBooks(booksResponse.items);
    setUsers(usersResponse.items);
    setRequests(requestsResponse.items);
    setStats(statsResponse.stats);
    setRequestEdits(
      Object.fromEntries(
        requestsResponse.items.map((request) => [
          request.id,
          { status: request.status, note: request.note ?? "" },
        ]),
      ),
    );
  }

  useEffect(() => {
    const activeToken = getToken();
    const cachedUser = getStoredUser();

    if (!activeToken || !cachedUser) {
      router.push("/login");
      return;
    }

    setToken(activeToken);

    loadAll(activeToken)
      .catch((error: Error) => {
        setMessage(error.message);
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function createBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      if (editingBookId) {
        await api.updateBook(token, editingBookId, bookForm);
      } else {
        await api.createBook(token, bookForm);
      }
      setBookForm(defaultBookForm);
      setBookImageName("");
      setEditingBookId(null);
      setMessage(editingBookId ? "Livre mis a jour." : "Livre ajoute.");
      await loadAll(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur lors de la creation.");
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      if (editingUserId) {
        await api.updateUser(token, editingUserId, {
          ...userForm,
          password: userForm.password || undefined,
        });
      } else {
        await api.createUser(token, userForm);
      }
      setUserForm(defaultUserForm);
      setEditingUserId(null);
      setMessage(editingUserId ? "Utilisateur mis a jour." : "Utilisateur cree.");
      await loadAll(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur lors de la creation.");
    }
  }

  async function saveRequest(id: number) {
    if (!token) return;
    const edit = requestEdits[id];
    if (!edit) return;
    if (edit.status === "REJECTED" && edit.note.trim() === "") {
      setMessage("Ajoute une note pour expliquer le rejet de la demande.");
      return;
    }
    try {
      await api.updateBorrowRequest(token, id, edit);
      setMessage("Demande mise a jour.");
      await loadAll(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise a jour impossible.");
    }
  }

  async function deleteRequest(id: number) {
    if (!token) return;
    try {
      await api.deleteBorrowRequest(token, id);
      setMessage("Demande supprimee.");
      await loadAll(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible.");
    }
  }

  async function deleteBook(id: number) {
    if (!token) return;
    try {
      await api.deleteBook(token, id);
      setMessage("Livre supprime.");
      await loadAll(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible.");
    }
  }

  async function deleteUser(id: number) {
    if (!token) return;
    try {
      await api.deleteUser(token, id);
      setMessage("Utilisateur supprime.");
      await loadAll(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible.");
    }
  }

  function startBookEdit(book: Book) {
    setActiveTab("books");
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      description: book.description,
      imageUrl: book.imageUrl ?? "",
      availableCopies: book.availableCopies,
      publishedAt: book.publishedAt.slice(0, 10),
    });
    setBookImageName(book.imageUrl ? "Couverture deja enregistree" : "");
  }

  function startUserEdit(member: User) {
    setActiveTab("users");
    setEditingUserId(member.id);
    setUserForm({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone ?? "",
      password: "",
      roles: member.roles,
    });
  }

  if (loading) {
    return <section className="catalog-empty-state">Chargement du tableau de bord administrateur...</section>;
  }

  return (
    <section className="admin-workspace" data-animate="soft">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="hero-badge admin-sidebar-logo">
            <span className="hero-badge-stripes" aria-hidden="true" />
            <strong>
              <span>Biblio</span>
            </strong>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {adminSections.map((section) => (
            <button
              key={section.key}
              type="button"
              className={`admin-nav-item ${activeTab === section.key ? "is-active" : ""}`}
              onClick={() => setActiveTab(section.key)}
            >
              <small>{section.eyebrow}</small>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <strong>{user?.fullName}</strong>
          <span>Administrateur</span>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <span className="eyebrow">Tableau de bord</span>
          <div className="admin-topbar-links">
            <Link href="/catalog">Catalogue public</Link>
            <button
              type="button"
              onClick={() => {
                clearSession();
                router.push("/");
                router.refresh();
              }}
            >
              Deconnexion
            </button>
          </div>
        </div>

        {message ? <p className="status-line dashboard-dark-status">{message}</p> : null}

        {activeTab === "overview" ? (
          <div className="stack-lg">
            <section className="admin-stats-grid">
              <article className="admin-stat-tile">
                <small>Livres empruntes</small>
                <strong>{stats?.overview.borrowedBooks ?? 0}</strong>
                <span>Valides par l administration</span>
              </article>
              <article className="admin-stat-tile">
                <small>Utilisateurs inscrits</small>
                <strong>{stats?.overview.registeredUsers ?? 0}</strong>
                <span>Comptes actifs en base</span>
              </article>
              <article className="admin-stat-tile">
                <small>Demandes en cours</small>
                <strong>{stats?.overview.pendingRequests ?? 0}</strong>
                <span>Attente de traitement</span>
              </article>
              <article className="admin-stat-tile">
                <small>Livres au catalogue</small>
                <strong>{stats?.overview.catalogBooks ?? 0}</strong>
                <span>Inventaire global</span>
              </article>
            </section>

            <section className="admin-insights-grid">
              <article className="admin-panel">
                <div className="section-heading">
                  <span className="eyebrow">Repartition</span>
                  <h2>Demandes d emprunt</h2>
                </div>
                <div className="dashboard-list dashboard-list-dark">
                  <div className="dashboard-list-row"><strong>En attente</strong><span>{requestSummary.pending}</span></div>
                  <div className="dashboard-list-row"><strong>Approuvees</strong><span>{requestSummary.approved}</span></div>
                  <div className="dashboard-list-row"><strong>Rejetees</strong><span>{requestSummary.rejected}</span></div>
                  <div className="dashboard-list-row"><strong>Retournees</strong><span>{requestSummary.returned}</span></div>
                </div>
              </article>

              <article className="admin-panel">
                <div className="section-heading">
                  <span className="eyebrow">Inventaire</span>
                  <h2>Lecture rapide du systeme</h2>
                </div>
                <div className="admin-api-grid">
                  <div className="admin-api-card">
                    <strong>Catalogue</strong>
                    <span>{books.length} livres enregistres dans le systeme</span>
                  </div>
                  <div className="admin-api-card">
                    <strong>Utilisateurs</strong>
                    <span>{users.length} comptes suivis par l administration</span>
                  </div>
                  <div className="admin-api-card">
                    <strong>Demandes</strong>
                    <span>{requests.length} demandes traitees ou en attente</span>
                  </div>
                  <div className="admin-api-card">
                    <strong>Exemplaires</strong>
                    <span>{stats?.inventory.totalAvailableCopies ?? 0} exemplaires disponibles</span>
                  </div>
                </div>
              </article>
            </section>
          </div>
        ) : null}

        {activeTab === "books" ? (
          <section className="admin-content-grid">
            <form className="admin-panel stack-md" onSubmit={createBook}>
              <span className="eyebrow">Gestion des livres</span>
              <h2>{editingBookId ? "Modifier un livre" : "Ajouter un livre"}</h2>
              <label className="field auth-field"><span>Titre</span><input className="input auth-input" value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} required /></label>
              <label className="field auth-field"><span>Auteur</span><input className="input auth-input" value={bookForm.author} onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })} required /></label>
              <label className="field auth-field"><span>Categorie</span><input className="input auth-input" value={bookForm.category} onChange={(event) => setBookForm({ ...bookForm, category: event.target.value })} required /></label>
              <label className="field auth-field"><span>ISBN</span><input className="input auth-input" value={bookForm.isbn} onChange={(event) => setBookForm({ ...bookForm, isbn: event.target.value })} required /></label>
              <label className="field auth-field">
                <span>Image du livre</span>
                <input
                  className="input auth-input file-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setBookImageName("");
                      setBookForm({ ...bookForm, imageUrl: "" });
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === "string" ? reader.result : "";
                      setBookForm((current) => ({ ...current, imageUrl: result }));
                      setBookImageName(file.name);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <small className="field-hint">
                  {bookImageName || "Selectionne une image depuis ton ordinateur."}
                </small>
              </label>
              <label className="field auth-field"><span>Description</span><textarea className="input auth-input auth-textarea" value={bookForm.description} onChange={(event) => setBookForm({ ...bookForm, description: event.target.value })} required /></label>
              <div className="two-col-grid">
                <label className="field auth-field"><span>Exemplaires</span><input className="input auth-input" type="number" min={0} value={bookForm.availableCopies} onChange={(event) => setBookForm({ ...bookForm, availableCopies: Number(event.target.value) })} required /></label>
                <label className="field auth-field"><span>Publication</span><input className="input auth-input" type="date" value={bookForm.publishedAt} onChange={(event) => setBookForm({ ...bookForm, publishedAt: event.target.value })} required /></label>
              </div>
              <div className="hero-actions">
                <button className="form-action-button" type="submit">{editingBookId ? "Enregistrer" : "Ajouter le livre"}</button>
                {editingBookId ? <button className="catalog-inline-button" type="button" onClick={() => { setEditingBookId(null); setBookForm(defaultBookForm); }}>Annuler</button> : null}
              </div>
            </form>

            <article className="admin-panel">
              <div className="section-heading"><span className="eyebrow">Lecture</span><h2>Catalogue actuel</h2></div>
              <div className="table-wrap">
                <table className="data-table admin-table">
                  <thead><tr><th>Titre</th><th>Categorie</th><th>ISBN</th><th>Couverture</th><th>Exemplaires</th><th>Actions</th></tr></thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.category}</td>
                        <td>{book.isbn}</td>
                        <td>{book.imageUrl ? "Oui" : "Non"}</td>
                        <td>{book.availableCopies}</td>
                        <td>
                          <div className="inline-actions">
                            <button className="table-action" onClick={() => startBookEdit(book)} type="button">Modifier</button>
                            <button className="table-action" onClick={() => deleteBook(book.id)} type="button">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "users" ? (
          <section className="admin-content-grid">
            <form className="admin-panel stack-md" onSubmit={createUser}>
              <span className="eyebrow">Gestion des utilisateurs</span>
              <h2>{editingUserId ? "Modifier un utilisateur" : "Creer un utilisateur"}</h2>
              <label className="field auth-field"><span>Nom complet</span><input className="input auth-input" value={userForm.fullName} onChange={(event) => setUserForm({ ...userForm, fullName: event.target.value })} required /></label>
              <label className="field auth-field"><span>Email</span><input className="input auth-input" type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required /></label>
              <label className="field auth-field"><span>Telephone</span><input className="input auth-input" value={userForm.phone} onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })} /></label>
              <label className="field auth-field"><span>Mot de passe</span><input className="input auth-input" type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required={!editingUserId} /></label>
              <label className="field auth-field">
                <span>Role</span>
                <select className="input auth-input" value={userForm.roles[0]} onChange={(event) => setUserForm({ ...userForm, roles: [event.target.value] })}>
                  <option value="ROLE_USER">Usager</option>
                  <option value="ROLE_ADMIN">Administrateur</option>
                </select>
              </label>
              <div className="hero-actions">
                <button className="form-action-button" type="submit">{editingUserId ? "Enregistrer" : "Ajouter l utilisateur"}</button>
                {editingUserId ? <button className="catalog-inline-button" type="button" onClick={() => { setEditingUserId(null); setUserForm(defaultUserForm); }}>Annuler</button> : null}
              </div>
            </form>

            <article className="admin-panel">
              <div className="section-heading"><span className="eyebrow">Lecture</span><h2>Utilisateurs</h2></div>
              <div className="table-wrap">
                <table className="data-table admin-table">
                  <thead><tr><th>Nom</th><th>Email</th><th>Role</th><th>Telephone</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map((member) => (
                      <tr key={member.id}>
                        <td>{member.fullName}</td>
                        <td>{member.email}</td>
                        <td>{member.roles.join(", ")}</td>
                        <td>{member.phone ?? "-"}</td>
                        <td>
                          <div className="inline-actions">
                            <button className="table-action" onClick={() => startUserEdit(member)} type="button">Modifier</button>
                            <button className="table-action" onClick={() => deleteUser(member.id)} type="button">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "requests" ? (
          <section className="admin-panel">
            <div className="section-heading"><span className="eyebrow">Gestion des emprunts</span><h2>Demandes d emprunt</h2></div>
            <div className="table-wrap">
              <table className="data-table admin-table">
                <thead><tr><th>Usager</th><th>Livre</th><th>Date</th><th>Statut</th><th>Note</th><th>Actions</th></tr></thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.user.fullName}</td>
                      <td>{request.book.title}</td>
                      <td>{formatDate(request.requestedAt)}</td>
                      <td>
                        <select
                          className="input auth-input compact-select"
                          value={requestEdits[request.id]?.status ?? request.status}
                          onChange={(event) =>
                            setRequestEdits((current) => ({
                              ...current,
                              [request.id]: {
                                status: event.target.value as BorrowRequestStatus,
                                note: current[request.id]?.note ?? request.note ?? "",
                              },
                            }))
                          }
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="RETURNED">RETURNED</option>
                        </select>
                      </td>
                      <td>
                        <textarea
                          className="input auth-input compact-textarea"
                          value={requestEdits[request.id]?.note ?? request.note ?? ""}
                          onChange={(event) =>
                            setRequestEdits((current) => ({
                              ...current,
                              [request.id]: {
                                status: current[request.id]?.status ?? request.status,
                                note: event.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <div className="inline-actions">
                          <button className="table-action" type="button" onClick={() => saveRequest(request.id)}>Enregistrer</button>
                          <button className="table-action" type="button" onClick={() => deleteRequest(request.id)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
