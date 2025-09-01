import { Like } from '../types/like';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Mock data for testing
const mockLikes: Like[] = [];

class LikeService {
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

  async toggleTaskLike(taskId: string): Promise<Like | null> {
    if (USE_MOCK) {
      // Check if like exists
      const existingLikeIndex = mockLikes.findIndex(
        like => like.targetId === taskId && like.targetType === 'TASK' && like.userId === 'user1'
      );

      if (existingLikeIndex !== -1) {
        // Remove like
        mockLikes.splice(existingLikeIndex, 1);
        return null;
      } else {
        // Add like
        const newLike: Like = {
          id: String(mockLikes.length + 1),
          userId: 'user1',
          targetType: 'TASK',
          targetId: taskId,
          createdAt: new Date().toISOString(),
        };
        mockLikes.push(newLike);
        return newLike;
      }
    }

    const response = await this.apiCall(`/tasks/${taskId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle task like');
    }

    const result = await response.json();
    return result || null;
  }

  async toggleCommentLike(commentId: string): Promise<Like | null> {
    if (USE_MOCK) {
      // Check if like exists
      const existingLikeIndex = mockLikes.findIndex(
        like => like.targetId === commentId && like.targetType === 'COMMENT' && like.userId === 'user1'
      );

      if (existingLikeIndex !== -1) {
        // Remove like
        mockLikes.splice(existingLikeIndex, 1);
        return null;
      } else {
        // Add like
        const newLike: Like = {
          id: String(mockLikes.length + 1),
          userId: 'user1',
          targetType: 'COMMENT',
          targetId: commentId,
          createdAt: new Date().toISOString(),
        };
        mockLikes.push(newLike);
        return newLike;
      }
    }

    const response = await this.apiCall(`/comments/${commentId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle comment like');
    }

    const result = await response.json();
    return result || null;
  }

  async deleteLike(likeId: string): Promise<void> {
    if (USE_MOCK) {
      const likeIndex = mockLikes.findIndex(like => like.id === likeId);
      if (likeIndex === -1) {
        throw new Error('Like not found');
      }
      mockLikes.splice(likeIndex, 1);
      return;
    }

    const response = await this.apiCall(`/likes/${likeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete like');
    }
  }
}

export const likeService = new LikeService();