<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251017223825 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE usuario ADD COLUMN avatar VARCHAR(500) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__usuario AS SELECT id, nombreusuario, clave FROM usuario');
        $this->addSql('DROP TABLE usuario');
        $this->addSql('CREATE TABLE usuario (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nombreusuario VARCHAR(255) NOT NULL, clave VARCHAR(255) NOT NULL)');
        $this->addSql('INSERT INTO usuario (id, nombreusuario, clave) SELECT id, nombreusuario, clave FROM __temp__usuario');
        $this->addSql('DROP TABLE __temp__usuario');
    }
}
