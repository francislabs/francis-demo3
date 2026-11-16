# Harness Shop — GKE demo app

A tiny, dependency-free Node.js web app used to demo how Harness **builds, secures and deploys** an application to GKE, and how a Jira story becomes a pull request (via Cursor) that triggers the pipeline.

## What's in here

| Path | Purpose |
|---|---|
| `src/config.js` | Everything visible on the page. The demo Jira story only changes this file. |
| `src/server.js`, `src/page.js` | HTTP server (`/`, `/healthz`, `/api/info`, `/api/products`) and HTML rendering |
| `test/` | Unit tests (`npm test`, uses the built-in Node test runner) |
| `Dockerfile` | Non-root `node:22-alpine` image, port 8080 |
| `deploy/k8s/` | Harness-templated Kubernetes manifests (Deployment + LoadBalancer Service) |
| `.cursor/rules/demo.mdc` | Tells Cursor how to turn a Jira story into a branch + PR |
| `docs/JIRA_STORY.md` | The story to raise in Jira for the demo, plus the Cursor prompt |

## Run locally

```bash
npm test
npm start            # http://localhost:8080
```

Or with Docker:

```bash
docker build -t harness-shop .
docker run -p 8080:8080 harness-shop
```

## Demo flow (summary)

1. **Baseline:** pipeline deploys `main` to GKE; open the LoadBalancer URL and show the blue "Welcome to Harness Shop" page.
2. **Change:** raise the story in `docs/JIRA_STORY.md` in Jira. In Cursor, ask it to implement the story; it creates `feature/<KEY>-...`, edits `src/config.js`, and opens a PR.
3. **Pipeline:** the PR triggers the Harness pipeline (scan → test → build → deploy). Refresh the URL to see the red holiday version.
4. **Reset:** close the PR without merging, delete the branch, and re-run the pipeline on `main` so the URL shows the baseline again.

Pipeline and connector setup are added in the next step.
