<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251019025435 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cliente (id SERIAL NOT NULL, nombre VARCHAR(255) NOT NULL, correo VARCHAR(255) DEFAULT NULL, telefono VARCHAR(255) DEFAULT NULL, sexo VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE refresh_token (id SERIAL NOT NULL, usuario_id INT NOT NULL, token VARCHAR(255) NOT NULL, expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_C74F21955F37A13B ON refresh_token (token)');
        $this->addSql('CREATE INDEX IDX_C74F2195DB38439E ON refresh_token (usuario_id)');
        $this->addSql('COMMENT ON COLUMN refresh_token.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN refresh_token.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE usuario (id SERIAL NOT NULL, nombreusuario VARCHAR(255) NOT NULL, clave VARCHAR(255) NOT NULL, avatar VARCHAR(500) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE refresh_token ADD CONSTRAINT FK_C74F2195DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE refresh_token DROP CONSTRAINT FK_C74F2195DB38439E');
        $this->addSql('DROP TABLE cliente');
        $this->addSql('DROP TABLE refresh_token');
        $this->addSql('DROP TABLE usuario');
    }
}
