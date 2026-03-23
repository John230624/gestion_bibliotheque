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

#[Route('/api/admin/users')]
class UserController extends AbstractController
{
    public function __construct(private readonly ApiResponse $apiResponse)
    {
    }

    #[Route('', name: 'api_admin_users_index', methods: ['GET'])]
    #[OA\Get(summary: 'Liste des utilisateurs')]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $users = $entityManager->getRepository(User::class)->findAll();

        return $this->json([
            'items' => array_map(fn (User $user) => $this->apiResponse->user($user), $users),
            'meta' => ['total' => count($users)],
        ]);
    }

    #[Route('', name: 'api_admin_users_create', methods: ['POST'])]
    #[OA\Post(summary: 'Creation d un utilisateur')]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $payload = json_decode($request->getContent(), true);
        $validation = $this->validatePayload($payload ?? []);

        if ($validation !== null) {
            return $validation;
        }

        $email = mb_strtolower(trim((string) $payload['email']));

        if ($entityManager->getRepository(User::class)->findOneBy(['email' => $email]) instanceof User) {
            return $this->json(['message' => 'Un utilisateur existe deja avec cette adresse email.'], 409);
        }

        $user = new User();
        $this->hydrateUser($user, $payload ?? []);
        $user->setPassword($passwordHasher->hashPassword($user, (string) $payload['password']));

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur cree.',
            'user' => $this->apiResponse->user($user),
        ], 201);
    }

    #[Route('/{id}', name: 'api_admin_users_show', methods: ['GET'])]
    #[OA\Get(summary: 'Details d un utilisateur')]
    public function show(User $user): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        return $this->json($this->apiResponse->user($user));
    }

    #[Route('/{id}', name: 'api_admin_users_update', methods: ['PUT', 'PATCH'])]
    #[OA\Patch(summary: 'Mise a jour d un utilisateur')]
    public function update(
        User $user,
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $payload = json_decode($request->getContent(), true);
        $validation = $this->validatePayload($payload ?? [], true);

        if ($validation !== null) {
            return $validation;
        }

        if (isset($payload['email'])) {
            $email = mb_strtolower(trim((string) $payload['email']));
            $existing = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
            if ($existing instanceof User && $existing->getId() !== $user->getId()) {
                return $this->json(['message' => 'Cette adresse email est deja utilisee.'], 409);
            }
        }

        $this->hydrateUser($user, $payload ?? []);

        if (!empty($payload['password'])) {
            $user->setPassword($passwordHasher->hashPassword($user, (string) $payload['password']));
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur mis a jour.',
            'user' => $this->apiResponse->user($user),
        ]);
    }

    #[Route('/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Suppression d un utilisateur')]
    public function delete(User $user, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $requestCount = $entityManager->getRepository(\App\Entity\BorrowRequest::class)->count(['user' => $user]);
        if ($requestCount > 0) {
            return $this->json(['message' => 'Impossible de supprimer un utilisateur qui possede des demandes d emprunt.'], 422);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['message' => 'Utilisateur supprime.']);
    }

    private function validatePayload(array $payload, bool $partial = false): ?JsonResponse
    {
        if (!$partial) {
            foreach (['fullName', 'email', 'password'] as $field) {
                if (empty($payload[$field])) {
                    return $this->json(['message' => sprintf('Le champ %s est obligatoire.', $field)], 422);
                }
            }
        }

        if (isset($payload['email']) && !filter_var((string) $payload['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide.'], 422);
        }

        if (isset($payload['password']) && $payload['password'] !== '' && mb_strlen((string) $payload['password']) < 8) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caracteres.'], 422);
        }

        return null;
    }

    private function hydrateUser(User $user, array $payload): void
    {
        if (isset($payload['fullName'])) {
            $user->setFullName(trim((string) $payload['fullName']));
        }
        if (isset($payload['email'])) {
            $user->setEmail(trim((string) $payload['email']));
        }
        if (array_key_exists('phone', $payload)) {
            $phone = trim((string) $payload['phone']);
            $user->setPhone($phone !== '' ? $phone : null);
        }
        if (isset($payload['roles']) && is_array($payload['roles']) && $payload['roles'] !== []) {
            $user->setRoles($payload['roles']);
        }
    }
}
