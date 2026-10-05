import { ApiError, apiRequest } from '../../src/api/client';
import { mockFetch } from '../helpers/fetch';

afterEach(() => jest.restoreAllMocks());

describe('apiRequest', () => {
  test('sends JSON to /api and returns the response', async () => {
    const fetchSpy = mockFetch(201, JSON.stringify({ id: 'order-1' }));

    const result = await apiRequest('/orders', { method: 'POST', body: { patientRef: 'PT-1' } });

    expect(result).toEqual({ id: 'order-1' });
    expect(fetchSpy).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientRef: 'PT-1' }),
    });
  });

  test('sends no Content-Type header without a body', async () => {
    const fetchSpy = mockFetch(200, JSON.stringify([]));

    await apiRequest('/orders');

    expect(fetchSpy).toHaveBeenCalledWith('/api/orders', { method: 'GET', headers: undefined, body: undefined });
  });

  test("throws an ApiError with the API's message", async () => {
    mockFetch(409, JSON.stringify({ error: { code: 'CONFLICT', message: 'Order is already submitted' } }));

    await expect(apiRequest('/orders/1/submit', { method: 'POST' })).rejects.toEqual(
      new ApiError(409, 'Order is already submitted'),
    );
  });

  test('throws an ApiError when the error response is not JSON', async () => {
    mockFetch(502, '<html>Bad Gateway</html>');

    await expect(apiRequest('/orders')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    });
  });
});
