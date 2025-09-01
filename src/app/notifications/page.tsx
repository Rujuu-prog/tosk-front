'use client';

import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  // Placeholder implementation
  const mockNotifications = [
    {
      id: '1',
      title: 'タスクにいいねがつきました',
      message: '田中さんがあなたのタスク「プロジェクト企画書」にいいねしました',
      type: 'like',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: '新しいコメント',
      message: '山田さんがタスク「デザインレビュー」にコメントしました',
      type: 'comment',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      title: 'チームに招待されました',
      message: 'マーケティングチームに招待されました',
      type: 'team_invitation',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'team_invitation':
        return '👥';
      default:
        return '📢';
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card p="lg" radius="md" withBorder>
            <Group justify="space-between" align="center">
              <div>
                <Group gap="sm" mb="xs">
                  <Title order={1}>通知</Title>
                  {unreadCount > 0 && (
                    <Badge color="red" size="lg">
                      {unreadCount}
                    </Badge>
                  )}
                </Group>
                <Text c="dimmed">
                  最新の通知とアクティビティを確認できます
                </Text>
              </div>
              <Button
                variant="light"
                size="sm"
                disabled={unreadCount === 0}
              >
                すべて既読にする
              </Button>
            </Group>
          </Card>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Stack gap="md">
            {mockNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              >
                <Card
                  p="md"
                  radius="md"
                  withBorder
                  bg={notification.read ? 'white' : 'blue.0'}
                >
                  <Group gap="md" align="flex-start">
                    <Text size="xl" style={{ minWidth: '32px' }}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                    
                    <div style={{ flex: 1 }}>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500} size="sm">
                          {notification.title}
                        </Text>
                        <Group gap="xs">
                          {!notification.read && (
                            <Badge color="blue" size="xs">
                              未読
                            </Badge>
                          )}
                          <Text size="xs" c="dimmed">
                            {new Date(notification.createdAt).toLocaleString('ja-JP')}
                          </Text>
                        </Group>
                      </Group>
                      
                      <Text c="dimmed" size="sm">
                        {notification.message}
                      </Text>
                    </div>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </Stack>
        </motion.div>

        {/* Empty State (when no notifications) */}
        {mockNotifications.length === 0 && (
          <Card p="xl" radius="md" bg="gray.1" withBorder>
            <Stack align="center" gap="md">
              <Text size="xl">🔕</Text>
              <Title order={3} c="dimmed">
                通知はありません
              </Title>
              <Text c="dimmed" ta="center">
                新しいアクティビティがあると、ここに通知が表示されます。
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}