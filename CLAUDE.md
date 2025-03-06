# CLAUDE.md - Coding Standards & Commands

## Frontend Commands (in frontend/pandora/)
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Backend Commands (in backend/)
- `python manage.py runserver` - Start Django server
- `python manage.py test <app>.<test_class>.<test_method>` - Run specific test
- `python manage.py test <app>` - Run all tests in an app
- `python manage.py makemigrations` - Create DB migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py shell` - Interactive Django shell

## Project Structure
- **Frontend**: React (Vite) in frontend/pandora/
- **Backend**: Django in backend/ with apps: pandora, products, proformas
- **Media**: User uploads in backend/media/
- **Config**: Environment variables via import.meta.env in frontend, python-dotenv in backend

## Code Style Guidelines
- **Frontend**: React functional components with hooks, shadcn/ui component library
- **Imports**: Group by type (React, 3rd party, local) and sort alphabetically
- **Naming**: camelCase for JS variables/functions, PascalCase for components, snake_case for Python
- **Components**: Place in src/components/ui for shadcn components, other components by feature
- **API Integration**: Use BaseService in services/api.js for API calls with proper error handling
- **CSS**: Tailwind CSS with cn utility for conditional classes
- **Models**: Always add verbose_name, indexes, and __str__ method to all Django models
- **Error Handling**: Try/catch in frontend with toast notifications, explicit exceptions in backend
- **Documentation**: JSDoc for JS functions, docstrings for Python classes/methods
- **State Management**: Zustand for global state, React hooks for component state