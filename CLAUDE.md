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
- `python manage.py createsuperuser` - Create admin user

## Project Structure
- **Frontend**: React (Vite) in frontend/pandora/ with shadcn/ui components and Tailwind CSS
- **Backend**: Django in backend/ with apps: pandora, products, proformas, blegal, cajachica, inventario
- **Media**: Uploads in backend/media/ with productos_disponibles/documentos and imagenes subdirectories
- **Auth**: JWT authentication with SimpleJWT (access and refresh tokens)
- **API**: Django REST Framework with ViewSets, serializers and filtering

## Code Style Guidelines
- **Frontend**: React functional components with hooks, component props destructuring
- **Imports**: Group by type (React, 3rd party, local) and sort alphabetically
- **Naming**: camelCase for JS variables/functions, PascalCase for components, snake_case for Python
- **Components**: src/components/ui for shadcn/ui, feature-based organization elsewhere
- **API Integration**: Use axios with proper error handling and interceptors
- **CSS**: Tailwind CSS with cn utility for conditional classes
- **Models**: Extend TimeStampedModel base class, add verbose_name, indexes, and __str__ method
- **Error Handling**: Try/catch with toast notifications in frontend, custom exceptions in backend
- **Documentation**: JSDoc for JS functions, docstrings for Python classes/methods
- **State Management**: Zustand for global state, React hooks for component state
- **Testing**: Django TestCase for backend, component testing approach TBD for frontend
- **Validation**: React Hook Form with Yup schema validation in frontend, model validation in backend