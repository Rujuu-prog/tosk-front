'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/contexts/AuthContext';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types/task';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 最近のタスクを取得
        const myTasks = await taskService.getTasks({
          myTasksOnly: true,
          size: 5,
        });
        
        setRecentTasks(myTasks.content);
        
        // タスク統計を計算
        const allMyTasks = await taskService.getTasks({
          myTasksOnly: true,
          size: 1000, // すべてのタスクを取得
        });
        
        const stats = {
          total: allMyTasks.content.length,
          completed: allMyTasks.content.filter(task => task.status === 'COMPLETED').length,
          inProgress: allMyTasks.content.filter(task => task.status === 'IN_PROGRESS').length,
          pending: allMyTasks.content.filter(task => task.status === 'TODO').length,
        };
        
        setTaskStats(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO':
        return { color: 'gray', label: '未着手' };
      case 'IN_PROGRESS':
        return { color: 'blue', label: '進行中' };
      case 'COMPLETED':
        return { color: 'green', label: '完了' };
      default:
        return { color: 'gray', label: '未設定' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { color: 'red', label: '高' };
      case 'MEDIUM':
        return { color: 'yellow', label: '中' };
      case 'LOW':
        return { color: 'blue', label: '低' };
      default:
        return { color: 'gray', label: '未設定' };
    }
  };

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <Card>
          <Text>読み込み中...</Text>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" p="md">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card p="xl" radius="lg" withBorder>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                おかえりなさい
              </Text>
              <Title order={2} mb="xs">
                {user?.displayName || user?.username}さん
              </Title>
              <Text c="dimmed">
                今日も生産的な一日を始めましょう！
              </Text>
            </div>
            <Avatar size="xl" radius="xl">
              {user?.displayName?.charAt(0).toUpperCase() || user?.username.charAt(0).toUpperCase()}
            </Avatar>
          </Group>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <Card p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  総タスク数
                </Text>
                <Text size="xl" fw={700}>
                  {taskStats.total}
                </Text>
              </div>
              <ActionIcon size="xl" radius="md" variant="light" color="blue">
                📝
              </ActionIcon>
            </Group>
          </Card>

          <Card p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  完了済み
                </Text>
                <Text size="xl" fw={700} c="green">
                  {taskStats.completed}
                </Text>
              </div>
              <ActionIcon size="xl" radius="md" variant="light" color="green">
                ✅
              </ActionIcon>
            </Group>
          </Card>

          <Card p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  進行中
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {taskStats.inProgress}
                </Text>
              </div>
              <ActionIcon size="xl" radius="md" variant="light" color="blue">
                🚀
              </ActionIcon>
            </Group>
          </Card>

          <Card p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  進捗率
                </Text>
                <Text size="xl" fw={700} c="brand">
                  {completionRate.toFixed(0)}%
                </Text>
              </div>
              <ActionIcon size="xl" radius="md" variant="light" color="brand">
                📊
              </ActionIcon>
            </Group>
            <Progress value={completionRate} mt="sm" size="xs" />
          </Card>
        </SimpleGrid>
      </motion.div>

      {/* Main Content Grid */}
      <Grid>
        {/* Recent Tasks */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card p="lg" radius="md" withBorder h="400px">
              <Group justify="space-between" mb="md">
                <Title order={3}>最近のタスク</Title>
                <Button
                  component={Link}
                  href="/tasks"
                  variant="light"
                  size="sm"
                >
                  すべて見る
                </Button>
              </Group>
              
              <Stack gap="md" style={{ height: '300px', overflowY: 'auto' }}>
                {recentTasks.length > 0 ? (
                  recentTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    >
                      <Card p="sm" radius="sm" withBorder bg="gray.0">
                        <Group justify="space-between">
                          <div style={{ flex: 1 }}>
                            <Group gap="xs" mb="xs">
                              <Badge
                                size="xs"
                                color={getStatusBadge(task.status || 'TODO').color}
                              >
                                {getStatusBadge(task.status || 'TODO').label}
                              </Badge>
                              <Badge
                                size="xs"
                                variant="outline"
                                color={getPriorityBadge(task.priority).color}
                              >
                                {getPriorityBadge(task.priority).label}
                              </Badge>
                            </Group>
                            <Text fw={500} lineClamp={1}>
                              {task.title}
                            </Text>
                            {task.description && (
                              <Text size="sm" c="dimmed" lineClamp={2}>
                                {task.description}
                              </Text>
                            )}
                          </div>
                        </Group>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card p="lg" bg="gray.1" radius="md">
                    <Stack align="center" gap="sm">
                      <Text size="xl">📝</Text>
                      <Text c="dimmed" ta="center">
                        まだタスクがありません
                      </Text>
                      <Button
                        component={Link}
                        href="/tasks"
                        variant="light"
                        size="sm"
                      >
                        タスクを作成する
                      </Button>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid.Col>

        {/* Quick Actions */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Stack gap="md">
              <Card p="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  クイックアクション
                </Title>
                <Stack gap="sm">
                  <Button
                    component={Link}
                    href="/tasks"
                    fullWidth
                    leftSection="➕"
                    variant="light"
                  >
                    新しいタスクを作成
                  </Button>
                  <Button
                    component={Link}
                    href="/teams"
                    fullWidth
                    leftSection="👥"
                    variant="light"
                  >
                    チームを見る
                  </Button>
                  <Button
                    component={Link}
                    href="/notifications"
                    fullWidth
                    leftSection="🔔"
                    variant="light"
                  >
                    通知を確認
                  </Button>
                </Stack>
              </Card>

              <Card p="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  今日の目標
                </Title>
                <Text size="sm" c="dimmed">
                  {taskStats.inProgress > 0
                    ? `進行中のタスク ${taskStats.inProgress}件を完了させましょう！`
                    : '新しいタスクを始めて、生産的な一日を過ごしましょう！'
                  }
                </Text>
              </Card>
            </Stack>
          </motion.div>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}