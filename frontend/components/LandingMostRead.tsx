"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getBookVisual } from "@/lib/book-display";
import { Book } from "@/lib/types";

const fallbackBooks: Book[] = [
  {
    id: 901,
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Romans",
    isbn: "9780000000901",
    description: "Lecture fiction tres demandee.",
    availableCopies: 3,
    isAvailable: true,
    publishedAt: "2020-08-13",
  },
  {
    id: 902,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Sciences",
    isbn: "9780000000902",
    description: "Un titre constamment reserve.",
    availableCopies: 2,
    isAvailable: true,
    publishedAt: "2018-10-16",
  },
  {
    id: 903,
    title: "Anne of Green Gables",
    author: "L.M. Montgomery",
    category: "Jeunesse",
    isbn: "9780000000903",
    description: "Un classique jeunesse toujours lu.",
    availableCopies: 1,
    isAvailable: false,
    publishedAt: "1908-01-01",
  },
  {
    id: 904,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "Sciences",
    isbn: "9780000000904",
    description: "Essai incontournable du moment.",
    availableCopies: 4,
    isAvailable: true,
    publishedAt: "2011-01-01",
  },
  {
    id: 905,
    title: "The Book Thief",
    author: "Markus Zusak",
    category: "Romans",
    isbn: "9780000000905",
    description: "Roman phare parmi les emprunts.",
    availableCopies: 2,
    isAvailable: true,
    publishedAt: "2005-03-14",
  },
  {
    id: 906,
    title: "Charlotte's Web",
    author: "E.B. White",
    category: "Jeunesse",
    isbn: "9780000000906",
    description: "Lecture tres aimee des familles.",
    availableCopies: 5,
    isAvailable: true,
    publishedAt: "1952-10-15",
  },
  {
    id: 907,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Sciences",
    isbn: "9780000000907",
    description: "Reference tres consultee.",
    availableCopies: 1,
    isAvailable: false,
    publishedAt: "2011-10-25",
  },
  {
    id: 908,
    title: "The Paris Library",
    author: "Janet Skeslien Charles",
    category: "Patrimoine",
    isbn: "9780000000908",
    description: "Un succes fort sur la memoire du livre.",
    availableCopies: 3,
    isAvailable: true,
    publishedAt: "2021-02-09",
  },
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80",
];

export function LandingMostRead() {
  const [books, setBooks] = useState<Book[]>(fallbackBooks);

  useEffect(() => {
    let cancelled = false;

    api
      .books()
      .then((response) => {
        if (!cancelled && response.items.length > 0) {
          setBooks(response.items.slice(0, 8));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBooks(fallbackBooks);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const repeatedBooks = useMemo(() => [...books, ...books], [books]);

  return (
    <section className="most-read-section" data-animate="fade">
      <div className="most-read-head">
        <span className="eyebrow">Les Plus Lus</span>
        <h2>Les livres qui attirent le plus les lecteurs en ce moment.</h2>
      </div>

      <div className="most-read-viewport">
        <div className="most-read-track">
          {repeatedBooks.map((book, index) => {
            const visual = getBookVisual(book, index);
            const coverImage =
              book.id >= 900 ? fallbackImages[index % fallbackImages.length] : visual.image;

            return (
            <Link
              key={`${book.id}-${index}`}
              href={
                book.id >= 900
                  ? `/catalog?category=${encodeURIComponent(book.category)}`
                  : `/catalog/${book.id}`
              }
              className="most-read-card"
              data-animate="lift"
              style={{ backgroundImage: `url("${coverImage}")` }}
            >
                <div className="most-read-overlay" />
                <div className="most-read-copy">
                  <span>{visual.label}</span>
                  <strong>{book.title}</strong>
                  <small>{book.author}</small>
                  <em>{book.category}</em>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
