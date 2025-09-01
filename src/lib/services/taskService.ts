import { CreateTaskRequest, Task, TaskFilters, TaskListResponse,UpdateTaskRequest } from '../types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Mock data for testing
const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'プロジェクト企画書作成',
    description: '新規プロジェクトの企画書を作成する',
    dueDate: '2025-09-15',
    priority: 'HIGH',
    visibility: 'TEAM',
    likeCount: 3,
    commentCount: 2,
    createdAt: '2025-08-31T08:00:00Z',
    updatedAt: '2025-08-31T08:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    title: 'デザインレビュー',
    description: 'UIデザインのレビューを行う',
    priority: 'MEDIUM',
    visibility: 'PRIVATE',
    likeCount: 1,
    commentCount: 0,
    createdAt: '2025-08-31T09:00:00Z',
    updatedAt: '2025-08-31T09:00:00Z',
  },
];

class TaskService {
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}/api/tasks${endpoint}`;
    
    return fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  async getTasks(filters: TaskFilters = {}): Promise<TaskListResponse> {
    if (USE_MOCK) {
      // Mock implementation with filtering
      let filteredTasks = [...mockTasks];
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(keyword) ||
          task.description?.toLowerCase().includes(keyword)
        );
      }
      
      if (filters.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
      
      if (filters.visibility) {
        filteredTasks = filteredTasks.filter(task => task.visibility === filters.visibility);
      }
      
      // Simulate pagination
      const page = filters.page || 0;
      const size = filters.size || 20;
      const start = page * size;
      const end = start + size;
      const paginatedTasks = filteredTasks.slice(start, end);
      
      return {
        content: paginatedTasks,
        pageable: {
          pageNumber: page,
          pageSize: size,
        },
        totalElements: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / size),
        first: page === 0,
        last: end >= filteredTasks.length,
      };
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    // デバッグ用ログ
    console.log('TaskService.getTasks - filters:', filters);
    console.log('TaskService.getTasks - params:', params.toString());
    console.log('TaskService.getTasks - URL:', `${API_BASE_URL}/api/tasks?${params.toString()}`);

    try {
      const response = await this.apiCall(`?${params.toString()}`);
      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。');
        } else if (response.status >= 400) {
          throw new Error('リクエストが無効です。');
        }
        throw new Error(`タスクの取得に失敗しました (${response.status})`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できません。インターネット接続を確認してください。');
      }
      throw error;
    }
  }

  async getTask(taskId: string): Promise<Task> {
    if (USE_MOCK) {
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    }

    const response = await this.apiCall(`/${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    return response.json();
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    if (USE_MOCK) {
      const newTask: Task = {
        id: String(mockTasks.length + 1),
        userId: 'user1',
        ...taskData,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return newTask;
    }

    const response = await this.apiCall('', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    return response.json();
  }

  async updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<Task> {
    if (USE_MOCK) {
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      const updatedTask = {
        ...mockTasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString(),
      };
      mockTasks[taskIndex] = updatedTask;
      return updatedTask;
    }

    const response = await this.apiCall(`/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return response.json();
  }

  async deleteTask(taskId: string): Promise<void> {
    if (USE_MOCK) {
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      mockTasks.splice(taskIndex, 1);
      return;
    }

    const response = await this.apiCall(`/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  }
}

export const taskService = new TaskService();