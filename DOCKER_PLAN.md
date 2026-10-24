I want to Dockerize my Red Store project (MERN: React 19 + Vite frontend in `frontend/`, Express 5 backend in `backend/`, MongoDB Atlas, Cloudinary, Stripe, JWT). Final goal: later deploy the 2 images on Render (no VPS) via GitHub Actions and Docker Hub (`YOUR_DOCKERHUB_USERNAME/redstore-backend` and `YOUR_DOCKERHUB_USERNAME/redstore-frontend`). For now we are doing the Docker part locally ONLY. Read CLAUDE.md and README.md before starting.

## Phase 1 — Analysis (make no changes)
Check and summarize:
- the port of `backend/server.js` and whether it reads `process.env.PORT`
- the backend entry file and the scripts in `backend/package.json` and `frontend/package.json` (is there a `lint` script?)
- the `baseURL` in `frontend/src/utils/api.js` (it must be relative `/api`) and the proxy in `vite.config.js`
- the NAMES of environment variables used (backend: `process.env.*`, frontend: `import.meta.env.VITE_*`), never the values
- whether Multer writes files locally instead of sending everything to Cloudinary
- the backend CORS config
- the seed scripts in `backend/scripts/`
- whether `npm run build` of the frontend passes without errors
Then propose a plan and wait for my approval.

## Phase 2 — Files to create
1. `backend/Dockerfile`: `node:20-alpine`, `WORKDIR /app`, copy `package*.json` before code (cache), `npm ci --omit=dev`, `NODE_ENV=production`, `EXPOSE` the correct port, `USER node`.
2. `backend/docker-entrypoint.sh`: check that mandatory variables exist (clear message + `exit 1` if not), then `exec "$@"`. Used with `ENTRYPOINT ["docker-entrypoint.sh"]` + `CMD ["node", "<entry file>"]`. LF line endings.
3. `frontend/Dockerfile` multi-stage: `build` stage (`node:20-alpine`, `npm ci`, `npm run build`, public `VITE_*` variables as `ARG`/`ENV`), final `nginx:alpine` stage that copies `dist/` and the Nginx template into `/etc/nginx/templates/`.
4. `frontend/default.conf.template`:
   - `listen 80`, `root /usr/share/nginx/html`
   - `location /` with `try_files $uri $uri/ /index.html` (React Router)
   - `location /api/`: `proxy_pass ${BACKEND_URL};`, `proxy_set_header Host $proxy_host;`, `proxy_ssl_server_name on;`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `client_max_body_size 10M`
   - gzip enabled, long cache for `/assets/`, no cache for `index.html`
   - This file must work both locally (`BACKEND_URL=http://backend:<port>`) and on Render (`BACKEND_URL=https://xxx.onrender.com`).
5. `.dockerignore` in `backend/` and `frontend/`: node_modules, dist, .env*, .git, logs, *.md.
6. `docker-compose.yml` at the root (Atlas mode): `backend` (build, env_file `backend/.env`, no published port, `restart: unless-stopped`) and `frontend` (build with `VITE_*` args read from a root `.env`, port `8080:80`, `BACKEND_URL=http://backend:<port>`, `depends_on: backend`). Image names: `YOUR_DOCKERHUB_USERNAME/redstore-backend` and `YOUR_DOCKERHUB_USERNAME/redstore-frontend`.
7. `docker-compose.local.yml` (override for offline dev): `mongo:7` service with named volume `mongo-data`, healthcheck `mongosh ping`, no published port; the backend uses `MONGO_URI=mongodb://mongo:27017/redstore` and `depends_on` with `condition: service_healthy`.
8. `.gitattributes`: `*.sh text eol=lf`.
9. `.env.example` (root, backend, frontend) with variable names only.
10. "Docker" section in README.md: run with Atlas (`docker compose up --build`), run locally with Mongo (`docker compose -f docker-compose.yml -f docker-compose.local.yml up --build`), run the seed, view logs, stop, difference between `down` and `down -v`.

## Rules
- Never read, display or modify the contents of `.env` files. Only verify they are in `.gitignore` and `.dockerignore`.
- No secrets in a Dockerfile or in an image. On the frontend side, only public keys (Stripe `pk_...`).
- If application code needs to change (port, baseURL, CORS, local uploads), explain why and ask first.
- Do not delete any existing file. Do not commit.

## Phase 3 — Verification
Docker Desktop is running. Execute:
1. `docker compose build` and fix any errors
2. `docker compose up -d`, then `docker compose ps` (everything must be running)
3. `docker compose logs backend`: successful MongoDB connection
4. Test with curl: `http://localhost:8080` (HTML), an endpoint `http://localhost:8080/api/...` (JSON), and a React route like `http://localhost:8080/cart` (must return index.html, not 404)
5. `docker images`: give the size of the 2 images
6. `docker compose down`
End with a summary: files created, commands to remember, points to check manually in the browser (login, admin image upload, Stripe test payment).