export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Visibility = 'PRIVATE' | 'TEAM' | 'PUBLIC';

export interface Task {
  id: string;
  userId: string;
  teamId?: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD format
  priority: Priority;
  visibility: Visibility;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  teamId?: string;
  priority: Priority;
  visibility: Visibility;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  visibility: Visibility;
}

export interface TaskFilters {
  keyword?: string;
  priority?: Priority;
  visibility?: Visibility;
  dueDateStart?: string;
  dueDateEnd?: string;
  teamId?: string;
  myTasksOnly?: boolean;
  page?: number;
  size?: number;
}

export interface TaskListResponse {
  content: Task[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}