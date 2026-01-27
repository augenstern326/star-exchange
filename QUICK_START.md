# 快速开始指南

3 个简单步骤让你的应用运行起来！

## 步骤 1: 设置数据库 (5 分钟)

### 1.1 在 Neon 中执行 SQL 脚本

1. 登录到 Neon (https://console.neon.tech)
2. 选择你的数据库
3. 打开 SQL Editor
4. 复制 `scripts/01-init-database.sql` 文件的全部内容
5. 粘贴到 SQL Editor 中并执行

**预期结果**: 所有表成功创建，无错误

### 1.2 在本地或 Vercel 中设置环境变量

**本地开发**: 创建 `.env.local` 文件
```
DATABASE_URL=postgresql://user:password@host/database
```

**Vercel 部署**: 在项目设置中添加环境变量 `DATABASE_URL`

---

## 步骤 2: 创建用户 (2 分钟)

### 2.1 生成密码哈希

选择一种方法生成 bcrypt 哈希密码：

**方法 A: 在线工具（最简单）**
1. 访问 https://bcrypt.online/
2. 输入你的密码（例如：`password123`）
3. 复制生成的哈希值（开始于 `$2b$`）

**方法 B: Node.js**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```

**方法 C: Python**
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode())"
```

### 2.2 在 Neon 中创建用户

1. 回到 Neon SQL Editor
2. 执行以下 SQL（替换 `[HASH_HERE]` 为你的哈希值）：

```sql
-- 创建父母用户
INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
VALUES ('parent1', 'parent@example.com', '[HASH_HERE]', 'parent', '爸爸', 0);

-- 创建小孩用户
INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, star_balance)
VALUES ('child1', 'child@example.com', '[HASH_HERE]', 'child', 1, '小明', 50);
```

**预期结果**: 两行数据成功插入

---

## 步骤 3: 启动应用 (1 分钟)

### 3.1 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000/

**你应该看到:**
- 页面标题: "小明的星星存折"
- 显示星星余额: 50

### 3.2 测试登录

1. 点击右上角 "登录" 按钮
2. 在小孩标签中输入：
   - 用户名: `child1`
   - 密码: 你之前设置的密码（如 `password123`）
3. 点击 "小孩登录"

**预期结果**: 成功登录，重定向到任务页面

### 3.3 测试父母登录

1. 访问 http://localhost:3000/parent/login
2. 输入：
   - 用户名: `parent1`
   - 密码: 你之前设置的密码
3. 点击 "家长登录"

**预期结果**: 成功登录，进入父母仪表板

---

## 可选: 创建测试数据 (2 分钟)

想要看到更多内容？创建一些任务和商品：

### 创建任务

在 Neon SQL Editor 中执行：

```sql
INSERT INTO tasks (parent_id, child_id, title, description, reward_stars, status, requires_approval)
VALUES (1, 2, '做完作业', '完成今天的数学作业', 10, 'pending', true);

INSERT INTO tasks (parent_id, child_id, title, description, reward_stars, status, requires_approval)
VALUES (1, 2, '整理房间', '把房间整理干净', 5, 'pending', true);
```

### 创建商品

```sql
INSERT INTO products (parent_id, name, description, price_stars, stock_quantity, is_active)
VALUES (1, '小玩具', '可爱的小玩具', 20, 5, true);

INSERT INTO products (parent_id, name, description, price_stars, stock_quantity, is_active)
VALUES (1, '零食', '小包装零食', 10, 10, true);
```

现在：
- 访问 http://localhost:3000/child/tasks 查看任务列表
- 访问 http://localhost:3000/child/mall 查看商品列表

---

## 常见问题 (快速排查)

### "没有找到小孩用户"
✓ 确认在数据库中创建了小孩用户
✓ 检查用户的 `user_type` 是否为 'child'
✓ 重启应用

### 登录失败 - "用户名、密码或身份类型错误"
✓ 检查用户名是否正确
✓ 确认密码哈希正确（使用在线工具验证）
✓ 选择正确的用户类型（小孩/家长）

### 数据库连接错误
✓ 验证 DATABASE_URL 环境变量已设置
✓ 检查 DATABASE_URL 格式是否正确
✓ 确保 Neon 数据库在线且可访问

### 表不存在错误
✓ 确认 SQL 初始化脚本已完全执行
✓ 检查是否有执行错误（可能有某个表失败）
✓ 在 Neon 中验证表是否存在：`\dt`

---

## 📁 重要文件

| 文件 | 用途 |
|------|------|
| `scripts/01-init-database.sql` | 数据库初始化 SQL 脚本 |
| `DATABASE_SETUP_GUIDE.md` | 详细的设置说明 |
| `VERIFICATION_CHECKLIST.md` | 验证清单 |
| `/lib/db.ts` | 数据库连接 |
| `/lib/data-store.ts` | 数据库操作层 |
| `/app/api/auth/login/route.ts` | 登录 API |
| `/app/api/users/default-child/route.ts` | 获取默认小孩用户 |

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

## 下一步

现在你的应用已经运行，你可以：

1. **自定义用户数据**: 修改昵称、头像等
2. **创建更多任务和商品**: 通过 SQL 或应用界面
3. **修改星星数量**: 更新 `users.star_balance`
4. **部署到生产**: 在 Vercel 中设置 `DATABASE_URL` 并部署

---

## 📚 完整文档

- [详细设置指南](./DATABASE_SETUP_GUIDE.md)
- [验证清单](./VERIFICATION_CHECKLIST.md)
- [迁移总结](./MIGRATION_SUMMARY.md)
- [代码变更](./CHANGES_SUMMARY.md)

---

## 时间估计

| 任务 | 时间 |
|------|------|
| 设置数据库 | 5 分钟 |
| 生成密码哈希 | 1 分钟 |
| 创建用户 | 1 分钟 |
| 启动应用 | 1 分钟 |
| **总计** | **~8 分钟** |

---

祝你使用愉快！🎉
