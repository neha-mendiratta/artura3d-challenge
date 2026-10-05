import { Anchor, AppShell, Group, Title } from '@mantine/core';
import { Link, Outlet } from 'react-router';

export function Layout() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Anchor component={Link} to="/" c="inherit" underline="never">
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
