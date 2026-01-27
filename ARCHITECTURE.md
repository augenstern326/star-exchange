# 项目架构文档

## 高层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端 (Next.js)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Pages (app/login, app/parent)             │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │        Components & UI (shadcn/ui)                   │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │    DBInitializer (自动初始化数据库)                   │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ API 调用 (Fetch)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                 Next.js API Routes                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  POST /api/auth/login                               │    │
│  │  - 查询用户                                          │    │
│  │  - 验证密码                                          │    │
│  │  - 返回用户数据                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  POST /api/init                                      │    │
│  │  - 创建表                                            │    │
│  │  - 创建索引                                          │    │
│  │  - 插入演示用户                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  其他 API 路由（待实现）                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ SQL 查询
                               │
┌──────────────────────────────▼───────────────────────────────┐
│               Neon PostgreSQL 数据库                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  users (用户)                                        │   │
│  │  ├─ id (BIGSERIAL)                                  │   │
│  │  ├─ username (VARCHAR, UNIQUE, INDEX)               │   │
│  │  ├─ password_hash (VARCHAR)                         │   │
│  │  ├─ user_type ('parent' | 'child')                  │   │
│  │  ├─ parent_id (BIGINT, FK, INDEX)                   │   │
│  │  └─ ... 其他字段                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  tasks (任务表)                                      │   │
│  │  ├─ id (BIGSERIAL)                                  │   │
│  │  ├─ parent_id (BIGINT, FK)                          │   │
│  │  ├─ child_id (BIGINT, FK)                           │   │
│  │  ├─ reward_stars (INT)                              │   │
│  │  └─ ... 其他字段                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  products (商品表)                                   │   │
│  │  ├─ id (BIGSERIAL)                                  │   │
│  │  ├─ parent_id (BIGINT, FK)                          │   │
│  │  ├─ price_stars (INT)                               │   │
│  │  └─ ... 其他字段                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  exchanges (兑换记录表)                               │   │
│  │  ├─ id (BIGSERIAL)                                  │   │
│  │  ├─ child_id (BIGINT, FK)                           │   │
│  │  ├─ product_id (BIGINT, FK)                         │   │
│  │  └─ ... 其他字段                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  star_transactions (交易日志表)                       │   │
│  │  ├─ id (BIGSERIAL)                                  │   │
│  │  ├─ child_id (BIGINT, FK)                           │   │
│  │  ├─ transaction_type (VARCHAR)                      │   │
│  │  ├─ amount (INT)                                    │   │
│  │  └─ ... 其他字段                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 数据流图

### 登录流程

```
用户输入
  ├─ 用户名: "child1"
  ├─ 密码: "child123"
  └─ 身份: "child"
        │
        ▼
┌─────────────────────┐
│ POST /api/auth/login │
└────────┬────────────┘
         │
         ▼
   查询数据库:
   SELECT * FROM users
   WHERE username = $1 AND user_type = $2
        │
        ▼
   用户存在?
   ├─ 否 → 返回 401 错误
   │
   ├─ 是 → 下一步
   │
        ▼
   验证密码:
   verifyPassword(输入密码, 存储的密码哈希)
        │
        ▼
   密码正确?
   ├─ 否 → 返回 401 错误
   │
   ├─ 是 → 下一步
   │
        ▼
   返回用户数据
   (不含 password_hash)
        │
        ▼
   localStorage.setItem('currentUser', ...)
        │
        ▼
   重定向到应用页面
```

### 数据库初始化流程

```
应用启动 (app/layout.tsx)
    │
    ▼
<DBInitializer /> 组件加载
    │
    ▼
调用 POST /api/init
    │
    ├─────────────────────────────────┐
    ▼                                 ▼
CREATE TABLE users ...        CREATE INDEX ...
CREATE TABLE tasks ...        CREATE INDEX ...
CREATE TABLE products ...     CREATE INDEX ...
CREATE TABLE exchanges ...    CREATE INDEX ...
CREATE TABLE star_transactions...
    │
    ▼
检查表中是否有用户:
SELECT COUNT(*) FROM users
    │
    ├─ 有用户? → 初始化完成
    │
    ├─ 没有用户? → 插入演示用户
    │       │
    │       ├─ INSERT parent1 用户
    │       │
    │       └─ INSERT child1 用户 (parent_id = parent1.id)
    │
    ▼
返回初始化结果
```

## 密码加密流程

```
用户注册/登录
    │
    ├─ 输入密码: "password123"
    │
    ▼
调用 hashPassword("password123")
    │
    ▼
┌──────────────────────────────────────────┐
│      PBKDF2-SHA512 加密                  │
├──────────────────────────────────────────┤
│  1. 生成随机盐值                          │
│  2. 执行 1000 次迭代                     │
│  3. 使用 SHA-512 哈希算法                │
│  4. 输出格式:                            │
│     pbkdf2_sha512$1000$salt$hash        │
└──────────────────────────────────────────┘
    │
    ▼
存储到数据库 (password_hash 字段)
    │
    ▼
登录时:
    │
    ├─ 从数据库读取密码哈希
    │
    ├─ 调用 verifyPassword(输入密码, 哈希)
    │
    └─ 比较新生成的哈希与存储的哈希
```

## 模块依赖关系

```
app/layout.tsx
    │
    ├─→ components/db-initializer.tsx
    │   └─→ app/api/init/route.ts
    │       └─→ lib/db.ts
    │           └─→ @neondatabase/serverless
    │
    ├─→ app/login/page.tsx
    │   └─→ app/api/auth/login/route.ts
    │       └─→ lib/db.ts
    │       └─→ lib/crypto.ts
    │
    └─→ app/parent/login/page.tsx
        └─→ app/api/auth/login/route.ts
            └─→ lib/db.ts
            └─→ lib/crypto.ts
```

## 数据库索引策略

```
users 表:
├─ PRIMARY KEY: id
├─ UNIQUE: username
├─ INDEX: user_type (查询特定身份的用户)
└─ INDEX: parent_id (查询父级关系)

tasks 表:
├─ PRIMARY KEY: id
├─ FOREIGN KEY: parent_id
├─ FOREIGN KEY: child_id
├─ INDEX: (parent_id, child_id) (复合索引)
├─ INDEX: status (按状态过滤)
└─ INDEX: created_at (按日期排序)

products 表:
├─ PRIMARY KEY: id
├─ FOREIGN KEY: parent_id
├─ INDEX: parent_id (查询特定家长的商品)
└─ INDEX: is_active (查询激活的商品)

exchanges 表:
├─ PRIMARY KEY: id
├─ FOREIGN KEY: child_id
├─ FOREIGN KEY: product_id
├─ INDEX: child_id (查询特定小孩的兑换)
└─ INDEX: created_at (按日期排序)

star_transactions 表:
├─ PRIMARY KEY: id
├─ FOREIGN KEY: child_id
├─ FOREIGN KEY: parent_id
├─ INDEX: child_id (查询特定小孩的交易)
└─ INDEX: transaction_type (按交易类型过滤)
```

## 文件结构

```
├── app/
│   ├── layout.tsx                    # RootLayout (含DBInitializer)
│   ├── login/
│   │   └── page.tsx                  # 小孩/家长登录页
│   ├── parent/
│   │   ├── login/
│   │   │   └── page.tsx              # 家长登录页
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   └── ...
│   ├── child/
│   │   ├── tasks/
│   │   ├── mall/
│   │   ├── exchanges/
│   │   └── ...
│   └── api/
│       ├── auth/
│       │   └── login/
│       │       └── route.ts          # 登录 API
│       └── init/
│           └── route.ts              # 数据库初始化 API
│
├── components/
│   ├── db-initializer.tsx            # 自动初始化组件
│   └── ui/                           # shadcn/ui 组件
│
├── lib/
│   ├── db.ts                         # Neon 数据库连接
│   ├── crypto.ts                     # 密码加密
│   ├── data-store.ts                 # 数据存储接口 (废弃)
│   └── utils.ts                      # 工具函数
│
├── scripts/
│   ├── 01-init-database.sql          # SQL 脚本
│   ├── seed-database.ts              # Seed 脚本
│   └── manual-init.md                # 手动初始化指南
│
├── public/                           # 静态资源
│
├── .env.local                        # 本地环境变量 (git ignored)
├── package.json                      # 依赖配置
├── tsconfig.json                     # TypeScript 配置
│
├── QUICK_START.md                    # 快速开始指南
├── NEON_SETUP.md                     # Neon 完整设置指南
├── DATABASE_MIGRATION.md             # 迁移文档
├── ARCHITECTURE.md                   # 本文件
└── CHECKLIST.md                      # 检查清单
```

## 关键设计决定

### 1. 使用 Neon PostgreSQL
**原因:**
- 无服务器，自动扩展
- 自动备份和恢复
- 分支功能便于开发
- 与 Vercel 集成紧密

### 2. PBKDF2 密码加密
**原因:**
- 安全性高（1000 次迭代）
- 标准算法，广泛使用
- 适合 Node.js 原生支持

### 3. 自动数据库初始化
**原因:**
- 降低部署复杂性
- 自动创建演示数据
- 首次访问时自动设置

### 4. 用户类型分离 (parent | child)
**原因:**
- 权限模型清晰
- 易于查询和过滤
- 支持多个小孩关联一个家长

## 性能考虑

### 查询优化
- 使用索引加速常见查询
- 避免全表扫描
- 预加载用户会话

### 连接管理
- Neon 自动连接池
- 无需手动连接管理
- 支持并发请求

### 缓存策略
- localStorage 缓存当前用户
- 减少重复查询
- 生产环境考虑 Redis

## 安全考虑

### 认证
- 密码使用 PBKDF2 加密
- 密码从不以明文传输
- 密码从不在响应中返回

### 数据库
- 参数化查询防止 SQL 注入
- 外键约束维护数据完整性
- CHECK 约束验证数据有效性

### 部署
- 环境变量保护敏感信息
- HTTPS 自动启用 (Vercel)
- 定期备份 (Neon 自动)

## 未来扩展

### 短期
- 用户注册功能
- 密码重置
- 用户资料编辑

### 中期
- 实时通知（WebSocket）
- 文件上传（Vercel Blob）
- 搜索功能（全文搜索）

### 长期
- 多语言支持
- 离线同步
- 移动应用
- API 公开
- 第三方集成

---

**文档版本**: 1.0.0
**最后更新**: 2024年
**作者**: v0
