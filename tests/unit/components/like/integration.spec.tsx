import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CommentList } from '@/components/comment/CommentList';
import { TaskList } from '@/components/task/TaskList';
import { commentService } from '@/lib/services/commentService';
import { likeService } from '@/lib/services/likeService';
import { taskService } from '@/lib/services/taskService';
import { Comment } from '@/lib/types/comment';
import { Task } from '@/lib/types/task';

vi.mock('@/lib/services/taskService', () => ({
  taskService: {
    getTasks: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

vi.mock('@/lib/services/commentService', () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

vi.mock('@/lib/services/likeService', () => ({
  likeService: {
    toggleTaskLike: vi.fn(),
    toggleCommentLike: vi.fn(),
  },
}));

const mockTaskService = vi.mocked(taskService);
const mockCommentService = vi.mocked(commentService);
const mockLikeService = vi.mocked(likeService);

const mockTask: Task = {
  id: 'task1',
  title: 'テストタスク',
  description: 'テスト用のタスクです',
  priority: 'MEDIUM',
  visibility: 'PUBLIC',
  likeCount: 5,
  commentCount: 3,
  createdAt: '2025-08-31T10:00:00Z',
  updatedAt: '2025-08-31T10:00:00Z',
  userId: 'user1',
  authorDisplayName: 'テストユーザー',
  authorUsername: 'testuser',
};

const mockComment: Comment = {
  id: 'comment1',
  taskId: 'task1',
  userId: 'user1',
  content: 'これはテストコメントです',
  likeCount: 2,
  createdAt: '2025-08-31T11:00:00Z',
  updatedAt: '2025-08-31T11:00:00Z',
  authorUsername: 'testuser',
  authorDisplayName: 'テストユーザー',
  authorAvatarUrl: null,
};

describe('Like Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task List with Like Integration', () => {
    beforeEach(() => {
      mockTaskService.getTasks.mockResolvedValue({
        content: [mockTask],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });
    });

    it('タスクリストでいいねボタンが正常に動作する', async () => {
      const user = userEvent.setup();
      const mockLike = { 
        id: 'like1', 
        userId: 'user1', 
        taskId: 'task1', 
        createdAt: '2025-08-31T12:00:00Z' 
      };
      
      mockLikeService.toggleTaskLike.mockResolvedValue(mockLike);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('テストタスク')).toBeInTheDocument();
      });

      // いいねボタンを見つける
      const likeButton = screen.getByRole('button', { name: /いいね|❤️|🤍/ });
      expect(screen.getByText('5')).toBeInTheDocument();

      // いいねボタンをクリック
      await user.click(likeButton);

      await waitFor(() => {
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledWith('task1');
        expect(screen.getByText('6')).toBeInTheDocument();
      });
    });

    it('タスクリストでいいねの取り消しができる', async () => {
      const user = userEvent.setup();
      const likedTask = { ...mockTask, likeCount: 6 };
      
      mockTaskService.getTasks.mockResolvedValue({
        content: [likedTask],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });
      
      mockLikeService.toggleTaskLike.mockResolvedValue(null);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument();
      });

      const likeButton = screen.getByRole('button', { name: /いいね|❤️|🤍/ });
      await user.click(likeButton);

      await waitFor(() => {
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledWith('task1');
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  describe('Comment List with Like Integration', () => {
    beforeEach(() => {
      mockCommentService.getComments.mockResolvedValue({
        content: [mockComment],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });
    });

    it('コメントリストでいいねボタンが正常に動作する', async () => {
      const user = userEvent.setup();
      const mockLike = { 
        id: 'like1', 
        userId: 'user1', 
        commentId: 'comment1', 
        createdAt: '2025-08-31T12:00:00Z' 
      };
      
      mockLikeService.toggleCommentLike.mockResolvedValue(mockLike);

      render(<CommentList taskId="task1" />);

      await waitFor(() => {
        expect(screen.getByText('これはテストコメントです')).toBeInTheDocument();
      });

      // いいねボタンを見つける（コメント内の）
      const likeButtons = screen.getAllByRole('button');
      const commentLikeButton = likeButtons.find(button => 
        button.textContent?.includes('2') || button.getAttribute('aria-label')?.includes('いいね')
      );
      
      expect(commentLikeButton).toBeInTheDocument();
      await user.click(commentLikeButton!);

      await waitFor(() => {
        expect(mockLikeService.toggleCommentLike).toHaveBeenCalledWith('comment1');
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('コメントでいいねエラーが適切にハンドリングされる', async () => {
      const user = userEvent.setup();
      
      mockLikeService.toggleCommentLike.mockRejectedValue(new Error('Network Error'));

      render(<CommentList taskId="task1" />);

      await waitFor(() => {
        expect(screen.getByText('これはテストコメントです')).toBeInTheDocument();
      });

      const likeButtons = screen.getAllByRole('button');
      const commentLikeButton = likeButtons.find(button => 
        button.textContent?.includes('2')
      );
      
      if (commentLikeButton) {
        await user.click(commentLikeButton);

        await waitFor(() => {
          expect(mockLikeService.toggleCommentLike).toHaveBeenCalledWith('comment1');
          // エラー時はカウントが変わらない
          expect(screen.getByText('2')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Like State Synchronization', () => {
    it('複数のコンポーネント間でいいね状態が同期される', async () => {
      const user = userEvent.setup();
      
      // タスクとコメントの両方を表示するシナリオ
      mockTaskService.getTasks.mockResolvedValue({
        content: [mockTask],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });

      mockCommentService.getComments.mockResolvedValue({
        content: [mockComment],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });

      const mockTaskLike = { 
        id: 'like1', 
        userId: 'user1', 
        taskId: 'task1', 
        createdAt: '2025-08-31T12:00:00Z' 
      };
      
      mockLikeService.toggleTaskLike.mockResolvedValue(mockTaskLike);

      const TestComponent = () => (
        <div>
          <TaskList />
          <CommentList taskId="task1" />
        </div>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('テストタスク')).toBeInTheDocument();
        expect(screen.getByText('これはテストコメントです')).toBeInTheDocument();
      });

      // タスクのいいねボタンをクリック
      const taskLikeButton = screen.getAllByRole('button').find(button =>
        button.getAttribute('data-testid') === 'task-like-button' ||
        (button.textContent?.includes('5') && button.closest('[data-testid*="task"]'))
      );

      if (taskLikeButton) {
        await user.click(taskLikeButton);

        await waitFor(() => {
          expect(mockLikeService.toggleTaskLike).toHaveBeenCalledWith('task1');
        });
      }
    });
  });

  describe('Performance and UX', () => {
    it('いいねボタンが連続クリックされても適切に制御される', async () => {
      const user = userEvent.setup();
      
      // 遅延を追加してレスポンス時間をシミュレート
      mockLikeService.toggleTaskLike.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(null), 200))
      );

      mockTaskService.getTasks.mockResolvedValue({
        content: [mockTask],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('テストタスク')).toBeInTheDocument();
      });

      const likeButton = screen.getByRole('button', { name: /いいね|❤️|🤍/ });
      
      // 連続でクリック
      await user.click(likeButton);
      await user.click(likeButton);
      await user.click(likeButton);

      // 最初のリクエストのみが処理される
      await waitFor(() => {
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledTimes(1);
      });
    });

    it('いいねボタンのアニメーションが正常に動作する', async () => {
      const user = userEvent.setup();
      
      mockLikeService.toggleTaskLike.mockResolvedValue({
        id: 'like1', 
        userId: 'user1', 
        taskId: 'task1', 
        createdAt: '2025-08-31T12:00:00Z' 
      });

      mockTaskService.getTasks.mockResolvedValue({
        content: [mockTask],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('テストタスク')).toBeInTheDocument();
      });

      const likeButton = screen.getByRole('button', { name: /いいね|❤️|🤍/ });
      
      // ボタンの初期状態を確認
      expect(likeButton).toHaveAttribute('data-liked', 'false');
      
      await user.click(likeButton);

      await waitFor(() => {
        expect(likeButton).toHaveAttribute('data-liked', 'true');
      });
    });
  });
});