<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['usuario:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['usuario:read', 'usuario:write'])]
    private ?string $nombreusuario = null;

    #[ORM\Column(length: 255)]
    #[Groups(['usuario:write'])]
    private ?string $clave = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['usuario:read', 'usuario:write'])]
    private ?string $avatar = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['usuario:read', 'usuario:write'])]
    private ?string $nombre = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['usuario:read', 'usuario:write'])]
    private ?string $correo = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['usuario:read', 'usuario:write'])]
    private ?string $telefono = null;

    #[ORM\Column(type: 'date', nullable: true)]
    #[Groups(['usuario:read', 'usuario:write'])]
    private ?\DateTimeInterface $fechaNacimiento = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombreusuario(): ?string
    {
        return $this->nombreusuario;
    }

    public function setNombreusuario(string $nombreusuario): static
    {
        $this->nombreusuario = $nombreusuario;
        return $this;
    }

    public function getClave(): ?string
    {
        return $this->clave;
    }

    public function setClave(string $clave): static
    {
        $this->clave = $clave;
        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->nombreusuario;
    }

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function getPassword(): string
    {
        return $this->clave;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(?string $nombre): static
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getCorreo(): ?string
    {
        return $this->correo;
    }

    public function setCorreo(?string $correo): static
    {
        $this->correo = $correo;
        return $this;
    }

    public function getTelefono(): ?string
    {
        return $this->telefono;
    }

    public function setTelefono(?string $telefono): static
    {
        $this->telefono = $telefono;
        return $this;
    }

    public function getFechaNacimiento(): ?\DateTimeInterface
    {
        return $this->fechaNacimiento;
    }

    public function setFechaNacimiento(?\DateTimeInterface $fechaNacimiento): static
    {
        $this->fechaNacimiento = $fechaNacimiento;
        return $this;
    }

    public function eraseCredentials(): void
    {
    }
}
