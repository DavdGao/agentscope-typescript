## PR Title Format

Please ensure your PR title follows the Conventional Commits format:

- Format: `<type>(<scope>): <description>`
- Example: `feat(memory): add redis cache support`
- Allowed types: `feat`, `fix`, `docs`, `ci`, `refactor`, `test`, `chore`, `perf`, `style`, `build`, `revert`
- Description should start with a lowercase letter

## Linked Issues

> Linked issues will be **automatically closed** when this PR is merged.

- Closes #

## Description

[Please describe the background, purpose, changes made, and how to test this PR]

## Checklist

Please check the following items before the code is ready to be reviewed.

- [ ] This PR is linked to a related issue (see above)
- [ ] Code has been formatted with `pnpm format`
- [ ] Related documentation has been updated (e.g. links, examples, etc.)
- [ ] All tests are passing (`pnpm test`)
- [ ] Code is ready for review
