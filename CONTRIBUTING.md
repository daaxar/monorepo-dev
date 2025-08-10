# 📝 Commit and Branch Naming Conventions

This document outlines the commit and branch naming rules we follow in this repository. The goal is to maintain a clean, understandable history and automate version management.

---

## 🚀 1. Commit Convention

We follow the **Conventional Commits** convention using the following commit types:

| Type       | Purpose                                             |
| ---------- | --------------------------------------------------- |
| `feat`     | Add a new feature                                   |
| `fix`      | Fix a bug                                           |
| `docs`     | Documentation changes                               |
| `style`    | Code style changes (formatting, spaces, semicolons) |
| `refactor` | Code restructuring without changing behavior        |
| `test`     | Add or update tests                                 |
| `chore`    | Maintenance tasks (dependencies, configs)           |
| `perf`     | Performance improvements                            |
| `ci`       | Changes to CI/CD configuration                      |
| `build`    | Changes affecting the build system                  |
| `revert`   | Revert a previous commit                            |

📌 **Commit Format:**

```
<type>(<scope>): <short description>

[optional detailed description]

[optional BREAKING CHANGE note]
```

📌 **Examples:**

```
feat(ui): add dark mode toggle

fix(auth): resolve login issue on mobile

docs(readme): update installation guide

refactor(api): optimize response time for queries

chore(deps): update eslint to v8.0.0
```

📌 **Breaking Changes:**
If the commit introduces breaking changes, include a note at the end:

```
feat(api): migrate authentication to OAuth 2.0

BREAKING CHANGE: The old authentication system has been removed.
```

---

## 🔀 2. Branch Naming Convention

Branches should follow this format:

```
<type>/<short-description>
```

📌 **Examples:**

- `feat/user-dashboard`
- `fix/login-bug`
- `docs/update-readme`
- `chore/update-dependencies`
- `release/v1.2.0`

---

## 🔍 3. Automated Validations with Husky and Commitlint

To enforce these rules, we use **Husky** and **Commitlint**.

### ✅ Validations:

- **`commitlint`**: Rejects commits that don't follow the proper format.
- **`pre-commit`**: Ensures the branch name follows the correct prefix.
- **`lint-staged`**: Ensures code is formatted before committing.

📌 **Quick setup locally:**

```sh
npm install
npx husky init
```

To make a valid commit:

```sh
git commit -m "feat(auth): add password reset functionality"
```

If your commit message does not follow the rules, Git will reject it.

---

## 🎯 4. Commitlint Rules

We use the default `@commitlint/config-conventional` rules, which include:

✅ **Commits must:**

- **Use a valid type** (`feat`, `fix`, `docs`, etc.).
- **Be written in the present tense** (`add` instead of `added`).
- **Not exceed 100 characters** in the main message line.
- **Not use capital letters in the type** (`feat`, not `Feat`).
- **Not end with a period** (`fix(api): resolve bug`, not `fix(api): resolve bug.`).

---

## 🔗 5. Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)
- [Git Flow vs GitHub Flow](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Thanks for following the conventions!** 🙌 This helps keep our code clean and organized. 🚀
