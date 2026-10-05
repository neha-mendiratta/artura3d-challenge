import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createOrder, getOrder } from '../../src/api/orders';
import { NEW_ORDER_DEFAULTS } from '../../src/constants';
import { makeOrder } from '../helpers/fixtures';
import { renderRoute } from '../helpers/render';

jest.mock('../../src/api/orders');

afterEach(() => jest.resetAllMocks());

describe('NewOrderPage', () => {
  test('creates an order and opens it', async () => {
    const order = makeOrder({ patientRef: 'PT-7001' });
    jest.mocked(createOrder).mockResolvedValue(order);
    jest.mocked(getOrder).mockResolvedValue(order);
    renderRoute('/orders/new');

    await userEvent.type(screen.getByLabelText('Patient ref'), 'PT-7001');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(createOrder).toHaveBeenCalledWith({ ...NEW_ORDER_DEFAULTS, patientRef: 'PT-7001', notes: '' });
    expect(await screen.findByRole('heading', { name: 'PT-7001' })).toBeInTheDocument();
  });

  test('shows API errors', async () => {
    jest.mocked(createOrder).mockRejectedValue(new Error('Order could not be saved'));
    renderRoute('/orders/new');

    await userEvent.type(screen.getByLabelText('Patient ref'), 'PT-7001');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Order could not be saved')).toBeInTheDocument();
  });
});
