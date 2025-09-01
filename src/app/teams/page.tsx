'use client';

import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { motion } from 'framer-motion';

export default function TeamsPage() {
  // Placeholder implementation
  const mockTeams = [
    {
      id: '1',
      name: '開発チーム',
      description: 'フロントエンド・バックエンド開発を担当',
      memberCount: 8,
      role: 'MEMBER',
    },
    {
      id: '2',
      name: 'デザインチーム',
      description: 'UI/UXデザインとブランディング',
      memberCount: 5,
      role: 'OWNER',
    },
  ];

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
                <Title order={1} mb="xs">
                  チーム管理
                </Title>
                <Text c="dimmed">
                  所属チームの確認と新しいチームへの参加申請ができます
                </Text>
              </div>
              <Button
                leftSection="➕"
                gradient={{ from: 'brand.6', to: 'brand.4' }}
                variant="gradient"
                size="md"
                disabled
              >
                チーム作成
              </Button>
            </Group>
          </Card>
        </motion.div>

        {/* Teams Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {mockTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              >
                <Card p="lg" radius="md" withBorder h="200px">
                  <Stack justify="space-between" h="100%">
                    <div>
                      <Group justify="space-between" mb="sm">
                        <Title order={4}>{team.name}</Title>
                        <Badge
                          color={team.role === 'OWNER' ? 'brand' : 'blue'}
                          size="sm"
                        >
                          {team.role === 'OWNER' ? 'オーナー' : 'メンバー'}
                        </Badge>
                      </Group>
                      <Text c="dimmed" size="sm" mb="md">
                        {team.description}
                      </Text>
                      <Text size="sm">
                        👥 {team.memberCount} 人のメンバー
                      </Text>
                    </div>
                    <Button variant="light" fullWidth size="sm" disabled>
                      詳細を見る
                    </Button>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>

        {/* Placeholder for future features */}
        <Card p="xl" radius="md" bg="gray.1" withBorder>
          <Stack align="center" gap="md">
            <Text size="xl">🚧</Text>
            <Title order={3} c="dimmed">
              開発中の機能
            </Title>
            <Text c="dimmed" ta="center">
              チーム作成、メンバー管理、参加申請などの機能は現在開発中です。<br />
              近日中にリリース予定です。
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}