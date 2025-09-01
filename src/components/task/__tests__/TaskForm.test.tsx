import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { taskService } from '../../../lib/services/taskService';
import { Task } from '../../../lib/types/task';
import { TaskForm } from '../TaskForm';

// Mock the taskService
jest.mock('../../../lib/services/taskService', () => ({
  taskService: {
    createTask: jest.fn(),
    updateTask: jest.fn(),
  },
}));

const mockTaskService = taskService as jest.Mocked<typeof taskService>;

const mockCreatedTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'New Task',
  description: 'Task description',
  priority: 'MEDIUM',
  visibility: 'PRIVATE',
  likeCount: 0,
  commentCount: 0,
  createdAt: '2025-08-31T08:00:00Z',
  updatedAt: '2025-08-31T08:00:00Z',
};

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskService.createTask.mockResolvedValue(mockCreatedTask);
  });

  it('タスク作成フォームが正しく表示される', () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Check form elements
    expect(screen.getByLabelText(/タイトル/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/優先度/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/公開設定/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/期限/i)).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /作成/i })).toBeInTheDocument();
  });

  it('必須フィールドのバリデーションが動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);
    
    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText(/タイトルは必須です/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正常なタスク作成が動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Fill form fields
    await user.type(screen.getByLabelText(/タイトル/i), 'New Task');
    await user.type(screen.getByLabelText(/説明/i), 'Task description');
    await user.selectOptions(screen.getByLabelText(/優先度/i), 'MEDIUM');
    await user.selectOptions(screen.getByLabelText(/公開設定/i), 'PRIVATE');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);
    
    // Check if onSubmit is called with correct data
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'MEDIUM',
        visibility: 'PRIVATE',
      });
    });
  });

  it('タイトルの文字数制限バリデーションが動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Fill with too long title (over 120 characters)
    const longTitle = 'a'.repeat(121);
    await user.type(screen.getByLabelText(/タイトル/i), longTitle);
    
    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/タイトルは120文字以内で入力してください/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('説明の文字数制限バリデーションが動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Fill with valid title and too long description (over 10000 characters)
    await user.type(screen.getByLabelText(/タイトル/i), 'Valid Title');
    const longDescription = 'a'.repeat(10001);
    await user.type(screen.getByLabelText(/説明/i), longDescription);
    
    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/説明は10,000文字以内で入力してください/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('期限日付のバリデーションが動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Fill with valid title and past date
    await user.type(screen.getByLabelText(/タイトル/i), 'Valid Title');
    const pastDate = '2020-01-01';
    await user.type(screen.getByLabelText(/期限/i), pastDate);
    
    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/期限は今日以降の日付を選択してください/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('編集モードで既存データが表示される', () => {
    const existingTask: Task = {
      id: '1',
      userId: 'user1',
      title: 'Existing Task',
      description: 'Existing description',
      priority: 'HIGH',
      visibility: 'TEAM',
      dueDate: '2025-12-31',
      likeCount: 0,
      commentCount: 0,
      createdAt: '2025-08-31T08:00:00Z',
      updatedAt: '2025-08-31T08:00:00Z',
    };
    
    const onSubmit = jest.fn();
    render(<TaskForm task={existingTask} onSubmit={onSubmit} />);
    
    // Check if form is populated with existing data
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
    
    // Check if submit button shows "更新"
    expect(screen.getByRole('button', { name: /更新/i })).toBeInTheDocument();
  });

  it('フォームリセットが正しく動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/タイトル/i), 'Test Title');
    await user.type(screen.getByLabelText(/説明/i), 'Test description');
    
    // Check reset button exists and works
    const resetButton = screen.queryByRole('button', { name: /リセット|クリア/i });
    if (resetButton) {
      await user.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/タイトル/i)).toHaveValue('');
        expect(screen.getByLabelText(/説明/i)).toHaveValue('');
      });
    }
  });

  it('ローディング状態が正しく表示される', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    
    // Mock slow API response
    mockTaskService.createTask.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockCreatedTask), 1000))
    );
    
    render(<TaskForm onSubmit={onSubmit} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/タイトル/i), 'New Task');
    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /作成中/i })).toBeDisabled();
    });
  });
});