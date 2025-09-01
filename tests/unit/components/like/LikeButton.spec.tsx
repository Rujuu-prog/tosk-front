import { MantineProvider } from '@mantine/core';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LikeButton } from '@/components/like/LikeButton';
import { likeService } from '@/lib/services/likeService';

vi.mock('@/lib/services/likeService', () => ({
  likeService: {
    toggleTaskLike: vi.fn(),
    toggleCommentLike: vi.fn(),
    getUserTaskLikes: vi.fn(),
    getUserCommentLikes: vi.fn(),
  },
}));

const mockLikeService = vi.mocked(likeService);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Like', () => {
    it('タスクのいいねボタンが表示される', () => {
      renderWithProvider(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={() => {}}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('いいね済みの状態で表示される', () => {
      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={true}
          initialCount={5}
          onLikeChange={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-liked', 'true');
    });

    it('タスクのいいねをトグルできる', async () => {
      const user = userEvent.setup();
      const mockOnLikeChange = vi.fn();
      const mockLike = { id: '1', userId: 'user1', taskId: 'task1', createdAt: '2025-08-31T10:00:00Z' };
      
      mockLikeService.toggleTaskLike.mockResolvedValue(mockLike);

      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={mockOnLikeChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledWith('task1');
        expect(mockOnLikeChange).toHaveBeenCalledWith(true, 6);
      });
    });

    it('タスクのいいねを取り消せる', async () => {
      const user = userEvent.setup();
      const mockOnLikeChange = vi.fn();
      
      mockLikeService.toggleTaskLike.mockResolvedValue(null);

      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={true}
          initialCount={5}
          onLikeChange={mockOnLikeChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledWith('task1');
        expect(mockOnLikeChange).toHaveBeenCalledWith(false, 4);
      });
    });
  });

  describe('Comment Like', () => {
    it('コメントのいいねボタンが表示される', () => {
      render(
        <LikeButton
          type="comment"
          targetId="comment1"
          initialLiked={false}
          initialCount={3}
          onLikeChange={() => {}}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('コメントのいいねをトグルできる', async () => {
      const user = userEvent.setup();
      const mockOnLikeChange = vi.fn();
      const mockLike = { id: '1', userId: 'user1', commentId: 'comment1', createdAt: '2025-08-31T10:00:00Z' };
      
      mockLikeService.toggleCommentLike.mockResolvedValue(mockLike);

      render(
        <LikeButton
          type="comment"
          targetId="comment1"
          initialLiked={false}
          initialCount={3}
          onLikeChange={mockOnLikeChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockLikeService.toggleCommentLike).toHaveBeenCalledWith('comment1');
        expect(mockOnLikeChange).toHaveBeenCalledWith(true, 4);
      });
    });
  });

  describe('Error Handling', () => {
    it('いいね操作が失敗した場合にエラーハンドリングされる', async () => {
      const user = userEvent.setup();
      const mockOnLikeChange = vi.fn();
      
      mockLikeService.toggleTaskLike.mockRejectedValue(new Error('API Error'));

      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={mockOnLikeChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledWith('task1');
        // エラー時はonLikeChangeが呼ばれない
        expect(mockOnLikeChange).not.toHaveBeenCalled();
      });
    });

    it('連続クリックが制御される', async () => {
      const user = userEvent.setup();
      const mockOnLikeChange = vi.fn();
      
      // 遅延を伴うPromiseを作成
      mockLikeService.toggleTaskLike.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={mockOnLikeChange}
        />
      );

      const button = screen.getByRole('button');
      
      // 連続でクリック
      await user.click(button);
      await user.click(button);
      await user.click(button);

      await waitFor(() => {
        // 最初のクリックのみ処理される
        expect(mockLikeService.toggleTaskLike).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Disabled State', () => {
    it('無効化された状態で表示される', () => {
      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={() => {}}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('無効化された状態ではクリックできない', async () => {
      const user = userEvent.setup();
      const mockOnLikeChange = vi.fn();

      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={mockOnLikeChange}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockLikeService.toggleTaskLike).not.toHaveBeenCalled();
      expect(mockOnLikeChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('適切なARIA属性が設定される', () => {
      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={true}
          initialCount={5}
          onLikeChange={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label');
    });

    it('ローディング中の状態が適切に表示される', async () => {
      const user = userEvent.setup();
      
      // 遅延を伴うPromiseを作成
      mockLikeService.toggleTaskLike.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      render(
        <LikeButton
          type="task"
          targetId="task1"
          initialLiked={false}
          initialCount={5}
          onLikeChange={() => {}}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // ローディング状態の確認
      expect(button).toHaveAttribute('data-loading', 'true');
    });
  });
});