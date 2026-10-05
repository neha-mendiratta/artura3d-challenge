import { screen } from '@testing-library/react';
import { renderRoute } from './helpers/render';

describe('routes', () => {
  test.each([
    ['/', 'Orders'],
    ['/orders/new', 'New order'],
    ['/orders/01a104ee-0000-7000-8000-000000000000', 'Order'],
  ])('shows the layout and the right page at %p', async (path, heading) => {
    renderRoute(path);
    expect(screen.getByText('Artura3D · Orthotic orders')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
  });
});
