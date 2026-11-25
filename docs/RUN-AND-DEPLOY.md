# Run and Deploy Raksha Atlas

Use the commands from the repository root in PowerShell.

## 1. Install

```powershell
npm install
```

## 2. Run the complete local website

```powershell
npm run dev:full
```

Open http://localhost:5173. This starts the Vite website and Node API together.

## 3. Build and test

```powershell
npm run build
npm test
```

## 4. Environment settings

Copy `.env.example` to `.env` only when local services or API integrations need environment variables. Fill in only the values required for the service being used. Never share or commit `.env`.

## 5. Run with Docker (optional)

Docker Compose requires the values marked as required in `.env`.

```powershell
docker compose config --quiet
docker compose up --build
```

Open http://localhost:8080. Stop with `Ctrl+C`; use `docker compose down` to stop and remove containers. Do not add `-v` unless you intentionally want to delete the local database volume.

## 6. Deploy the website

The repository has a Vercel configuration in `vercel.json`:

- Build command: `npm run build`
- Output folder: `dist`
- API function: `api/[...path].mjs`

For the existing Vercel project, push the approved changes to its connected deployment branch and check the deployment in the Vercel dashboard. Confirm the required environment variables are configured in Vercel before deploying. Do not paste secrets into Git or this guide.

The AWS ECS workflow is a separate, manually approved deployment path. Do not run it unless the AWS environment, ECS service and reviewed task definition are configured.

## Important

- The active local website is root `src/` + `server/`.
- `frontend/` and `backend/` are migration applications, not the default local run command.
- Read [the architecture guide](architecture/README.md) before changing deployment or service boundaries.
