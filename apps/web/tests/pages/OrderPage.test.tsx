import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../src/api/client';
import { getOrder, updateNotes, updateOrder } from '../../src/api/orders';
import { makeOrder } from '../helpers/fixtures';
import { renderRoute } from '../helpers/render';

jest.mock('../../src/api/orders');

const draft = makeOrder();
const submitted = makeOrder({ status: 'Submitted' });

afterEach(() => jest.resetAllMocks());

describe('OrderPage', () => {
  test('shows the order', async () => {
    jest.mocked(getOrder).mockResolvedValue(draft);
    renderRoute(`/orders/${draft.id}`);

    expect(await screen.findByRole('heading', { name: 'PT-1042' })).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByLabelText('Width (mm)')).toHaveValue('90.5');
  });

  test('saves a draft order', async () => {
    jest.mocked(getOrder).mockResolvedValue(draft);
    jest.mocked(updateOrder).mockResolvedValue({ ...draft, widthMm: 100, updatedAt: 'later' });
    renderRoute(`/orders/${draft.id}`);

    const width = await screen.findByLabelText('Width (mm)');
    await userEvent.clear(width);
    await userEvent.type(width, '100');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateOrder).toHaveBeenCalledWith(draft.id, expect.objectContaining({ widthMm: 100 }));
    expect(await screen.findByDisplayValue('100')).toBeInTheDocument();
  });

  test('saves only the notes of a submitted order', async () => {
    jest.mocked(getOrder).mockResolvedValue(submitted);
    jest.mocked(updateNotes).mockResolvedValue({ ...submitted, notes: 'Left foot only', updatedAt: 'later' });
    renderRoute(`/orders/${submitted.id}`);

    await userEvent.type(await screen.findByLabelText('Notes'), 'Left foot only');
    await userEvent.click(screen.getByRole('button', { name: 'Save notes' }));

    expect(updateNotes).toHaveBeenCalledWith(submitted.id, 'Left foot only');
    expect(updateOrder).not.toHaveBeenCalled();
  });

  test('reloads the order after a conflict', async () => {
    jest.mocked(getOrder).mockResolvedValueOnce(draft).mockResolvedValue(submitted);
    jest.mocked(updateOrder).mockRejectedValue(new ApiError(409, 'Only Draft orders can be edited'));
    renderRoute(`/orders/${draft.id}`);

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Only Draft orders can be edited')).toBeInTheDocument();
    expect(await screen.findByText('Submitted')).toBeInTheDocument();
    expect(screen.getByLabelText('Patient ref')).toBeDisabled();
  });

  test('shows an error for an order that cannot be loaded', async () => {
    jest.mocked(getOrder).mockRejectedValue(new ApiError(404, 'Order not found'));
    renderRoute('/orders/missing');

    expect(await screen.findByText('Order not found')).toBeInTheDocument();
  });
});
