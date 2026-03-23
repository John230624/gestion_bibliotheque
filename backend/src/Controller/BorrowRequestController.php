<?php

namespace App\Controller;

use App\Entity\Book;
use App\Entity\BorrowRequest;
use App\Entity\User;
use App\Service\ApiResponse;
use App\Service\BorrowRequestManager;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/borrow-requests')]
class BorrowRequestController extends AbstractController
{
    public function __construct(
        private readonly ApiResponse $apiResponse,
        private readonly BorrowRequestManager $borrowRequestManager
    ) {
    }

    #[Route('', name: 'api_borrow_requests_index', methods: ['GET'])]
    #[OA\Get(summary: 'Liste des demandes d emprunt')]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['message' => 'Non authentifie.'], 401);
        }

        $repository = $entityManager->getRepository(BorrowRequest::class);
        $requests = in_array('ROLE_ADMIN', $currentUser->getRoles(), true)
            ? $repository->findBy([], ['requestedAt' => 'DESC'])
            : $repository->findBy(['user' => $currentUser], ['requestedAt' => 'DESC']);

        return $this->json([
            'items' => array_map(fn (BorrowRequest $borrowRequest) => $this->apiResponse->borrowRequest($borrowRequest), $requests),
            'meta' => ['total' => count($requests)],
        ]);
    }

    #[Route('', name: 'api_borrow_requests_create', methods: ['POST'])]
    #[OA\Post(summary: 'Creation d une demande d emprunt')]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['message' => 'Non authentifie.'], 401);
        }

        $payload = json_decode($request->getContent(), true);
        $bookId = (int) ($payload['bookId'] ?? 0);
        $note = isset($payload['note']) ? trim((string) $payload['note']) : null;

        if ($bookId <= 0) {
            return $this->json(['message' => 'Le livre cible est obligatoire.'], 422);
        }

        $book = $entityManager->getRepository(Book::class)->find($bookId);
        if (!$book instanceof Book) {
            return $this->json(['message' => 'Livre introuvable.'], 404);
        }

        try {
            $borrowRequest = $this->borrowRequestManager->create($currentUser, $book, $note);
        } catch (\DomainException $exception) {
            return $this->json(['message' => $exception->getMessage()], 422);
        }

        return $this->json([
            'message' => 'Demande d emprunt envoyee.',
            'request' => $this->apiResponse->borrowRequest($borrowRequest),
        ], 201);
    }

    #[Route('/{id}', name: 'api_borrow_requests_show', methods: ['GET'])]
    #[OA\Get(summary: 'Details d une demande')]
    public function show(BorrowRequest $borrowRequest): JsonResponse
    {
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['message' => 'Non authentifie.'], 401);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles(), true) && $borrowRequest->getUser()->getId() !== $currentUser->getId()) {
            return $this->json(['message' => 'Acces refuse.'], 403);
        }

        return $this->json($this->apiResponse->borrowRequest($borrowRequest));
    }

    #[Route('/{id}', name: 'api_borrow_requests_update', methods: ['PUT', 'PATCH'])]
    #[OA\Patch(summary: 'Mise a jour d une demande d emprunt')]
    public function update(BorrowRequest $borrowRequest, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $payload = json_decode($request->getContent(), true);
        $status = (string) ($payload['status'] ?? '');
        $note = array_key_exists('note', $payload ?? []) ? trim((string) $payload['note']) : null;

        if ($status === '') {
            return $this->json(['message' => 'Le statut est obligatoire.'], 422);
        }

        try {
            $borrowRequest = $this->borrowRequestManager->transition($borrowRequest, $status, $note);
        } catch (\DomainException $exception) {
            return $this->json(['message' => $exception->getMessage()], 422);
        }

        return $this->json([
            'message' => 'Demande mise a jour.',
            'request' => $this->apiResponse->borrowRequest($borrowRequest),
        ]);
    }

    #[Route('/{id}', name: 'api_borrow_requests_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Suppression d une demande')]
    public function delete(BorrowRequest $borrowRequest, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($borrowRequest->getStatus() === BorrowRequest::STATUS_APPROVED) {
            return $this->json(['message' => 'Une demande approuvee ne peut pas etre supprimee tant que le retour n est pas enregistre.'], 422);
        }

        $entityManager->remove($borrowRequest);
        $entityManager->flush();

        return $this->json(['message' => 'Demande supprimee.']);
    }
}
