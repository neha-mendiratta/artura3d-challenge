import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../src/api/client';
import { createQuote, getOrder, getPacket, submitOrder, updateNotes, updateOrder } from '../../src/api/orders';
import { makeOrder, makePacket } from '../helpers/fixtures';
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

  test('submits an order after confirmation', async () => {
    jest.mocked(getOrder).mockResolvedValue(draft);
    jest.mocked(submitOrder).mockResolvedValue({ ...submitted, updatedAt: 'later' });
    renderRoute(`/orders/${draft.id}`);

    await userEvent.click(await screen.findByRole('button', { name: 'Submit order' }));
    expect(screen.getByText('After submitting, only the notes can be changed.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(submitOrder).toHaveBeenCalledWith(draft.id);
    expect(await screen.findByText('Submitted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate quote' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit order' })).not.toBeInTheDocument();
  });

  test('does not submit when the confirmation is cancelled', async () => {
    jest.mocked(getOrder).mockResolvedValue(draft);
    renderRoute(`/orders/${draft.id}`);

    await userEvent.click(await screen.findByRole('button', { name: 'Submit order' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(submitOrder).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Submit order' })).toBeInTheDocument();
  });

  test('shows the quote total', async () => {
    const quoted = { ...submitted, quote: { id: 'q1', orderId: submitted.id, totalCents: 17509, createdAt: '' } };
    jest.mocked(getOrder).mockResolvedValueOnce(submitted).mockResolvedValue(quoted);
    jest.mocked(createQuote).mockResolvedValue(quoted.quote);
    jest.mocked(getPacket).mockResolvedValue(makePacket({ status: 'Completed' }));
    renderRoute(`/orders/${submitted.id}`);

    await userEvent.click(await screen.findByRole('button', { name: 'Generate quote' }));

    expect(createQuote).toHaveBeenCalledWith(submitted.id);
    expect(await screen.findByText('Quote: 175.09')).toBeInTheDocument();
    expect(await screen.findByText('Completed')).toBeInTheDocument();
  });
});
