# Demo Jira story

Create this story in Jira before each demo (or reuse it and move it back to "To Do").

**Type:** Story
**Summary:** Launch holiday promo on the Harness Shop home page

**Description**

As a shopper I want to see the current promotion on the home page so that I know about the holiday sale.

**Acceptance criteria**

1. A promo banner reading `Holiday Sale: 20% off everything this week!` appears under the header.
2. The header colour changes to festive red `#C8102E`.
3. A new product `Harness Holiday Beanie` priced at `$25` is listed.
4. All unit tests pass and the pipeline security scans pass.

**Implementation hint:** all three changes are in `src/config.js` (`promoBanner`, `themeColor`, `products`).

---

## Prompt to use in Cursor

> Read Jira story `<KEY>` and implement it in this repo following `.cursor/rules/demo.mdc`. Create the feature branch, make the change, run the tests, commit, push and open a pull request into main. Don't merge.
