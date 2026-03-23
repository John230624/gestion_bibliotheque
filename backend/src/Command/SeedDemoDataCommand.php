<?php

namespace App\Command;

use App\Entity\Book;
use App\Entity\BorrowRequest;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:seed-demo', description: 'Charge des donnees de demonstration pour la bibliotheque')]
class SeedDemoDataCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $userRepository = $this->entityManager->getRepository(User::class);
        $bookRepository = $this->entityManager->getRepository(Book::class);
        $requestRepository = $this->entityManager->getRepository(BorrowRequest::class);

        $admin = $userRepository->findOneBy(['email' => 'admin@bibliotheque.local']);
        if (!$admin instanceof User) {
            $admin = (new User())
                ->setFullName('Administrateur Principal')
                ->setEmail('admin@bibliotheque.local')
                ->setRoles(['ROLE_ADMIN'])
                ->setPhone('+22900000001');
            $admin->setPassword($this->passwordHasher->hashPassword($admin, 'Admin123!'));
            $this->entityManager->persist($admin);
        }

        $user = $userRepository->findOneBy(['email' => 'user@bibliotheque.local']);
        if (!$user instanceof User) {
            $user = (new User())
                ->setFullName('Usager Demo')
                ->setEmail('user@bibliotheque.local')
                ->setRoles(['ROLE_USER'])
                ->setPhone('+22900000002');
            $user->setPassword($this->passwordHasher->hashPassword($user, 'User123!'));
            $this->entityManager->persist($user);
        }

        $catalog = [
            [
                'title' => 'Le Nom du Vent',
                'author' => 'Patrick Rothfuss',
                'category' => 'Fantasy',
                'isbn' => '9782070466969',
                'description' => 'Roman de fantasy tres demande.',
                'availableCopies' => 4,
                'publishedAt' => '2007-03-27',
            ],
            [
                'title' => 'Clean Code',
                'author' => 'Robert C. Martin',
                'category' => 'Informatique',
                'isbn' => '9780132350884',
                'description' => 'Reference pour les bonnes pratiques de developpement.',
                'availableCopies' => 2,
                'publishedAt' => '2008-08-11',
            ],
            [
                'title' => 'L Etranger',
                'author' => 'Albert Camus',
                'category' => 'Litterature',
                'isbn' => '9782070360021',
                'description' => 'Classique de la litterature francophone.',
                'availableCopies' => 1,
                'publishedAt' => '1942-05-19',
            ],
        ];

        $firstBook = null;

        foreach ($catalog as $bookData) {
            $book = $bookRepository->findOneBy(['isbn' => $bookData['isbn']]);
            if (!$book instanceof Book) {
                $book = (new Book())
                    ->setTitle($bookData['title'])
                    ->setAuthor($bookData['author'])
                    ->setCategory($bookData['category'])
                    ->setIsbn($bookData['isbn'])
                    ->setDescription($bookData['description'])
                    ->setAvailableCopies($bookData['availableCopies'])
                    ->setPublishedAt(new \DateTimeImmutable($bookData['publishedAt']));
                $this->entityManager->persist($book);
            }

            if ($firstBook === null) {
                $firstBook = $book;
            }
        }

        $this->entityManager->flush();

        $existingRequest = $requestRepository->findOneBy([
            'user' => $user,
            'book' => $firstBook,
        ]);

        if (!$existingRequest instanceof BorrowRequest && $firstBook instanceof Book) {
            $borrowRequest = (new BorrowRequest())
                ->setUser($user)
                ->setBook($firstBook)
                ->setStatus(BorrowRequest::STATUS_PENDING)
                ->setNote('Demande de demonstration');

            $this->entityManager->persist($borrowRequest);
            $this->entityManager->flush();
        }

        $output->writeln('Donnees de demonstration chargees.');
        $output->writeln('Admin: admin@bibliotheque.local / Admin123!');
        $output->writeln('Usager: user@bibliotheque.local / User123!');

        return Command::SUCCESS;
    }
}
