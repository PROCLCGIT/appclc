# CLAUDE.md - Coding Standards & Commands

## Frontend Commands (in frontend/pandora/)
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Backend Commands (in backend/)
- `python manage.py runserver` - Start Django server
- `python manage.py test <app>.<test_class>.<test_method>` - Run specific test
- `python manage.py makemigrations` - Create DB migrations
- `python manage.py migrate` - Apply migrations

## Code Style Guidelines
- **Frontend**: Use React functional components with hooks
- **Imports**: Group imports by type (React, 3rd party, local) and sort alphabetically
- **Naming**: camelCase for JS variables/functions, PascalCase for components, snake_case for Python
- **Components**: Place in src/components, organized by feature or type
- **Models**: Use descriptive docstrings and TimeStampedModel base class for consistency
- **Error Handling**: Use try/catch in frontend, explicit exception handling in backend
- **Documentation**: JSDoc for JS functions, docstrings for Python classes/methods
- **State Management**: Use Zustand for global state, React hooks for component state
- **Django Models**: Add verbose_name, indexes, and __str__ method to all models