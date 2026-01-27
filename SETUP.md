# 星星存折应用 - 设置指南

## 项目概览

这是一个用于家长和孩子管理星星的应用。家长可以创建任务和商品，孩子可以完成任务赚取星星，然后用星星兑换商品。

## 认证更新

### 登录方式
- **用户名/密码登录** - 已从邮箱登录更改为用户名密码登录
- **密码加密** - 使用PBKDF2算法加密存储在数据库中
- **用户类型** - 支持"parent"（家长）和"child"（小孩）两种用户类型

### 演示账号

#### 小孩账号
- 用户名: `child1`
- 密码: `child123`
- 登录地址: `/login` (选择"小孩"标签)

#### 家长账号
- 用户名: `parent1`
- 密码: `password123`
- 登录地址: `/parent/login` 或 `/login` (选择"家长"标签)

## 数据库设置

### PostgreSQL (Neon)

本应用使用PostgreSQL数据库。如果使用Neon（推荐）：

1. **在Neon上创建项目**
   - 访问 [neon.tech](https://neon.tech)
   - 创建新项目
   - 记下连接字符串

2. **设置环境变量**
   \`\`\`bash
   DATABASE_URL=postgresql://user:password@host/dbname
   \`\`\`

3. **初始化数据库**
   \`\`\`bash
   # 使用 psql 连接到数据库
   psql $DATABASE_URL -f scripts/01-init-database.sql
   \`\`\`

### 数据库表结构

- **users** - 用户表（支持parent和child类型）
- **tasks** - 任务表（由家长创建，孩子完成）
- **products** - 商品表（由家长创建）
- **exchanges** - 兑换记录表
- **star_transactions** - 星星交易日志表

## 当前数据存储

当前应用使用**内存数据存储**（在`lib/data-store.ts`）。

### 从内存存储迁移到Neon数据库

要从内存存储迁移到实际数据库：

1. 安装PostgreSQL驱动程序
   \`\`\`bash
   npm install pg
   # 或使用 @neondatabase/serverless（更轻量）
   npm install @neondatabase/serverless
   \`\`\`

2. 创建新的数据库访问层（替换`lib/data-store.ts`）
   - 实现与现有API相同的接口
   - 使用SQL查询替代内存操作
   - 添加连接池管理

3. 更新API路由以使用新的数据库层

## 默认登录用户

应用现已设置为支持多个用户。默认演示用户是数据库中的第一个child用户：
- `child1` (来自初始化数据)

## 密码加密

密码使用PBKDF2算法加密：
- 算法: SHA-512
- 迭代次数: 1000
- Salt: `star_book_salt` (应在生产环境中更改)

**注意**: 对于生产环境，建议使用`bcryptjs`或`argon2`等更安全的算法。

## 文件说明

- `/lib/crypto.ts` - 密码加密/验证工具
- `/lib/data-store.ts` - 数据存储层（当前为内存存储）
- `/app/api/auth/login/route.ts` - 登录API端点
- `/app/login/page.tsx` - 统一登录页面（同时支持小孩和家长）
- `/app/parent/login/page.tsx` - 家长登录页面
- `/scripts/01-init-database.sql` - PostgreSQL数据库初始化脚本

## 快速开始

1. 配置Neon数据库和环境变量
2. 运行初始化脚本
3. 访问 `http://localhost:3000/login`
4. 使用演示账号登录

## 后续步骤

- [ ] 将内存数据存储迁移到Neon数据库
- [ ] 实现用户注册功能
- [ ] 添加密码找回功能
- [ ] 增强安全性（改进密码加密算法）
- [ ] 添加会话管理/JWT认证
