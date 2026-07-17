# 🏛️ Flujo de trabajo — InUPA

Guía para el equipo. **Nadie programa directamente sobre `develop`, `qa` o `main`.**
Cada cambio nace en una rama propia, pasa por el Robot Inspector (CI) y por la
revisión de QA, y solo entonces se integra.

---

## 🌳 Ramas

| Rama        | Para qué sirve                                  | ¿Se le hace push directo? |
|-------------|--------------------------------------------------|---------------------------|
| `feature/*` | Tu mesa de trabajo aislada                        | Sí (es tuya)              |
| `develop`   | Integración del proyecto                          | ❌ Solo por PR aprobado   |
| `qa`        | Promoción para pruebas                            | ❌ Solo por PR aprobado   |
| `main`      | Versión estable                                   | ❌ Solo por PR aprobado   |

Los PRs de trabajo diario van **contra `develop`**. La promoción `develop → qa → main`
la maneja el líder técnico.

---

## 🔄 Ciclo completo

```
GitHub Projects → rama feature → programar → commit → push
      → Pull Request (contra develop) → CI (Robot Inspector)
      → QA Visual (Runner Windows) → Approve → Merge → develop actualizado
```

### 1. Recibe la tarea (GitHub Projects)
El líder crea la tarjeta en **Projects**, la asigna, define la fecha y el nombre de la rama.

### 2. Crea tu rama y trabaja
```bash
git checkout develop
git pull
git checkout -b feature/nombre-de-la-tarea   # ej: feature/front-page-auth
```
Programa libremente. Si rompes algo, solo rompes tu mesa.

### 3. Guarda y sube tu trabajo
```bash
git add .
git commit -m "feat: descripcion clara del cambio"
git push -u origin feature/nombre-de-la-tarea
```

### 4. Abre el Pull Request
En GitHub aparece el botón verde **"Compare & Pull Request"**.
- **Base:** `develop`  ·  **Compare:** tu rama `feature/*`
- Rellena la plantilla y enlaza la tarjeta (`Closes #NN`).

> Todavía no entra al proyecto: estás pidiendo permiso.

### 5. El Robot Inspector (CI)
Al abrir el PR corre [`ci-validation.yml`](.github/workflows/ci-validation.yml):
compila (typecheck) backend y frontend; corre lint/tests si hay config.
- ❌ Falla → corrige y vuelve a hacer `push` (el PR se revalida solo).
- ✅ Pasa → listo para revisión humana.

### 6. QA Visual (Runner de Windows)
Para revisar la app corriendo, el líder pone la etiqueta **`qa`** al PR.
El workflow [`qa-preview.yml`](.github/workflows/qa-preview.yml) levanta el entorno con
Docker en la máquina del líder:
- Frontend: http://localhost:5173
- Backend (health): http://localhost:3000/health

Al quitar la etiqueta `qa` o cerrar el PR, el entorno se baja solo.

### 7. Aprobación y Merge
- Si algo falla → **Request Changes** con comentarios. El dev corrige y vuelve a subir.
- Si todo bien → **Approve** → **Merge Pull Request**. Tu rama se fusiona con `develop`.

---

## 👥 Roles

- **Líder técnico (Juan):** crea/asigna tareas, revisa PRs, hace QA visual, aprueba y mergea. Mantiene `develop` estable.
- **Desarrolladores:** trabajan en su rama, commits frecuentes, resuelven conflictos, abren PRs y atienden observaciones.
- **CI (GitHub Actions):** valida compilación, typecheck, lint y tests. No deja pasar código roto.
- **Runner Windows + QA:** levanta la app y valida diseño, navegación, responsive y experiencia.

---

## 🖥️ Registrar el Runner de Windows (una sola vez, lo hace el líder)

El workflow de QA necesita un *self-hosted runner* en tu PC con Docker.

1. En GitHub: **Settings → Actions → Runners → New self-hosted runner**, elige **Windows**.
2. Sigue los comandos que te muestra GitHub (descarga + `config.cmd` con tu token).
3. Cuando pregunte por *labels*, añade: `windows` (ya trae `self-hosted`).
4. Instálalo como servicio para que quede siempre activo:
   ```powershell
   ./run.cmd            # prueba en primer plano
   # o como servicio:
   ./svc.cmd install
   ./svc.cmd start
   ```
5. Ten **Docker Desktop** instalado y corriendo.

> ⚠️ Seguridad: un self-hosted runner ejecuta el código del PR en tu máquina.
> Úsalo solo con PRs del propio equipo, nunca con forks externos no confiables.

---

## 🔒 Protección de ramas (la configura el líder en GitHub)

Para que el flujo no se pueda saltar: **Settings → Branches → Add branch ruleset**
(o *Add rule*) para `develop`, `qa` y `main` con:

- ✅ Require a pull request before merging
- ✅ Require approvals (mínimo 1)
- ✅ Require review from Code Owners
- ✅ Require status checks to pass → selecciona **Backend - typecheck & build** y **Frontend - typecheck & build**
- ✅ Do not allow bypassing the above settings
