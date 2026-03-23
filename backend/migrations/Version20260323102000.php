<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\DBAL\Platforms\SqlitePlatform;

final class Version20260323102000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Elargit image_url pour accepter les images locales encodees';
    }

    public function up(Schema $schema): void
    {
        if (!$schema->hasTable('books') || !$schema->getTable('books')->hasColumn('image_url')) {
            return;
        }

        $platform = $this->connection->getDatabasePlatform();

        if ($platform instanceof MySQLPlatform) {
            $this->addSql('ALTER TABLE books MODIFY image_url LONGTEXT DEFAULT NULL');
        }

        if ($platform instanceof SqlitePlatform) {
            return;
        }
    }

    public function down(Schema $schema): void
    {
        if (!$schema->hasTable('books') || !$schema->getTable('books')->hasColumn('image_url')) {
            return;
        }

        $platform = $this->connection->getDatabasePlatform();

        if ($platform instanceof MySQLPlatform) {
            $this->addSql('ALTER TABLE books MODIFY image_url VARCHAR(500) DEFAULT NULL');
        }
    }
}
