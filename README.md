# 🏛️ InUPA — Plataforma de Vinculación Laboral UPA

Plataforma universitaria de vinculación profesional para la comunidad de la UPA.
Ofrece **recomendaciones de vacantes** y **adaptación inteligente de currículums** (IA) para estudiantes.
Construida con **React + Node.js + PostgreSQL** e infraestructura **Docker** on-premise.

> 📌 Este README es la guía **oficial** del equipo. Aquí está TODO: qué es el proyecto, cómo correrlo,
> y **exactamente cómo cada quien sube su módulo** (con los comandos listos para copiar y pegar).

---

## 📑 Índice

1. [¿Qué es InUPA?](#-qué-es-inupa)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Estructura del repositorio](#-estructura-del-repositorio)
4. [Requisitos previos](#-requisitos-previos)
5. [Cómo correr el proyecto en local](#-cómo-correr-el-proyecto-en-local)
6. [Variables de entorno](#-variables-de-entorno)
7. [Ramas y flujo de trabajo](#-ramas-y-flujo-de-trabajo)
8. [📦 Módulos, responsables y cómo subir tu trabajo](#-módulos-responsables-y-cómo-subir-tu-trabajo)
9. [¿Qué pasa cuando abres tu PR?](#-qué-pasa-cuando-abres-tu-pr)
10. [Convenciones de commits](#-convenciones-de-commits)
11. [Tablero y equipo](#-tablero-y-equipo)

---

## 🎯 ¿Qué es InUPA?

InUPA conecta a **estudiantes** de la UPA con **vacantes laborales**. Un estudiante inicia sesión con su
correo institucional (login por **OTP**, código de un solo uso), construye/sube su **CV**, y el sistema le
**recomienda vacantes** usando IA de emparejamiento (*matching*). También permite **postularse**,
**conectarse** con otros y recibir **notificaciones**.

Grandes bloques del sistema:
- **Auth** (login por OTP) · **Users** (perfil) · **CV** · **Jobs** (vacantes) · **Applications** (postulaciones)
- **Connections** (red de contactos) · **Notifications** · **AI / Matching** (recomendaciones)

---

## 🧰 Stack tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | Vite · React 18 · TypeScript · React Router · Zustand · Axios |
| **Backend** | Node.js · Express · TypeScript · PostgreSQL (`pg`) · JWT · Nodemailer |
| **Arquitectura backend** | Patrón **DAO** (acceso a datos en `backend/src/daos/`) + módulos por dominio |
| **Infra / DevOps** | Docker + Docker Compose · GitHub Actions (CI) · Runner self-hosted Windows (QA) |
| **Base de datos** | PostgreSQL 15 (esquema inicial en `docker/init.sql`) |

---

## 📁 Estructura del repositorio

```
ISC08C_InUPA_FinalProyect/
├─ backend/
│  ├─ src/
│  │  ├─ config/        # Config central (db.ts = conexión a PostgreSQL)
│  │  ├─ daos/          # Acceso a datos: auth.dao.ts, users.dao.ts, jobs.dao.ts, ...
│  │  ├─ middlewares/   # Middlewares de Express (auth JWT, errores, ...)
│  │  ├─ modules/       # Un folder por dominio: auth, users, jobs, cv, notifications, ai
│  │  │  └─ auth/       #   controller + service + routes de cada módulo
│  │  ├─ utils/         # Utilidades compartidas (mailer.ts, ...)
│  │  └─ index.ts       # Punto de entrada de Express (monta rutas /api/...)
│  ├─ docker/Dockerfile.dev
│  ├─ package.json      # scripts: dev, build, lint
│  └─ tsconfig.json
├─ frontend/
│  ├─ src/
│  │  ├─ pages/         # Pantallas (pages/auth/LoginPage.tsx, ...)
│  │  ├─ components/    # common/ (reutilizables) y layout/
│  │  ├─ services/      # api.ts (axios) y servicios por dominio (auth.service.ts, ...)
│  │  ├─ store/         # Estado global Zustand (authStore.ts, ...)
│  │  ├─ hooks/         # Hooks reutilizables
│  │  ├─ types/         # Tipos TypeScript compartidos
│  │  ├─ App.tsx        # Rutas de la app
│  │  └─ main.tsx       # Bootstrap de React
│  ├─ docker/Dockerfile.dev
│  ├─ package.json      # scripts: dev, build, lint
│  └─ vite.config.ts
├─ docker/
│  ├─ docker-compose.yml  # db + backend + frontend
│  └─ init.sql            # Esquema inicial de la BD
├─ .github/
│  ├─ workflows/
│  │  ├─ ci-validation.yml   # CI: compila backend y frontend en cada PR
│  │  └─ qa-preview.yml      # QA: levanta el entorno en el runner de Windows
│  └─ pull_request_template.md
├─ CODEOWNERS
├─ CONTRIBUTING.md       # Flujo de trabajo (versión resumida)
└─ README.md            # (este archivo)
```

---

## ✅ Requisitos previos

Instala en tu computadora:

- **Git** → https://git-scm.com/downloads
- **Node.js 20+** (trae `npm`) → https://nodejs.org
- **Docker Desktop** (recomendado para correr todo junto) → https://www.docker.com/products/docker-desktop

Verifica que todo esté instalado:

```bash
git --version
node -v
npm -v
docker --version
```

---

## ▶️ Cómo correr el proyecto en local

Primero **clona el repo** (solo la primera vez):

```bash
git clone https://github.com/Upa-ISC08C/ISC08C_InUPA_FinalProyect.git
cd ISC08C_InUPA_FinalProyect
```

### Opción A — Con Docker (recomendada, levanta TODO)

Levanta base de datos + backend + frontend con un solo comando:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Cuando termine, abre en el navegador:
- **Frontend:** http://localhost:5173
- **Backend (health check):** http://localhost:3000/health
- **PostgreSQL:** localhost:5432

Para apagarlo: `Ctrl + C` y luego:

```bash
docker compose -f docker/docker-compose.yml down
```

### Opción B — Manual (sin Docker)

Necesitas un PostgreSQL corriendo en tu máquina. En **dos terminales**:

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev        # arranca en http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev        # arranca en http://localhost:5173
```

---

## 🔐 Variables de entorno

> ⚠️ **Nunca subas archivos `.env`, contraseñas, secretos ni tokens al repositorio.**
> Los `.env` ya están en `.gitignore`. Guarda los valores reales **solo en tu `.env` local**.

Cada quien crea sus propios archivos de entorno en local. Pide al **líder del proyecto** los
valores reales (o usa una plantilla `.env.example` **sin secretos**). Estas son las variables
que se usan (solo los nombres, sin valores):

- **Backend** (`backend/.env`):
  - Conexión a PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - API: `PORT`
  - Seguridad: `JWT_SECRET`
  - Correo (envío de OTP): `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`
- **Frontend** (`frontend/.env`):
  - URL del backend: `VITE_API_URL`

> Si corres con **Docker** (Opción A), el entorno de desarrollo local ya queda configurado y
> no necesitas crear estos archivos a mano.

---

## 🌳 Ramas y flujo de trabajo

**Regla número uno: NADIE programa directo sobre `develop`, `qa` o `main`.** Todo cambio nace en tu propia rama.

| Rama | Para qué sirve | ¿Push directo? |
|---|---|---|
| `feature/*` | Tu mesa de trabajo (una por módulo) | ✅ es tuya |
| `develop` | **Rama por defecto** — integración de todo | ❌ solo por PR aprobado |
| `qa` | Pruebas antes de liberar | ❌ solo por PR aprobado |
| `main` | Versión estable / releases | ❌ solo por PR aprobado |

Las 3 ramas protegidas exigen: **PR + 1 aprobación (Juan) + revisión de Code Owner + CI en verde**.
No se puede hacer *force-push* ni borrarlas.

> Versión resumida del flujo también en [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 📦 Módulos, responsables y cómo subir tu trabajo

Esta es **la sección más importante**. Aquí está tu módulo, tu nombre y **los comandos exactos** para subirlo.

### 🥇 Reglas de oro

1. **Una rama por módulo.** Nunca trabajes en `develop`.
2. **Actualiza `develop` antes de empezar** cada módulo (para partir de lo más reciente).
3. **Commits pequeños y descriptivos.**
4. **Abre tu PR contra `develop`** (ya es la base por defecto).
5. **No mergees tú**: cuando el CI esté verde, Juan revisa (QA) y hace el merge.

### 📝 Paso a paso GENERAL (explicado línea por línea)

Este es el ciclo que harás **para cada módulo**. Abajo verás el comando exacto de cada quien.

```bash
# 1) Ubícate en develop y tráete lo último
git checkout develop
git pull

# 2) Crea TU rama para el módulo (usa el nombre exacto que te toca; ver tablas de abajo)
git checkout -b feature/backend-users     # <-- ejemplo, cambia por tu rama

# 3) Programa tu módulo... (edita archivos, crea componentes, etc.)

# 4) Revisa qué cambiaste (opcional pero recomendado)
git status

# 5) Agrega tus cambios al "stage"
git add .

# 6) Guarda un commit con un mensaje claro
git commit -m "feat(users): endpoint de perfil GET/PUT /users/me"

# 7) Sube TU rama a GitHub (la primera vez usa -u para enlazarla)
git push -u origin feature/backend-users

# 8) Abre el Pull Request:
#    GitHub te mostrará un botón verde "Compare & pull request".
#    Verifica que la base sea "develop" y dale "Create pull request".
```

**¿Qué hace cada comando?**
- `git checkout develop` → te cambia a la rama `develop`.
- `git pull` → descarga los últimos cambios de `develop` desde GitHub.
- `git checkout -b feature/...` → crea TU rama nueva y te cambia a ella.
- `git add .` → marca TODOS tus cambios para el siguiente commit.
- `git commit -m "..."` → guarda una "foto" de tus cambios con un mensaje.
- `git push -u origin feature/...` → sube tu rama a GitHub por primera vez.
  (Después, para subir más cambios de esa misma rama, basta con `git push`.)

> 💡 Si sigues trabajando en la misma rama otro día: `git add . && git commit -m "..." && git push`.

---

### 📋 Tabla resumen — quién hace qué y en qué rama

| # | Módulo | Responsable | Rama a crear |
|---|---|---|---|
| 1 | Backend · Auth | **Juan** (@JuanJesusRodriguezArellano) | `feature/backend-auth` |
| 2 | Backend · Users | **Juan** | `feature/backend-users` |
| 3 | Backend · Notifications | **Juan** | `feature/backend-notifications` |
| 4 | Infra · Services | **Juan** | `feature/infra-services` |
| 5 | Infra · Middlewares | **Juan** | `feature/infra-middlewares` |
| 6 | Backend · Jobs | **Andrea** (@AndreaSurdez) | `feature/backend-jobs` |
| 7 | Backend · Applications | **Andrea** | `feature/backend-applications` |
| 8 | Backend · Connections | **Andrea** | `feature/backend-connections` |
| 9 | Infra · Config | **Andrea** | `feature/infra-config` |
| 10 | Infra · Utils | **Andrea** | `feature/infra-utils` |
| 11 | Backend · AI / Matching | **@UP230823** | `feature/ia-matching` |
| 12 | Backend · CV (parsing IA) | **@UP230823** | `feature/ia-cv` |
| 13 | Front · Auth (login/OTP) | **@UP230254** | `feature/front-auth` |
| 14 | Front · Users (perfil) | **@UP230254** | `feature/front-users` |
| 15 | Front · Notifications | **@UP230254** | `feature/front-notifications` |
| 16 | Front · CV (editor) | **@UP230254** | `feature/front-cv` |
| 17 | Front · Jobs (vacantes) | **@isaivlogs** | `feature/front-jobs` |
| 18 | Front · Aplicaciones (mis postulaciones) | **@isaivlogs** | `feature/front-aplicaciones` |
| 19 | Front · Dashboard | **@isaivlogs** | `feature/front-dashboard` |
| 20 | Front · Admin — Panel | **@isaivlogs** | `feature/front-admin-panel` |
| 21 | Front · Admin — Empresas (registro) | **@isaivlogs** | `feature/front-admin-empresas` |
| 22 | Front · Admin — Vacantes (registro y edición) | **@isaivlogs** | `feature/front-admin-vacantes` |
| 23 | Front · Admin — Usuarios (altas y bajas) | **@isaivlogs** | `feature/front-admin-usuarios` |
| 24 | Front · Layout + routing | **@UP230254 + @isaivlogs** | `feature/front-layout` |
| 25 | Front · Store (estado global) | **@UP230254 + @isaivlogs** | `feature/front-store` |
| 26 | Front · Componentes comunes | **@UP230254 + @isaivlogs** | `feature/front-components` |

> **@isaivlogs** es el usuario de GitHub cuyo nombre visible es *up230533* (la misma persona).

---

### 👤 Juan (@JuanJesusRodriguezArellano) — Backend + DevOps

**Qué te toca:** los módulos de dominio **Auth, Users, Notifications** y la infraestructura de backend
**Services** y **Middlewares**. Además llevas todo **DevOps** (CI, Docker, Runner y protección de ramas).

<details><summary><b>1. Backend · Auth</b> — dónde: <code>backend/src/modules/auth/</code> + <code>backend/src/daos/auth.dao.ts</code></summary>

Endpoints de login/registro por OTP, generación/validación de código, emisión de JWT y guard de correo institucional.

```bash
git checkout develop && git pull
git checkout -b feature/backend-auth
# ...trabaja en backend/src/modules/auth/ y daos/auth.dao.ts...
git add .
git commit -m "feat(auth): verificacion de OTP y emision de JWT"
git push -u origin feature/backend-auth
```
</details>

<details><summary><b>2. Backend · Users</b> — dónde: <code>backend/src/modules/users/</code> + <code>daos/users.dao.ts</code></summary>

CRUD de perfil: `GET/PUT /users/me`, datos (nombre, matrícula, carrera) y enlace con el CV.

```bash
git checkout develop && git pull
git checkout -b feature/backend-users
git add .
git commit -m "feat(users): endpoints de perfil GET/PUT /users/me"
git push -u origin feature/backend-users
```
</details>

<details><summary><b>3. Backend · Notifications</b> — dónde: <code>backend/src/modules/notifications/</code> + <code>daos/notifications.dao.ts</code></summary>

Endpoints de notificaciones (crear, listar, marcar leídas) y disparadores en match/postulación/conexión.

```bash
git checkout develop && git pull
git checkout -b feature/backend-notifications
git add .
git commit -m "feat(notifications): CRUD de notificaciones y marcar leidas"
git push -u origin feature/backend-notifications
```
</details>

<details><summary><b>4. Infra · Services</b> — dónde: <code>backend/src/</code> (capa de servicios)</summary>

Capa de servicios reutilizable: separa la lógica de negocio de los controllers y estandariza cómo los services usan los DAOs.

```bash
git checkout develop && git pull
git checkout -b feature/infra-services
git add .
git commit -m "refactor(services): capa de servicios estandar sobre DAOs"
git push -u origin feature/infra-services
```
</details>

<details><summary><b>5. Infra · Middlewares</b> — dónde: <code>backend/src/middlewares/</code></summary>

Middleware de autenticación (valida JWT), manejo centralizado de errores, validación de requests y logging.

```bash
git checkout develop && git pull
git checkout -b feature/infra-middlewares
git add .
git commit -m "feat(middlewares): auth JWT y manejo central de errores"
git push -u origin feature/infra-middlewares
```
</details>

---

### 👤 Andrea (@AndreaSurdez) — Backend

**Qué te toca:** los módulos de dominio **Jobs, Applications, Connections** y la infraestructura de backend
**Config** y **Utils**.

<details><summary><b>6. Backend · Jobs</b> — dónde: <code>backend/src/modules/jobs/</code> + <code>daos/jobs.dao.ts</code></summary>

CRUD de vacantes (crear, listar, filtrar, detalle) y estados de la vacante.

```bash
git checkout develop && git pull
git checkout -b feature/backend-jobs
git add .
git commit -m "feat(jobs): CRUD de vacantes y filtros"
git push -u origin feature/backend-jobs
```
</details>

<details><summary><b>7. Backend · Applications</b> — dónde: <code>backend/src/modules/</code> (applications) + DAO</summary>

Postular a una vacante, listar postulaciones del usuario y estados (enviada, revisada, aceptada/rechazada).

```bash
git checkout develop && git pull
git checkout -b feature/backend-applications
git add .
git commit -m "feat(applications): postular a vacante y estados"
git push -u origin feature/backend-applications
```
</details>

<details><summary><b>8. Backend · Connections</b> — dónde: <code>backend/src/modules/</code> (connections) + DAO</summary>

Enviar/aceptar solicitudes de conexión y listar conexiones.

```bash
git checkout develop && git pull
git checkout -b feature/backend-connections
git add .
git commit -m "feat(connections): solicitudes y lista de conexiones"
git push -u origin feature/backend-connections
```
</details>

<details><summary><b>9. Infra · Config</b> — dónde: <code>backend/src/config/</code> (ej. <code>db.ts</code>)</summary>

Configuración central: conexión a PostgreSQL, variables de entorno y config de la app.

```bash
git checkout develop && git pull
git checkout -b feature/infra-config
git add .
git commit -m "chore(config): variables de entorno y pool de PostgreSQL"
git push -u origin feature/infra-config
```
</details>

<details><summary><b>10. Infra · Utils</b> — dónde: <code>backend/src/utils/</code> (ej. <code>mailer.ts</code>)</summary>

Utilidades compartidas: mailer (nodemailer) y helpers de validación/formato.

```bash
git checkout develop && git pull
git checkout -b feature/infra-utils
git add .
git commit -m "feat(utils): helpers de validacion y mailer"
git push -u origin feature/infra-utils
```
</details>

---

### 👤 @UP230823 — Inteligencia Artificial

**Qué te toca:** el cerebro de recomendaciones: **AI / Matching** y el **procesamiento de CV con IA**.

<details><summary><b>11. Backend · AI / Matching</b> — dónde: <code>backend/src/modules/ai/</code> + <code>daos/ai.dao.ts</code></summary>

Servicio de emparejamiento candidato↔vacante (según CV, habilidades, carrera), endpoint de recomendaciones e integración con el modelo de IA.

```bash
git checkout develop && git pull
git checkout -b feature/ia-matching
git add .
git commit -m "feat(ai): servicio de matching candidato-vacante"
git push -u origin feature/ia-matching
```
</details>

<details><summary><b>12. Backend · CV (parsing con IA)</b> — dónde: <code>backend/src/modules/cv/</code> + <code>daos/cv.dao.ts</code></summary>

Parsing/estructuración del CV; extracción de habilidades y experiencia con IA para alimentar el matching.

```bash
git checkout develop && git pull
git checkout -b feature/ia-cv
git add .
git commit -m "feat(cv): parsing del CV y extraccion de habilidades"
git push -u origin feature/ia-cv
```
</details>

---

### 👤 @UP230254 — Frontend (espejo de Juan)

**Qué te toca:** las pantallas de **Auth, Users, Notifications y CV**.

<details><summary><b>13. Front · Auth (login/OTP)</b> — dónde: <code>frontend/src/pages/auth/</code></summary>

Pantalla de Login/OTP (correo → código → sesión), manejo de errores e integración con `authStore`.

```bash
git checkout develop && git pull
git checkout -b feature/front-auth
git add .
git commit -m "feat(front-auth): pantalla de login por OTP"
git push -u origin feature/front-auth
```
</details>

<details><summary><b>14. Front · Users (perfil)</b> — dónde: <code>frontend/src/pages/</code> (users)</summary>

Pantalla de registro/perfil: formulario de datos y edición, consumiendo los endpoints de users.

```bash
git checkout develop && git pull
git checkout -b feature/front-users
git add .
git commit -m "feat(front-users): pantalla de perfil y edicion"
git push -u origin feature/front-users
```
</details>

<details><summary><b>15. Front · Notifications</b> — dónde: <code>frontend/src/</code> (components/pages de notificaciones)</summary>

Campana y vista de notificaciones: listado, marcar leídas y badge de no leídas.

```bash
git checkout develop && git pull
git checkout -b feature/front-notifications
git add .
git commit -m "feat(front-notifications): campana y lista de notificaciones"
git push -u origin feature/front-notifications
```
</details>

<details><summary><b>16. Front · CV (editor)</b> — dónde: <code>frontend/src/pages/</code> (cv)</summary>

Editor/visor de currículum (experiencia, educación, habilidades) y subida del CV.

```bash
git checkout develop && git pull
git checkout -b feature/front-cv
git add .
git commit -m "feat(front-cv): editor de curriculum"
git push -u origin feature/front-cv
```
</details>

---

### 👤 @isaivlogs (up230533) — Frontend (Vacantes, Dashboard y Administración)

**Qué te toca:** las pantallas de **Vacantes** y **Dashboard**, y todo el **panel de Administración** (Panel, Empresas, Vacantes, Usuarios).

<details><summary><b>17. Front · Jobs (vacantes)</b> — dónde: <code>frontend/src/pages/</code> (jobs)</summary>

Listado de vacantes con filtros/búsqueda y detalle de la vacante.

```bash
git checkout develop && git pull
git checkout -b feature/front-jobs
git add .
git commit -m "feat(front-jobs): listado y detalle de vacantes"
git push -u origin feature/front-jobs
```
</details>

<details><summary><b>18. Front · Aplicaciones (mis postulaciones)</b> — dónde: <code>frontend/src/pages/</code> (dashboard)</summary>

En la tarjeta **Aplicaciones** (el maletín) del dashboard, un **botón** que despliega las vacantes a las que el usuario se ha postulado, con su estado. **No** es una página aparte: postularse se hace desde la vista de Vacantes.

```bash
git checkout develop && git pull
git checkout -b feature/front-aplicaciones
git add .
git commit -m "feat(front-aplicaciones): boton de mis postulaciones en el dashboard"
git push -u origin feature/front-aplicaciones
```
</details>

<details><summary><b>19. Front · Dashboard</b> — dónde: <code>frontend/src/pages/</code> (dashboard)</summary>

Panel principal tras el login: recomendaciones, notificaciones y accesos rápidos.

```bash
git checkout develop && git pull
git checkout -b feature/front-dashboard
git add .
git commit -m "feat(front-dashboard): panel principal"
git push -u origin feature/front-dashboard
```
</details>

<details><summary><b>20. Front · Admin — Panel</b> — dónde: <code>frontend/src/pages/admin/</code></summary>

Apartado visual de administración: layout con sidebar (Panel, Empresas, Vacantes, Usuarios), KPIs (empresas, usuarios activos, vacantes activas, postulaciones), gráfica de postulaciones mensuales y dona de usuarios por carrera.

```bash
git checkout develop && git pull
git checkout -b feature/front-admin-panel
git add .
git commit -m "feat(front-admin-panel): panel visual de administracion"
git push -u origin feature/front-admin-panel
```
</details>

<details><summary><b>21. Front · Admin — Empresas (registro)</b> — dónde: <code>frontend/src/pages/admin/empresas</code></summary>

Registro y gestión de empresas: listado, formulario de nueva empresa, editar y eliminar.

```bash
git checkout develop && git pull
git checkout -b feature/front-admin-empresas
git add .
git commit -m "feat(front-admin-empresas): registro y gestion de empresas"
git push -u origin feature/front-admin-empresas
```
</details>

<details><summary><b>22. Front · Admin — Vacantes (registro y edición)</b> — dónde: <code>frontend/src/pages/admin/vacantes</code></summary>

Registro y modificación de vacantes: listado con búsqueda/filtros, formulario de nueva vacante, editar/eliminar y estado activa/inactiva.

```bash
git checkout develop && git pull
git checkout -b feature/front-admin-vacantes
git add .
git commit -m "feat(front-admin-vacantes): registro y edicion de vacantes"
git push -u origin feature/front-admin-vacantes
```
</details>

<details><summary><b>23. Front · Admin — Usuarios (altas y bajas)</b> — dónde: <code>frontend/src/pages/admin/usuarios</code></summary>

Altas y bajas / gestión de usuarios: listado (nombre, carrera, semestre, CV score, estado), buscador y filtros, ver detalle y activar/suspender.

```bash
git checkout develop && git pull
git checkout -b feature/front-admin-usuarios
git add .
git commit -m "feat(front-admin-usuarios): altas y bajas de usuarios"
git push -u origin feature/front-admin-usuarios
```
</details>

---

### 👥 Compartido (@UP230254 + @isaivlogs) — Frontend base

**Qué toca:** la base sobre la que se montan todas las pantallas. **Pónganse de acuerdo** para no chocar.

<details><summary><b>24. Front · Layout + routing</b> — dónde: <code>frontend/src/components/layout/</code> + <code>App.tsx</code></summary>

Navbar/sidebar, layout general, React Router (rutas públicas/privadas) y protección de rutas por sesión.

```bash
git checkout develop && git pull
git checkout -b feature/front-layout
git add .
git commit -m "feat(front-layout): layout, rutas y proteccion por sesion"
git push -u origin feature/front-layout
```
</details>

<details><summary><b>25. Front · Store (estado global)</b> — dónde: <code>frontend/src/store/</code></summary>

Zustand: `authStore` y demás stores, con persistencia de sesión.

```bash
git checkout develop && git pull
git checkout -b feature/front-store
git add .
git commit -m "feat(front-store): stores globales con Zustand"
git push -u origin feature/front-store
```
</details>

<details><summary><b>26. Front · Componentes comunes</b> — dónde: <code>frontend/src/components/common/</code></summary>

Botones, inputs, modales y loaders reutilizables.

```bash
git checkout develop && git pull
git checkout -b feature/front-components
git add .
git commit -m "feat(front-components): componentes reutilizables"
git push -u origin feature/front-components
```
</details>

---

## 🤖 ¿Qué pasa cuando abres tu PR?

1. **CI (Robot Inspector):** al abrir el PR corre `ci-validation.yml`, que **compila** backend y frontend.
   - ❌ Si falla → corrige y vuelve a hacer `git push` (el PR se revalida solo).
   - ✅ Si pasa → queda listo para revisión.
2. **QA visual:** Juan pone la etiqueta `qa` al PR y `qa-preview.yml` levanta el entorno con Docker para
   revisar la app corriendo.
3. **Revisión:** Juan revisa el código y el funcionamiento.
   - Si pide cambios (*Request changes*) → corrige y vuelve a subir.
   - Si aprueba (*Approve*) → hace **Merge** a `develop`. 🎉

> **Tú NO haces merge.** Solo abres el PR y atiendes las observaciones.

---

## ✍️ Convenciones de commits

Usamos **Conventional Commits**: `tipo(alcance): descripción corta`.

| Tipo | Cuándo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `refactor` | Reestructurar sin cambiar comportamiento |
| `chore` | Configuración, dependencias, tareas varias |
| `docs` | Documentación |

Ejemplos: `feat(jobs): filtro por carrera` · `fix(auth): validacion de correo institucional`.

---

## 📋 Tablero y equipo

- **Tablero (Kanban):** https://github.com/orgs/Upa-ISC08C/projects/1
- **Flujo resumido:** [`CONTRIBUTING.md`](CONTRIBUTING.md)

| Persona | Área |
|---|---|
| Juan (@JuanJesusRodriguezArellano) | Líder · Backend (Auth/Users/Notifications + Services/Middlewares) · DevOps |
| Andrea (@AndreaSurdez) | Backend (Jobs/Applications/Connections + Config/Utils) |
| @UP230823 | IA (Matching + CV) |
| @UP230254 | Frontend (Auth/Users/Notifications/CV) |
| @isaivlogs (up230533) | Frontend: Vacantes, Dashboard (con Aplicaciones) y panel de Admin (Panel/Empresas/Vacantes/Usuarios) |

---

> Hecho con ❤️ por el equipo InUPA · ISC08C
