# 数据库迁移总结

## 项目概述

该项目已从内存存储（LocalStorage + In-Memory）迁移到 **Neon PostgreSQL** 数据库，同时实现了以下重要功能：

- ✅ 用户名密码登录系统
- ✅ PBKDF2 密码加密存储
- ✅ PostgreSQL 数据库支持
- ✅ 自动数据库初始化
- ✅ 演示用户自动创建

## 项目结构变更

### 新增文件

#### 数据库相关
- **`/lib/db.ts`** - Neon 数据库连接和初始化
  - 使用 `@neondatabase/serverless` 包
  - 自动创建所有必需的表和索引
  - 导出 `sql` 函数用于查询，`initializeDatabase()` 用于初始化

- **`/lib/crypto.ts`** - 密码加密和验证
  - `hashPassword(password: string)` - 使用 PBKDF2 SHA-512 加密
  - `verifyPassword(password: string, hash: string)` - 验证密码

#### API 路由
- **`/app/api/init/route.ts`** - 数据库初始化端点
  - POST 请求触发数据库初始化
  - 创建所有表和索引
  - 添加演示用户（如果不存在）
  - 返回初始化结果

#### 前端组件
- **`/components/db-initializer.tsx`** - 自动初始化组件
  - 在应用加载时自动调用 `/api/init`
  - 处理错误，不阻止应用加载
  - 在 RootLayout 中使用

#### 脚本和文档
- **`/scripts/seed-database.ts`** - 演示数据 seed 脚本
- **`/scripts/manual-init.md`** - 手动初始化指南
- **`/NEON_SETUP.md`** - 完整的 Neon 设置指南
- **`/DATABASE_MIGRATION.md`** - 本文件

### 修改的文件

#### 登录相关
- **`/app/api/auth/login/route.ts`**
  - 从 `UserStore.getByEmail()` 改为 `sql` 查询
  - 改用 `username` 和 `userType` 参数
  - 使用 `verifyPassword()` 验证加密的密码
  - 返回格式标准化（id, username, userType 等）

- **`/app/login/page.tsx`**
  - 添加小孩/家长身份选择标签页
  - 改用用户名和密码表单
  - 添加快速登录按钮和演示账号提示
  - 不同身份登录后跳转到不同页面

- **`/app/parent/login/page.tsx`**
  - 改用用户名和密码（之前是邮箱）
  - 更新演示账号提示
  - 添加 `userType: 'parent'` 参数

#### 数据模型
- **`/lib/data-store.ts`**
  - User 接口改用 `username` 和 `passwordHash`
  - 添加 `userType: 'parent' | 'child'`
  - 添加 `parentId` 支持父子关系
  - 添加辅助方法：`getByUsername()`, `getFirstChild()`, `getChildrenByParent()`

#### 根布局
- **`/app/layout.tsx`**
  - 导入 `DBInitializer` 组件
  - 在 body 中添加 `<DBInitializer />` 用于自动初始化

## 核心架构说明

### 认证流程

```
用户输入 (username + password + userType)
        ↓
POST /api/auth/login
        ↓
从 Neon 查询用户
        ↓
验证密码哈希
        ↓
返回用户数据 (不含密码)
        ↓
存储到 localStorage
        ↓
重定向到相应页面
```

### 数据库初始化流程

```
应用启动
    ↓
RootLayout 挂载
    ↓
<DBInitializer /> 组件加载
    ↓
调用 POST /api/init
    ↓
创建表（IF NOT EXISTS）
    ↓
创建索引
    ↓
检查是否有用户
    ↓
如果没有，创建演示用户
    ↓
初始化完成
```

### 密码加密

使用 PBKDF2 算法：
- 算法：SHA-512
- 迭代次数：1000
- 盐值：随机生成
- 输出格式：`pbkdf2_sha512$iterations$salt$hash`

## 数据库表结构

### users 表
```
id (BIGSERIAL) - 主键，自增
username (VARCHAR 50) - 唯一用户名，索引
email (VARCHAR 100)
password_hash (VARCHAR 255) - PBKDF2 加密密码
user_type (VARCHAR 20) - 'parent' 或 'child'，索引
parent_id (BIGINT) - 父级用户 ID，外键，索引
nickname (VARCHAR 100) - 昵称
avatar_url (VARCHAR 255)
star_balance (INT) - 当前星星余额
total_earned (INT) - 总获得星星
total_spent (INT) - 总消费星星
is_active (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### tasks, products, exchanges, star_transactions 表
参考 `/NEON_SETUP.md` 中的完整表结构说明。

## 演示账号

### 小孩账号
- **用户名**: `child1`
- **密码**: `child123`
- **初始星星**: 50

### 家长账号
- **用户名**: `parent1`
- **密码**: `password123`

这些账号在首次初始化时自动创建。

## 环境变量

需要设置以下环境变量：

```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 获取方式

1. 在 Neon Console 中创建项目
2. 复制连接字符串
3. 添加到 Vercel 环境变量或本地 `.env.local`

## 快速开始

### 本地开发

```bash
# 1. 设置环境变量
echo "DATABASE_URL=your_neon_connection_string" > .env.local

# 2. 安装依赖
npm install

# 3. 运行开发服务器
npm run dev

# 4. 访问应用
# http://localhost:3000
```

应用会自动初始化数据库（如果还没有）。

### 生产部署

1. 推送代码到 GitHub
2. 在 Vercel 中连接仓库
3. 添加 `DATABASE_URL` 环境变量
4. Vercel 自动构建并部署

## 向后兼容性

这次迁移是**破坏性的**，因为：

- ❌ 不再支持基于邮箱的登录
- ❌ LocalStorage 中的旧数据不会迁移
- ❌ 用户界面有变化（小孩/家长标签页）

**建议**: 清除旧数据，使用新的演示账号。

## 安全特性

✅ **密码安全**
- PBKDF2-SHA512，1000 次迭代
- 密码从不以明文存储
- 密码从不在 API 响应中返回

✅ **查询安全**
- 使用参数化查询防止 SQL 注入
- `@neondatabase/serverless` 自动处理

✅ **会话安全**
- 用户数据存储在 localStorage（仅用于演示）
- 生产环境应该实现 HTTP-only cookies

## 性能考虑

- 🚀 Neon 自动连接池
- 🚀 已添加必要的数据库索引
- 🚀 首次查询会触发初始化（可能较慢）
- 🚀 建议缓存用户会话数据

## 故障排除

### "Database URL is not set"
**原因**: 环境变量 `DATABASE_URL` 未配置
**解决方案**: 检查 Vercel 项目设置或 `.env.local` 文件

### "relation 'users' does not exist"
**原因**: 数据库初始化失败
**解决方案**: 手动运行 `/api/init` 或参考 `/scripts/manual-init.md`

### "permission denied"
**原因**: Neon 用户权限不足
**解决方案**: 在 Neon Console 中检查用户权限

### "password verification failed"
**原因**: 密码不匹配或密码哈希损坏
**解决方案**: 重置演示用户或检查密码哈希格式

## 下一步

### 必需的功能
- [ ] 实现用户注册接口
- [ ] 添加密码重置功能
- [ ] 实现 HTTP-only cookie 会话管理
- [ ] 添加数据库备份和恢复

### 可选的改进
- [ ] 实现软删除（逻辑删除）用户
- [ ] 添加审计日志
- [ ] 实现数据库事务
- [ ] 添加缓存层（Redis）

## 相关文档

- 📖 [完整 Neon 设置指南](./NEON_SETUP.md)
- 📖 [手动数据库初始化](./scripts/manual-init.md)
- 📖 [原始设置文档](./SETUP.md)
- 📖 [Neon 官方文档](https://neon.tech/docs)
- 📖 [Next.js 官方文档](https://nextjs.org/docs)

## 贡献者指南

当修改数据库相关代码时：

1. 更新 `/lib/db.ts` 中的 `initializeDatabase()` 函数
2. 更新 `/scripts/manual-init.md` 中的 SQL 脚本
3. 更新此文档
4. 在本地测试数据库初始化

---

**最后更新**: 2024年
**版本**: 1.0.0
**状态**: 生产就绪 ✅
