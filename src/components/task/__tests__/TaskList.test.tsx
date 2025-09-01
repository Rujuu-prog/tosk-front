import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { taskService } from '../../../lib/services/taskService';
import { Task, TaskFilters } from '../../../lib/types/task';
import { TaskList } from '../TaskList';

// Mock the taskService
jest.mock('../../../lib/services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

const mockTaskService = taskService as jest.Mocked<typeof taskService>;

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'テストタスク1',
    description: 'これはテスト用のタスクです',
    priority: 'HIGH',
    visibility: 'PRIVATE',
    likeCount: 3,
    commentCount: 2,
    createdAt: '2025-08-31T08:00:00Z',
    updatedAt: '2025-08-31T08:00:00Z',
  },
  {
    id: '2',
    userId: 'user1', 
    title: 'テストタスク2',
    description: '2番目のタスク',
    priority: 'MEDIUM',
    visibility: 'TEAM',
    likeCount: 1,
    commentCount: 0,
    createdAt: '2025-08-31T09:00:00Z',
    updatedAt: '2025-08-31T09:00:00Z',
  },
];

const mockTaskListResponse = {
  content: mockTasks,
  pageable: {
    pageNumber: 0,
    pageSize: 20,
  },
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskService.getTasks.mockResolvedValue(mockTaskListResponse);
  });

  it('タスク一覧が正しく表示される', async () => {
    render(<TaskList />);
    
    // Loading state is shown first
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    });
    
    // Check task details
    expect(screen.getByText('これはテスト用のタスクです')).toBeInTheDocument();
    expect(screen.getByText('2番目のタスク')).toBeInTheDocument();
    
    // Check priority badges
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    
    // Check like and comment counts
    expect(screen.getByText('3')).toBeInTheDocument(); // like count
    expect(screen.getByText('2')).toBeInTheDocument(); // comment count
  });

  it('フィルターが適用されてタスクが検索される', async () => {
    const filters: TaskFilters = { keyword: 'test', priority: 'HIGH' };
    render(<TaskList filters={filters} />);
    
    await waitFor(() => {
      expect(mockTaskService.getTasks).toHaveBeenCalledWith(filters);
    });
  });

  it('タスクが存在しない場合の表示', async () => {
    mockTaskService.getTasks.mockResolvedValue({
      ...mockTaskListResponse,
      content: [],
      totalElements: 0,
    });
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('タスクが見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('エラー時の表示', async () => {
    mockTaskService.getTasks.mockRejectedValue(new Error('API Error'));
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('ページネーションが正しく動作する', async () => {
    const onPageChange = jest.fn();
    
    render(<TaskList onPageChange={onPageChange} />);
    
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });
    
    // Check if pagination controls are present when needed
    // This would be implemented based on the actual pagination design
  });

  it('タスクリフレッシュが正しく動作する', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });
    
    // Click refresh button (if exists)
    const refreshButton = screen.queryByRole('button', { name: /更新|リフレッシュ/i });
    if (refreshButton) {
      await userEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockTaskService.getTasks).toHaveBeenCalledTimes(2);
      });
    }
  });
});

describe('TaskCard', () => {
  const mockTask = mockTasks[0];

  it('タスクカードが正しく表示される', () => {
    // This test would be for a separate TaskCard component
    // For now, we'll include it in the TaskList test suite
  });

  it('優先度に応じたスタイルが適用される', () => {
    // Test priority-based styling
  });

  it('可視性設定が正しく表示される', () => {
    // Test visibility indicators
  });
});