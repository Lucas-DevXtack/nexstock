import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './providers/AuthProvider';
import { TenantProvider } from './providers/TenantProvider';
import { ThemeProvider } from './providers/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TenantProvider>
          <>
            <RouterProvider router={router} />
          </>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
