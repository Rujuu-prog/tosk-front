export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentListResponse {
  content: Comment[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}