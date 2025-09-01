'use client';

import {
  Button,
  Card,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { taskService } from '../../lib/services/taskService';
import { CreateTaskRequest, Task, UpdateTaskRequest } from '../../lib/types/task';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task) => void;
  onCancel?: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!task;

  const form = useForm<CreateTaskRequest | UpdateTaskRequest>({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      visibility: task?.visibility || 'PRIVATE',
      dueDate: task?.dueDate || undefined,
      teamId: task?.teamId || undefined,
    },
    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) {
          return 'タイトルは必須です';
        }
        if (value.length > 120) {
          return 'タイトルは120文字以内で入力してください';
        }
        return null;
      },
      description: (value) => {
        if (value && value.length > 10000) {
          return '説明は10,000文字以内で入力してください';
        }
        return null;
      },
      dueDate: (value) => {
        if (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(value);
          if (dueDate < today) {
            return '期限は今日以降の日付を選択してください';
          }
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      setLoading(true);
      
      let result: Task;
      if (isEditing && task) {
        result = await taskService.updateTask(task.id, values);
        notifications.show({
          title: '更新完了',
          message: 'タスクを更新しました',
          color: 'green',
        });
      } else {
        result = await taskService.createTask(values as CreateTaskRequest);
        notifications.show({
          title: '作成完了',
          message: 'タスクを作成しました',
          color: 'green',
        });
      }
      
      onSubmit(result);
      
      if (!isEditing) {
        form.reset();
      }
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: isEditing ? 'タスクの更新に失敗しました' : 'タスクの作成に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card p="lg" radius="lg" shadow="sm" withBorder>
        <Stack gap="md">
          <Title order={3}>
            {isEditing ? 'タスクを編集' : 'タスクを作成'}
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="タイトル"
                placeholder="タスクのタイトルを入力してください"
                required
                {...form.getInputProps('title')}
              />

              <Textarea
                label="説明"
                placeholder="タスクの詳細説明（任意）"
                minRows={3}
                maxRows={6}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <Select
                  label="優先度"
                  required
                  data={[
                    { value: 'LOW', label: '低' },
                    { value: 'MEDIUM', label: '中' },
                    { value: 'HIGH', label: '高' },
                  ]}
                  {...form.getInputProps('priority')}
                />

                <Select
                  label="公開設定"
                  required
                  data={[
                    { value: 'PRIVATE', label: '個人' },
                    { value: 'TEAM', label: 'チーム' },
                    { value: 'PUBLIC', label: '公開' },
                  ]}
                  {...form.getInputProps('visibility')}
                />
              </Group>

              <DateInput
                label="期限"
                placeholder="期限を選択してください（任意）"
                value={form.values.dueDate ? new Date(form.values.dueDate) : null}
                onChange={(date) => {
                  form.setFieldValue('dueDate', date?.toISOString().split('T')[0]);
                }}
                error={form.errors.dueDate}
              />

              <Group justify="flex-end" mt="md">
                {!isEditing && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    リセット
                  </Button>
                )}
                
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    キャンセル
                  </Button>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  gradient={{ from: 'brand.6', to: 'brand.4' }}
                  variant="gradient"
                >
                  {loading 
                    ? (isEditing ? '更新中...' : '作成中...')
                    : (isEditing ? '更新' : '作成')
                  }
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </motion.div>
  );
}