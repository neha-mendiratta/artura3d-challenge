import { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { NewOrderPage } from './pages/NewOrderPage';
import { OrderPage } from './pages/OrderPage';
import { OrdersListPage } from './pages/OrdersListPage';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <OrdersListPage /> },
      { path: '/orders/new', element: <NewOrderPage /> },
      { path: '/orders/:id', element: <OrderPage /> },
    ],
  },
];
