# 数据库设置指南

本应用已迁移为完全数据库驱动，不再使用任何 mock 数据或客户端存储。所有数据都存储在 Neon PostgreSQL 数据库中。

## 前置要求

- Neon PostgreSQL 数据库（通过 DATABASE_URL 环境变量连接）
- 已安装的 Node.js 和 npm

## 设置步骤

### 1. 创建数据库表

执行 `scripts/01-init-database.sql` 中的 SQL 脚本来创建所有必要的表和索引：

```sql
-- 在 Neon 的 SQL Editor 中执行以下脚本
-- 复制 scripts/01-init-database.sql 文件的全部内容并执行
```

### 2. 创建用户

数据库初始化完成后，使用 SQL INSERT 语句创建用户。应用系统只支持 **一个小孩用户**。

#### 创建父母用户

```sql
INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
VALUES ('parent1', 'parent@example.com', '[bcrypt_hashed_password]', 'parent', '爸爸', 0);
```

#### 创建小孩用户

```sql
INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, star_balance)
VALUES ('child1', 'child@example.com', '[bcrypt_hashed_password]', 'child', 1, '小明', 50);
```

**注意：** `parent_id` 应该是上面创建的父母用户的 ID。

### 3. 密码哈希

密码必须使用 bcrypt 进行哈希处理。你可以使用以下方法生成哈希密码：

#### 使用在线工具
访问 [bcrypt.online](https://bcrypt.online/) 并输入你的密码来生成哈希。

#### 使用 Node.js

```javascript
const bcrypt = require('bcryptjs');

// 生成盐
const salt = bcrypt.genSaltSync(10);
// 哈希密码
const hashedPassword = bcrypt.hashSync('your_password', salt);
console.log(hashedPassword);
```

#### 使用 Python

```python
import bcrypt

password = 'your_password'
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password.encode(), salt)
print(hashed_password.decode())
```

### 4. 创建任务和商品

登录后，父母用户可以通过以下 API 或管理界面创建：
- 任务（Tasks）
- 商品（Products）

数据库中也可以手动插入：

#### 创建任务

```sql
INSERT INTO tasks (parent_id, child_id, title, description, reward_stars, status, requires_approval)
VALUES (1, 2, '做完作业', '完成今天的数学作业', 10, 'pending', true);
```

#### 创建商品

```sql
INSERT INTO products (parent_id, name, description, price_stars, stock_quantity, is_active)
VALUES (1, '小玩具', '可爱的小玩具', 20, 5, true);
```

## 系统架构

- **前端**: Next.js 应用程序
- **数据库**: Neon PostgreSQL
- **认证**: 基于 bcrypt 密码哈希的数据库认证
- **默认用户**: 系统自动加载第一个（唯一的）小孩用户

## 主要 API 端点

### 认证
- `POST /api/auth/login` - 用户登录

### 用户
- `GET /api/users` - 获取所有用户
- `GET /api/users/default-child` - 获取默认小孩用户

### 任务
- `GET /api/tasks` - 获取任务列表（支持 `parentId` 和 `childId` 参数）

### 商品
- `GET /api/products` - 获取商品列表（支持 `parentId` 参数）

### 兑换
- `GET /api/exchanges` - 获取兑换记录

### 交易
- `GET /api/transactions` - 获取星星交易记录

## 环境变量

确保在你的 Vercel 项目中设置 `DATABASE_URL` 环境变量：

```
DATABASE_URL=postgresql://user:password@host/database
```

## 常见问题

**Q: 如何修改小孩的星星余额？**  
A: 使用 SQL UPDATE 语句：
```sql
UPDATE users SET star_balance = 75 WHERE username = 'child1';
```

**Q: 如何删除任务或商品？**  
A: 在数据库中直接删除或标记为非活跃状态：
```sql
-- 删除任务
DELETE FROM tasks WHERE id = 1;

-- 或将商品标记为非活跃
UPDATE products SET is_active = false WHERE id = 1;
```

**Q: 系统可以支持多个小孩吗？**  
A: 当前系统的前端设计针对单个小孩。如果需要支持多个小孩，需要修改前端逻辑来允许小孩选择。

## 故障排除

如果在加载小孩数据时出现 404 错误，请检查：
1. 数据库连接是否正确（DATABASE_URL）
2. 是否已创建至少一个 `user_type = 'child'` 的用户
3. Neon 数据库中是否成功创建了所有表

## 下一步

1. 创建数据库和表
2. 创建父母和小孩用户
3. 创建一些初始任务和商品
4. 在应用中测试登录和数据加载
