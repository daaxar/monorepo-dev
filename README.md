# DAAx Monorepo

This monorepo centralizes the development of DAAx projects, facilitating collaboration, standardization, and efficient management across multiple applications, Lambda functions, microservices, and shared libraries.

## Projects Structure

The repository is structured as follows:

```plaintext
monorepo/
├── funcs/            # AWS Lambda functions (serverless backend components)
├── libs/             # Common utilities, shared libraries, and core logic
├── servs/            # Backend microservices
├── app/              # Frontend applications and user interfaces
├── tools/            # Internal development and deployment tools
└── CONTRIBUTING.md   # Guidelines for contributions and workflow
```

## Workspace Management

The monorepo uses npm workspaces to manage multiple interconnected projects effectively, with a unified approach to dependencies and scripts:

### Important npm Scripts

- **`npm run build`**: Builds all projects within the workspace.
- **`npm run clean`**: Cleans build artifacts from all projects.
- **`npm run deploy`**: Deploys projects to their respective environments.
- **`npm run test`**: Runs tests across all workspaces.
- **`npm run dev`**: Starts development mode for applicable projects.

### Dependency Management

Centralized management ensures consistent and minimal duplication of development dependencies.

## Development and Quality Assurance

### Git Hooks

Git hooks enforce code quality and consistency across the monorepo:

- **pre-commit**: Validates and formats code automatically to maintain consistency.
- **commit-msg**: Enforces commit message standards for clarity and structured history.
- **pre-push**: Runs automated tests ensuring reliability and preventing regressions.

### Custom CLI Tool

The CLI tool (`Dx`) simplifies common tasks within the monorepo. It supports:

- **`Dx build`**: Automatically detects the project context and builds the selected project.
- **`Dx deploy`**: Deploys selected projects to AWS using predefined configurations.
  - `--init`: Initializes the cloud environment.
  - `--preview`: Generates and previews deployment configurations.
  - `--diff`: Shows differences between current state and planned deployment.

The CLI automatically determines the current workspace or prompts selection, streamlining the workflow across the monorepo.

## Environment

All projects within the monorepo use standardized environments:

- **Node.js version**: `22.11.0` (managed via `.nvmrc`).
- **npm version**: `10.9.0`

## Contribution Guidelines

Contributions should follow the standards outlined in [CONTRIBUTING.md](./CONTRIBUTING.md), emphasizing clear commit messages, structured branch naming conventions, and consistent workflows to ensure maintainability and ease of collaboration.

---

© DAAx 2025
