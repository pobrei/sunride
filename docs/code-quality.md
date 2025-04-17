# Code Quality Tools

This document outlines the code quality tools and processes used in the SunRide project.

## Prettier

Prettier is an opinionated code formatter that enforces a consistent style by parsing your code and reprinting it with its own rules.

### Configuration

The Prettier configuration is defined in `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Usage

```bash
# Format all files
npm run format

# Check if files are formatted correctly (without modifying them)
npm run format:check
```

## ESLint

ESLint is a static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code.

### Configuration

The ESLint configuration is defined in `.eslintrc.json` and `eslint.config.mjs`.

### Usage

```bash
# Run ESLint
npm run lint
```

## TypeScript Type Checking

TypeScript provides static type checking to catch type-related errors during development.

### Usage

```bash
# Run TypeScript type checking
npm run check:types

# Check for TypeScript issues (any types, missing annotations)
npm run check:ts

# Check specifically for 'any' types
npm run check:any
```

## Pre-commit Hooks with Husky and lint-staged

Husky and lint-staged are used to run code quality checks before each commit.

### Configuration

- Husky configuration is in `.husky/pre-commit`
- lint-staged configuration is in `.lintstagedrc`

### How It Works

When you commit changes, the pre-commit hook will:

1. Run Prettier on staged files
2. Run ESLint on staged JavaScript/TypeScript files
3. Only allow the commit if all checks pass

## Continuous Integration

GitHub Actions workflows are set up to run code quality checks on pull requests and pushes to the main branch.

### Workflows

1. **Test Workflow** (`.github/workflows/test.yml`)

   - Runs on push to main and pull requests
   - Runs linting, formatting checks, type checking, and tests
   - Generates and uploads coverage reports

2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
   - Runs on push to main
   - Runs code quality checks before deployment
   - Deploys to Vercel

## Best Practices

1. **Run Formatting Locally**: Run `npm run format` before committing to ensure your code is properly formatted.
2. **Fix Linting Issues**: Address ESLint warnings and errors to maintain code quality.
3. **Maintain Type Safety**: Avoid using `any` types and ensure proper type annotations.
4. **Write Tests**: Maintain good test coverage for all new features and bug fixes.

## Setting Up on a New Machine

When setting up the project on a new machine, run:

```bash
npm install --legacy-peer-deps
npm run prepare
```

This will install all dependencies and set up the Husky hooks.
