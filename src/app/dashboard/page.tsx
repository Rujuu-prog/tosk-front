"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";

import { useAuth } from "@/lib/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed";
  visibility: "private" | "team" | "public";
  createdAt: Date;
  updatedAt: Date;
}

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "プロジェクト企画書を作成",
      description: "新規プロジェクトの企画書を作成し、チームに共有する",
      status: "in_progress",
      visibility: "team",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "デザインレビュー",
      description: "UIデザインのレビューを行い、フィードバックを提供",
      status: "todo",
      visibility: "team",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "個人的な読書メモ",
      description: "技術書を読んで重要なポイントをまとめる",
      status: "completed",
      visibility: "private",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [menuOpened, { toggle: toggleMenu }] = useDisclosure();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      visibility: "private",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    notifications.show({
      title: "タスク追加",
      message: "新しいタスクが追加されました",
      color: "green",
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date() }
          : task,
      ),
    );
    notifications.show({
      title: "ステータス更新",
      message: "タスクのステータスが更新されました",
      color: "blue",
    });
  };

  const getStatusBadge = (status: Task["status"]) => {
    const statusConfig = {
      todo: { color: "gray", label: "未着手" },
      in_progress: { color: "yellow", label: "進行中" },
      completed: { color: "green", label: "完了" },
    };
    return statusConfig[status];
  };

  const getVisibilityBadge = (visibility: Task["visibility"]) => {
    const visibilityConfig = {
      private: { color: "red", label: "個人", icon: "🔒" },
      team: { color: "blue", label: "チーム", icon: "👥" },
      public: { color: "green", label: "公開", icon: "🌐" },
    };
    return visibilityConfig[visibility];
  };

  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === "todo"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };

  const handleLogout = async () => {
    try {
      await logout();
      notifications.show({
        title: "ログアウト",
        message: "ログアウトしました",
        color: "blue",
      });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Text ta="center">読み込み中...</Text>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper p="md" mb="xl" radius="lg" shadow="sm">
          <Flex justify="space-between" align="center">
            <Group>
              <Title order={1} c="brand.6">
                Tosk Dashboard
              </Title>
              <Badge size="sm" variant="light" color="brand">
                v1.0
              </Badge>
            </Group>
            <Menu opened={menuOpened} onClose={toggleMenu} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={toggleMenu}
                  style={{ borderRadius: "50%" }}
                >
                  <Avatar size="sm">
                    {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user.displayName || user.username}</Menu.Label>
                <Menu.Item leftSection="⚙️">設定</Menu.Item>
                <Menu.Item leftSection="👥">チーム管理</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection="🚪" color="red" onClick={handleLogout}>
                  ログアウト
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </Paper>
      </motion.div>

      {/* Add Task Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card p="lg" mb="xl" radius="lg" shadow="sm">
          <Text fw={600} mb="md" c="brand.7">
            新しいタスクを追加
          </Text>
          <Group>
            <TextInput
              placeholder="タスクのタイトルを入力..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              flex={1}
              leftSection="📝"
            />
            <Button
              onClick={handleAddTask}
              gradient={{ from: "brand.6", to: "brand.4" }}
              variant="gradient"
            >
              追加
            </Button>
          </Group>
        </Card>
      </motion.div>

      {/* Task Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Grid mb="xl">
          <Grid.Col span={4}>
            <Card p="lg" radius="lg" bg="gray.0">
              <Text ta="center" size="xl" fw={700} c="gray.7">
                {tasksByStatus.todo.length}
              </Text>
              <Text ta="center" size="sm" c="dimmed">
                未着手
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card p="lg" radius="lg" bg="yellow.0">
              <Text ta="center" size="xl" fw={700} c="yellow.7">
                {tasksByStatus.in_progress.length}
              </Text>
              <Text ta="center" size="sm" c="dimmed">
                進行中
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card p="lg" radius="lg" bg="green.0">
              <Text ta="center" size="xl" fw={700} c="green.7">
                {tasksByStatus.completed.length}
              </Text>
              <Text ta="center" size="sm" c="dimmed">
                完了
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </motion.div>

      {/* Task Lists */}
      <Grid>
        {Object.entries(tasksByStatus).map(([status, statusTasks], index) => (
          <Grid.Col key={status} span={4}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <Card p="md" radius="lg" shadow="sm" h="600px">
                <Text fw={600} mb="md" c="brand.7" ta="center">
                  {getStatusBadge(status as Task["status"]).label}
                  <Badge ml="xs" size="sm" variant="light">
                    {statusTasks.length}
                  </Badge>
                </Text>
                <Stack gap="sm" style={{ maxHeight: "520px", overflowY: "auto" }}>
                  {statusTasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.5 + taskIndex * 0.1,
                        duration: 0.3,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Paper p="sm" radius="md" shadow="xs" bg="white">
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500} size="sm" lineClamp={2}>
                              {task.title}
                            </Text>
                            <Menu position="bottom-end">
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  c="dimmed"
                                >
                                  ⋮
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Label>ステータス変更</Menu.Label>
                                <Menu.Item
                                  onClick={() => handleStatusChange(task.id, "todo")}
                                  leftSection="📝"
                                >
                                  未着手
                                </Menu.Item>
                                <Menu.Item
                                  onClick={() => handleStatusChange(task.id, "in_progress")}
                                  leftSection="🚀"
                                >
                                  進行中
                                </Menu.Item>
                                <Menu.Item
                                  onClick={() => handleStatusChange(task.id, "completed")}
                                  leftSection="✅"
                                >
                                  完了
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                          {task.description && (
                            <Text size="xs" c="dimmed" lineClamp={2}>
                              {task.description}
                            </Text>
                          )}
                          <Group justify="space-between" mt="xs">
                            <Tooltip
                              label={getVisibilityBadge(task.visibility).label}
                              position="bottom"
                            >
                              <Badge
                                size="xs"
                                variant="light"
                                color={getVisibilityBadge(task.visibility).color}
                                leftSection={getVisibilityBadge(task.visibility).icon}
                              >
                                {getVisibilityBadge(task.visibility).label}
                              </Badge>
                            </Tooltip>
                            <Text size="xs" c="dimmed">
                              {task.updatedAt.toLocaleDateString()}
                            </Text>
                          </Group>
                        </Stack>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}