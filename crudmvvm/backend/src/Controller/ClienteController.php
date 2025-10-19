<?php

namespace App\Controller;

use App\Entity\Cliente;
use App\Repository\ClienteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cliente')]
final class ClienteController extends AbstractController 
{
    #[Route(path: '', name: 'list', methods:['GET'])]
    public function index(ClienteRepository $repo) : JsonResponse {

        $clientes = $repo->findAll();
      return $this->json($clientes, 200, [], ['groups' => 'cliente:read']);
    }
    #[Route(path: '', name: 'create', methods:['POST'])]

    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent());
        $nombre = $data->nombre;
        if ($nombre == null) {
            return new JsonResponse(
                ['error' => 'El nombre es obligatorio'],400
            ); 
        }

        $cliente = new Cliente();
        $cliente->setNombre($nombre);
        $cliente->setCorreo($data->correo ?? null);
        $cliente->setTelefono($data->telefono ?? null);
        $cliente->setSexo($data->sexo ?? null);
        $cliente->setAvatar($data->avatar ?? null);


        $em->persist($cliente);
        $em->flush();
        return $this->json($cliente, 201, [], ['groups' => 'cliente:read']); 
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'])]
    public function update(Request $request, Cliente $cliente, EntityManagerInterface $em){
        $data = json_decode($request->getContent());
        if (isset($data->nombre)) {
            $cliente->setNombre($data->nombre);
        }
        if (isset($data->correo)) {
            $cliente->setCorreo($data->correo);
        }
        if (isset($data->telefono)) {
            $cliente->setTelefono($data->telefono);
        }
        if (isset($data->sexo)) {
            $cliente->setSexo($data->sexo);
        }
        if (isset($data->avatar)) {
            $cliente->setAvatar($data->avatar);
        }

        $em->flush();
        return $this->json($cliente,200,[],['groups' => 'cliente:read']);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Request $request, Cliente $cliente, EntityManagerInterface $em){
        $em->remove($cliente);
        $em->flush();
        return $this->json([],204);
    }

    
}
