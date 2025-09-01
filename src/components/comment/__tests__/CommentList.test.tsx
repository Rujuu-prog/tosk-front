import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { commentService } from '../../../lib/services/commentService';
import { Comment } from '../../../lib/types/comment';
import { CommentList } from '../CommentList';

// Mock the commentService
jest.mock('../../../lib/services/commentService', () => ({
  commentService: {
    getComments: jest.fn(),
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

const mockCommentService = commentService as jest.Mocked<typeof commentService>;

const mockComments: Comment[] = [
  {
    id: '1',
    taskId: 'task1',
    userId: 'user1',
    content: 'これは最初のコメントです',
    likeCount: 2,
    createdAt: '2025-08-31T10:00:00Z',
    updatedAt: '2025-08-31T10:00:00Z',
    authorUsername: 'testuser1',
    authorDisplayName: 'テストユーザー1',
    authorAvatarUrl: null,
  },
  {
    id: '2',
    taskId: 'task1',
    userId: 'user2',
    parentCommentId: '1',
    content: '返信コメントです',
    likeCount: 1,
    createdAt: '2025-08-31T11:00:00Z',
    updatedAt: '2025-08-31T11:00:00Z',
    authorUsername: 'testuser2',
    authorDisplayName: 'テストユーザー2',
    authorAvatarUrl: null,
  },
];

const mockCommentListResponse = {
  content: mockComments,
  pageable: {
    pageNumber: 0,
    pageSize: 20,
  },
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

describe('CommentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCommentService.getComments.mockResolvedValue(mockCommentListResponse);
  });

  it('コメント一覧が正しく表示される', async () => {
    render(<CommentList taskId="task1" />);
    
    // Loading state is shown first
    expect(screen.getByText('コメント読み込み中...')).toBeInTheDocument();
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
      expect(screen.getByText('返信コメントです')).toBeInTheDocument();
    });
    
    // Check author information
    expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    expect(screen.getByText('テストユーザー2')).toBeInTheDocument();
    
    // Check like counts
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('スレッド型コメント（親子関係）が正しく表示される', async () => {
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
    });
    
    // Check if reply comment is nested/indented
    const replyComment = screen.getByText('返信コメントです');
    const parentElement = replyComment.closest('[data-testid="comment-reply"]');
    expect(parentElement).toBeInTheDocument();
  });

  it('新しいコメントを作成できる', async () => {
    const user = userEvent.setup();
    const newComment: Comment = {
      id: '3',
      taskId: 'task1',
      userId: 'user1',
      content: '新しいコメント',
      likeCount: 0,
      createdAt: '2025-08-31T12:00:00Z',
      updatedAt: '2025-08-31T12:00:00Z',
      authorUsername: 'testuser1',
      authorDisplayName: 'テストユーザー1',
      authorAvatarUrl: null,
    };
    
    mockCommentService.createComment.mockResolvedValue(newComment);
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
    });
    
    // Fill and submit comment form
    const textarea = screen.getByPlaceholderText(/コメントを入力/i);
    await user.type(textarea, '新しいコメント');
    
    const submitButton = screen.getByRole('button', { name: /投稿|コメント/i });
    await user.click(submitButton);
    
    // Check if createComment was called with correct data
    await waitFor(() => {
      expect(mockCommentService.createComment).toHaveBeenCalledWith('task1', {
        content: '新しいコメント',
      });
    });
  });

  it('返信コメントを作成できる', async () => {
    const user = userEvent.setup();
    const replyComment: Comment = {
      id: '4',
      taskId: 'task1',
      userId: 'user1',
      parentCommentId: '1',
      content: '返信します',
      likeCount: 0,
      createdAt: '2025-08-31T12:00:00Z',
      updatedAt: '2025-08-31T12:00:00Z',
      authorUsername: 'testuser1',
      authorDisplayName: 'テストユーザー1',
      authorAvatarUrl: null,
    };
    
    mockCommentService.createComment.mockResolvedValue(replyComment);
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
    });
    
    // Click reply button on first comment
    const replyButtons = screen.getAllByRole('button', { name: /返信/i });
    await user.click(replyButtons[0]);
    
    // Fill reply form
    const replyTextarea = screen.getByPlaceholderText(/返信を入力/i);
    await user.type(replyTextarea, '返信します');
    
    const submitReplyButton = screen.getByRole('button', { name: /返信投稿/i });
    await user.click(submitReplyButton);
    
    // Check if createComment was called with parentCommentId
    await waitFor(() => {
      expect(mockCommentService.createComment).toHaveBeenCalledWith('task1', {
        content: '返信します',
        parentCommentId: '1',
      });
    });
  });

  it('コメントを編集できる', async () => {
    const user = userEvent.setup();
    const updatedComment: Comment = {
      ...mockComments[0],
      content: '編集されたコメント',
      updatedAt: '2025-08-31T13:00:00Z',
    };
    
    mockCommentService.updateComment.mockResolvedValue(updatedComment);
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
    });
    
    // Click edit button (assuming it exists for own comments)
    const editButtons = screen.getAllByRole('button', { name: /編集/i });
    await user.click(editButtons[0]);
    
    // Edit comment content
    const editTextarea = screen.getByDisplayValue('これは最初のコメントです');
    await user.clear(editTextarea);
    await user.type(editTextarea, '編集されたコメント');
    
    const saveButton = screen.getByRole('button', { name: /保存/i });
    await user.click(saveButton);
    
    // Check if updateComment was called
    await waitFor(() => {
      expect(mockCommentService.updateComment).toHaveBeenCalledWith('1', {
        content: '編集されたコメント',
      });
    });
  });

  it('コメントを削除できる', async () => {
    const user = userEvent.setup();
    mockCommentService.deleteComment.mockResolvedValue();
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
    });
    
    // Click delete button (assuming it exists for own comments)
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    await user.click(deleteButtons[0]);
    
    // Confirm deletion if confirmation dialog exists
    const confirmButton = screen.queryByRole('button', { name: /確認|削除する/i });
    if (confirmButton) {
      await user.click(confirmButton);
    }
    
    // Check if deleteComment was called
    await waitFor(() => {
      expect(mockCommentService.deleteComment).toHaveBeenCalledWith('1');
    });
  });

  it('コメントが存在しない場合の表示', async () => {
    mockCommentService.getComments.mockResolvedValue({
      ...mockCommentListResponse,
      content: [],
      totalElements: 0,
    });
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/コメントはまだありません/i)).toBeInTheDocument();
    });
  });

  it('エラー時の表示', async () => {
    mockCommentService.getComments.mockRejectedValue(new Error('API Error'));
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/コメントの読み込みでエラーが発生/i)).toBeInTheDocument();
    });
  });

  it('ページネーションが正しく動作する', async () => {
    const mockPaginatedResponse = {
      ...mockCommentListResponse,
      totalPages: 2,
      last: false,
    };
    
    mockCommentService.getComments.mockResolvedValue(mockPaginatedResponse);
    
    render(<CommentList taskId="task1" />);
    
    await waitFor(() => {
      expect(screen.getByText('これは最初のコメントです')).toBeInTheDocument();
    });
    
    // Check if "もっと見る" button is present
    const loadMoreButton = screen.queryByRole('button', { name: /もっと見る|次のページ/i });
    if (loadMoreButton) {
      await userEvent.click(loadMoreButton);
      
      await waitFor(() => {
        expect(mockCommentService.getComments).toHaveBeenCalledWith('task1', 1, 20);
      });
    }
  });
});