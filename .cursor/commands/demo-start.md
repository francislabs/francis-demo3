# Demo start: Jira story → code → PR → Harness pipeline

Run the full demo story for a Jira issue. Use the issue key the user typed after the command; if none was given, use **SHOP-1**.

Fixed values for this demo:
- Jira site: `demolabsf.atlassian.net`, Scrum project `SHOP`
- Harness: org `default`, project `francis`, repo `harness-gke-demo`
- Pipeline: `harness_shop_build_deploy`, triggered automatically by the `pr_to_main` PR trigger
- App URL: http://34.41.88.205

Work through these steps in order and narrate each one in a single short line, because this is shown live to an audience.

1. **Read the requirement.** Fetch the issue with the Atlassian MCP. Show its summary, status and acceptance criteria as a short list. If the issue is not in **To Do**, tell the user to run `/demo-reset` first and stop.

2. **Start from a clean main.** Run `git checkout main && git pull`. If `git status` shows local changes, stop and tell the user.

3. **Branch.** Create `feature/<KEY>-<short-slug>` from `main`, for example `feature/SHOP-1-holiday-promo`. The Jira key must be in the branch name; that is how the pipeline finds and updates the story.

4. **Implement.** Make the change the acceptance criteria describe in `src/config.js` (`promoBanner`, `themeColor`, `products`). Do not touch `deploy/`, `.harness/` or `.cursor/`. Show the diff.

5. **Test locally.** Run `npm ci` (only if `node_modules` is missing), then `npm test`. All tests must pass before you continue.

6. **Commit and push.** Commit with the message `<KEY>: <issue summary>`, then run `git push -u origin <branch>`. If the push fails because of credentials, tell the user to generate Harness Code clone credentials, and stop.

7. **Raise the PR.** Use the Harness MCP to create a pull request in repo `harness-gke-demo` (org `default`, project `francis`):
   - from `<branch>` into `main`
   - title `<KEY>: <issue summary>`
   - a description listing the acceptance criteria you implemented

   **Never merge it.** Show the PR link.

8. **Follow the pipeline.** Wait about 15 seconds, then use the Harness MCP to find the newest execution of pipeline `harness_shop_build_deploy`. Its trigger type should be WEBHOOK. Share the execution link. While it runs, call out the stages:
   - **Jira Start:** the story moves to In Progress.
   - **Build and Secure:** secret scan, dependency scan, unit tests, image push.
   - **Deploy to GKE:** rolling deploy, then the Get App URL step, then the story moves to Done.

9. **Wrap up.** When the execution succeeds, report:
   - the image version (from the Build and Push step),
   - the app URL http://34.41.88.205, and what changed on the page,
   - that the Jira story is now **Done** with a comment containing the live URL.

   If any step failed, show the failing step's log excerpt and stop. Do not retry blindly.

10. **Remind the user** that `/demo-reset` puts everything back for the next demo.
