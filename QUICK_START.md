# 快速开始 - 5 分钟指南

## 1️⃣ 获取 Neon 数据库 URL

1. 访问 [Neon Console](https://console.neon.tech)
2. 创建项目 → 获取连接字符串
3. 复制 `postgresql://...` 格式的 URL

## 2️⃣ 本地配置

创建 `.env.local` 文件：

```
DATABASE_URL=paste_your_neon_url_here
```

## 3️⃣ 启动应用

```bash
npm install
npm run dev
```

访问 http://localhost:3000 - 数据库会自动初始化！

## 4️⃣ 登录

### 演示账号（自动创建）

| 身份 | 用户名 | 密码 |
|------|--------|------|
| 小孩 | child1 | child123 |
| 家长 | parent1 | password123 |

在登录页选择身份，输入账号密码即可。

## 5️⃣ 部署到 Vercel

```bash
git push
```

在 Vercel 项目中：
1. 添加环境变量 `DATABASE_URL`
2. 部署完成

## 📁 重要文件

| 文件 | 用途 |
|------|------|
| `/lib/db.ts` | 数据库连接 |
| `/lib/crypto.ts` | 密码加密 |
| `/app/api/auth/login/route.ts` | 登录 API |
| `/app/api/init/route.ts` | 数据库初始化 |
| `/components/db-initializer.tsx` | 自动初始化组件 |

## 🔑 API 端点

### 登录
```
POST /api/auth/login
Body: {
  "username": "child1",
  "password": "child123",
  "userType": "child"
}
```

### 初始化数据库（自动调用）
```
POST /api/init
```

## 📝 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产
npm start

# 代码检查
npm run lint
```

## ❓ 常见问题

**Q: 本地运行时数据库连接失败？**
A: 检查 `.env.local` 中的 `DATABASE_URL` 是否正确。

**Q: 登录失败？**
A: 确保选择了正确的身份（小孩/家长），检查用户名和密码。

**Q: 如何重置演示数据？**
A: 访问 `/api/init` 或删除表后重新初始化。

**Q: 支持自定义用户注册吗？**
A: 目前没有，需要自己实现 `/api/auth/register` 端点。

## 📚 完整文档

- [Neon 完整设置指南](./NEON_SETUP.md)
- [数据库迁移说明](./DATABASE_MIGRATION.md)
- [手动初始化步骤](./scripts/manual-init.md)

## 🚀 就这么简单！

应用现在已连接到 Neon PostgreSQL，所有登录和数据都会保存到数据库。

享受你的项目！🎉
