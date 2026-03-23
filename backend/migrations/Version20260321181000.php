<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Platforms\SqlitePlatform;

final class Version20260321181000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create tables for users, books and borrow requests';
    }

    public function up(Schema $schema): void
    {
        $platform = $this->connection->getDatabasePlatform();
        $hasUsers = $schema->hasTable('users');
        $hasBooks = $schema->hasTable('books');
        $hasRequests = $schema->hasTable('borrow_requests');

        if ($hasUsers && $hasBooks && $hasRequests) {
            return;
        }

        if ($platform instanceof SqlitePlatform) {
            $this->addSql('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(180) NOT NULL, full_name VARCHAR(120) NOT NULL, roles CLOB NOT NULL, password VARCHAR(255) NOT NULL, phone VARCHAR(30) DEFAULT NULL)');
            $this->addSql('CREATE UNIQUE INDEX UNIQ_1483A5E9E7927C74 ON users (email)');
            $this->addSql('CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, title VARCHAR(255) NOT NULL, author VARCHAR(255) NOT NULL, category VARCHAR(80) NOT NULL, isbn VARCHAR(20) NOT NULL, description CLOB NOT NULL, available_copies INT NOT NULL, published_at DATE NOT NULL)');
            $this->addSql('CREATE UNIQUE INDEX UNIQ_4A1B2A92A5F51D1A ON books (isbn)');
            $this->addSql('CREATE TABLE borrow_requests (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, user_id INT NOT NULL, book_id INT NOT NULL, status VARCHAR(20) NOT NULL, note CLOB DEFAULT NULL, requested_at DATETIME NOT NULL, CONSTRAINT FK_BC1A3B31A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BC1A3B3116A2B381 FOREIGN KEY (book_id) REFERENCES books (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
            $this->addSql('CREATE INDEX IDX_BC1A3B31A76ED395 ON borrow_requests (user_id)');
            $this->addSql('CREATE INDEX IDX_BC1A3B3116A2B381 ON borrow_requests (book_id)');

            return;
        }

        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, full_name VARCHAR(120) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, phone VARCHAR(30) DEFAULT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE books (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, author VARCHAR(255) NOT NULL, category VARCHAR(80) NOT NULL, isbn VARCHAR(20) NOT NULL, description LONGTEXT NOT NULL, available_copies INT NOT NULL, published_at DATE NOT NULL, UNIQUE INDEX UNIQ_4A1B2A92A5F51D1A (isbn), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE borrow_requests (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, book_id INT NOT NULL, status VARCHAR(20) NOT NULL, note LONGTEXT DEFAULT NULL, requested_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)", INDEX IDX_BC1A3B31A76ED395 (user_id), INDEX IDX_BC1A3B3116A2B381 (book_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE borrow_requests ADD CONSTRAINT FK_BC1A3B31A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE borrow_requests ADD CONSTRAINT FK_BC1A3B3116A2B381 FOREIGN KEY (book_id) REFERENCES books (id)');
    }

    public function down(Schema $schema): void
    {
        if (!$schema->hasTable('borrow_requests') && !$schema->hasTable('books') && !$schema->hasTable('users')) {
            return;
        }

        if (!$this->connection->getDatabasePlatform() instanceof SqlitePlatform && $schema->hasTable('borrow_requests')) {
            $this->addSql('ALTER TABLE borrow_requests DROP FOREIGN KEY FK_BC1A3B31A76ED395');
            $this->addSql('ALTER TABLE borrow_requests DROP FOREIGN KEY FK_BC1A3B3116A2B381');
        }

        if ($schema->hasTable('borrow_requests')) {
            $this->addSql('DROP TABLE borrow_requests');
        }
        if ($schema->hasTable('books')) {
            $this->addSql('DROP TABLE books');
        }
        if ($schema->hasTable('users')) {
            $this->addSql('DROP TABLE users');
        }
    }
}
