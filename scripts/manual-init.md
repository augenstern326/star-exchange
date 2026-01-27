# 手动初始化 Neon 数据库

如果自动初始化不工作，可以使用以下步骤手动初始化数据库。

## 方法 1: 使用 API 端点（推荐）

### 在浏览器中访问

访问以下 URL（将 `YOUR_DOMAIN` 替换为你的 Vercel URL 或本地地址）：

\`\`\`
POST http://YOUR_DOMAIN/api/init
\`\`\`

使用 curl 命令：

\`\`\`bash
curl -X POST http://localhost:3000/api/init
\`\`\`

使用 fetch：

\`\`\`javascript
fetch('/api/init', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
\`\`\`

## 方法 2: 直接在 Neon 控制台运行 SQL

1. 登录 [Neon Console](https://console.neon.tech)
2. 选择你的项目
3. 点击"SQL Editor"
4. 将以下 SQL 复制到编辑器中并执行：

\`\`\`sql
-- 创建 users 表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_username ON users(username);

-- 创建 tasks 表
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

-- 创建 products 表
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

-- 创建 exchanges 表
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

-- 创建 star_transactions 表
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

CREATE INDEX IF NOT EXISTS idx_transactions_child ON star_transactions(child_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON star_transactions(transaction_type);

-- 插入演示用户
-- 家长账号: username=parent1, password=password123 (hashed)
-- 小孩账号: username=child1, password=child123 (hashed)
INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
VALUES ('parent1', 'dad@example.com', 'pbkdf2_sha512$1000$6fd5b9ec7a8faea1f4b7d9b1e2a3c4d5$8c9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f', 'parent', '爸爸', 0),
('child1', 'child@example.com', 'pbkdf2_sha512$1000$7ae6c0fdb8fbgbf2g5c8e0c2f3b4d5e6$9d0g1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f0', 'child', '小明', 50)
ON CONFLICT (username) DO NOTHING;

-- 为 child1 设置 parent_id
UPDATE users SET parent_id = (SELECT id FROM users WHERE username = 'parent1')
WHERE username = 'child1';
\`\`\`

**注意**: 上面的密码哈希是示例。为了设置正确的哈希密码，建议使用 API 端点方法。

## 方法 3: 使用 Node.js 脚本

运行 seed 脚本（需要 Node.js 和 ts-node）：

\`\`\`bash
# 首先设置环境变量
export DATABASE_URL="postgresql://user:password@host/database"

# 运行 seed 脚本
npx ts-node scripts/seed-database.ts
\`\`\`

## 验证初始化

初始化完成后，可以验证数据库：

\`\`\`sql
-- 检查表是否已创建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 检查用户
SELECT id, username, user_type, nickname FROM users;

-- 检查索引
SELECT indexname FROM pg_indexes 
WHERE tablename = 'users';
\`\`\`

## 重置数据库

如果需要重置演示数据：

\`\`\`sql
-- 删除所有数据（但保留表结构）
TRUNCATE TABLE star_transactions CASCADE;
TRUNCATE TABLE exchanges CASCADE;
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE users CASCADE;

-- 然后重新运行插入演示用户的 SQL
-- (见上面的 SQL 代码)
\`\`\`

或者删除整个数据库并重新创建（生产环境不推荐）：

\`\`\`sql
-- 谨慎：这会删除所有表和数据
DROP TABLE IF EXISTS star_transactions CASCADE;
DROP TABLE IF EXISTS exchanges CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
\`\`\`

## 故障排除

### 连接错误

\`\`\`
Error: connect ECONNREFUSED
\`\`\`

**解决方案**: 检查 DATABASE_URL 是否正确设置。

### 权限错误

\`\`\`
ERROR: permission denied for schema public
\`\`\`

**解决方案**: 确保你的 Neon 用户有创建表的权限。

### 表已存在

\`\`\`
ERROR: relation "users" already exists
\`\`\`

**解决方案**: 这是正常的，脚本使用了 `IF NOT EXISTS`。如果需要重置，先删除表。

## 更多信息

- [Neon SQL Editor 文档](https://neon.tech/docs/get-started-with-neon/query-with-psql-editor)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
