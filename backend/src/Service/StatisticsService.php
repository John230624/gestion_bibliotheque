<?php

namespace App\Service;

use App\Entity\Book;
use App\Entity\BorrowRequest;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class StatisticsService
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function getLibraryStats(): array
    {
        $bookRepository = $this->entityManager->getRepository(Book::class);
        $userRepository = $this->entityManager->getRepository(User::class);
        $requestRepository = $this->entityManager->getRepository(BorrowRequest::class);
        $books = $bookRepository->findAll();
        $requests = $requestRepository->findAll();

        $categoryBreakdown = [];

        foreach ($books as $book) {
            $categoryBreakdown[] = [
                'category' => $book->getCategory(),
                'title' => $book->getTitle(),
                'availableCopies' => $book->getAvailableCopies(),
            ];
        }

        return [
            'overview' => [
                'borrowedBooks' => $requestRepository->count(['status' => BorrowRequest::STATUS_APPROVED]),
                'registeredUsers' => $userRepository->count([]),
                'pendingRequests' => $requestRepository->count(['status' => BorrowRequest::STATUS_PENDING]),
                'catalogBooks' => $bookRepository->count([]),
            ],
            'requestStatusBreakdown' => [
                ['status' => BorrowRequest::STATUS_PENDING, 'count' => $requestRepository->count(['status' => BorrowRequest::STATUS_PENDING])],
                ['status' => BorrowRequest::STATUS_APPROVED, 'count' => $requestRepository->count(['status' => BorrowRequest::STATUS_APPROVED])],
                ['status' => BorrowRequest::STATUS_REJECTED, 'count' => $requestRepository->count(['status' => BorrowRequest::STATUS_REJECTED])],
                ['status' => BorrowRequest::STATUS_RETURNED, 'count' => $requestRepository->count(['status' => BorrowRequest::STATUS_RETURNED])],
            ],
            'inventory' => [
                'totalAvailableCopies' => array_sum(array_map(static fn (Book $book) => $book->getAvailableCopies(), $books)),
                'unavailableTitles' => count(array_filter($books, static fn (Book $book) => $book->getAvailableCopies() <= 0)),
            ],
            'users' => [
                'admins' => count(array_filter($userRepository->findAll(), static fn (User $user) => in_array('ROLE_ADMIN', $user->getRoles(), true))),
                'members' => count(array_filter($userRepository->findAll(), static fn (User $user) => !in_array('ROLE_ADMIN', $user->getRoles(), true))),
            ],
            'catalogSnapshot' => $categoryBreakdown,
            'recentRequests' => array_map(
                static fn (BorrowRequest $request) => [
                    'id' => $request->getId(),
                    'bookTitle' => $request->getBook()->getTitle(),
                    'requester' => $request->getUser()->getFullName(),
                    'status' => $request->getStatus(),
                    'requestedAt' => $request->getRequestedAt()->format(DATE_ATOM),
                ],
                array_slice($requests, 0, 5)
            ),
        ];
    }
}
