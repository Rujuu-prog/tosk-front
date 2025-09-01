export type LikeTargetType = 'TASK' | 'COMMENT';

export interface Like {
  id: string;
  userId: string;
  targetType: LikeTargetType;
  targetId: string;
  createdAt: string;
}