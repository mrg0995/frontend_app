# Proyecto Final - Segunda Mano (Frontend)

Angular 22. Layout del Sprint 1 y páginas de los compañeros.

## Ejecutar en local

1. `pnpm install`
2. Arrancar el backend con MySQL siguiendo su README.
3. `pnpm start` (Angular en `http://localhost:4200`, con proxy para `/api` y `/uploads`).

## Organización

- `src/app/app.routes.ts`: rutas generales (no editar después de integrar el layout).
- `src/app/features/<modulo>/<modulo>.routes.ts`: cada equipo trabaja en las rutas de su módulo.
- `src/app/shared/`: cabecera, menú y componentes compartidos.
- `src/styles.css`: variables de color, tipografía y clases comunes.
- `src/app/core/auth.service.ts`: servicio de autenticación del proyecto.

Las pantallas con el texto “Apartado pendiente de desarrollar por el equipo” son rutas de ejemplo, no funcionalidades implementadas. Consultar `docs/api.md` en el backend para el contrato de los endpoints.

## Pruebas

`pnpm test` para las pruebas unitarias, y `pnpm build` para comprobar la compilación. Son pasos pendientes de ejecutar al instalar las dependencias.
