"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getBookCoverImage, getBookVisual } from "@/lib/book-display";
import { fallbackBooks } from "@/lib/fallback-books";
import { formatDate } from "@/lib/format";
import { getToken } from "@/lib/session";
import { Book } from "@/lib/types";

function filterBooks(
  books: Book[],
  filters: { q?: string; category?: string; available?: boolean },
) {
  const query = filters.q?.trim().toLowerCase() ?? "";

  return books.filter((book) => {
    const matchesQuery =
      query.length === 0 ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query);

    const matchesCategory = !filters.category || book.category === filters.category;
    const matchesAvailable = !filters.available || book.isAvailable;

    return matchesQuery && matchesCategory && matchesAvailable;
  });
}

export function BookCatalogue() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "true");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ q: query, category, available: availableOnly }),
    [availableOnly, category, query],
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "");
    setAvailableOnly(searchParams.get("available") === "true");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .books(filters)
      .then((response) => {
        if (cancelled) return;
        setBooks(response.items);
        setCategories(response.meta.categories);
        setMessage(null);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        const localBooks = filterBooks(fallbackBooks, filters);
        const localCategories = [...new Set(fallbackBooks.map((book) => book.category))];
        setBooks(localBooks);
        setCategories(localCategories);
        setMessage(
          `${error.message} Affichage d une selection locale en attendant le retour du serveur.`
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  async function borrowBook(bookId: number) {
    const token = getToken();
    if (!token) {
      setMessage("Connecte-toi d abord pour envoyer une demande d emprunt.");
      return;
    }

    try {
      const response = await api.createBorrowRequest(token, { bookId });
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inattendue.");
    }
  }

  const groupedBooks = useMemo(() => {
    const groups = new Map<string, Book[]>();

    books.forEach((book) => {
      const existing = groups.get(book.category) ?? [];
      groups.set(book.category, [...existing, book]);
    });

    return [...groups.entries()];
  }, [books]);

  return (
    <div className="catalog-page-shell stack-lg">
      <section className="catalog-controls-strip" data-animate="soft">
        <div className="catalog-controls-grid">
          <label className="field">
            Recherche
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input catalog-dark-input"
              placeholder="Titre, auteur, ISBN..."
            />
          </label>
          <label className="field">
            Categorie
            <select
              className="input catalog-dark-input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Toutes</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="check-pill catalog-dark-pill">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            <span>Disponibles uniquement</span>
          </label>
        </div>

        {message ? <p className="status-line catalog-status-line">{message}</p> : null}
      </section>

      {loading ? (
        <section className="catalog-empty-state" data-animate="soft">
          Chargement du catalogue...
        </section>
      ) : null}

      {!loading && groupedBooks.length === 0 ? (
        <section className="catalog-empty-state" data-animate="soft">
          Aucun ouvrage ne correspond a la recherche actuelle.
        </section>
      ) : null}

      {!loading &&
        groupedBooks.map(([group, items], groupIndex) => (
          <section key={group} className="catalog-group" data-animate="soft">
            <div className="catalog-group-head">
              <div>
                <span className="eyebrow">{group}</span>
                <h2>{items.length} livre{items.length > 1 ? "s" : ""}</h2>
              </div>
              <Link href={`/catalog?category=${encodeURIComponent(group)}`} className="shelf-link">
                Voir toute la categorie
              </Link>
            </div>

            <div className="catalog-book-grid">
              {items.map((book, index) => {
                const visual = getBookVisual(book, index + groupIndex);
                const image = getBookCoverImage(book, index + groupIndex);

                return (
                  <article
                    key={book.id}
                    className="catalog-book-card"
                    data-animate="lift"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <Link
                      href={`/catalog/${book.id}`}
                      className="catalog-book-media"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(8, 8, 10, 0.04), rgba(8, 8, 10, 0.58)), url("${image}")`,
                      }}
                    >
                      <span>{visual.label}</span>
                    </Link>
                    <div className="catalog-book-body">
                      <span className={`availability ${book.isAvailable ? "available" : "unavailable"}`}>
                        {book.isAvailable ? "Disponible" : "Indisponible"}
                      </span>
                      <h3>
                        <Link href={`/catalog/${book.id}`}>{book.title}</Link>
                      </h3>
                      <p>{book.author}</p>
                      <small>{formatDate(book.publishedAt)} · ISBN {book.isbn}</small>
                    </div>
                    <div className="catalog-book-actions">
                      <Link href={`/catalog/${book.id}`} className="catalog-inline-button">
                        Voir le detail
                      </Link>
                      <button
                        className="catalog-inline-button catalog-inline-button-accent"
                        type="button"
                        onClick={() => borrowBook(book.id)}
                        disabled={!book.isAvailable}
                      >
                        Emprunter
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
    </div>
  );
}
