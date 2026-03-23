<?php

namespace App\Service;

use App\Entity\Book;
use App\Entity\BorrowRequest;
use App\Entity\User;

class ApiResponse
{
    public function user(User $user): array
    {
        return [
            'id' => $user->getId(),
            'fullName' => $user->getFullName(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'phone' => $user->getPhone(),
        ];
    }

    public function book(Book $book): array
    {
        return [
            'id' => $book->getId(),
            'title' => $book->getTitle(),
            'author' => $book->getAuthor(),
            'category' => $book->getCategory(),
            'isbn' => $book->getIsbn(),
            'description' => $book->getDescription(),
            'availableCopies' => $book->getAvailableCopies(),
            'isAvailable' => $book->getAvailableCopies() > 0,
            'publishedAt' => $book->getPublishedAt()->format('Y-m-d'),
            'imageUrl' => $book->getImageUrl(),
        ];
    }

    public function borrowRequest(BorrowRequest $borrowRequest): array
    {
        return [
            'id' => $borrowRequest->getId(),
            'status' => $borrowRequest->getStatus(),
            'note' => $borrowRequest->getNote(),
            'requestedAt' => $borrowRequest->getRequestedAt()->format(DATE_ATOM),
            'book' => $this->book($borrowRequest->getBook()),
            'user' => $this->user($borrowRequest->getUser()),
        ];
    }
}
