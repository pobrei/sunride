# Project Structure

This project has been migrated to a modular structure with three main folders:

## Folder Structure

```
/
├── frontend/           # Next.js app and UI components
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI components
│   ├── features/       # Feature-based modules
│   └── hooks/          # React hooks
│
├── backend/            # API routes and server-side logic
│   ├── api/            # Next.js API routes
│   ├── lib/            # Backend utilities
│   └── services/       # Backend services
│
├── shared/             # Shared code used by both frontend and backend
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── lib/            # Shared libraries
│   └── constants/      # Shared constants
│
├── public/             # Static assets
├── scripts/            # Build and utility scripts
└── ...                 # Configuration files
```

## Import Paths

The project uses path aliases to make imports cleaner and more maintainable:

- `@frontend/*` - Import from the frontend folder
- `@backend/*` - Import from the backend folder
- `@shared/*` - Import from the shared folder
- `@/*` - Legacy imports from the src folder (will be removed)

Example:

```typescript
// Import from frontend
import { Button } from '@frontend/components/ui/button';

// Import from backend
import { getWeatherForecast } from '@backend/lib/weatherAPI';

// Import from shared
import { WeatherData } from '@shared/types';
```

## Module Boundaries

- **Frontend**: Contains all UI components, pages, and client-side logic. It should not directly access backend services except through API calls.

- **Backend**: Contains API routes, server-side logic, and database access. It should not import from the frontend folder.

- **Shared**: Contains code used by both frontend and backend. It should not have dependencies on either frontend or backend code.

## Development Guidelines

1. **Keep modules separate**: Avoid circular dependencies between modules.
2. **Use path aliases**: Always use the appropriate path alias for imports.
3. **Shared code**: If code is used by both frontend and backend, move it to the shared folder.
4. **Type definitions**: Keep shared types in the shared/types folder.
5. **API boundaries**: Frontend should only access backend through API calls.

## Migration Notes

This project was migrated from a flat structure to a modular structure. Some legacy imports may still exist and should be updated over time.

The migration was performed using the following scripts:

- `scripts/migrate-structure.js` - Copies files from the old structure to the new structure
- `scripts/update-imports.js` - Updates import statements to use the new path aliases
