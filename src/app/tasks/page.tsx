'use client';

import {
  Button,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { TaskForm } from '@/components/task/TaskForm';
import { TaskList } from '@/components/task/TaskList';
import { TaskSearch } from '@/components/task/TaskSearch';
import { Task, TaskFilters } from '@/lib/types/task';

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
  };

  const handleTaskCreate = (task: Task) => {
    closeCreateModal();
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleTaskUpdate = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const finalFilters = {
    ...filters,
    page: currentPage,
  };

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
                  タスク管理
                </Title>
                <Text c="dimmed">
                  タスクの作成、編集、検索を行うことができます
                </Text>
              </div>
              <Button
                leftSection="➕"
                onClick={openCreateModal}
                gradient={{ from: 'brand.6', to: 'brand.4' }}
                variant="gradient"
                size="md"
              >
                新しいタスク
              </Button>
            </Group>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <TaskSearch
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </motion.div>

        <Divider />

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          key={refreshTrigger} // Force re-render on refresh
        >
          <TaskList
            filters={finalFilters}
            onPageChange={handlePageChange}
            onTaskUpdate={handleTaskUpdate}
          />
        </motion.div>
      </Stack>

      {/* Create Task Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="新しいタスクを作成"
        size="lg"
        centered
      >
        <TaskForm
          onSubmit={handleTaskCreate}
          onCancel={closeCreateModal}
        />
      </Modal>
    </Container>
  );
}