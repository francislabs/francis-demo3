# Demo runbook — Jira → Cursor → PR → Harness → GKE

| What | Where |
|---|---|
| App URL | http://34.41.88.205 (GKE LoadBalancer, namespace `deploy`) |
| Repo | Harness Code `default/francis/harness-gke-demo` |
| Pipeline | `harness-shop-build-deploy` (scan → test → build/push → deploy → print URL) |
| PR trigger | `pr-to-main` — runs on PR **create/update** into `main` (not on merge) |
| Jira story | `DEV-1` at https://demolabsf.atlassian.net/browse/DEV-1 |
| New story | Run pipeline `create-demo-jira-story` (creates a fresh copy of the story) |

## One-time setup in Cursor

1. **Clone the repo.** In Harness Code, open the repo, click **Clone**, then **Generate Clone Credential**. Clone `https://git.harness.io/iOrKafK-S4atFewx03Owag/default/francis/harness-gke-demo.git` in Cursor.
2. **Jira access.** In Cursor settings, add the **Atlassian MCP** server and sign in to `demolabsf.atlassian.net`.
3. **PR creation.** Either:
   - add the **Harness MCP** server in Cursor (lets Cursor open the PR itself), or
   - let Cursor push the branch, then open the PR from the Harness Code UI.

## Before each demo (2 minutes)

- Open the app URL and confirm the **blue** "Welcome to Harness Shop" page.
- If it isn't blue, run the reset below.
- Make sure `DEV-1` is in **To Do**, or run `create-demo-jira-story` for a new ticket.

## Demo flow

1. **Show the baseline.** Open the app URL: blue header, three products, and the version in the footer. Show the last pipeline run in Harness (scans, tests, image push, rolling deploy, URL step).
2. **Show the story.** Open `DEV-1` in Jira and walk through the acceptance criteria.
3. **Implement it in Cursor.** Paste this prompt:
   > Read Jira issue DEV-1 and implement it in this repo following `.cursor/rules/demo.mdc`. Create the feature branch, make the change, run the tests, commit, push and open a pull request into main. Don't merge.

   Cursor creates `feature/DEV-1-...`, edits `src/config.js`, and opens the PR.
4. **Watch the pipeline.** The PR fires `pr-to-main`. Walk through:
   - the secret scan and dependency scan,
   - the unit tests,
   - the image built and pushed with a new version tag,
   - the rolling deploy to GKE.
5. **Show the result.** Refresh the app URL. The page now has a red header, the holiday banner and the Holiday Beanie, and the footer shows the new version.

## Reset after the demo (keep `main` untouched)

1. In Harness Code, **close the PR without merging** and delete the `feature/DEV-1-...` branch.
2. Run `harness-shop-build-deploy` manually with **Git branch = `main`**. The URL goes back to the blue baseline.
3. Move `DEV-1` back to **To Do**, or run `create-demo-jira-story` before the next demo.
4. In Cursor: `git checkout main && git branch -D feature/DEV-1-<slug>`.

## If something goes wrong

- **Pipeline didn't start from the PR:** check that the PR targets `main`, and look in **Triggers → pr-to-main** for the last activation. You can always run the pipeline manually with build type **Pull Request** and the PR number.
- **Scans or tests fail:** open the step log. A failing test usually means the change broke `test/app.test.js` assumptions.
- **No URL printed:** the LoadBalancer IP can take a minute on the first deploy. Run `kubectl -n deploy get svc harness-shop`.
