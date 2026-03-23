import { BookCatalogue } from "@/components/BookCatalogue";
import { PublicSiteShell } from "@/components/PublicSiteShell";

export default function CatalogPage() {
  return (
    <PublicSiteShell>
      <BookCatalogue />
    </PublicSiteShell>
  );
}
