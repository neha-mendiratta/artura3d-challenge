import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createQueryClient } from '../../src/query-client';
import { routes } from '../../src/routes';

// Renders the real app at the given URL, with the same providers as main.tsx.
export function renderRoute(path: string) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <MantineProvider>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>,
  );
}

// Renders one component with Mantine around it, for component tests.
export function renderComponent(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}
