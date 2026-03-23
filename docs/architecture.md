# Architecture proposee

## Frontend

- Next.js App Router
- Pages principales :
  - `/`
  - `/login`
  - `/register`
  - `/catalog`
  - `/dashboard`
  - `/admin`

## Backend

- Symfony REST API
- Entites principales :
  - `User`
  - `Book`
  - `BorrowRequest`
- Authentification JWT
- Documentation Swagger UI

## Regles metier

- Un usager peut consulter le catalogue et soumettre une demande d'emprunt.
- Un administrateur peut gerer toutes les ressources.
- Une demande d'emprunt suit les statuts `PENDING`, `APPROVED`, `REJECTED`, `RETURNED`.
