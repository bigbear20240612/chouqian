# 🚀 Vercel 部署指南

## 前置条件

✅ 项目已配置完成
✅ 构建测试通过
✅ Neon 数据库已连接
✅ 环境变量已配置

---

## 📋 部署步骤

### 方法 1：通过 Vercel CLI 部署（推荐）

#### 1. 登录 Vercel

在项目目录中运行：

```bash
cd /root/vibcoding/case3
vercel login
```

按照提示在浏览器中完成授权。

#### 2. 部署项目

```bash
vercel --prod
```

部署过程中会提示：
- **Set up and deploy?** → 选择 **Yes**
- **Which scope?** → 选择您的账号
- **Link to existing project?** → 选择 **chouqian**（如果存在）
- **What's your project's name?** → **chouqian**
- **In which directory is your code located?** → **.**（当前目录）

#### 3. 配置环境变量

部署过程中，Vercel 会自动检测项目中的环境变量。

如果需要手动添加：

1. 访问 https://vercel.com/dashboard
2. 进入 **chouqian** 项目
3. 点击 **Settings** → **Environment Variables**
4. 确认 `DATABASE_URL` 已存在（应该已经从 Neon 连接中自动配置）

#### 4. 初始化数据库

部署完成后，运行数据库初始化脚本：

```bash
npx dotenv-cli -e .env.local -- npx tsx scripts/seed-db.ts
```

或者通过 Vercel 控制台的终端运行。

#### 5. 验证部署

访问您的 Vercel 项目 URL（格式：`https://chouqian.vercel.app`）

---

### 方法 2：通过 Vercel Dashboard 部署

#### 1. 导入 GitHub 仓库

1. 将项目推送到 GitHub
2. 访问 https://vercel.com/new
3. 导入您的 GitHub 仓库

#### 2. 配置项目

- **Project Name**: `chouqian`
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

#### 3. 配置环境变量

在 Environment Variables 中添加：

```
DATABASE_URL = postgresql://neondb_owner:npg_glyRNedPA6X8@ep-autumn-heart-a4ah31ov-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 4. 部署

点击 **Deploy** 按钮。

---

## 🔧 部署后配置

### 1. 数据库表结构

如果需要重新创建数据库表：

```bash
npx dotenv-cli -e .env.local -- npm run db:push
```

### 2. 初始化预置数据

```bash
npx dotenv-cli -e .env.local -- npx tsx scripts/seed-db.ts
```

### 3. 验证功能

测试以下功能：
- ✅ 访问首页
- ✅ 查看项目列表
- ✅ 执行抽签
- ✅ 查看历史记录
- ✅ 切换 UI 风格

---

## 📊 部署信息

- **项目名称**: chouqian
- **框架**: Next.js 14 (App Router)
- **数据库**: Neon Postgres
- **构建输出**: Static + Dynamic
- **部署区域**: Hong Kong (hkg1)

---

## 🎯 快速命令

```bash
# 查看部署状态
vercel ls

# 查看项目日志
vercel logs

# 重新部署
vercel --prod

# 打开项目
vercel open

# 查看环境变量
vercel env ls
```

---

## ❓ 常见问题

### Q: 构建失败怎么办？

检查以下几点：
1. 确认 `DATABASE_URL` 环境变量已设置
2. 检查 Node.js 版本（推荐 18.x 或 20.x）
3. 查看 Vercel 部署日志

### Q: 数据库连接失败？

确认：
1. Neon 数据库处于可用状态
2. `DATABASE_URL` 格式正确
3. 数据库防火墙允许 Vercel IP

### Q: 环境变量未生效？

1. 确认在 Vercel Dashboard 的 **Environment Variables** 中设置了变量
2. 重新部署项目：`vercel --prod`

---

## 🎉 部署完成

部署成功后，您将获得：

- **生产环境 URL**: `https://chouqian.vercel.app`
- **自动 HTTPS**: ✅
- **全球 CDN**: ✅
- **自动部署**: Git push 时自动触发
- **数据分析**: Vercel Analytics

开始使用您的抽签系统吧！🎊
