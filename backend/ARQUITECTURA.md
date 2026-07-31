# 🏗️ Arquitectura del backend — convenciones

Guía corta para que todos los módulos se vean igual. Si vas a crear un módulo nuevo
(o tocar uno existente), sigue esto.

## Las 4 capas

```
routes  →  controller  →  service  →  dao  →  PostgreSQL
```

| Capa | Responsabilidad | NO debe |
|---|---|---|
| **routes** | Declarar endpoints, aplicar middlewares (`authenticateToken`, `asyncHandler`) | Tener lógica |
| **controller** | Leer `req`, llamar al service, responder `res` | Tener reglas de negocio ni SQL |
| **service** | **Reglas de negocio**, validaciones, permisos, orquestar varios DAOs | Conocer `req`/`res` |
| **dao** | SQL y acceso a datos | Tener reglas de negocio |

## Reglas de oro

### 1. El ID del usuario SIEMPRE sale del token
```ts
const usuarioId = req.user?.id;   // ✅ del token
const usuarioId = req.body.userId; // ❌ el cliente puede mentir
```
> **Autenticado ≠ autorizado.** El token dice *quién eres*; el service decide *qué te corresponde*.

### 2. SQL siempre parametrizado
```ts
db.query('SELECT * FROM USUARIOS WHERE id = $1', [id]);        // ✅
db.query(`SELECT * FROM USUARIOS WHERE id = '${id}'`);          // ❌ SQL injection
```
Para filtros dinámicos, construye `$1, $2...` con un contador (ver `jobs.dao.ts`).

### 3. Los errores se lanzan, no se responden
El service lanza errores de `shared/errors.ts` y el middleware `errorHandler` los traduce:

| Error | HTTP | Cuándo |
|---|---|---|
| `ValidationError` | 400 | Datos inválidos |
| `UnauthorizedError` | 401 | Sin sesión |
| `ForbiddenError` | 403 | Con sesión, pero el recurso no es suyo |
| `NotFoundError` | 404 | No existe (o es ajeno y no se revela) |
| `ConflictError` | 409 | Duplicado / conflicto de estado |

```ts
// service
if (!user) throw new NotFoundError('Usuario no encontrado');

// controller: sin try/catch, la ruta usa asyncHandler
router.get('/me', asyncHandler(UsersController.getMe));
```

### 4. Nunca expongas datos sensibles
`password_hash` jamás sale en una respuesta. En los `UPDATE`, usa **whitelist** de campos
editables: aunque el cliente mande `correo_institucional` o `activo`, se ignoran.

### 5. Monta la ruta en `index.ts`
Un módulo sin `app.use('/api/loquesea', rutas)` **no existe**. Pruébalo con una petición
real antes de abrir el PR.

## Plantilla de un módulo nuevo

```
backend/src/
├─ daos/mimodulo.dao.ts
└─ modules/mimodulo/
   ├─ mimodulo.types.ts       # interfaces y DTOs
   ├─ mimodulo.dao? (no)      # el DAO vive en daos/
   ├─ mimodulo.service.ts     # reglas de negocio
   ├─ mimodulo.controller.ts  # req/res
   └─ mimodulo.routes.ts      # endpoints + middlewares
```

## Middlewares disponibles

| Middleware | Para qué |
|---|---|
| `authenticateToken` | Exige JWT válido y llena `req.user` |
| `asyncHandler(fn)` | Envía los errores de un handler async al `errorHandler` |
| `requestLogger` | Log de método, ruta, status y duración |
| `notFoundHandler` | 404 de rutas no registradas |
| `errorHandler` | Traduce errores a HTTP (va **al final** de `index.ts`) |

## Notificar a un usuario desde otro módulo

```ts
import { NotificationsService } from '../notifications/notifications.service';

await NotificationsService.crearSilencioso({
  usuario_id: idDelEstudiante,
  tipo: 'postulacion',
  titulo: 'Tu postulación cambió de estado',
  mensaje: `Tu postulación a "${vacante.titulo}" ahora está: aceptada`,
  enlace: `/applications/${postulacionId}`,
});
```
Usa `crearSilencioso` cuando la notificación sea secundaria: si falla, **no** debe
romper la operación principal.
