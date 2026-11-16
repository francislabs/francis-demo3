# Demo reset: back to baseline for the next demo

Undo the demo without ever changing `main`. Use the Jira key the user typed after the command; if none was given, use **SHOP-1**.

Fixed values: Harness org `default`, project `francis`, repo `harness-gke-demo`, reset pipeline `reset_demo`, app URL http://34.41.88.205.

1. **Close the demo PR(s).** Use the Harness MCP to list **open** pull requests in `harness-gke-demo`. For each one whose source branch starts with `feature/`, close it **without merging**. If closing asks for `is_draft`, pass `false`. Never merge anything.

2. **Delete the feature branch(es).** Use the Harness MCP to delete each of those `feature/...` branches from the repo.

3. **Clean up locally.** Run:

   ```
   git checkout main
   git pull
   ```

   Then run `git branch -D <branch>` for each local `feature/...` branch, and `git fetch --prune`.

4. **Reset the app and Jira.** Use the Harness MCP to run pipeline `reset_demo` with variable `jira_issue=<KEY>`, and wait for it to finish (about 2 minutes). It redeploys `main` to GKE and moves the story back to **To Do**.

5. **Verify.** Check three things:
   - `src/config.js` on `main` has `themeColor: '#0063F7'` and `promoBanner: ''`.
   - The `reset_demo` execution succeeded.
   - Fetching http://34.41.88.205 shows the blue "Welcome to Harness Shop" page, with no promo banner.

   Report each check in one line.

If any step fails, report what failed and stop.
