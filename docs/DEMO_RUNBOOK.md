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

## How Jira is updated automatically

The pipeline finds the Jira key (for example `SHOP-1`) in the PR's **source branch name or PR title**. Cursor's branch `feature/SHOP-1-...` covers this.

1. **Pipeline starts:** the story moves to **In Progress** and gets a comment with the PR number and a link to the execution.
2. **After the GKE deploy:** the story moves to **Done** and gets a comment with the **live app URL**, the version, and the fact that the scans and tests passed.
3. **Manual runs on `main`:** there is no Jira key, so these steps are skipped.

## One-time setup in Cursor

1. **Clone the repo.** In Harness Code, open the repo, click **Clone**, then **Generate Clone Credential**. Clone `https://git.harness.io/iOrKafK-S4atFewx03Owag/default/francis/harness-gke-demo.git`.
2. **Jira access.** In Cursor settings, add the **Atlassian MCP** server and sign in to `demolabsf.atlassian.net`.
3. **PR creation.** Either:
   - add the **Harness MCP** server in Cursor (lets Cursor open the PR itself), or
   - let Cursor push the branch, then open the PR from the Harness Code UI.

## Before each demo (2 minutes)

- Open the app URL and confirm the **blue** "Welcome to Harness Shop" page.
- Open the SHOP board and confirm `SHOP-1` is in **To Do** in the active sprint.
- If either is wrong, run `reset-demo`.

## Demo flow

1. **The sprint.** Open the SHOP Scrum board and show `SHOP-1` in To Do. Talk through the acceptance criteria.
2. **The baseline.** Open the app URL: blue header, three products, and the version in the footer.
3. **Implement it in Cursor.** Paste this prompt:
   > Read Jira issue SHOP-1 and implement it in this repo following `.cursor/rules/demo.mdc`. Create the feature branch, make the change, run the tests, commit, push and open a pull request into main. Don't merge.

   Cursor creates `feature/SHOP-1-...`, edits `src/config.js`, and opens the PR.
4. **Watch Harness.** The PR fires `pr-to-main`. Flip to Jira first: `SHOP-1` has jumped to **In Progress** with a pipeline comment. Then walk through:
   - the secret scan and dependency scan,
   - the unit tests,
   - the image push with a new version tag,
   - the rolling deploy to GKE.
5. **The reveal.** Refresh the app URL to show the red header, the holiday banner and the Holiday Beanie. Flip to the board: `SHOP-1` is in **Done**, with a comment linking to the live URL.

## Reset after the demo (keep `main` untouched)

1. In Harness Code, **close the PR without merging** and delete the `feature/SHOP-1-...` branch.
2. Run the **`reset-demo`** pipeline. It redeploys `main` (blue baseline) and moves `SHOP-1` back to To Do.
3. In Cursor: `git checkout main && git branch -D feature/SHOP-1-<slug>`.

## If something goes wrong

- **Pipeline didn't start from the PR:** check that the PR targets `main`, and look in **Triggers → pr-to-main** for the last activation. You can always run the pipeline manually with build type **Pull Request** and the PR number.
- **Jira didn't move:** make sure the branch name or PR title contains `SHOP-1`. The Jira steps never fail the pipeline; check their step logs.
- **Scans or tests fail:** open the step log. A failing test usually means the change broke `test/app.test.js` assumptions.
- **No URL printed:** the LoadBalancer IP can take a minute on the first deploy. Run `kubectl -n deploy get svc harness-shop`.
