<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:create-admin', description: 'Cree un compte administrateur sans donnees de demonstration')]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Adresse email de l administrateur')
            ->addArgument('password', InputArgument::REQUIRED, 'Mot de passe')
            ->addArgument('fullName', InputArgument::OPTIONAL, 'Nom complet', 'Administrateur Biblio')
            ->addArgument('phone', InputArgument::OPTIONAL, 'Telephone', '');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = mb_strtolower(trim((string) $input->getArgument('email')));
        $password = (string) $input->getArgument('password');
        $fullName = trim((string) $input->getArgument('fullName'));
        $phone = trim((string) $input->getArgument('phone'));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $io->error('Adresse email invalide.');
            return Command::FAILURE;
        }

        if (mb_strlen($password) < 8) {
            $io->error('Le mot de passe doit contenir au moins 8 caracteres.');
            return Command::FAILURE;
        }

        if ($this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]) instanceof User) {
            $io->error('Un utilisateur existe deja avec cette adresse email.');
            return Command::FAILURE;
        }

        $user = (new User())
            ->setEmail($email)
            ->setFullName($fullName !== '' ? $fullName : 'Administrateur Biblio')
            ->setPhone($phone !== '' ? $phone : null)
            ->setRoles(['ROLE_ADMIN']);

        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success(sprintf('Administrateur cree: %s', $email));

        return Command::SUCCESS;
    }
}
