-- Star Book Database Initialization Script
-- Execute this script manually in your Neon PostgreSQL database
-- This script creates all necessary tables and indexes.
-- You will need to manually insert user data using SQL INSERT statements.

-- Users table (for both parents and children)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL DEFAULT 'child' CHECK (user_type IN ('parent', 'child')),
  parent_id BIGINT,
  nickname VARCHAR(100),
  avatar_url VARCHAR(255),
  star_balance INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_username ON users(username);

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT NOT NULL,
  child_id BIGINT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  reward_stars INT NOT NULL,
  task_type VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (task_type IN ('normal', 'direct_reward', 'deduct')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  requires_approval BOOLEAN DEFAULT TRUE,
  deadline_at TIMESTAMP,
  completed_at TIMESTAMP,
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_parent_child ON tasks(parent_id, child_id);
CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON tasks(created_at);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  price_stars INT NOT NULL,
  stock_quantity INT DEFAULT 0,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 兑换记录表
CREATE TABLE IF NOT EXISTS exchanges (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  stars_used INT NOT NULL,
  quantity INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exchanges_child_id ON exchanges(child_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_created_at ON exchanges(created_at);

-- 星星交易记录表（日志）
CREATE TABLE IF NOT EXISTS star_transactions (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL,
  parent_id BIGINT,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('task_completed', 'task_approved', 'exchange', 'manual_add', 'manual_deduct')),
  amount INT NOT NULL,
  reference_type VARCHAR(50),
  reference_id BIGINT,
  description VARCHAR(500),
  balance_after INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_child_status ON tasks(child_id, status);
CREATE INDEX IF NOT EXISTS idx_exchanges_product ON exchanges(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_child ON star_transactions(child_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON star_transactions(transaction_type);

-- Database initialization complete!
-- 
-- IMPORTANT: You must now create users manually using SQL INSERT statements.
-- 
-- Example 1: Create a parent user
INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
VALUES ('htt', 'htt@example.com', '3ae3806906f0ed98a6fb7e84a00e89785fa3049457394d2b48a5e62a883c50b06af8f799f1ae154f57b6f6f21534977299488c1c3c3e27b5e7c19f4a3d4ad5ba', 'parent', '胡婷婷', 0);
--
-- Example 2: Create a child user (replace parent_user_id with actual parent ID)
INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, star_balance)
VALUES ('fyq', 'fyq@example.com', '3ae3806906f0ed98a6fb7e84a00e89785fa3049457394d2b48a5e62a883c50b06af8f799f1ae154f57b6f6f21534977299488c1c3c3e27b5e7c19f4a3d4ad5ba', 'child', 1, '方佑琪', 0);
--
-- Password hashing: Use bcrypt to hash passwords before storing them.
-- The application expects bcrypt-hashed passwords in the password_hash field.
