import { BookDetails } from "@/components/BookDetails";
import { PublicSiteShell } from "@/components/PublicSiteShell";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PublicSiteShell>
      <BookDetails bookId={Number(id)} />
    </PublicSiteShell>
  );
}
