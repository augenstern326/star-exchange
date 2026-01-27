// Database-driven data store for Star Book application
// All data is stored in the database via Neon PostgreSQL

import { sql } from './db';

// Database type interfaces
export interface User {
  id: number;
  username: string;
  email?: string;
  password_hash: string;
  user_type: 'parent' | 'child';
  parent_id?: number;
  nickname?: string;
  avatar_url?: string;
  star_balance: number;
  total_earned: number;
  total_spent: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  parent_id: number;
  child_id?: number;
  title: string;
  description?: string;
  image_url?: string;
  reward_stars: number;
  task_type: 'normal' | 'direct_reward' | 'deduct';
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  requires_approval: boolean;
  deadline_at?: Date;
  completed_at?: Date;
  approved_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  parent_id: number;
  name: string;
  description?: string;
  image_url?: string;
  price_stars: number;
  stock_quantity: number;
  category?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Exchange {
  id: number;
  child_id: number;
  product_id: number;
  stars_used: number;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StarTransaction {
  id: number;
  child_id: number;
  parent_id?: number;
  transaction_type: 'task_completed' | 'task_approved' | 'exchange' | 'manual_add' | 'manual_deduct';
  amount: number;
  reference_type?: string;
  reference_id?: number;
  description?: string;
  balance_after?: number;
  created_at: Date;
}

// User operations
export const UserStore = {
  getAll: async () => {
    return await sql`SELECT * FROM users ORDER BY created_at DESC`;
  },

  getById: async (id: number) => {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  },

  getByUsername: async (username: string) => {
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    return result[0] || null;
  },

  getByEmail: async (email: string) => {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },

  // Get the first (and typically only) child user
  getFirstChild: async () => {
    const result = await sql`SELECT * FROM users WHERE user_type = 'child' LIMIT 1`;
    return result[0] || null;
  },

  getChildrenByParent: async (parentId: number) => {
    return await sql`SELECT * FROM users WHERE user_type = 'child' AND parent_id = ${parentId} ORDER BY created_at`;
  },

  update: async (id: number, updates: Partial<User>) => {
    const fields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    if (!fields) return null;

    const result = await sql`
      UPDATE users 
      SET ${sql.raw(fields)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  },
};

// Task operations
export const TaskStore = {
  getAll: async () => {
    return await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
  },

  getByParent: async (parentId: number) => {
    return await sql`SELECT * FROM tasks WHERE parent_id = ${parentId} ORDER BY created_at DESC`;
  },

  getByChild: async (childId: number) => {
    return await sql`SELECT * FROM tasks WHERE child_id = ${childId} ORDER BY created_at DESC`;
  },

  getById: async (id: number) => {
    const result = await sql`SELECT * FROM tasks WHERE id = ${id}`;
    return result[0] || null;
  },

  create: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await sql`
      INSERT INTO tasks (parent_id, child_id, title, description, image_url, reward_stars, task_type, status, requires_approval, deadline_at, notes)
      VALUES (${task.parent_id}, ${task.child_id || null}, ${task.title}, ${task.description || null}, ${task.image_url || null}, ${task.reward_stars}, ${task.task_type}, ${task.status}, ${task.requires_approval}, ${task.deadline_at || null}, ${task.notes || null})
      RETURNING *
    `;
    return result[0] || null;
  },

  update: async (id: number, updates: Partial<Task>) => {
    const fields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    if (!fields) return null;

    const result = await sql`
      UPDATE tasks 
      SET ${sql.raw(fields)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  },
};

// Product operations
export const ProductStore = {
  getAll: async () => {
    return await sql`SELECT * FROM products WHERE is_active = true ORDER BY sort_order, created_at DESC`;
  },

  getByParent: async (parentId: number) => {
    return await sql`SELECT * FROM products WHERE parent_id = ${parentId} ORDER BY sort_order, created_at DESC`;
  },

  getById: async (id: number) => {
    const result = await sql`SELECT * FROM products WHERE id = ${id}`;
    return result[0] || null;
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await sql`
      INSERT INTO products (parent_id, name, description, image_url, price_stars, stock_quantity, category, is_active, sort_order)
      VALUES (${product.parent_id}, ${product.name}, ${product.description || null}, ${product.image_url || null}, ${product.price_stars}, ${product.stock_quantity}, ${product.category || null}, ${product.is_active}, ${product.sort_order})
      RETURNING *
    `;
    return result[0] || null;
  },

  update: async (id: number, updates: Partial<Product>) => {
    const fields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    if (!fields) return null;

    const result = await sql`
      UPDATE products 
      SET ${sql.raw(fields)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  },
};

// Exchange operations
export const ExchangeStore = {
  getAll: async () => {
    return await sql`SELECT * FROM exchanges ORDER BY created_at DESC`;
  },

  getById: async (id: number) => {
    const result = await sql`SELECT * FROM exchanges WHERE id = ${id}`;
    return result[0] || null;
  },

  getByChild: async (childId: number) => {
    return await sql`SELECT * FROM exchanges WHERE child_id = ${childId} ORDER BY created_at DESC`;
  },

  create: async (exchange: Omit<Exchange, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await sql`
      INSERT INTO exchanges (child_id, product_id, stars_used, quantity, status, notes)
      VALUES (${exchange.child_id}, ${exchange.product_id}, ${exchange.stars_used}, ${exchange.quantity}, ${exchange.status}, ${exchange.notes || null})
      RETURNING *
    `;
    return result[0] || null;
  },

  update: async (id: number, updates: Partial<Exchange>) => {
    const fields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    if (!fields) return null;

    const result = await sql`
      UPDATE exchanges 
      SET ${sql.raw(fields)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  },
};

// Star Transaction operations
export const TransactionStore = {
  getAll: async () => {
    return await sql`SELECT * FROM star_transactions ORDER BY created_at DESC`;
  },

  getByChild: async (childId: number) => {
    return await sql`SELECT * FROM star_transactions WHERE child_id = ${childId} ORDER BY created_at DESC`;
  },

  create: async (transaction: Omit<StarTransaction, 'id' | 'created_at'>) => {
    const result = await sql`
      INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type, reference_id, description, balance_after)
      VALUES (${transaction.child_id}, ${transaction.parent_id || null}, ${transaction.transaction_type}, ${transaction.amount}, ${transaction.reference_type || null}, ${transaction.reference_id || null}, ${transaction.description || null}, ${transaction.balance_after || null})
      RETURNING *
    `;
    return result[0] || null;
  },
};
