# Neon PostgreSQL 数据库连接指南

## 项目已为 Neon PostgreSQL 数据库进行了完全配置

此项目已经完全准备好与 Neon PostgreSQL 数据库连接。以下是设置步骤：

## 1. 在 Neon 中创建数据库

1. 访问 [Neon Console](https://console.neon.tech)
2. 创建一个新项目或使用现有项目
3. 创建一个新的数据库（如果需要）
4. 获取连接字符串

## 2. 配置环境变量

在你的 Vercel 项目或本地 `.env.local` 文件中添加以下环境变量：

```
DATABASE_URL=postgresql://user:password@host/database
```

### 获取 DATABASE_URL：

1. 在 Neon Console 中，选择你的项目
2. 点击"Connection string"或"Connection details"
3. 复制完整的连接字符串（格式：`postgresql://...`）
4. 将其添加到你的环境变量中

## 3. 应用架构

### 数据库模块

- **`/lib/db.ts`** - 数据库连接和初始化
  - 使用 `@neondatabase/serverless` 的 `neon()` 函数
  - 包含 `initializeDatabase()` 函数用于自动创建表

- **`/lib/crypto.ts`** - 密码加密/验证
  - 使用 PBKDF2 (SHA-512, 1000 iterations) 算法
  - `hashPassword()` - 加密密码
  - `verifyPassword()` - 验证密码

### API 路由

- **`/app/api/auth/login/route.ts`** - 用户登录
  - 接受：`username`, `password`, `userType` (parent | child)
  - 返回：用户对象（不包含密码哈希）
  - 自动调用 `initializeDatabase()` 创建表和演示用户

- **`/app/api/init/route.ts`** - 数据库初始化端点
  - 创建所有必需的表和索引
  - 添加演示用户（如果不存在）
  - 由 `DBInitializer` 组件在应用启动时自动调用

### 初始化组件

- **`/components/db-initializer.tsx`** - 自动初始化数据库
  - 在应用启动时调用 `/api/init`
  - 处理初始化错误（不会阻止应用加载）

## 4. 数据库表结构

### users 表
- `id` (BIGSERIAL) - 主键
- `username` (VARCHAR) - 唯一用户名
- `email` (VARCHAR) - 邮箱
- `password_hash` (VARCHAR) - 加密的密码
- `user_type` (VARCHAR) - 'parent' 或 'child'
- `parent_id` (BIGINT) - 父级用户 ID (仅 child)
- `nickname` (VARCHAR) - 昵称
- `avatar_url` (VARCHAR) - 头像 URL
- `star_balance` (INT) - 星星余额
- `total_earned` (INT) - 总获得星星
- `total_spent` (INT) - 总消费星星
- `is_active` (BOOLEAN) - 是否激活
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

### 其他表
- **tasks** - 任务表
- **products** - 商品表
- **exchanges** - 兑换记录表
- **star_transactions** - 星星交易日志表

## 5. 演示账号

应用会自动创建演示账号（如果数据库为空）：

### 小孩账号
- **用户名**: `child1`
- **密码**: `child123`
- **初始星星**: 50

### 家长账号
- **用户名**: `parent1`
- **密码**: `password123`

## 6. 本地开发

### 使用本地 Neon 连接

1. 创建 `.env.local` 文件：
```bash
DATABASE_URL=postgresql://your_username:your_password@your_host/your_database
```

2. 运行开发服务器：
```bash
npm run dev
# 或
yarn dev
```

3. 应用会自动初始化数据库（首次运行时）

### 使用 Neon 分支（可选）

Neon 支持分支功能，非常适合开发和测试：

1. 在 Neon Console 中为你的项目创建一个开发分支
2. 使用分支的连接字符串作为开发环境的 DATABASE_URL

## 7. 生产部署

### 在 Vercel 上部署

1. 推送代码到 GitHub
2. 在 Vercel 中连接你的 GitHub 仓库
3. 添加环境变量：
   - `DATABASE_URL` - 你的 Neon 连接字符串
4. Vercel 会自动构建并部署

### 安全注意事项

- 🔒 **从不**在代码中提交 DATABASE_URL
- 🔒 始终使用环境变量存储敏感信息
- 🔒 密码使用 PBKDF2 加密存储（2^20 iterations）
- 🔒 使用参数化查询防止 SQL 注入

## 8. 常见问题

### Q: 如何重置演示数据？

```sql
-- 连接到你的 Neon 数据库并运行：
DELETE FROM users;
DELETE FROM tasks;
DELETE FROM products;
DELETE FROM exchanges;
DELETE FROM star_transactions;
```

然后访问 `/api/init`，新的演示用户会自动创建。

### Q: 如何修改演示用户的密码？

演示用户的密码在 `/app/api/init/route.ts` 中定义。修改后重新运行初始化。

### Q: 支持离线模式吗？

目前不支持。所有数据都存储在 Neon PostgreSQL 中。

### Q: 如何实现用户注册？

需要创建 `/app/api/auth/register/route.ts` 路由来处理注册逻辑（参考登录 API）。

## 9. 监控和调试

### 查看 Neon 数据库日志

1. 访问 Neon Console
2. 选择你的项目
3. 进入"Monitoring"标签查看查询日志

### 本地调试

应用使用 `console.log("[v0] ...")` 格式的日志：

```typescript
console.log('[v0] Database initialized successfully');
console.error('[v0] Database initialization error:', error);
```

检查浏览器控制台或 Next.js 终端输出以查看这些日志。

## 10. 性能优化建议

- ✅ 使用连接池（Neon 自动提供）
- ✅ 为常用查询添加索引（已添加）
- ✅ 避免 N+1 查询问题
- ✅ 缓存用户会话数据（localStorage）
- ⚠️ 定期备份重要数据（Neon 提供自动备份）

## 需要帮助？

- [Neon 文档](https://neon.tech/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
