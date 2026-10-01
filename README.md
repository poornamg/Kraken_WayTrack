# WayLink Monorepo

Welcome to the WayLink monorepo. This repository contains the source code for the WayLink logistics system, spanning five separate frontend applications and a unified backend.

## Structure

```
/
├── frontend/
│   ├── Login/             (Role-based sign-in SPA)
│   ├── Store-Manager/     (Store Manager app)
│   ├── dispatcher/        (Dispatcher app)
│   ├── loader/            (Loader app)
│   └── delivery-driver/   (Driver app)
├── backend/
│   ├── src/
│   │   ├── routes/        (API route definitions)
│   │   ├── middleware/    (Auth, error handling, etc.)
│   │   ├── services/      (Business logic / Constraints)
│   │   ├── models/        (Mongoose database schemas)
│   │   ├── config/        (Env vars & DB connections)
│   │   └── utils/         (Shared utilities and seeders)
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     (Runs MongoDB and optionally backend API)
└── package.json           (Convenience scripts)
```

## Running Locally

To install and run everything locally, first install dependencies across the monorepo:

```bash
# Frontend Apps
cd frontend/Login && npm install
cd ../Store-Manager && npm install
cd ../dispatcher && npm install
cd ../loader && npm install
cd ../delivery-driver && npm install

# Backend
cd ../../backend && npm install
```

### Starting the Database

```bash
docker compose up -d mongo mongo-init
```

### Running the Backend

Ensure `.env` values are set appropriately (see `backend/.env.example`).
```bash
npm run dev:backend
```

### Running Frontend Apps

The root `package.json` provides scripts to easily start frontend applications from the root directory:
```bash
npm run dev:login
npm run dev:store
npm run dev:dispatcher
npm run dev:loader
npm run dev:driver
```

## Deployment (Vercel)

Each frontend application is designed to be deployed separately as a distinct project on Vercel. 
Due to the monorepo structure, **you must configure the "Root Directory" for each Vercel project correctly**:

| Vercel Project | Old Root Directory | New Root Directory |
| --- | --- | --- |
| Login | `Login` | `frontend/Login` |
| Store Manager | `Store-Manager` | `frontend/Store-Manager` |
| Dispatcher | `dispatcher` | `frontend/dispatcher` |
| Loader | `loader` | `frontend/loader` |
| Delivery Driver | `delivery-driver` | `frontend/delivery-driver` |

### Environment Variables

When deploying to Vercel, ensure the following environment variables are set for **each** respective frontend app:

- **Login**:
  - `VITE_API_BASE_URL` (e.g. `https://api.waylink.com`)
  - `VITE_USE_MOCK_AUTH` (optional)
- **Store Manager**:
  - `VITE_API_BASE_URL`
  - `VITE_SERVICE_DATE` (optional)
- **Dispatcher**:
  - `VITE_API_BASE_URL`
  - `VITE_SERVICE_DATE` (optional)
- **Loader**:
  - `VITE_API_BASE_URL`
- **Delivery Driver**:
  - `VITE_API_BASE_URL`

*(The backend API redirect URLs rely on the `LOGIN_ORIGIN`, `STORE_MANAGER_ORIGIN`, `DISPATCHER_ORIGIN`, `LOADER_ORIGIN`, and `DRIVER_ORIGIN` env values. These determine where users go post-login).*
