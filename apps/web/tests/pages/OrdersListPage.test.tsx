import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { listOrders } from '../../src/api/orders';
import { makeOrder } from '../helpers/fixtures';
import { renderRoute } from '../helpers/render';

jest.mock('../../src/api/orders');
const mockListOrders = jest.mocked(listOrders);

afterEach(() => jest.resetAllMocks());

describe('OrdersListPage', () => {
  test('shows the orders from the API', async () => {
    mockListOrders.mockResolvedValue({
      items: [
        makeOrder({ patientRef: 'PT-1', status: 'Submitted', quote: { id: 'q1', orderId: 'o1', totalCents: 17509, createdAt: '' } }),
        makeOrder({ id: 'o2', patientRef: 'PT-2' }),
      ],
      nextCursor: null,
    });
    renderRoute('/');

    expect(await screen.findByRole('link', { name: 'PT-1' })).toHaveAttribute('href', `/orders/${makeOrder().id}`);
    expect(screen.getByText('175.09')).toBeInTheDocument();
    expect(screen.getByText('PT-2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  test('filters by status', async () => {
    mockListOrders.mockResolvedValue({ items: [], nextCursor: null });
    renderRoute('/');

    await userEvent.click(await screen.findByText('Submitted'));

    expect(mockListOrders).toHaveBeenLastCalledWith({ status: 'Submitted', cursor: undefined });
  });

  test('loads the next page', async () => {
    mockListOrders
      .mockResolvedValueOnce({ items: [makeOrder({ id: 'o1', patientRef: 'PT-1' })], nextCursor: 'o1' })
      .mockResolvedValueOnce({ items: [makeOrder({ id: 'o2', patientRef: 'PT-2' })], nextCursor: null });
    renderRoute('/');

    await userEvent.click(await screen.findByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('PT-2')).toBeInTheDocument();
    expect(screen.getByText('PT-1')).toBeInTheDocument();
    expect(mockListOrders).toHaveBeenLastCalledWith({ status: undefined, cursor: 'o1' });
  });

  test('shows a message when there are no orders', async () => {
    mockListOrders.mockResolvedValue({ items: [], nextCursor: null });
    renderRoute('/');

    expect(await screen.findByText('No orders yet.')).toBeInTheDocument();
  });

  test('shows API errors', async () => {
    mockListOrders.mockRejectedValue(new Error('Something went wrong'));
    renderRoute('/');

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });
});
