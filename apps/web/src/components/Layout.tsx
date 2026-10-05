import { Anchor, AppShell, Group, Title } from '@mantine/core';
import { Link, Outlet } from 'react-router';

export function Layout() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group className="app-header">
          <Anchor component={Link} to="/" className="app-home-link">
            <Title order={3}>Artura3D · Orthotic orders</Title>
          </Anchor>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
