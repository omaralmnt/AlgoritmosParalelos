<?php

namespace App\Repository;

use App\Entity\RefreshToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RefreshTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    public function deleteExpired(): void
    {
        $this->createQueryBuilder('r')
            ->delete()
            ->where('r.expiresAt < :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }

    public function deleteByUsuario($usuario): void
    {
        $this->createQueryBuilder('r')
            ->delete()
            ->where('r.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->execute();
    }
}
