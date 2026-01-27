# 迁移验证检查清单

完成以下步骤以验证迁移成功。

## 第一步：数据库设置

- [ ] 在 Neon 中创建 PostgreSQL 数据库
- [ ] 复制 `DATABASE_URL` 并在 Vercel 项目中设置环境变量
- [ ] 在 Neon SQL Editor 中执行 `scripts/01-init-database.sql`
- [ ] 验证所有表已成功创建（查询 `\dt` 或检查表列表）

## 第二步：创建测试用户

### 密码哈希

首先，为你的密码生成 bcrypt 哈希值。可以使用：

1. **在线工具**: https://bcrypt.online/
   - 输入密码：`password123` 或任何你喜欢的密码
   - 复制生成的哈希值

2. **或使用 Node.js**:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```

3. **或使用 Python**:
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode())"
```

### 创建用户

在 Neon SQL Editor 中执行以下 SQL（用实际的哈希值替换 `[HASH_HERE]`）：

```sql
-- 创建父母用户
INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
VALUES ('parent1', 'parent@example.com', '[HASH_HERE]', 'parent', '爸爸', 0);

-- 创建小孩用户（注意：parent_id = 1 是刚创建的父母用户的 ID）
INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, star_balance)
VALUES ('child1', 'child@example.com', '[HASH_HERE]', 'child', 1, '小明', 50);
```

- [ ] 父母用户已创建
- [ ] 小孩用户已创建
- [ ] 验证数据：`SELECT * FROM users;`

## 第三步：验证应用功能

### 启动应用
```bash
npm run dev
```

- [ ] 应用启动无错误
- [ ] 访问 http://localhost:3000/ 
- [ ] 主页显示小孩用户数据（"小明的星星存折"）
- [ ] 显示星星余额 50

### 验证登录

1. 访问 http://localhost:3000/login
2. 点击"小孩"标签
3. 输入用户名：`child1`
4. 输入密码：你之前哈希的密码（例如 `password123`）
5. 点击"小孩登录"

- [ ] 登录成功
- [ ] 重定向到 `/child/tasks` 页面
- [ ] 页面加载正确的数据

### 验证 API 端点

使用 curl 或 Postman 测试以下端点：

#### 获取默认小孩用户
```bash
curl http://localhost:3000/api/users/default-child
```

- [ ] 返回 200 状态码
- [ ] 返回小孩用户数据

**预期响应:**
```json
{
  "id": 2,
  "username": "child1",
  "user_type": "child",
  "nickname": "小明",
  "star_balance": 50,
  ...
}
```

#### 测试登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"child1","password":"password123","userType":"child"}'
```

- [ ] 返回 200 状态码
- [ ] 响应包含用户数据（不含密码哈希）

**预期响应:**
```json
{
  "success": true,
  "user": {
    "id": "2",
    "username": "child1",
    "userType": "child",
    "nickname": "小明",
    "totalStars": 50,
    ...
  }
}
```

#### 获取任务列表
```bash
curl "http://localhost:3000/api/tasks?childId=2"
```

- [ ] 返回 200 状态码
- [ ] 返回任务数组（可能为空）

#### 获取商品列表
```bash
curl http://localhost:3000/api/products
```

- [ ] 返回 200 状态码
- [ ] 返回商品数组（可能为空）

## 第四步：创建测试数据（可选）

### 创建任务

```sql
INSERT INTO tasks (parent_id, child_id, title, description, reward_stars, status, requires_approval)
VALUES (1, 2, '做完作业', '完成今天的数学作业', 10, 'pending', true);

INSERT INTO tasks (parent_id, child_id, title, description, reward_stars, status, requires_approval)
VALUES (1, 2, '整理房间', '把房间整理干净', 5, 'pending', true);
```

- [ ] 任务已创建
- [ ] 验证：`SELECT * FROM tasks WHERE child_id = 2;`

### 创建商品

```sql
INSERT INTO products (parent_id, name, description, price_stars, stock_quantity, is_active)
VALUES (1, '小玩具', '可爱的小玩具', 20, 5, true);

INSERT INTO products (parent_id, name, description, price_stars, stock_quantity, is_active)
VALUES (1, '零食', '小包装零食', 10, 10, true);
```

- [ ] 商品已创建
- [ ] 验证：`SELECT * FROM products WHERE is_active = true;`
- [ ] 访问 http://localhost:3000/child/mall 验证显示商品

## 第五步：清理检查

- [ ] 确认 `DBInitializer` 组件已删除
- [ ] 确认 `lib/db.ts` 中没有自动初始化逻辑
- [ ] 确认登录页面中没有演示账号提示
- [ ] 确认所有 API 路由都使用数据库而不是内存存储

## 第六步：生产部署前

- [ ] 更新 Vercel 环境变量中的 DATABASE_URL
- [ ] 在生产数据库中执行 SQL 初始化脚本
- [ ] 创建生产环境用户账号
- [ ] 测试登录和数据加载
- [ ] 设置数据库备份策略

## 常见问题

### Q: 密码哈希错误怎么办？
A: 在 Neon 中执行以下 SQL 重新设置密码：
```sql
UPDATE users SET password_hash = '[NEW_HASH]' WHERE username = 'child1';
```

### Q: 忘记了密码哈希怎么办？
A: 重新生成一个新的：
1. 使用在线工具或本地脚本生成哈希
2. 在 Neon 中更新用户记录

### Q: 如何验证 DATABASE_URL 连接？
A: 查看应用的错误日志。如果 DATABASE_URL 错误，应用会显示"DATABASE_URL environment variable is not set"错误。

### Q: 主页显示 404 错误，找不到小孩用户？
A: 
1. 验证是否创建了至少一个 `user_type = 'child'` 的用户
2. 检查 DATABASE_URL 是否正确配置
3. 查看浏览器控制台和服务器日志获取更多信息

## 完成标记

- [ ] 所有步骤已完成
- [ ] 应用运行正常
- [ ] 数据库连接正常
- [ ] 登录功能正常
- [ ] API 端点正常工作
- [ ] 生产部署已准备好

迁移完成！🎉
