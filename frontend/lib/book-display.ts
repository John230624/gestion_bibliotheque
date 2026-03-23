import { Book } from "@/lib/types";

const categoryVisuals: Record<
  string,
  { image: string; accent: string; tone: string; label: string }
> = {
  Romans: {
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    accent: "#f7851f",
    tone: "rgba(118, 56, 20, 0.7)",
    label: "Choix lecteurs",
  },
  Sciences: {
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    accent: "#80b9ff",
    tone: "rgba(24, 45, 84, 0.7)",
    label: "Focus savoirs",
  },
  Jeunesse: {
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",
    accent: "#f5c05a",
    tone: "rgba(101, 73, 16, 0.66)",
    label: "Selection famille",
  },
  Patrimoine: {
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
    accent: "#92d0b3",
    tone: "rgba(25, 63, 50, 0.68)",
    label: "Reserve locale",
  },
};

const fallbackVisual = {
  image:
    "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=900&q=80",
  accent: "#f7851f",
  tone: "rgba(33, 22, 14, 0.66)",
  label: "A decouvrir",
};

const coverImages = [
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
];

function hashTitle(title: string) {
  return [...title].reduce((acc, character) => acc + character.charCodeAt(0), 0);
}

export function getBookCoverImage(book: Pick<Book, "title">, index = 0) {
  if ("imageUrl" in book && book.imageUrl) {
    return book.imageUrl;
  }
  const imageIndex = (hashTitle(book.title) + index) % coverImages.length;
  return coverImages[imageIndex];
}

export function getBookVisual(book: Pick<Book, "category" | "title">, index = 0) {
  const categoryVisual = categoryVisuals[book.category];
  return {
    ...(categoryVisual ?? fallbackVisual),
    image: getBookCoverImage(book, index),
  };
}
