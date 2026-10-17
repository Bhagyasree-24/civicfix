# CivicFix — Smart Civic Issue Reporter

CivicFix is a LAB #13 full-stack civic reporting project for reporting and tracking community issues such as potholes, garbage overflow, broken streetlights, water leakage, and other street hazards. The platform helps communities report issues so local authorities can review and address them.

## Tech Stack

- **Frontend:** React + Vite
- **Backend API:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose
- **Deployment:** Vercel (frontend) + Render (API)
- **Optimization:** Vite production builds, minification, tree-shaking, gzip compression, Helmet security headers, and API rate limiting.

## Requirements

- Node.js 20+
- npm
- MongoDB Atlas database

## Run Locally

Open two terminals from the project root.

### Terminal 1 — Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` in `backend/.env` to your MongoDB Atlas connection string. Then run:

```powershell
npm run dev
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Set `VITE_API_URL` in `frontend/.env` to:

```text
http://localhost:5000/api
```

Then run:

```powershell
npm run dev
```

- Frontend: http://localhost:5173
- API health check: http://localhost:5000/api/health

## Environment Variables

Never commit `.env` files or credentials. The repository should track only `.env.example` templates.

- **Backend:** `PORT`, `NODE_ENV`, `MONGO_URI`, and `CLIENT_URL`
- **Frontend:** `VITE_API_URL`

Vite exposes `VITE_` variables in browser bundles, so never store secrets in frontend environment variables.

For deployment, configure environment variables in Render and Vercel instead of uploading local `.env` files.

## Deploy Backend on Render

1. Push the repository to GitHub.
2. Create a new Web Service in Render and connect the repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Configure `MONGO_URI`, `CLIENT_URL`, and `NODE_ENV=production`.
7. Deploy and test the API health endpoint:

   `https://YOUR-API.onrender.com/api/health`

8. Ensure MongoDB Atlas network access allows the deployed backend to connect. Use a database user with only the required permissions.

## Deploy Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Select the Vite framework preset.
4. Set the build command to `npm run build` and output directory to `dist`.
5. Set `VITE_API_URL` to `https://YOUR-API.onrender.com/api`, replacing the example with your actual Render URL.
6. Redeploy after changing environment variables.
7. Set `CLIENT_URL` in Render to your exact deployed Vercel origin and redeploy the backend if needed.

## Build Optimization

Run the following commands from the frontend directory:

```powershell
npm install
npm run build
```

Vite generates an optimized production bundle in `frontend/dist`, using production optimizations such as minification and tree-shaking. Record the generated asset sizes for the lab report.

The Express backend can use compression for eligible responses and rate limiting to help reduce bandwidth and limit API abuse.

## Security Note

This educational version supports civic issue submission and status viewing. Do not treat it as production-ready administrative software without verifying authentication and authorization.

Before enabling administrative or status-changing features for public use, implement authenticated roles, server-side authorization, input validation, and audit logging.