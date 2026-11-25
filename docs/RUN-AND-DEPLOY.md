# Run and deploy Raksha Atlas

This guide explains how to start the current website on your computer, check that it builds, optionally run it with Docker and understand the deployment files.

**Run commands from the repository root** — the folder that contains `package.json`.

## 1. What you need

- Windows, macOS or Linux.
- A supported Node.js LTS release.
- npm (installed with Node.js).
- Git to download and update the repository.
- Optional: Docker Desktop if you want to use Docker Compose.

The current active application is the React + Vite frontend in `src/` and the Node.js API in `server/`.

## 2. Download dependencies

Open a terminal in the project root:

```powershell
npm install
```

This reads `package.json` and installs the packages needed by the project into `node_modules/`. The lock file records the resolved package versions.

If installation fails, check the Node.js and npm versions first. Do not delete the lock file as a first troubleshooting step.

## 3. Start the full local website

```powershell
npm run dev:full
```

This runs the helper in `dev-full.mjs`, which starts the Vite frontend and Node API together.

- Website: normally http://localhost:5173
- API: normally http://localhost:8787

Keep the terminal open while using the site. Stop the processes with `Ctrl+C`.

If a port is already in use, close the other process or inspect the configured port. Do not start multiple copies of the API against the same local data files unless you understand the effect.

## 4. Start only one part

Start only the frontend:

```powershell
npm run dev
```

Start only the Node API:

```powershell
npm run api
```

The frontend may show API errors if the backend is not running. That is expected when you start only the frontend and open a page that needs backend data.

## 5. Build and test

Run:

```powershell
npm run build
npm test
```

What these checks mean:

- `npm run build` runs the TypeScript project build and Vite production build.
- `npm test` runs the Node.js built-in test suite.

A successful build means the configured frontend build completed. It does not prove that every API endpoint, scheduled job, external source or deployed environment works. Test the changed feature locally as well.

## 6. Environment variables

The example file is `.env.example`. Create a local `.env` only when the service you are running needs those settings.

```powershell
Copy-Item .env.example .env
notepad .env
```

Only fill in values required for your local task. Keep real tokens and passwords private.

Rules:
- Never commit `.env`.
- Never paste real secrets into source files, screenshots or documentation.
- Do not put server secrets in frontend variables such as `VITE_*`.
- Use different local credentials from production.
- If a setting is unclear, inspect the code that reads it before adding a value.

## 7. Optional Docker Compose runtime

Docker Compose starts a group of containers described in `docker-compose.yml`.

First validate the Compose configuration:

```powershell
docker compose config --quiet
```

Then start the configured services:

```powershell
docker compose up --build
```

The legacy container website is normally exposed at http://localhost:8080. Exact services and required environment variables depend on the Compose profile and local configuration.

Stop the running containers with `Ctrl+C`, then:

```powershell
docker compose down
```

**Volume warning:** do not add `-v` unless you intentionally want to remove Compose volumes. A database volume may contain local data.

Optional profiles and service boundaries are described in [the Docker guide](docker/README.md).

## 8. Deployment files

| File or folder | Purpose |
|---|---|
| `vercel.json` | Tells Vercel how to build the website and route API functions. |
| `api/[...path].mjs` | Passes Vercel API requests to the existing Node handler. |
| `vite.config.ts` | Vite development and build configuration. |
| `Dockerfile` | Root container build instructions. |
| `docker-compose.yml` | Local multi-service container configuration. |
| `deploy/nginx.conf` | Legacy Nginx routing for the Docker website/API setup. |
| `.github/workflows/` | Automated checks and controlled deployment workflows. |

The current Vercel configuration uses `npm run build`, outputs the `dist` folder and includes the server files needed by the API function. Always confirm the actual settings in `vercel.json`; this guide is not a substitute for the configuration file.

## 9. Vercel deployment

For the existing Vercel project:

1. Confirm the local branch contains the intended changes.
2. Run the build and tests.
3. Push only the approved branch/commit to the branch connected to Vercel.
4. Open the Vercel deployment page.
5. Check the build log and function logs.
6. Confirm required environment variables exist in the Vercel project settings.
7. Open the deployed website and test a page that calls the API.

Do not put secrets in GitHub commits or this guide. Do not assume a successful Git push means deployment succeeded.

## 10. AWS deployment path

The repository also contains an AWS/ECS workflow and Terraform foundation. This is a separate, manually controlled path. It is not required to run the current Vercel website.

Do not run Terraform apply or an ECS deployment until the AWS account, cost, network, IAM, secrets, database, backups and rollback plan have been reviewed and approved. See [the AWS guide](../infrastructure/aws/README.md).

## 11. Common problems

| Problem | What to check |
|---|---|
| `npm install` fails | Node/npm version, network, package-lock consistency and error text. |
| Website opens but data does not load | Confirm the Node API is running and inspect browser/network and API terminal errors. |
| Port is already in use | Identify the process using the port before stopping it. |
| Docker configuration fails | Check required variables in local `.env` and run `docker compose config`. |
| Docker website cannot reach API | Check Compose service names, internal port and Nginx proxy configuration. |
| Vercel page loads but API fails | Check function logs, `vercel.json`, included server files and deployed environment variables. |
| Database connection fails | Check PostgreSQL status, database URL, credentials and network access. |

## 12. Before saying a release is ready

- [ ] Local build passes.
- [ ] Automated tests pass.
- [ ] Changed pages and API routes have been manually checked.
- [ ] No secrets or local data files were added to the commit.
- [ ] Deployment logs show success.
- [ ] The deployed website and a backend-powered feature have been checked.
- [ ] Rollback path is understood for any infrastructure or data change.