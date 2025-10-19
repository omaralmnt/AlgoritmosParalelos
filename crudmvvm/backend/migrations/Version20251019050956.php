<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251019050956 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cliente ADD avatar VARCHAR(500) DEFAULT NULL');
        $this->addSql('ALTER TABLE usuario ADD nombre VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE usuario ADD correo VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE usuario ADD telefono VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE usuario ADD fecha_nacimiento DATE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cliente DROP avatar');
        $this->addSql('ALTER TABLE usuario DROP nombre');
        $this->addSql('ALTER TABLE usuario DROP correo');
        $this->addSql('ALTER TABLE usuario DROP telefono');
        $this->addSql('ALTER TABLE usuario DROP fecha_nacimiento');
    }
}
