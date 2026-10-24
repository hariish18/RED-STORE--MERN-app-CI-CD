Next step of the Red Store Dockerization: create the CI/CD GitHub Actions pipeline. The local Docker setup already works (read CLAUDE.md, README.md, docker-compose.yml and the 2 Dockerfiles).

## Phase 1 — Analysis (make no changes)
Check and summarize:
- the name of the main branch and the remote GitHub URL
- the available scripts (lint, build, test) in backend/ and frontend/
- whether `npm run lint` of the frontend passes without errors
- whether the backend has tests; if not, propose a minimal check (e.g. `node --check` on the files, or server startup)
Then propose a plan and wait for my approval.

## Phase 2 — Create `.github/workflows/ci-cd.yml`
Triggers: push and pull_request on the main branch.

Job `ci` (ubuntu-latest, Node 22 with npm cache):
- backend: `npm ci` + the check proposed in phase 1
- frontend: `npm ci`, `npm run lint`, `npm run build`

Job `docker` (needs: ci, push only, not on pull_request):
- docker/setup-buildx-action, docker/login-action with secrets DOCKERHUB_USERNAME and DOCKERHUB_TOKEN
- docker/build-push-action for backend and frontend
- images: `YOUR_DOCKERHUB_USERNAME/redstore-backend` and `YOUR_DOCKERHUB_USERNAME/redstore-frontend`
- tags: `latest` and the short commit SHA
- frontend: build-arg VITE_STRIPE_PUBLISHABLE_KEY from secrets, VITE_API_URL empty
- Buildx GitHub Actions cache (`type=gha`) with a different scope per image

Job `deploy` (needs: docker, push only):
- calls the Render Deploy Hooks with curl from secrets RENDER_DEPLOY_HOOK_BACKEND and RENDER_DEPLOY_HOOK_FRONTEND
- if these secrets do not exist yet, the job prints a message and succeeds (not fails)

Also add:
- `concurrency` to cancel a run in progress if a new push arrives
- `permissions: contents: read`
- a CI/CD badge at the top of README.md and a "CI/CD" section explaining the 3 jobs and listing the required GitHub secrets (names only)

## Rules
- No plain-text secrets in the workflow, only `${{ secrets.* }}`
- Never read the `.env` files
- Do not modify application code without asking
- No commit or push

## Phase 3 — Verification
- Validate the workflow syntax with actionlint via Docker: `docker run --rm -v "${PWD}:/repo" -w /repo rhysd/actionlint:latest`
- Run locally the same commands as the `ci` job to confirm they pass
- End with a summary: files created/modified, and the exact list of manual steps remaining (commit, push, where to look in the Actions tab)