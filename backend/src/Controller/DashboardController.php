<?php

namespace App\Controller;

use App\Service\StatisticsService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class DashboardController extends AbstractController
{
    #[Route('/stats', name: 'api_stats', methods: ['GET'])]
    #[OA\Get(summary: 'Statistiques detaillees de la bibliotheque')]
    public function stats(StatisticsService $statisticsService): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        return $this->json([
            'message' => 'Statistiques chargees.',
            'stats' => $statisticsService->getLibraryStats(),
        ]);
    }
}
