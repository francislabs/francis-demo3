# AGENTS.md — guidance for Cosmos and other coding agents

This repo is **Harness Shop**, a small Node.js (Express) store deployed to GKE by Harness. It is used for a live "self-healing" demo:

1. The app raises a Jira Service Management incident (project `DEV`) when it hits an error.
2. You (Cosmos) fix it and open a pull request.
3. Harness builds, scans, approves and deploys the PR.

## How to work on an incident

1. **Read the incident.** Read the Jira incident: the summary, the description (endpoint, request body, error, stack trace), and the app version and commit. The stack trace points at the failing file and line.

2. **Reproduce it locally before changing anything.**
   - `npm ci`
   - `npm test`
   - `PORT=8080 node src/server.js`, then `curl -X POST localhost:8080/api/cart -H 'Content-Type: application/json' -d '{"productId":"mug"}'`

3. **Fix the root cause.**
   - Keep the change minimal and focused on the incident.
   - Products are defined in `src/config.js`, and the cart logic lives in `src/cart.js`.
   - Unknown product IDs should return a clear 4xx error, not crash.

4. **Add a regression test** in `test/app.test.js` that fails without your fix and passes with it. For example, `POST /api/cart` with `{"productId":"mug"}` returns 200 and `count` 1. `npm test` must pass.

5. **Name the branch** `fix/<JIRA-KEY>-<short-slug>`, for example `fix/DEV-12-add-to-cart`.

6. **Open the PR** into `main`.
   - Title: `<JIRA-KEY>: <short summary>`. The Jira key is how the Harness pipeline links the run back to the incident.
   - Open it **ready for review, not as a draft**. The Harness PR trigger runs the pipeline as soon as the PR is opened.
   - In the PR description: the root cause, the fix, and the test you added.

7. **Comment on the Jira incident** with the root cause and a link to the PR.

8. **Do not merge.** A human approves the deployment in Harness. This demo is reset after each run, so the PR is closed rather than merged.

## Do not change

- Anything under `deploy/` (Kubernetes manifests rendered by Harness).
- `.harness/` (pipeline definitions).
- `src/incident.js` (the incident reporter), unless the incident is about it.
- Dependencies in `package.json`, unless the fix needs it.
