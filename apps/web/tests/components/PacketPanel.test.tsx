import { act, screen } from '@testing-library/react';
import { getPacket } from '../../src/api/orders';
import { PacketPanel } from '../../src/components/PacketPanel';
import { PACKET_POLL_INTERVAL_MS } from '../../src/constants';
import { makePacket } from '../helpers/fixtures';
import { renderComponent } from '../helpers/render';

jest.mock('../../src/api/orders');

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

describe('PacketPanel', () => {
  test('polls packet status until finished', async () => {
    jest.useFakeTimers();
    jest
      .mocked(getPacket)
      .mockResolvedValueOnce(makePacket({ status: 'Pending' }))
      .mockResolvedValue(makePacket({ status: 'Completed' }));
    renderComponent(<PacketPanel orderId="o1" />);

    expect(await screen.findByText('Pending')).toBeInTheDocument();
    await act(() => jest.advanceTimersByTimeAsync(PACKET_POLL_INTERVAL_MS));
    expect(await screen.findByText('Completed')).toBeInTheDocument();

    await act(() => jest.advanceTimersByTimeAsync(PACKET_POLL_INTERVAL_MS * 3));
    expect(getPacket).toHaveBeenCalledTimes(2);
  });

  test('shows a failed packet', async () => {
    jest.mocked(getPacket).mockResolvedValue(makePacket({ status: 'Failed', error: 'Payload could not be built' }));
    renderComponent(<PacketPanel orderId="o1" />);

    expect(await screen.findByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Payload could not be built')).toBeInTheDocument();
  });
});
