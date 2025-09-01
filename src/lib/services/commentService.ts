import { Comment, CommentListResponse,CreateCommentRequest, UpdateCommentRequest } from '../types/comment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Mock data for testing
const mockComments: Comment[] = [
  {
    id: '1',
    taskId: '1',
    userId: 'user1',
    content: 'これはとても良いタスクですね！',
    likeCount: 2,
    createdAt: '2025-08-31T10:00:00Z',
    updatedAt: '2025-08-31T10:00:00Z',
    authorUsername: 'testuser',
    authorDisplayName: 'テストユーザー',
    authorAvatarUrl: null,
  },
  {
    id: '2',
    taskId: '1',
    userId: 'user2',
    parentCommentId: '1',
    content: 'ありがとうございます！頑張ります。',
    likeCount: 1,
    createdAt: '2025-08-31T11:00:00Z',
    updatedAt: '2025-08-31T11:00:00Z',
    authorUsername: 'user2',
    authorDisplayName: 'ユーザー2',
    authorAvatarUrl: null,
  },
];

class CommentService {
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    return fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  async getComments(taskId: string, page = 0, size = 20): Promise<CommentListResponse> {
    if (USE_MOCK) {
      const taskComments = mockComments.filter(comment => comment.taskId === taskId);
      const start = page * size;
      const end = start + size;
      const paginatedComments = taskComments.slice(start, end);
      
      return {
        content: paginatedComments,
        pageable: {
          pageNumber: page,
          pageSize: size,
        },
        totalElements: taskComments.length,
        totalPages: Math.ceil(taskComments.length / size),
        first: page === 0,
        last: end >= taskComments.length,
      };
    }

    const response = await this.apiCall(`/tasks/${taskId}/comments?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  }

  async createComment(taskId: string, commentData: CreateCommentRequest): Promise<Comment> {
    if (USE_MOCK) {
      const newComment: Comment = {
        id: String(mockComments.length + 1),
        taskId,
        userId: 'user1',
        ...commentData,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorUsername: 'testuser',
        authorDisplayName: 'テストユーザー',
        authorAvatarUrl: null,
      };
      mockComments.push(newComment);
      return newComment;
    }

    const response = await this.apiCall(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create comment');
    }

    return response.json();
  }

  async updateComment(commentId: string, commentData: UpdateCommentRequest): Promise<Comment> {
    if (USE_MOCK) {
      const commentIndex = mockComments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }
      
      const updatedComment = {
        ...mockComments[commentIndex],
        ...commentData,
        updatedAt: new Date().toISOString(),
      };
      mockComments[commentIndex] = updatedComment;
      return updatedComment;
    }

    const response = await this.apiCall(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }

    return response.json();
  }

  async deleteComment(commentId: string): Promise<void> {
    if (USE_MOCK) {
      const commentIndex = mockComments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }
      mockComments.splice(commentIndex, 1);
      return;
    }

    const response = await this.apiCall(`/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  }
}

export const commentService = new CommentService();