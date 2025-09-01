'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Menu,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { taskService } from '../../lib/services/taskService';
import { Task, TaskFilters, TaskListResponse } from '../../lib/types/task';
import { LikeButton } from '../like/LikeButton';

interface TaskListProps {
  filters?: TaskFilters;
  onPageChange?: (page: number) => void;
  onTaskUpdate?: () => void;
}

export function TaskList({ filters = {}, onPageChange, onTaskUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: TaskListResponse = await taskService.getTasks(filters);
      setTasks(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.pageable.pageNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleDelete = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      notifications.show({
        title: '削除完了',
        message: 'タスクを削除しました',
        color: 'green',
      });
      fetchTasks();
      onTaskUpdate?.();
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: 'タスクの削除に失敗しました',
        color: 'red',
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return '🔒';
      case 'TEAM':
        return '👥';
      case 'PUBLIC':
        return '🌐';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Text>読み込み中...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack align="center" p="xl">
        <Text c="red">エラーが発生しました: {error}</Text>
        <Button onClick={fetchTasks} variant="outline">
          再試行
        </Button>
      </Stack>
    );
  }

  if (tasks.length === 0) {
    return (
      <Stack align="center" p="xl">
        <Text c="dimmed">タスクが見つかりませんでした</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>タスク一覧</Title>
        <Button onClick={fetchTasks} variant="outline" size="sm">
          更新
        </Button>
      </Group>

      <Grid>
        {tasks.map((task, index) => (
          <Grid.Col key={task.id} span={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <TaskCard
                task={task}
                onDelete={handleDelete}
                onUpdate={onTaskUpdate}
              />
            </motion.div>
          </Grid.Col>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            前へ
          </Button>
          <Text size="sm">
            {currentPage + 1} / {totalPages}
          </Text>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            次へ
          </Button>
        </Group>
      )}
    </Stack>
  );
}

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdate?: () => void;
}

function TaskCard({ task, onDelete, onUpdate }: TaskCardProps) {
  const [likeCount, setLikeCount] = useState(task.likeCount);
  const [liked, setLiked] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return '🔒';
      case 'TEAM':
        return '👥';
      case 'PUBLIC':
        return '🌐';
      default:
        return '❓';
    }
  };

  const handleLikeChange = (isLiked: boolean, newCount: number) => {
    setLiked(isLiked);
    setLikeCount(newCount);
  };

  return (
    <Card p="md" radius="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Title order={4} lineClamp={2}>
              {task.title}
            </Title>
            {task.description && (
              <Text c="dimmed" size="sm" mt="xs" lineClamp={3}>
                {task.description}
              </Text>
            )}
          </div>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" c="dimmed">
                ⋮
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection="✏️">編集</Menu.Item>
              <Menu.Item leftSection="👁️">詳細を見る</Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection="🗑️"
                color="red"
                onClick={() => onDelete(task.id)}
              >
                削除
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group justify="space-between" align="center" mt="xs">
          <Group gap="xs">
            <Badge color={getPriorityColor(task.priority)} size="sm">
              {task.priority}
            </Badge>
            <Tooltip label={`公開設定: ${task.visibility}`}>
              <Text size="sm">{getVisibilityIcon(task.visibility)}</Text>
            </Tooltip>
            {task.dueDate && (
              <Badge variant="outline" size="sm">
                期限: {task.dueDate}
              </Badge>
            )}
          </Group>

          <Group gap="md" align="center">
            <LikeButton
              type="task"
              targetId={task.id}
              initialLiked={liked}
              initialCount={likeCount}
              onLikeChange={handleLikeChange}
              size="xs"
            />
            <Group gap={4}>
              <Text size="sm">💬</Text>
              <Text size="sm">{task.commentCount}</Text>
            </Group>
          </Group>
        </Group>

        <Text size="xs" c="dimmed">
          作成日: {new Date(task.createdAt).toLocaleDateString()}
          {task.updatedAt !== task.createdAt && (
            <> • 更新日: {new Date(task.updatedAt).toLocaleDateString()}</>
          )}
        </Text>
      </Stack>
    </Card>
  );
}