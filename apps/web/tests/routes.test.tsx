import { screen } from '@testing-library/react';
import { getOrder, listOrders } from '../src/api/orders';
import { makeOrder } from './helpers/fixtures';
import { renderRoute } from './helpers/render';

jest.mock('../src/api/orders');

beforeEach(() => {
  jest.mocked(listOrders).mockResolvedValue({ items: [], nextCursor: null });
  jest.mocked(getOrder).mockResolvedValue(makeOrder({ patientRef: 'PT-1042' }));
});

describe('routes', () => {
  test.each([
    ['/', 'Orders'],
    ['/orders/new', 'New order'],
    ['/orders/01a104ee-0000-7000-8000-000000000001', 'PT-1042'],
  ])('shows the layout and the right page at %p', async (path, heading) => {
    renderRoute(path);
    expect(screen.getByText('Artura3D · Orthotic orders')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
  });
});
