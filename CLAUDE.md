# CLAUDE.md - Coding Standards & Commands

## Frontend Commands (in frontend/pandora/)
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test <pattern>` - Run specific tests matching pattern

## Backend Commands (in backend/)
- `python manage.py runserver` - Start Django server
- `python manage.py test <app>.<test_class>.<test_method>` - Run specific test
- `python manage.py test <app>` - Run all tests in an app
- `python manage.py makemigrations` - Create DB migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py shell` - Interactive Django shell
- `python manage.py createsuperuser` - Create admin user
- `python -m pytest backend/<app>/tests.py::TestClass::test_method -v` - Run specific pytest test

## Architecture
- **Frontend**: React 18.3.1 with Vite 6.0+ in frontend/pandora/
- **Backend**: Django 5.1.4 with DRF 3.15+ in backend/
- **Auth**: JWT with SimpleJWT (access/refresh tokens)
- **Database**: MySQL (production) / SQLite3 (development)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: Zustand 5.0+ (global) + React hooks (local)

## Code Style Guidelines
- **Frontend**: Functional components with hooks, props destructuring
- **JS Standards**: ES2020+, JSX with jsx-runtime, module imports
- **React Rules**: Follow eslint-plugin-react-hooks rules, prefer useState/useEffect
- **Imports**: Group by: 1) React/core 2) External libs 3) Internal components 4) Styles
- **Naming**: camelCase (JS vars/functions), PascalCase (components), snake_case (Python)
- **Forms**: React Hook Form with Yup/Zod validation
- **API Calls**: Use BaseService class extensions with axios and proper error handling
- **Error Handling**: Frontend: toast notifications; Backend: DRF exceptions
- **Data Flow**: Pass data down via props, manage complex state with Zustand
- **Testing**: Django TestCase for backend, React Testing Library for frontend
- **Documentation**: JSDoc for functions, component prop types with PropTypes/TypeScript