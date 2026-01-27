# 数据库迁移总结

本项目已完成从 mock 数据和 localStorage 到完全数据库驱动的迁移。

## 主要变更

### 1. 移除 Mock 数据和 localStorage

- ✅ 删除了 `DBInitializer` 组件 - 不再在应用启动时初始化数据库
- ✅ 移除了 `lib/data-store.ts` 中的内存数据存储
- ✅ 停用了 localStorage 依赖（登录时仍使用 localStorage 存储当前用户，这是必要的）
- ✅ 移除了登录页面中的演示账号信息

### 2. 数据库集成

- ✅ 更新了 `lib/db.ts` - 仅连接到 Neon PostgreSQL，移除自动初始化逻辑
- ✅ 重写了 `lib/data-store.ts` - 所有操作都调用数据库而不是内存存储
- ✅ 更新了所有 API 路由以使用数据库

### 3. API 路由更新

#### 用户相关
- `GET /api/users` - 从数据库获取所有用户
- `GET /api/users/default-child` - **新增** - 获取默认小孩用户（首次加载时使用）
- `POST /api/auth/login` - 从数据库验证登录凭证

#### 任务相关
- `GET /api/tasks` - 从数据库获取任务列表
- `POST /api/tasks/[id]/approve` - 批准任务并更新数据库中的星星余额

#### 商品相关
- `GET /api/products` - 从数据库获取商品列表
- `PATCH /api/products/[id]` - 更新商品
- `DELETE /api/products/[id]` - 删除商品

#### 兑换相关
- `GET /api/exchanges` - 从数据库获取兑换记录

#### 交易相关
- `GET /api/transactions` - 从数据库获取星星交易记录

### 4. 前端更新

#### 主页面
- `/app/page.tsx` - 现在从 `/api/users/default-child` 加载默认小孩用户
- 移除了 localStorage 中的用户自动创建逻辑
- 添加了错误处理，如果没有找到小孩用户则显示错误消息

#### 登录页面
- `/app/login/page.tsx` - 移除了演示账号快速登录按钮
- 登录现在直接从数据库验证

### 5. 初始化流程变更

**之前的流程：**
1. 应用启动 → DBInitializer 组件调用 /api/init
2. /api/init 创建表和演示数据
3. 应用使用内存存储的数据

**现在的流程：**
1. 用户手动执行 SQL 脚本创建表（scripts/01-init-database.sql）
2. 用户手动创建用户数据（通过 SQL INSERT）
3. 应用启动，从数据库加载数据
4. 用户可以通过登录页面登录或访问主页直接查看小孩数据

## 数据库初始化步骤

1. **执行 SQL 脚本** - 在 Neon 中执行 `scripts/01-init-database.sql` 创建所有表和索引

2. **创建用户** - 使用 SQL INSERT 语句创建父母和小孩用户：

```sql
-- 创建父母用户
INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
VALUES ('parent1', 'parent@example.com', '[bcrypt_hash]', 'parent', '爸爸', 0);

-- 创建小孩用户
INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, star_balance)
VALUES ('child1', 'child@example.com', '[bcrypt_hash]', 'child', 1, '小明', 50);
```

3. **创建初始数据** - 通过 SQL 或在应用中通过管理界面创建任务、商品等

## 环境变量

确保设置了以下环境变量：

```
DATABASE_URL=postgresql://user:password@host/database
```

## 文件变更清单

### 删除的文件
- ❌ `/components/db-initializer.tsx` - 不再需要

### 修改的文件

**核心库**
- 📝 `/lib/db.ts` - 移除初始化逻辑
- 📝 `/lib/data-store.ts` - 完全重写为数据库操作

**API 路由**
- 📝 `/app/api/init/route.ts` - 将其标记为已弃用
- 📝 `/app/api/auth/login/route.ts` - 移除初始化调用
- 📝 `/app/api/users/route.ts` - 迁移到数据库
- 📝 `/app/api/tasks/route.ts` - 迁移到数据库
- 📝 `/app/api/products/route.ts` - 迁移到数据库
- 📝 `/app/api/exchanges/route.ts` - 迁移到数据库
- 📝 `/app/api/transactions/route.ts` - 迁移到数据库
- 📝 `/app/api/products/[id]/route.ts` - 迁移到数据库
- 📝 `/app/api/tasks/[id]/approve/route.ts` - 迁移到数据库

**前端页面**
- 📝 `/app/layout.tsx` - 移除 DBInitializer 组件
- 📝 `/app/page.tsx` - 更新为加载默认小孩用户
- 📝 `/app/login/page.tsx` - 移除演示账号

### 新增文件
- ✨ `/app/api/users/default-child/route.ts` - 新增端点
- ✨ `/DATABASE_SETUP_GUIDE.md` - 设置指南
- ✨ `/MIGRATION_SUMMARY.md` - 本文件

## 系统现在只支持一个小孩用户

前端应用专门针对单个小孩用户优化：
- 主页直接显示该小孩的数据
- `/api/users/default-child` 端点自动返回第一个小孩用户
- 如果需要支持多个小孩，需要修改前端逻辑以允许选择

## 验证迁移成功

1. ✅ 数据库表已创建（无错误）
2. ✅ 用户数据已插入
3. ✅ 访问 http://localhost:3000/ 显示小孩的星星数据
4. ✅ 登录页面正常工作
5. ✅ API 端点正常返回数据库数据

## 故障排除

### "没有找到小孩用户"错误
- 检查是否创建了 `user_type = 'child'` 的用户
- 检查 DATABASE_URL 是否正确配置

### 密码验证失败
- 确保密码使用 bcrypt 正确哈希
- 检查数据库中存储的密码是否正确

### 数据库连接错误
- 验证 DATABASE_URL 环境变量
- 检查 Neon 数据库是否在线
- 确保已创建所有必需的表

## 下一步建议

1. 在生产环境中部署数据库
2. 设置数据库备份策略
3. 考虑添加用户管理界面（如果需要支持多个小孩）
4. 添加更多的数据验证和错误处理
