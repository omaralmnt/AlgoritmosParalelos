<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Entity\RefreshToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route(path: '/api')]
final class UsuarioController extends AbstractController 
{

    #[Route(path: '/auth/login', name: 'login', methods:['POST'])]
    public function iniciarSesion(
        Request $request,
        EntityManagerInterface $em,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse
    {
        $data = json_decode($request->getContent());

        if (!$data) {
            return new JsonResponse(
                ['error' => 'JSON inválido o vacío'],400
            );
        }

        $nombreUsuario = $data->nombreUsuario ?? null;
        $clave = $data->clave ?? null;

        if ($nombreUsuario == null || $clave == null) {
            return new JsonResponse(
                ['error' => 'Debe enviar el nombre de usuario y clave'],400
            );
        }
        $usuario = $em->getRepository(Usuario::class)->findOneBy([
            'nombreusuario' => $nombreUsuario,
            'clave' => $clave
        ]);
        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario o clave incorrectos'], status: 401);
        }

        $datosJwt = [
            'id' => $usuario->getId(),
        ];
        $token = $jwtManager->createFromPayload($usuario, $datosJwt);

        $refreshToken = new RefreshToken();
        $refreshToken->setToken(bin2hex(random_bytes(32)));
        $refreshToken->setUsuario($usuario);
        $refreshToken->setExpiresAt(new \DateTimeImmutable('+30 days'));

        $em->persist($refreshToken);
        $em->flush();

        return $this->json([
            'token' => $token,
            'refresh_token' => $refreshToken->getToken()
        ]);
    }

    #[Route(path: '/auth/refresh', name: 'refresh', methods:['POST'])]
    public function refresh(
        Request $request,
        EntityManagerInterface $em,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse
    {
        $data = json_decode($request->getContent());

        if (!$data || !isset($data->refresh_token)) {
            return new JsonResponse(['error' => 'Refresh token requerido'], 400);
        }

        $refreshToken = $em->getRepository(RefreshToken::class)->findOneBy([
            'token' => $data->refresh_token
        ]);

        if (!$refreshToken) {
            return new JsonResponse(['error' => 'Refresh token inválido'], 401);
        }

        if ($refreshToken->isExpired()) {
            $em->remove($refreshToken);
            $em->flush();
            return new JsonResponse(['error' => 'Refresh token expirado'], 401);
        }

        $usuario = $refreshToken->getUsuario();

        $datosJwt = [
            'id' => $usuario->getId(),
        ];
        $newToken = $jwtManager->createFromPayload($usuario, $datosJwt);

        $newRefreshToken = new RefreshToken();
        $newRefreshToken->setToken(bin2hex(random_bytes(32)));
        $newRefreshToken->setUsuario($usuario);
        $newRefreshToken->setExpiresAt(new \DateTimeImmutable('+30 days'));

        $em->remove($refreshToken);
        $em->persist($newRefreshToken);
        $em->flush();

        return $this->json([
            'token' => $newToken,
            'refresh_token' => $newRefreshToken->getToken()
        ]);
    }

    #[Route(path: '/usuario/perfil', name: 'perfil', methods:['GET'])]
    public function getPerfil(#[CurrentUser] ?Usuario $usuario): JsonResponse
    {
        if (!$usuario) {
            return new JsonResponse(['error' => 'No autenticado'], 401);
        }

        return $this->json($usuario, 200, [], ['groups' => 'usuario:read']);
    }

    #[Route(path: '/usuario/{id}/avatar', name: 'getUserAvatar', methods:['GET'])]
    public function getAvatar(int $id, EntityManagerInterface $em): JsonResponse {

        $usuario = $em->getRepository(Usuario::class)->find($id);

        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

     
        $avatarUrl = $usuario->getAvatar(); 

        if (!$avatarUrl) {
            return new JsonResponse(['error' => 'Usuario no tiene avatar'], 404);
        }

        return $this->json([
            'avatar' => $avatarUrl
        ]);
    

        
    }
}