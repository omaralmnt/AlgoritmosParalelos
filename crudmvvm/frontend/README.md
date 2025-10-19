# Frontend React Native - CRUD MVVM

## Estructura del Proyecto

```
src/
├── config/          # Configuración de API
├── models/          # Modelos de datos (Cliente)
├── viewmodels/      # ViewModels (lógica de negocio)
├── views/
│   ├── screens/     # Pantallas (Login, Clientes)
│   └── components/  # Componentes reutilizables
├── services/        # Servicios HTTP (auth, clientes)
├── navigation/      # Configuración de navegación
└── utils/           # Utilidades
```

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm start
```

Escanea el QR con Expo Go en tu dispositivo móvil.

## Características

- Login con JWT y refresh token automático
- CRUD completo de clientes en una sola pantalla
- Carga paralela de datos y avatares con Promise.allSettled
- Pull to refresh
- Arquitectura MVVM
- Async/await sin bloqueo de UI
