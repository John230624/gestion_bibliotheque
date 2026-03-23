"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { CSSProperties, useDeferredValue, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { getBookVisual } from "@/lib/book-display";
import { fallbackBooks } from "@/lib/fallback-books";
import { Book } from "@/lib/types";

export function HeroQuickSearch() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    if (deferredQuery.length < 2) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    api
      .books({ q: deferredQuery })
      .then((response) => {
        if (!cancelled) {
          setBooks(response.items.slice(0, 4));
        }
      })
      .catch(() => {
        if (!cancelled) {
          const localMatches = fallbackBooks.filter((book) => {
            const value = deferredQuery.toLowerCase();
            return (
              book.title.toLowerCase().includes(value) ||
              book.author.toLowerCase().includes(value) ||
              book.category.toLowerCase().includes(value)
            );
          });

          setBooks(localMatches.slice(0, 4));
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
  }, [deferredQuery]);

  const showPanel = open;

  return (
    <div className="hero-search-flyout" ref={searchRef}>
      <button
        type="button"
        className={`hero-login-button hero-search-button ${showPanel ? "is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>Recherche</span>
        <Search size={18} strokeWidth={2.1} aria-hidden="true" />
      </button>

      {showPanel ? (
        <div className="hero-search-panel-flyout">
          <div className="hero-search-input-shell">
            <Search size={18} strokeWidth={2.1} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Titre, categorie, ambiance..."
              aria-label="Rechercher un livre"
            />
            <button type="button" onClick={() => setOpen(false)} className="hero-search-close">
              <X size={16} strokeWidth={2.1} aria-hidden="true" />
            </button>
          </div>

          <div className="hero-search-panel-head">
            <span>Resultats rapides</span>
            <Link href={`/catalog?q=${encodeURIComponent(query.trim())}`}>Voir plus</Link>
          </div>

          {query.trim().length < 2 ? (
            <p className="hero-search-state">Tape au moins 2 lettres pour lancer la recherche.</p>
          ) : null}

          {loading ? <p className="hero-search-state">Recherche en cours...</p> : null}

          {!loading && query.trim().length >= 2 && books.length === 0 ? (
            <p className="hero-search-state">Aucun livre trouve pour cette recherche.</p>
          ) : null}

          {!loading && books.length > 0 ? (
            <div className="hero-search-grid">
              {books.map((book, index) => {
                const visual = getBookVisual(book, index);

                return (
                  <Link
                    key={book.id}
                    href={`/catalog/${book.id}`}
                    className="hero-search-card"
                    style={
                      {
                        "--hero-search-accent": visual.accent,
                        "--hero-search-tone": visual.tone,
                      } as CSSProperties
                    }
                  >
                    <div
                      className="hero-search-card-media"
                      style={{ backgroundImage: `url("${visual.image}")` }}
                    />
                    <div className="hero-search-card-body">
                      <span className="hero-search-card-meta">{book.category}</span>
                      <strong>{book.title}</strong>
                      <small>{book.author}</small>
                    </div>
                    <span className="hero-search-card-foot">
                      {book.isAvailable ? "Disponible" : "Voir le detail"}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {query.trim().length >= 2 ? (
            <div className="hero-search-more">
              <Link href={`/catalog?q=${encodeURIComponent(query.trim())}`} className="hero-search-more-link">
                <span>Voir plus de resultats</span>
                <ArrowUpRight size={17} strokeWidth={2.1} aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
