# Gitflow Guide for Monorepo with GitHub

This document outlines how to implement the Gitflow workflow within a monorepo using GitHub, ensuring clear branch management and enforcing merges exclusively via Pull Requests (PR).

## 📌 Table of Contents

- [Branch Structure](#-branch-structure)
- [Basic Workflow](#-basic-workflow)
  - [1. Initial Setup](#1-initial-setup)
  - [2. Creating a New Feature](#2-creating-a-new-feature)
  - [3. Creating a Release](#3-creating-a-release)
  - [4. Hotfix](#4-hotfix)
- [Best Practices](#-best-practices)
- [Recommended Tools](#-recommended-tools)
  - [Gitflow Git Extension](#gitflow-git-extension)
  - [GitHub CLI (gh)](#github-cli-gh)

## 📌 Branch Structure

```bash
main            # Primary production branch
└─ develop      # Main development branch
   ├─ feature/* # New features
   ├─ bugfix/*  # Quick bug fixes
   ├─ release/* # Release preparation
   └─ hotfix/*  # Urgent fixes on production
```

---

## 🚧 Basic Workflow

### 1. Initial Setup

Create `develop` from `main` via GitHub UI:

- Navigate to your GitHub repository.
- Ensure `main` branch is selected.
- Click "branch selector" dropdown and enter branch name `develop`.
- Click "Create branch: develop from main".
- Open a Pull Request from `develop` to `main` to verify setup and establish a baseline.

### 2. Creating a New Feature

```bash
git checkout develop
git checkout -b feature/my-new-feature

# make changes
git add .
git commit -m "feat: brief description of the feature"

git push -u origin feature/my-new-feature
```

- Open a Pull Request in GitHub targeting the `develop` branch.
- Merge only after approval and code review.

### 3. Creating a Release

When `develop` is ready for production:

```bash
git checkout develop
git checkout -b release/v1.2.0

# update versions, document changes, etc.
git commit -am "chore(release): version 1.2.0"
git push -u origin release/v1.2.0
```

- Open a Pull Request from `release/v1.2.0` to `main`.
- Merge after review and approval.
- Create a new release in GitHub with tag `v1.2.0`.

Update `develop` after merging to `main`:

- Open a Pull Request from `release/v1.2.0` to `develop`.
- Merge via GitHub.
- Delete the `release` branch via GitHub UI.

### 4. Hotfix

For urgent fixes from production:

```bash
git checkout main
git checkout -b hotfix/v1.2.1

# make urgent fixes
git commit -am "fix: urgent fix on production"
git push -u origin hotfix/v1.2.1
```

- Open a Pull Request from `hotfix/v1.2.1` to `main`.
- Merge after review and approval.
- Create a new release in GitHub with tag `v1.2.1`.

Also merge into `develop`:

- Open a Pull Request from `hotfix/v1.2.1` to `develop`.
- Merge via GitHub.
- Delete the `hotfix` branch.

---

## 📖 Best Practices

- Keep branches small and PRs focused on a single objective.
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.
- Always merge branches via Pull Requests on GitHub for transparency and review.
- Clearly tag each release.

---

## 📦 Recommended Tools

### Gitflow Git Extension

Install Gitflow extension for easier branch management:

```bash
# Linux (Debian/Ubuntu)
sudo apt-get install git-flow

# macOS
brew install git-flow

# Windows
# Use Git Bash and install git-flow via Git for Windows installation options
```

Initialize git-flow in your repository:

```bash
git flow init
```

### GitHub CLI (gh)

GitHub CLI simplifies creating and managing Pull Requests directly from the command line.

Install GitHub CLI:

```bash
# Linux (Debian/Ubuntu)
sudo apt install gh

# macOS
brew install gh

# Windows (via winget)
winget install --id GitHub.cli
```

Usage example for creating PRs:

```bash
git push -u origin feature/my-new-feature
gh pr create --base develop --title "Feature: My New Feature" --body "Description of changes"
```
