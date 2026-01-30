# ✨ 星星存折 - 儿童积分兑换系统 ✨

## 🚀 项目简介

**星星存折** 是一个专为家庭设计的、简单易用的儿童积分兑换系统。它帮助家长通过“星星”奖励机制，鼓励孩子们完成任务、培养好习惯，并通过兑换“商品”来增强孩子的参与感和成就感。

本项目最大的特点是**无需服务器部署**，利用 Vercel 和 Neon 提供的无服务器能力，几分钟内即可搭建属于你自己的家庭积分系统！

---

## ✨ 主要功能

本系统分为 **儿童端** 和 **家长端** 两个角色：

### 👦 儿童端 (无需登录)

-   **星星商城:**
    -   浏览家长设置的各种“商品”（例如：一次看动画片、一个玩具、一次野餐等）。
    -   查看所需星星数量，并进行兑换。
    -   查看自己的当前星星余额。
-   **星星任务:**
    -   查看家长发布的待完成任务（例如：整理房间、帮忙洗碗、完成作业等）。
    -   了解每个任务可获得的星星奖励。

### 👩‍🏫 家长端 (需要登录)

-   **任务管理:**
    -   创建、编辑、删除任务。
    -   为任务设置星星奖励。
    -   确认孩子是否完成任务，并自动发放星星。
-   **商品管理:**
    -   创建、编辑、删除兑换商品。
    -   设置商品的名称、描述、所需星星数量以及库存。
    -   确认孩子兑换请求，并减少库存。
-   **积分记录:**
    -   查看孩子的星星获得和消费的所有记录，做到公开透明。
    -   管理孩子的星星余额。

---

## 💻 技术栈

-   **前端框架:** [React](https://react.dev/) / [Next.js 14 (App Router)](https://nextjs.org/)
-   **开发语言:** [TypeScript](https://www.typescriptlang.org/)
-   **样式框架:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI 组件:** [Ant Design (antd)](https://ant.design/) 
-   **图标库:** [Lucide React](https://lucide.dev/icons/)
-   **数据库:** [PostgreSQL](https://www.postgresql.org/)
-   **数据库部署:** [Neon (Serverless PostgreSQL)](https://neon.tech/)
-   **应用部署:** [Vercel (Serverless Functions)](https://vercel.com/)

---

## 🛠️ 部署指南 (仅需几步！)

本项目旨在提供最简便的部署体验，无需自己管理服务器，完全免费（在Neon和Vercel的免费额度内）。

1.  **Fork 本项目:**
    点击页面右上角的 `Fork` 按钮，将本仓库复制到你的 GitHub 账户下。

2.  **创建 Neon 数据库:**
    -   访问 [Neon 控制台](https://console.neon.tech/) 并注册/登录。
    -   新建一个项目 (Project)。
    -   在你的项目主页，找到 `SQL Editor`。
    -   复制 `scripts` 文件夹下的 `init.sql` 文件内容。
    -   粘贴到 `SQL Editor` 中并执行，这将自动创建所需的表结构。
    -   **非常重要：** 在 `Connections` 页面，复制你的 `Connection String`，它通常以 `postgresql://` 开头。这将是你的 `DATABASE_URL`。

    > **提示:** `init.sql` 包含初始的用户数据。你可以根据需要修改这些插入语句，例如插入你自己的子用户和父用户（请确保设置 `is_parent` 字段）。

3.  **部署到 Vercel:**
    -   访问 [Vercel 控制台](https://vercel.com/dashboard) 并注册/登录。
    -   点击 `Add New...` > `Project`。
    -   选择 `Import Git Repository`，并从你的 GitHub 账户中选择你 Fork 的本项目。
    -   在项目配置页面：
        -   **Framework Preset:** 确保选择 `Next.js`。
        -   **Root Directory:** 默认为 `./`，如果你的代码在子目录中，请相应调整。
    -   **环境变量配置:**
        -   在 `Environment Variables` 部分，添加一个新的环境变量：
            -   **Name:** `DATABASE_URL`
            -   **Value:** 粘贴你在 Neon 步骤中复制的 `Connection String`。
    -   点击 `Deploy`。Vercel 将自动构建并部署你的应用！

    > **注意:** 首次部署后，Vercel 会生成一个项目域名，例如 `your-project-name.vercel.app`。你可以在 Vercel 控制台的 `Settings` > `Domains` 中修改或添加自定义域名。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！如果你有任何改进建议或发现 Bug，请随时提出。

---

## 📄 许可证

本项目采用 MIT 许可证。
