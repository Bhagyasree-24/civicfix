# CivicFix — Smart Civic Issue Reporter

A LAB#13 full-stack project for reporting and tracking community issues such as potholes, garbage overflow, broken streetlights, and water leakage.

## Stack
- Frontend: React + Vite
- API: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- Deployment: Vercel (frontend) + Render (API)
- Optimization: Vite production build, lazy-ready component structure, minification, gzip compression, Helmet security headers, API rate limiting, and production-only dependency installs.

## Requirements
Node.js 20+ and npm. A MongoDB Atlas database is needed for persistent data.

## Run locally
Open two terminals from this repository root.

Terminal 1 — backend:
```powershell
cd backend
npm install
Copy-Item .env.example .env
# Set MONGO_URI in backend/.env to your MongoDB Atlas connection string.
npm run dev
```

Terminal 2 — frontend:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
# Set VITE_API_URL=http://localhost:5000/api in frontend/.env.
npm run dev
```

Frontend: http://localhost:5173
API health: http://localhost:5000/api/health

## Environment variables
Never commit `.env` files or credentials. The repository ignores them and tracks only `.env.example` templates. `backend/.env` uses `PORT` (local API port), `NODE_ENV`, `MONGO_URI` (private database credential), and `CLIENT_URL` (allowed frontend origin; comma-separated origins are supported). `frontend/.env` uses `VITE_API_URL`, the public API base URL including `/api`; Vite exposes `VITE_` values in browser bundles, so never put secrets there. For deployment, configure backend values in Render and `VITE_API_URL` in Vercel instead of uploading local `.env` files.

## Deploy backend on Render
1. Push this repository to GitHub.
2. In Render, create **New → Web Service** and connect the repository.
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables: `MONGO_URI` (MongoDB Atlas connection string), `CLIENT_URL` (the deployed Vercel URL), and `NODE_ENV=production`.
7. Deploy. Check `https://YOUR-API.onrender.com/api/health`.
8. In MongoDB Atlas, allow network access for the deployed service according to your course requirements; use a database user with only the permissions it needs. Do not share database credentials.

## Deploy frontend on Vercel
1. Import the GitHub repository in Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add `VITE_API_URL=https://YOUR-API.onrender.com/api` in Project Settings → Environment Variables.
5. Redeploy after changing environment variables.
6. Add the exact Vercel deployment origin as `CLIENT_URL` in Render, then redeploy the backend if needed.

## Build optimization evidence
Run `npm run build` inside `frontend`. Vite generates the optimized production bundle in `frontend/dist`, with minification and tree-shaking. Inspect the build output and record the generated asset sizes in the lab report. Express uses `compression` to gzip eligible responses and `express-rate-limit` to limit API abuse.

## Important security note
This educational version supports public issue submission and public status viewing. It intentionally does not pretend to have secure administrator authentication. Before adding status-changing/admin features for real public use, implement authenticated roles, server-side authorization, input validation, and audit logging.
