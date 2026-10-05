import { listOrders } from '../../src/api/orders';
import { mockFetch } from '../helpers/fetch';

afterEach(() => jest.restoreAllMocks());

describe('listOrders', () => {
  test('adds the status filter and cursor to the URL', async () => {
    const fetchSpy = mockFetch(200, JSON.stringify({ items: [], nextCursor: null }));

    await listOrders({ status: 'Submitted', cursor: 'abc' });

    expect(fetchSpy.mock.calls[0]?.[0]).toBe('/api/orders?status=Submitted&cursor=abc');
  });
});
