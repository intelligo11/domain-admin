# 域名管理系统 (Domain Admin System)

### 🚀 部署指南

#### 1. 创建 D1 数据库

在 [Cloudflare Dashboard](https://dash.cloudflare.com) 中：

- `Workers & Pages` > `D1` > `Create database`，名称：`domain-admin-db`
- 进入数据库 > `Console`，复制并执行 `schema.sql` 文件中的所有 SQL 语句以初始化数据库结构



#### 2. 部署 Pages 项目

- Fork [本仓库](https://github.com/deerwan/domain-admin) 到 GitHub
- 在 Cloudflare Dashboard 创建 Pages 项目，连接 GitHub 仓库
- 构建设置：构建命令 `npm run build`，输出目录 `dist`

#### 3. 配置绑定和变量

**绑定 D1 数据库**：

- Pages 项目 > `Settings` > `Functions` > `D1 database bindings`
- 添加绑定：变量名 `DB`，选择 `domain-admin-db`

**配置环境变量**：

- Pages 项目 > `Settings` > `Environment variables`
- 添加以下变量：

| 变量名 | 说明 | 是否必需 | 示例值 |
|--------|------|----------|--------|
| `ADMIN_USER` | 管理员用户名 | ✅ 必需 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | ✅ 必需 | `your_password` |
| `JWT_SECRET` | JWT 签名密钥 | ✅ 必需 | `random_string` |
| `CRON_API_KEY` | 定时任务 API 密钥 | ⭐ 推荐 | `random_key` (用于保护 API) |

> ⚠️ **注意**：变量名必须完全一致（全大写、下划线），**不能包含空格**。

> 配置完成后，在 `Deployments` 页面重试部署 (Retry deployment) 以使配置生效。

#### 4. 配置定时任务

本项目支持两种定时任务触发方式，任选其一即可：
 
 **方案 1：GitHub Actions**
 
 1. 在 GitHub 仓库设置中添加 Secrets：
    - `PAGES_URL`: Cloudflare Pages 地址
    - `CRON_API_KEY`: API 认证密钥
 2. 编辑 `.github/workflows/` 下的文件，取消注释 `schedule` 部分以启用自动执行。
 
 **方案 2：Cloudflare Worker Cron**
 
 1. 在 Cloudflare Dashboard 创建一个 Worker。
 2. 将根目录下 `cron-worker.js` 的代码复制到 Worker 中。
 3. 配置环境变量 (`PAGES_URL`, `CRON_API_KEY`) 和 Cron 触发器。
 



#### 5. 配置通知设置

登录系统后，在**通知管理**页面配置：
- Telegram 机器人通知（Bot Token 和 Chat ID）
- 飞书 Webhook 通知
- 到期提醒天数

所有通知设置会保存在数据库中，无需配置环境变量。

---

### 📦 导入导出功能

系统支持 JSON 格式的域名数据导入导出：

- **支持格式**：JSON
- **使用方法**：域名管理页面 → 导入/导出按钮
- **示例文件**：查看 `/examples/domains-sample.json` 示例文件

---

