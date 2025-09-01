'use client';

import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Button,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/lib/contexts/AuthContext';

interface NavBarProps {
  children: React.ReactNode;
}

export function NavBar({ children }: NavBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const handleLogout = async () => {
    try {
      await logout();
      notifications.show({
        title: 'ログアウト',
        message: 'ログアウトしました',
        color: 'blue',
      });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'ダッシュボード', icon: '🏠' },
    { href: '/tasks', label: 'タスク', icon: '📝' },
    { href: '/teams', label: 'チーム', icon: '👥' },
    { href: '/notifications', label: '通知', icon: '🔔' },
  ];

  if (!user) {
    return <>{children}</>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ActionIcon
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="lg"
              variant="subtle"
            >
              ☰
            </ActionIcon>
            <ActionIcon
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="lg"
              variant="subtle"
            >
              ☰
            </ActionIcon>
            
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Text
                size="xl"
                fw={800}
                variant="gradient"
                gradient={{ from: 'brand.6', to: 'brand.4', deg: 45 }}
              >
                Tosk
              </Text>
            </Link>
          </Group>

          <Menu position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="sm">
                  <Avatar size="sm" radius="xl">
                    {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500} visibleFrom="sm">
                    {user.displayName || user.username}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user.displayName || user.username}</Menu.Label>
              <Menu.Item leftSection="👤">プロフィール</Menu.Item>
              <Menu.Item leftSection="⚙️">設定</Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection="🚪" color="red" onClick={handleLogout}>
                ログアウト
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
            メニュー
          </Text>
          {navLinks.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              variant={pathname === link.href ? 'filled' : 'subtle'}
              color={pathname === link.href ? 'brand' : 'gray'}
              fullWidth
              leftSection={link.icon}
              justify="flex-start"
              mb="xs"
            >
              {link.label}
            </Button>
          ))}
        </AppShell.Section>

        <AppShell.Section grow mt="md">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
            最近のアクティビティ
          </Text>
          <Group gap="xs" mb="sm">
            <Badge size="xs" variant="light" color="green">
              新
            </Badge>
            <Text size="xs" c="dimmed">
              タスク「プロジェクト企画書」を完了
            </Text>
          </Group>
          <Group gap="xs" mb="sm">
            <Badge size="xs" variant="light" color="blue">
              更新
            </Badge>
            <Text size="xs" c="dimmed">
              チーム「開発部」に参加
            </Text>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}