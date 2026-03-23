<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\ApiResponse;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(private readonly ApiResponse $apiResponse)
    {
    }

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    #[OA\Post(summary: 'Connexion JWT')]
    public function login(): JsonResponse
    {
        return $this->json([
            'message' => 'Connexion geree par le firewall JWT.',
        ]);
    }

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    #[OA\Post(summary: 'Inscription d un usager')]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $payload = json_decode($request->getContent(), true);

        $fullName = trim((string) ($payload['fullName'] ?? ''));
        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $phone = trim((string) ($payload['phone'] ?? ''));

        if ($fullName === '' || $email === '' || $password === '') {
            return $this->json(['message' => 'Nom, email et mot de passe sont obligatoires.'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide.'], 422);
        }

        if (mb_strlen($password) < 8) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caracteres.'], 422);
        }

        if ($entityManager->getRepository(User::class)->findOneBy(['email' => $email]) instanceof User) {
            return $this->json(['message' => 'Un compte existe deja avec cette adresse email.'], 409);
        }

        $user = (new User())
            ->setFullName($fullName)
            ->setEmail($email)
            ->setPhone($phone !== '' ? $phone : null)
            ->setRoles(['ROLE_USER']);

        $user->setPassword($passwordHasher->hashPassword($user, $password));

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Compte cree avec succes.',
            'user' => $this->apiResponse->user($user),
        ], 201);
    }

    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    #[OA\Get(summary: 'Profil courant')]
    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['message' => 'Non authentifie.'], 401);
        }

        return $this->json($this->apiResponse->user($user));
    }

    #[Route('/me', name: 'api_auth_me_update', methods: ['PATCH'])]
    #[OA\Patch(summary: 'Mise a jour du profil courant')]
    public function updateMe(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['message' => 'Non authentifie.'], 401);
        }

        $payload = json_decode($request->getContent(), true);

        if (isset($payload['fullName']) && trim((string) $payload['fullName']) !== '') {
            $user->setFullName(trim((string) $payload['fullName']));
        }

        if (array_key_exists('phone', $payload)) {
            $phone = trim((string) $payload['phone']);
            $user->setPhone($phone !== '' ? $phone : null);
        }

        if (!empty($payload['password'])) {
            if (mb_strlen((string) $payload['password']) < 8) {
                return $this->json(['message' => 'Le nouveau mot de passe doit contenir au moins 8 caracteres.'], 422);
            }

            $user->setPassword($passwordHasher->hashPassword($user, (string) $payload['password']));
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Profil mis a jour.',
            'user' => $this->apiResponse->user($user),
        ]);
    }
}
