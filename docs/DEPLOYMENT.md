# 部署指南 - 多功能抽签系统

## 部署前准备

### 1. Vercel Postgres 数据库设置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目设置 → Storage → Create Database
3. 选择 Postgres (基于 Neon)
4. 创建数据库后，获取连接字符串

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

### 3. 数据库迁移

部署后，需要运行数据库迁移来创建表结构：

```bash
# 开发环境
npm run db:generate
npm run db:push

# 生产环境 (使用 Vercel CLI)
vercel env pull .env.local
npm run db:push
```

## 部署到 Vercel

### 方式 1: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

### 方式 2: 通过 Git

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

## 部署后检查清单

- [ ] 访问主页是否正常加载
- [ ] 创建新项目是否成功
- [ ] 执行抽签是否正常工作
- [ ] 三种 UI 风格是否都能正常切换
- [ ] 历史记录是否正常显示
- [ ] 批量导入功能是否正常

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 数据库管理

### 查看数据库

```bash
# 打开 Drizzle Studio
npm run db:studio
```

### 重置数据库

```sql
-- 连接到数据库后执行
DROP TABLE IF EXISTS draw_records;
DROP TABLE IF EXISTS draw_projects;
DROP TABLE IF EXISTS activity_logs;
```

然后重新运行迁移：
```bash
npm run db:push
```

## 故障排查

### 数据库连接失败

检查 `DATABASE_URL` 环境变量是否正确设置。

### 构建失败

检查 Node.js 版本是否为 18.x 或更高。

### 抽签功能不工作

1. 检查浏览器控制台是否有错误
2. 检查 API 路由是否正常响应
3. 检查数据库连接是否正常

## 性能优化建议

1. 启用 Vercel Edge Network
2. 使用 Vercel KV 缓存频繁访问的数据
3. 优化图片和静态资源
4. 启用压缩和缓存策略

## 安全建议

1. 定期更新依赖包
2. 启用 HTTPS
3. 限制 API 请求频率
4. 验证所有用户输入

## 许可证

MIT License
