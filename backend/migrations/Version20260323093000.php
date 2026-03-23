<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260323093000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute le champ image_url sur les livres';
    }

    public function up(Schema $schema): void
    {
        if (!$schema->hasTable('books')) {
            return;
        }

        if ($schema->getTable('books')->hasColumn('image_url')) {
            return;
        }

        $this->addSql('ALTER TABLE books ADD image_url VARCHAR(500) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        if (!$schema->hasTable('books') || !$schema->getTable('books')->hasColumn('image_url')) {
            return;
        }

        $this->addSql('ALTER TABLE books DROP image_url');
    }
}
