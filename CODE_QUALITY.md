# Code Quality Tools

This document provides an overview of the code quality tools and processes set up in the RideWeather Planner project.

## Tools Installed

1. **Prettier**: An opinionated code formatter that enforces a consistent style
2. **ESLint**: A static code analysis tool for identifying problematic patterns in JavaScript/TypeScript
3. **Husky**: A tool for running scripts before git commits
4. **lint-staged**: A tool for running linters on staged git files

## Configuration Files

- `.prettierrc`: Prettier configuration
- `.prettierignore`: Files to be ignored by Prettier
- `.lintstagedrc`: Configuration for lint-staged
- `.husky/pre-commit`: Pre-commit hook for running lint-staged
- `.github/workflows/test.yml`: GitHub Actions workflow for testing
- `.github/workflows/deploy.yml`: GitHub Actions workflow for deployment

## NPM Scripts

The following scripts have been added to `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky"
  }
}
```

## Pre-commit Hook

The pre-commit hook runs lint-staged, which in turn runs:

1. Prettier on all staged files
2. ESLint on staged JavaScript/TypeScript files

This ensures that all code committed to the repository follows the project's coding standards.

## GitHub Actions Workflows

The GitHub Actions workflows have been updated to include formatting checks:

```yaml
- name: Check formatting
  run: npm run format:check
```

This ensures that all code pushed to the repository follows the project's coding standards.

## Usage

### Formatting Code

To format all files in the project:

```bash
npm run format
```

### Checking Formatting

To check if all files in the project are formatted correctly:

```bash
npm run format:check
```

### Pre-commit Hook

The pre-commit hook will automatically run when you commit changes. If there are any formatting issues, the commit will be aborted.

### GitHub Actions

The GitHub Actions workflows will automatically run when you push changes to the repository. If there are any formatting issues, the workflow will fail.

## Troubleshooting

### Pre-commit Hook Not Running

If the pre-commit hook is not running, make sure it's executable:

```bash
chmod +x .husky/pre-commit
```

### Prettier Not Formatting Files

If Prettier is not formatting files, make sure the files are not ignored in `.prettierignore`.

### ESLint Not Checking Files

If ESLint is not checking files, make sure the files are not ignored in `.eslintignore`.

## Best Practices

1. **Run Formatting Locally**: Run `npm run format` before committing to ensure your code is properly formatted.
2. **Fix Linting Issues**: Address ESLint warnings and errors to maintain code quality.
3. **Maintain Type Safety**: Avoid using `any` types and ensure proper type annotations.
4. **Write Tests**: Maintain good test coverage for all new features and bug fixes.

## Further Reading

- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [ESLint Documentation](https://eslint.org/docs/user-guide/getting-started)
- [Husky Documentation](https://typicode.github.io/husky/#/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged#readme)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
