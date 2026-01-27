// In-memory data store for Star Book application
// This can be replaced with a real database (MySQL, PostgreSQL, etc.)

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  passwordHash: string;
  userType: 'parent' | 'child';
  parentId?: string;
  totalStars: number;
  childName?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number; // stars to reward
  penalty?: number; // stars to deduct
  requiresApproval: boolean;
  parentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  childId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // stars cost
  image?: string;
  inventory: number;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exchange {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  totalCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface StarTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'task_reward' | 'task_penalty' | 'direct_reward' | 'direct_penalty' | 'exchange';
  description: string;
  taskId?: string;
  exchangeId?: string;
  createdAt: Date;
}

// Import crypto for password hashing
import { hashPassword } from './crypto';

// In-memory storage
let users: User[] = [
  {
    id: 'parent1',
    username: 'parent1',
    name: '爸爸',
    email: 'dad@example.com',
    passwordHash: hashPassword('password123'),
    userType: 'parent',
    totalStars: 0,
    createdAt: new Date(),
  },
  {
    id: 'child1',
    username: 'child1',
    name: '小明',
    passwordHash: hashPassword('child123'),
    userType: 'child',
    parentId: 'parent1',
    totalStars: 50,
    childName: '小明',
    createdAt: new Date(),
  },
];

let tasks: Task[] = [
  {
    id: 'task1',
    title: '做完作业',
    description: '完成今天的数学作业',
    reward: 10,
    requiresApproval: true,
    parentId: 'parent1',
    status: 'pending',
    childId: 'child1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let products: Product[] = [
  {
    id: 'prod1',
    name: '小玩具',
    description: '可爱的小玩具',
    price: 20,
    inventory: 5,
    parentId: 'parent1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let exchanges: Exchange[] = [];
let starTransactions: StarTransaction[] = [];

// User operations
export const UserStore = {
  getAll: () => users,
  getById: (id: string) => users.find(u => u.id === id),
  getByEmail: (email: string) => users.find(u => u.email === email),
  getByUsername: (username: string) => users.find(u => u.username === username),
  getFirstChild: () => users.find(u => u.userType === 'child'),
  getChildrenByParent: (parentId: string) => users.filter(u => u.userType === 'child' && u.parentId === parentId),
  create: (user: User) => {
    users.push(user);
    return user;
  },
  update: (id: string, updates: Partial<User>) => {
    const user = users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  },
  updateStars: (id: string, amount: number) => {
    const user = users.find(u => u.id === id);
    if (user) {
      user.totalStars += amount;
    }
    return user;
  },
};

// Task operations
export const TaskStore = {
  getAll: () => tasks,
  getByParent: (parentId: string) => tasks.filter(t => t.parentId === parentId),
  getByChild: (childId: string) => tasks.filter(t => t.childId === childId),
  getById: (id: string) => tasks.find(t => t.id === id),
  create: (task: Task) => {
    tasks.push(task);
    return task;
  },
  update: (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, { ...updates, updatedAt: new Date() });
    }
    return task;
  },
  delete: (id: string) => {
    tasks = tasks.filter(t => t.id !== id);
  },
};

// Product operations
export const ProductStore = {
  getAll: () => products,
  getByParent: (parentId: string) => products.filter(p => p.parentId === parentId),
  getById: (id: string) => products.find(p => p.id === id),
  create: (product: Product) => {
    products.push(product);
    return product;
  },
  update: (id: string, updates: Partial<Product>) => {
    const product = products.find(p => p.id === id);
    if (product) {
      Object.assign(product, { ...updates, updatedAt: new Date() });
    }
    return product;
  },
  delete: (id: string) => {
    products = products.filter(p => p.id !== id);
  },
};

// Exchange operations
export const ExchangeStore = {
  getAll: () => exchanges,
  getById: (id: string) => exchanges.find(e => e.id === id),
  getByUser: (userId: string) => exchanges.filter(e => e.userId === userId),
  create: (exchange: Exchange) => {
    exchanges.push(exchange);
    return exchange;
  },
  update: (id: string, updates: Partial<Exchange>) => {
    const exchange = exchanges.find(e => e.id === id);
    if (exchange) {
      Object.assign(exchange, { ...updates, updatedAt: new Date() });
    }
    return exchange;
  },
};

// Star Transaction operations
export const TransactionStore = {
  getAll: () => starTransactions,
  getByUser: (userId: string) => starTransactions.filter(t => t.userId === userId),
  create: (transaction: StarTransaction) => {
    starTransactions.push(transaction);
    return transaction;
  },
};
