// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import { ToastProvider } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ToastProvider>
  );
}

export default App;