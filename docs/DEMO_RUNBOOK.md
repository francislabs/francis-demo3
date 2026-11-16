# Demo runbook — Jira Scrum → Cursor → PR → Harness → GKE

| What | Where |
|---|---|
| App URL | http://34.41.88.205 (GKE LoadBalancer, namespace `deploy`) |
| Repo | Harness Code `default/francis/harness-gke-demo` |
| Jira | Scrum project `SHOP` at https://demolabsf.atlassian.net, story `SHOP-1` in the active sprint |
| Main pipeline | `harness-shop-build-deploy`: Jira start → scan, test, build/push → deploy → URL → Jira done |
| PR trigger | `pr-to-main` runs on PR **create/update** into `main` (not on merge) |
| Reset | Pipeline `reset-demo` redeploys `main` and moves `SHOP-1` back to To Do |
| Jira setup | Pipeline `setup-jira-demo` creates or reuses the SHOP project, sprint and story |
| Cursor commands | `/demo-start` and `/demo-reset` (in `.cursor/commands/`) |

## One-time setup in Cursor

1. **Clone the repo.** In Harness Code, open the repo, click **Clone**, then **Generate Clone Credential**. Then run `git clone https://git.harness.io/iOrKafK-S4atFewx03Owag/default/francis/harness-gke-demo.git`, open the folder in Cursor, and run `npm ci`.
2. **Harness MCP.** This is already connected. Check that it can see org `default`, project `francis`.
3. **Atlassian MCP.** In Cursor, go to **Settings → MCP**, add the **Atlassian** server (from the Cursor MCP marketplace, or URL `https://mcp.atlassian.com/v2/mcp`), and sign in to `demolabsf.atlassian.net`. Then test it by asking Cursor: "show me SHOP-1".
4. **Commands.** Type `/` in Cursor chat. You should see `demo-start` and `demo-reset`.

## Before each demo (2 minutes)

- Open the app URL and confirm the **blue** "Welcome to Harness Shop" page.
- Open the SHOP board and confirm `SHOP-1` is in **To Do**.
- If either is wrong, run `/demo-reset` in Cursor (or the `reset-demo` pipeline in Harness).

## Demo flow (all from Cursor)

1. **The sprint.** Show the SHOP Scrum board with `SHOP-1` in To Do, and the blue app.
2. **In Cursor, run `/demo-start SHOP-1`.** Cursor then:
   - reads the story and its acceptance criteria from Jira,
   - creates `feature/SHOP-1-...`, edits `src/config.js`, runs the tests,
   - commits, pushes, and opens the PR in Harness Code through the Harness MCP,
   - finds the triggered pipeline run and follows it.
3. **In Harness**, while the pipeline runs:
   - **Jira Start:** `SHOP-1` moves to **In Progress** with a pipeline comment (flip to the board to show it).
   - **Build and Secure:** secret scan, dependency scan, unit tests, image push with a new version tag.
   - **Deploy to GKE:** rolling deploy, then the URL step.
4. **The reveal.** Refresh the app URL to show the red header, the holiday banner and the Holiday Beanie. Show the board: `SHOP-1` is **Done**, with a comment that links to the live URL.

## Reset after the demo (`main` is never changed)

In Cursor, run `/demo-reset SHOP-1`. It:

- closes the PR without merging,
- deletes the feature branch remotely and locally,
- runs `reset-demo`, which redeploys `main` and moves `SHOP-1` back to To Do,
- verifies the blue page is back.

**Manual fallback:**

1. Close the PR in Harness Code and delete the branch.
2. Run the `reset-demo` pipeline.
3. Run `git checkout main && git branch -D feature/SHOP-1-<slug>`.

## If something goes wrong

- **The push fails:** regenerate the Harness Code clone credential and retry.
- **The pipeline didn't start from the PR:** check that the PR targets `main`, and look in **Triggers → pr-to-main** for the last activation.
- **Jira didn't move:** the branch name or PR title must contain `SHOP-1`. The Jira steps never fail the pipeline; check their step logs.
- **Scans or tests fail:** open the step log. A failing test usually means the change broke `test/app.test.js` assumptions.
- **No URL printed:** the LoadBalancer IP can take a minute on the first deploy. Run `kubectl -n deploy get svc harness-shop`.
