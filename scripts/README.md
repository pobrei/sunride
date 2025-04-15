# Migration Scripts

This directory contains scripts to help with the migration to the modular project structure.

## Scripts

### migrate-structure.js

This script copies files from the old structure to the new structure:

```bash
node scripts/migrate-structure.js
```

It creates the following folders:
- `frontend/` - Contains the Next.js app, UI components, and client-side logic
- `backend/` - Contains API routes, server-side logic, and database connections
- `shared/` - Contains utilities, types, and constants used by both frontend and backend

### update-imports.js

This script updates import statements in the migrated files to use the new path aliases:

```bash
node scripts/update-imports.js
```

It replaces imports like `from '@/components/Button'` with `from '@frontend/components/Button'`.

### update-tests.js

This script updates test files to work with the new structure:

```bash
node scripts/update-tests.js
```

It updates imports in test files, copies test setup files to the new location, and updates the Jest configuration.

### fix-remaining-imports.js

This script fixes any remaining imports that still use the old path alias:

```bash
node scripts/fix-remaining-imports.js
```

It scans all files in the project and updates any imports that still use the old `@/` path alias.

### cleanup-migration.js

This script cleans up the project after the migration:

```bash
node scripts/cleanup-migration.js
```

It removes the `src` directory and any temporary files created during the migration.

## Migration Process

The complete migration process is documented in the [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) file in the root of the project.
