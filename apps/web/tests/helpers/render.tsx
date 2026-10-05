import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createQueryClient } from '../../src/query-client';
import { routes } from '../../src/routes';

// The same providers as main.tsx. env="test" turns off Mantine's animations so dialogs open instantly.
function Providers({ children }: { children: ReactElement }) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });
  return (
    <MantineProvider env="test">
      <Notifications />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MantineProvider>
  );
}

// Renders the real app at the given URL.
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}

// Renders one component on its own, for component tests.
export function renderComponent(ui: ReactElement) {
  return render(<Providers>{ui}</Providers>);
}
