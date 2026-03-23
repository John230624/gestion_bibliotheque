<?php

namespace App\Service;

use App\Entity\Book;
use App\Entity\BorrowRequest;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class BorrowRequestManager
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function create(User $user, Book $book, ?string $note = null): BorrowRequest
    {
        if ($book->getAvailableCopies() <= 0) {
            throw new \DomainException('Ce livre n est actuellement pas disponible.');
        }

        $existing = $this->entityManager->getRepository(BorrowRequest::class)->findBy([
            'user' => $user,
            'book' => $book,
        ]);

        foreach ($existing as $request) {
            if (in_array($request->getStatus(), [
                BorrowRequest::STATUS_PENDING,
                BorrowRequest::STATUS_APPROVED,
            ], true)) {
                throw new \DomainException('Une demande active existe deja pour ce livre.');
            }
        }

        $borrowRequest = (new BorrowRequest())
            ->setUser($user)
            ->setBook($book)
            ->setStatus(BorrowRequest::STATUS_PENDING)
            ->setNote($note);

        $this->entityManager->persist($borrowRequest);
        $this->entityManager->flush();

        return $borrowRequest;
    }

    public function transition(BorrowRequest $borrowRequest, string $status, ?string $note = null): BorrowRequest
    {
        $allowedStatuses = [
            BorrowRequest::STATUS_PENDING,
            BorrowRequest::STATUS_APPROVED,
            BorrowRequest::STATUS_REJECTED,
            BorrowRequest::STATUS_RETURNED,
        ];

        if (!in_array($status, $allowedStatuses, true)) {
            throw new \DomainException('Statut de demande invalide.');
        }

        $currentStatus = $borrowRequest->getStatus();
        $book = $borrowRequest->getBook();

        if ($currentStatus !== BorrowRequest::STATUS_APPROVED && $status === BorrowRequest::STATUS_APPROVED) {
            if ($book->getAvailableCopies() <= 0) {
                throw new \DomainException('Aucun exemplaire disponible pour approuver cette demande.');
            }

            $book->setAvailableCopies($book->getAvailableCopies() - 1);
        }

        if ($currentStatus === BorrowRequest::STATUS_APPROVED && $status === BorrowRequest::STATUS_RETURNED) {
            $book->setAvailableCopies($book->getAvailableCopies() + 1);
        }

        if ($currentStatus === BorrowRequest::STATUS_APPROVED && $status === BorrowRequest::STATUS_REJECTED) {
            throw new \DomainException('Une demande approuvee ne peut pas etre rejetee. Marquez-la comme retournee.');
        }

        if ($status === BorrowRequest::STATUS_REJECTED && trim((string) $note) === '') {
            throw new \DomainException('Ajoutez une note pour expliquer le rejet de la demande.');
        }

        $borrowRequest->setStatus($status);

        if ($note !== null) {
            $borrowRequest->setNote($note);
        }

        $this->entityManager->flush();

        return $borrowRequest;
    }
}
