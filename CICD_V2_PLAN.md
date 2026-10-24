Evolve `.github/workflows/ci-cd.yml` for Red Store into a 7-job pipeline. First read the current workflow, CLAUDE.md and the 2 Dockerfiles.

## Phase 1 — Analysis (make no changes)
Summarize the current workflow and propose the detailed plan. Wait for my approval.

## Phase 2 — The 7 jobs
1. `lint-frontend`: Node 22 + npm cache, `npm ci`, `npm run lint`, `npm run build` in frontend/
2. `check-backend`: `npm ci` + the module checks already in place. In parallel with job 1
3. `sonarqube` (needs 1 and 2): SonarQube Cloud via the official SonarSource action, secret `SONAR_TOKEN`. Create `sonar-project.properties` (sources backend/ and frontend/src, exclude node_modules, dist, seed scripts). I will give you the organization key and project key. If `SONAR_TOKEN` doesn't exist, the job prints a message and succeeds
4. `docker-backend` (needs 3, push only): build + push with the short SHA tag ONLY, gha cache scope backend
5. `docker-frontend` (needs 3, push only): same with build-arg VITE_STRIPE_PUBLISHABLE_KEY, gha cache scope frontend. In parallel with job 4
6. `trivy-scan` (needs 4 and 5): scans both images (SHA tag) with the official Aqua Security action, fails on CRITICAL severity (ignore-unfixed: true), also displays HIGH without blocking. Publishes the report in the job summary
7. `deploy` (needs 6, push only): adds the `latest` tag to both images with `docker buildx imagetools create` (no rebuild), then calls the Render Deploy Hooks (message + success if secrets are absent)
8. `snyk`: in parallel with jobs 1 and 2 (no needs). Uses the official Snyk action for Node, secret `SNYK_TOKEN`. Scans the backend/ and frontend/ npm dependencies (`snyk test` with `--severity-threshold=high`). Job 3 (sonarqube) must also wait for this job. If `SNYK_TOKEN` doesn't exist, the job prints a message and succeeds. On pull_request, this job also runs.

Also:
- `runs-on: ubuntu-24.04` (fixed version) for all jobs
- recent action versions to suppress Node 20 warnings
- on pull_request: only jobs 1, 2 and 3
- keep concurrency and `permissions: contents: read`
- update the CI/CD section and pipeline diagram in README.md

## Rules
- No plain-text secrets, never read `.env` files
- Do not modify application code without asking
- No commit or push

## Phase 3 — Verification
- actionlint via Docker
- run Trivy locally via Docker on the 2 local images and give me the number of CRITICAL and HIGH vulnerabilities
- summary: modified files and remaining manual steps