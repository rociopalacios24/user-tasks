# user-tasks

App mínima para gestionar tareas de usuario (registro/login + CRUD básico de tareas) usando **Node.js + Express + PostgreSQL** y **frontend HTML/CSS/JS**.

## Estructura
```
user-tasks/
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  ├─ db.js
│  ├─ .env.example
│  └─ sql/
│     └─ schema.sql
└─ frontend/
   ├─ index.html
   ├─ app.js
   └─ styles.css
```

## Requisitos
- Node.js 18+
- PostgreSQL 14+ (o instancia en Render)

## Variables de entorno
Copia `.env.example` a `.env` dentro de `backend/` y ajusta:
```
PORT=3000
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
```

> En Render suele ser `DATABASE_URL=${POSTGRESQL_URL}` y **requiere SSL** (ya está manejado en `db.js`).

## Inicialización local
1) Base de datos (opcional si usarás Render):
```bash
createdb user_tasks_db
psql -d user_tasks_db -f backend/sql/schema.sql
```
2) Backend:
```bash
cd backend
cp .env.example .env
# edita DATABASE_URL
npm install
npm run dev
```
La API corre en `http://localhost:3000`.

3) Frontend:
- Abre `frontend/index.html` (Live Server recomendado).
- El frontend detecta `localhost` y apunta a `http://localhost:3000` automáticamente.

## Endpoints
- `POST /users/register` → body: `{ name, email, password }`
- `POST /users/login` → body: `{ email, password }`
- `POST /tasks` → body: `{ user_id, title, description? }`
- `GET /tasks/:userId`
- `PUT /tasks/:id/status` (ciclo: `pending` → `in_progress` → `done`)

## Deploy en Render
1) Crea **PostgreSQL** y copia `External Database URL`.
2) Crea **Web Service** desde `backend/`:
   - Build: `npm install`
   - Start: `node server.js`
   - Env Vars: `NODE_ENV=production`, `DATABASE_URL=<External DB URL>`
3) Ejecuta `backend/sql/schema.sql` en la DB (desde consola de la DB o local con la URL).
4) Sube `frontend/` a Netlify/GitHub Pages/Render Static Sites y en `frontend/app.js` fija:
```js
const API = 'https://tu-backend.onrender.com';
```

¡Listo! 😄
