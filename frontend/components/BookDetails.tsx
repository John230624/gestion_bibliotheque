"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getBookCoverImage } from "@/lib/book-display";
import { fallbackBooks } from "@/lib/fallback-books";
import { formatDate } from "@/lib/format";
import { getToken } from "@/lib/session";
import { Book } from "@/lib/types";

export function BookDetails({ bookId }: { bookId: number }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .book(bookId)
      .then((response) => {
        if (!cancelled) {
          setBook(response);
          setMessage(null);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          const fallbackBook = fallbackBooks.find((item) => item.id === bookId);
          if (fallbackBook) {
            setBook(fallbackBook);
            setMessage(null);
          } else {
            setMessage(error.message);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function borrowBook() {
    const token = getToken();
    if (!token || !book) {
      setMessage("Connecte-toi d abord pour envoyer une demande d emprunt.");
      return;
    }

    try {
      setBorrowing(true);
      const response = await api.createBorrowRequest(token, {
        bookId: book.id,
        note: note.trim() || undefined,
      });
      setMessage(response.message);
      setNote("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inattendue.");
    } finally {
      setBorrowing(false);
    }
  }

  if (loading) {
    return <section className="catalog-empty-state">Chargement du livre...</section>;
  }

  if (!book) {
    return <section className="catalog-empty-state">{message ?? "Livre introuvable."}</section>;
  }

  const image = getBookCoverImage(book, book.id);

  return (
    <section className="book-detail-page stack-lg">
      <section className="book-detail-stage" data-animate="soft">
        <div
          className="book-detail-poster"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10, 10, 12, 0.06), rgba(10, 10, 12, 0.56)), url("${image}")`,
          }}
        >
          <span className="book-detail-kicker">Fiche livre</span>
          <span className="book-detail-category">{book.category}</span>
        </div>

        <div className="book-detail-panel stack-md">
          <div className="stack-sm">
            <span className={`availability ${book.isAvailable ? "available" : "unavailable"}`}>
              {book.isAvailable ? "Disponible pour emprunt" : "Indisponible pour le moment"}
            </span>
            <div className="book-detail-heading">
              <h1>{book.title}</h1>
              <p>{book.author}</p>
            </div>
          </div>

          <div className="book-detail-facts">
            <div>
              <small>ISBN</small>
              <strong>{book.isbn}</strong>
            </div>
            <div>
              <small>Publication</small>
              <strong>{formatDate(book.publishedAt)}</strong>
            </div>
            <div>
              <small>Exemplaires</small>
              <strong>{book.availableCopies}</strong>
            </div>
          </div>

          <div className="book-detail-copy stack-sm">
            <span className="eyebrow">Presentation</span>
            <p>{book.description}</p>
          </div>

          <section className="borrow-request-panel stack-sm">
            <div className="hero-badge borrow-request-brand">
              <span className="hero-badge-stripes" aria-hidden="true" />
              <strong>
                <span>Biblio</span>
              </strong>
            </div>
            <div className="borrow-request-head">
              <span className="eyebrow">Demande d emprunt</span>
              <p>
                Ajoute une note si besoin, puis envoie la demande seulement si l ouvrage est
                disponible.
              </p>
            </div>

            <label className="field auth-field">
              Note pour l equipe
              <textarea
                className="input auth-input auth-textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Exemple: retrait en fin de journee ou besoin particulier."
                rows={4}
              />
            </label>

            {message ? <p className="status-line catalog-status-line">{message}</p> : null}

            <div className="catalog-book-actions">
              <button
                className="form-action-button"
                type="button"
                onClick={borrowBook}
                disabled={!book.isAvailable || borrowing}
              >
                {borrowing ? "Envoi..." : "Envoyer la demande"}
              </button>
              <Link
                href={`/catalog?category=${encodeURIComponent(book.category)}`}
                className="catalog-inline-button"
              >
                Voir la categorie
              </Link>
              <Link href="/catalog" className="catalog-inline-button">
                Retour catalogue
              </Link>
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
