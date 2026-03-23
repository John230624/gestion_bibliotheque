<?php

namespace App\Controller;

use App\Entity\Book;
use App\Service\ApiResponse;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/books')]
class BookController extends AbstractController
{
    public function __construct(private readonly ApiResponse $apiResponse)
    {
    }

    #[Route('', name: 'api_books_index', methods: ['GET'])]
    #[OA\Get(summary: 'Liste et recherche de livres')]
    public function index(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $q = mb_strtolower(trim((string) $request->query->get('q', '')));
        $category = trim((string) $request->query->get('category', ''));
        $availableOnly = filter_var($request->query->get('available'), FILTER_VALIDATE_BOOL);

        $books = $entityManager->getRepository(Book::class)->findAll();

        $filtered = array_values(array_filter($books, static function (Book $book) use ($q, $category, $availableOnly): bool {
            if ($q !== '') {
                $searchable = mb_strtolower(implode(' ', [
                    $book->getTitle(),
                    $book->getAuthor(),
                    $book->getCategory(),
                    $book->getIsbn(),
                    $book->getDescription(),
                ]));

                if (!str_contains($searchable, $q)) {
                    return false;
                }
            }

            if ($category !== '' && strcasecmp($book->getCategory(), $category) !== 0) {
                return false;
            }

            if ($availableOnly && $book->getAvailableCopies() <= 0) {
                return false;
            }

            return true;
        }));

        $categories = array_values(array_unique(array_map(static fn (Book $book) => $book->getCategory(), $books)));
        sort($categories);

        return $this->json([
            'items' => array_map(fn (Book $book) => $this->apiResponse->book($book), $filtered),
            'meta' => [
                'total' => count($filtered),
                'categories' => $categories,
            ],
        ]);
    }

    #[Route('', name: 'api_books_create', methods: ['POST'])]
    #[OA\Post(summary: 'Creation d un livre')]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $payload = json_decode($request->getContent(), true);
        $validation = $this->validatePayload($payload ?? []);

        if ($validation !== null) {
            return $validation;
        }

        if ($entityManager->getRepository(Book::class)->findOneBy(['isbn' => trim((string) $payload['isbn'])]) instanceof Book) {
            return $this->json(['message' => 'Un livre avec cet ISBN existe deja.'], 409);
        }

        $book = $this->hydrateBook(new Book(), $payload);
        $entityManager->persist($book);
        $entityManager->flush();

        return $this->json([
            'message' => 'Livre cree avec succes.',
            'book' => $this->apiResponse->book($book),
        ], 201);
    }

    #[Route('/{id}', name: 'api_books_show', methods: ['GET'])]
    #[OA\Get(summary: 'Details d un livre')]
    public function show(Book $book): JsonResponse
    {
        return $this->json($this->apiResponse->book($book));
    }

    #[Route('/{id}', name: 'api_books_update', methods: ['PUT', 'PATCH'])]
    #[OA\Patch(summary: 'Mise a jour d un livre')]
    public function update(Book $book, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $payload = json_decode($request->getContent(), true);
        $validation = $this->validatePayload($payload ?? [], true);

        if ($validation !== null) {
            return $validation;
        }

        if (isset($payload['isbn'])) {
            $existing = $entityManager->getRepository(Book::class)->findOneBy(['isbn' => trim((string) $payload['isbn'])]);
            if ($existing instanceof Book && $existing->getId() !== $book->getId()) {
                return $this->json(['message' => 'Un autre livre utilise deja cet ISBN.'], 409);
            }
        }

        $this->hydrateBook($book, $payload ?? []);
        $entityManager->flush();

        return $this->json([
            'message' => 'Livre mis a jour.',
            'book' => $this->apiResponse->book($book),
        ]);
    }

    #[Route('/{id}', name: 'api_books_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Suppression d un livre')]
    public function delete(Book $book, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $activeRequests = $entityManager->getRepository(\App\Entity\BorrowRequest::class)->count(['book' => $book]);
        if ($activeRequests > 0) {
            return $this->json(['message' => 'Impossible de supprimer ce livre tant qu il est lie a des demandes d emprunt.'], 422);
        }

        $entityManager->remove($book);
        $entityManager->flush();

        return $this->json(['message' => 'Livre supprime.']);
    }

    private function validatePayload(array $payload, bool $partial = false): ?JsonResponse
    {
        $required = ['title', 'author', 'category', 'isbn', 'description', 'availableCopies', 'publishedAt'];

        if (!$partial) {
            foreach ($required as $field) {
                if (!array_key_exists($field, $payload)) {
                    return $this->json(['message' => sprintf('Le champ %s est obligatoire.', $field)], 422);
                }
            }
        }

        if (isset($payload['availableCopies']) && (int) $payload['availableCopies'] < 0) {
            return $this->json(['message' => 'Le nombre d exemplaires disponibles ne peut pas etre negatif.'], 422);
        }

        if (isset($payload['publishedAt'])) {
            try {
                new \DateTimeImmutable((string) $payload['publishedAt']);
            } catch (\Throwable) {
                return $this->json(['message' => 'Date de publication invalide.'], 422);
            }
        }

        if (array_key_exists('imageUrl', $payload) && trim((string) $payload['imageUrl']) !== '') {
            $imageUrl = trim((string) $payload['imageUrl']);
            $isRemoteUrl = filter_var($imageUrl, FILTER_VALIDATE_URL) !== false;
            $isDataUrl = preg_match('/^data:image\/[a-zA-Z0-9.+-]+;base64,/', $imageUrl) === 1;

            if (!$isRemoteUrl && !$isDataUrl) {
                return $this->json(['message' => 'Image de couverture invalide. Utilisez un fichier image local ou une URL valide.'], 422);
            }
        }

        return null;
    }

    private function hydrateBook(Book $book, array $payload): Book
    {
        if (isset($payload['title'])) {
            $book->setTitle(trim((string) $payload['title']));
        }
        if (isset($payload['author'])) {
            $book->setAuthor(trim((string) $payload['author']));
        }
        if (isset($payload['category'])) {
            $book->setCategory(trim((string) $payload['category']));
        }
        if (isset($payload['isbn'])) {
            $book->setIsbn(trim((string) $payload['isbn']));
        }
        if (isset($payload['description'])) {
            $book->setDescription(trim((string) $payload['description']));
        }
        if (isset($payload['availableCopies'])) {
            $book->setAvailableCopies((int) $payload['availableCopies']);
        }
        if (isset($payload['publishedAt'])) {
            $book->setPublishedAt(new \DateTimeImmutable((string) $payload['publishedAt']));
        }
        if (array_key_exists('imageUrl', $payload)) {
            $imageUrl = trim((string) $payload['imageUrl']);
            $book->setImageUrl($imageUrl !== '' ? $imageUrl : null);
        }

        return $book;
    }
}
