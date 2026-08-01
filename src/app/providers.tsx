import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { router } from '@/routes';

export function AppProviders() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors closeButton duration={4000} />
      </ThemeProvider>
    </QueryProvider>
  );
}
