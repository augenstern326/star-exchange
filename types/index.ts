// 用户类型
export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  isParent?: boolean;
  user_type?: 'parent' | 'child';
  totalStars?: number;
  star_balance?: number;
  parent_id?: string;
  nickname?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// 任务状态类型
export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// 任务类型
export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: TaskStatus;
  requiresApproval: boolean;
  requires_approval?: boolean;
  created_at: string;
  createdAt?: string;
  deadline_at: string | null;
  dueDate?: string;
  parent_id?: string;
  child_id?: string;
}

// 商品类型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  image?: string;
  createdAt?: string;
  created_at?: string;
  parent_id?: string;
  is_active?: boolean;
  sort_order?: number;
}

// 兑换记录类型
export interface Exchange {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

// 筛选类型
export type TaskFilter = 'all' | 'pending' | 'completed' | 'approved' | 'rejected';
export type ProductFilter = 'all' | 'in_stock' | 'out_of_stock';

// API响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// 搜索和筛选参数
export interface TaskSearchParams {
  keyword?: string;
  status?: TaskStatus;
  sortBy?: 'created_at' | 'deadline_at' | 'reward';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchParams {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'created_at' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

