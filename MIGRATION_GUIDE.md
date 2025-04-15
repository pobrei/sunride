# Migration Guide: Modular Project Structure

This guide will help you migrate from the old flat project structure to the new modular structure with frontend, backend, and shared folders.

## Overview

The project has been restructured to follow a modular architecture:

- `frontend/` - Contains the Next.js app, UI components, and client-side logic
- `backend/` - Contains API routes, server-side logic, and database connections
- `shared/` - Contains utilities, types, and constants used by both frontend and backend

## Migration Steps

### 1. Update Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 2. Run Migration Scripts

Two scripts have been provided to help with the migration:

```bash
# Step 1: Migrate files from src/ to the new folder structure
node scripts/migrate-structure.js

# Step 2: Update import statements in the migrated files
node scripts/update-imports.js
```

### 3. Update Tests

Run the test update script to update test files to work with the new structure:

```bash
node scripts/update-tests.js
```

### 4. Fix Remaining Imports

Run the script to fix any remaining imports that still use the old path alias:

```bash
node scripts/fix-remaining-imports.js
```

### 5. Test the Application

Start the development server to make sure everything works correctly:

```bash
npm run dev
```

Run the tests to see if there are any remaining issues:

```bash
npm run test
```

### 6. Clean Up the Project

Once you're confident that the migration was successful, you can clean up the project by removing the src directory:

```bash
# This script will ask for confirmation before removing the src directory
node scripts/cleanup-migration.js
```

Alternatively, you can manually remove the src directory:

```bash
# Only do this after verifying that everything works correctly
rm -rf src
```

## Import Path Changes

The project now uses path aliases to make imports cleaner and more maintainable:

- `@frontend/*` - Import from the frontend folder
- `@backend/*` - Import from the backend folder
- `@shared/*` - Import from the shared folder

Example:

```typescript
// Old import
import { Button } from '@/components/ui/button';

// New import
import { Button } from '@frontend/components/ui/button';
```

## Configuration Changes

The following configuration files have been updated to support the new structure:

- `tsconfig.json` and `tsconfig.paths.json` - Path aliases
- `next.config.js` - Module resolution
- `tailwind.config.js` - Content paths
- `jest.config.js` - Test paths

## Troubleshooting

If you encounter any issues during the migration:

1. Check the import paths in your files
2. Make sure all configuration files have been updated
3. Clear the Next.js cache: `rm -rf .next`
4. Restart the development server

## Additional Resources

For more information about the new project structure, see the [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) document.
