import { notifications } from '@mantine/notifications';
import { MutationCache, QueryClient } from '@tanstack/react-query';

// One place for API call settings. Any failed save, submit or quote shows the API's message.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => notifications.show({ color: 'red', title: 'Something went wrong', message: error.message }),
    }),
  });
}
