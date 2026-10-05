// Makes the next fetch calls return this status and body, and returns the spy to inspect calls.
export function mockFetch(status: number, body: string) {
  return jest.spyOn(window, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(body),
  } as Response);
}
