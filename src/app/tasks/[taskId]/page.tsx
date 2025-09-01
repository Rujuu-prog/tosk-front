'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CommentList } from '@/components/comment/CommentList';
import { LikeButton } from '@/components/like/LikeButton';
import { TaskForm } from '@/components/task/TaskForm';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types/task';

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [commentCount, setCommentCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const resolvedParams = await params;
        const fetchedTask = await taskService.getTask(resolvedParams.taskId);
        setTask(fetchedTask);
        setCommentCount(fetchedTask.commentCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'タスクの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params]);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTask(updatedTask);
    closeEditModal();
    notifications.show({
      title: '更新完了',
      message: 'タスクを更新しました',
      color: 'green',
    });
  };

  const handleTaskDelete = async () => {
    if (!task) return;
    
    try {
      await taskService.deleteTask(task.id);
      notifications.show({
        title: '削除完了',
        message: 'タスクを削除しました',
        color: 'green',
      });
      router.push('/tasks');
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: 'タスクの削除に失敗しました',
        color: 'red',
      });
    }
  };

  const handleLikeChange = (liked: boolean, newCount: number) => {
    if (task) {
      setTask({ ...task, likeCount: newCount });
    }
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
    if (task) {
      setTask({ ...task, commentCount: count });
    }
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
      <Container size="xl" py="md">
        <Card p="xl">
          <Text ta="center">読み込み中...</Text>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Card p="xl" bg="red.0" withBorder>
          <Stack align="center" gap="md">
            <Text c="red" fw={500}>
              {error}
            </Text>
            <Button
              component={Link}
              href="/tasks"
              variant="outline"
            >
              タスク一覧に戻る
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container size="xl" py="md">
        <Card p="xl">
          <Stack align="center" gap="md">
            <Text c="dimmed">タスクが見つかりませんでした</Text>
            <Button
              component={Link}
              href="/tasks"
              variant="outline"
            >
              タスク一覧に戻る
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Navigation */}
        <Group>
          <Button
            component={Link}
            href="/tasks"
            variant="subtle"
            leftSection="←"
          >
            タスク一覧に戻る
          </Button>
        </Group>

        {/* Task Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card p="xl" radius="md" withBorder>
            <Group justify="space-between" align="flex-start" mb="md">
              <div style={{ flex: 1 }}>
                <Group gap="sm" mb="sm">
                  <Badge color={getPriorityColor(task.priority)} size="sm">
                    {task.priority === 'HIGH' ? '高' : task.priority === 'MEDIUM' ? '中' : '低'}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {getVisibilityIcon(task.visibility)} {
                      task.visibility === 'PRIVATE' ? '個人' :
                      task.visibility === 'TEAM' ? 'チーム' : '公開'
                    }
                  </Badge>
                  {task.status && (
                    <Badge
                      color={
                        task.status === 'COMPLETED' ? 'green' :
                        task.status === 'IN_PROGRESS' ? 'blue' : 'gray'
                      }
                      size="sm"
                    >
                      {
                        task.status === 'COMPLETED' ? '完了' :
                        task.status === 'IN_PROGRESS' ? '進行中' : '未着手'
                      }
                    </Badge>
                  )}
                </Group>
                
                <Title order={1} mb="md">
                  {task.title}
                </Title>
                
                {task.description && (
                  <Text size="lg" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {task.description}
                  </Text>
                )}
              </div>
              
              <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg">
                    ⋮
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection="✏️" onClick={openEditModal}>
                    編集
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection="🗑️"
                    color="red"
                    onClick={handleTaskDelete}
                  >
                    削除
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Divider mb="md" />

            {/* Task Metadata */}
            <Group gap="xl" mb="md">
              <Group gap="xs">
                <Text size="sm" c="dimmed">作成者:</Text>
                <Text size="sm" fw={500}>{task.authorDisplayName}</Text>
              </Group>
              
              <Group gap="xs">
                <Text size="sm" c="dimmed">作成日:</Text>
                <Text size="sm">
                  {new Date(task.createdAt).toLocaleDateString('ja-JP')}
                </Text>
              </Group>
              
              {task.dueDate && (
                <Group gap="xs">
                  <Text size="sm" c="dimmed">期限:</Text>
                  <Text size="sm">
                    {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                  </Text>
                </Group>
              )}
            </Group>

            {/* Actions */}
            <Group gap="md">
              <LikeButton
                type="task"
                targetId={task.id}
                initialLiked={false}
                initialCount={task.likeCount}
                onLikeChange={handleLikeChange}
              />
              
              <Group gap={4}>
                <Text size="sm">💬</Text>
                <Text size="sm">{commentCount}</Text>
              </Group>
            </Group>
          </Card>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CommentList
            taskId={task.id}
            onCommentCountChange={handleCommentCountChange}
          />
        </motion.div>
      </Stack>

      {/* Edit Task Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="タスクを編集"
        size="lg"
        centered
      >
        <TaskForm
          task={task}
          onSubmit={handleTaskUpdate}
          onCancel={closeEditModal}
        />
      </Modal>
    </Container>
  );
}