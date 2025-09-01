'use client';

import {
  Button,
  Card,
  Checkbox,
  Group,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';

import { TaskFilters } from '../../lib/types/task';

interface TaskSearchProps {
  onFiltersChange: (filters: TaskFilters) => void;
  initialFilters?: TaskFilters;
}

export function TaskSearch({ onFiltersChange, initialFilters = {} }: TaskSearchProps) {
  const form = useForm<TaskFilters>({
    initialValues: {
      keyword: initialFilters.keyword || '',
      priority: initialFilters.priority || '',
      visibility: initialFilters.visibility || '',
      dueDateStart: initialFilters.dueDateStart || '',
      dueDateEnd: initialFilters.dueDateEnd || '',
      myTasksOnly: initialFilters.myTasksOnly || false,
      page: initialFilters.page || 0,
      size: initialFilters.size || 20,
    },
  });

  const handleSubmit = (values: TaskFilters) => {
    // Remove empty string values
    const cleanedFilters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined) {
        acc[key as keyof TaskFilters] = value;
      }
      return acc;
    }, {} as TaskFilters);

    onFiltersChange(cleanedFilters);
  };

  const handleReset = () => {
    form.reset();
    onFiltersChange({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card p="md" radius="md" shadow="sm" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="キーワード検索"
              placeholder="タイトルや説明文で検索..."
              {...form.getInputProps('keyword')}
            />

            <Group grow>
              <Select
                label="優先度"
                placeholder="全ての優先度"
                clearable
                data={[
                  { value: 'HIGH', label: '高' },
                  { value: 'MEDIUM', label: '中' },
                  { value: 'LOW', label: '低' },
                ]}
                {...form.getInputProps('priority')}
              />

              <Select
                label="公開設定"
                placeholder="全ての公開設定"
                clearable
                data={[
                  { value: 'PRIVATE', label: '個人' },
                  { value: 'TEAM', label: 'チーム' },
                  { value: 'PUBLIC', label: '公開' },
                ]}
                {...form.getInputProps('visibility')}
              />
            </Group>

            <Group grow>
              <DateInput
                label="期限開始日"
                placeholder="開始日を選択"
                value={form.values.dueDateStart ? new Date(form.values.dueDateStart) : null}
                onChange={(date) => {
                  form.setFieldValue('dueDateStart', date?.toISOString().split('T')[0] || '');
                }}
              />

              <DateInput
                label="期限終了日"
                placeholder="終了日を選択"
                value={form.values.dueDateEnd ? new Date(form.values.dueDateEnd) : null}
                onChange={(date) => {
                  form.setFieldValue('dueDateEnd', date?.toISOString().split('T')[0] || '');
                }}
              />
            </Group>

            <Checkbox
              label="自分のタスクのみ表示"
              {...form.getInputProps('myTasksOnly', { type: 'checkbox' })}
            />

            <Group justify="flex-end">
              <Button variant="outline" onClick={handleReset}>
                リセット
              </Button>
              <Button
                type="submit"
                gradient={{ from: 'brand.6', to: 'brand.4' }}
                variant="gradient"
              >
                検索
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </motion.div>
  );
}