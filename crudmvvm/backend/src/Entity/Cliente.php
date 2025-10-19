<?php

namespace App\Entity;

use App\Repository\ClienteRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;  
#[ORM\Entity(repositoryClass: ClienteRepository::class)]
class Cliente
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['cliente:read'])] 
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['cliente:read', 'cliente:write'])]   
    private ?string $nombre = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['cliente:read', 'cliente:write'])]
    private ?string $correo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['cliente:read', 'cliente:write'])]
    private ?string $telefono = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['cliente:read', 'cliente:write'])]
    private ?string $sexo = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['cliente:read', 'cliente:write'])]
    private ?string $avatar = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
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

    public function getSexo(): ?string
    {
        return $this->sexo;
    }

    public function setSexo(?string $sexo): static
    {
        $this->sexo = $sexo;

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
}
