# 🎲 多功能抽签系统 (Lucky Draw System)

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)

一个功能完善、界面活泼可爱的抽签系统，专为课堂教学活动设计

[功能特性](#功能特性) • [快速开始](#快速开始) • [部署指南](#部署指南) • [演示](#演示)

</div>

---

## ✨ 功能特性

### 🎯 多种抽签模式

- **数字抽签** - 设置数字范围，支持重复/不重复抽取
- **姓名抽签** - 从学生名单中随机抽取
- **诗词抽签** - 预置古诗词库，随机展示
- **自定义抽签** - 完全自定义抽签内容

### 🎨 三种展示风格

| 风格 | 描述 | 动画效果 |
|------|------|----------|
| 🎴 卡片风格 | 现代卡片设计 | 3D 翻转动画 |
| 🎋 竹签风格 | 传统中式设计 | 摇晃动画 |
| 🎡 转盘风格 | 经典抽奖转盘 | 旋转减速动画 |

### 📦 批量导入

- 📝 **文本导入** - 粘贴换行分隔的文本
- 📊 **CSV 导入** - 上传 CSV 文件
- 📈 **Excel 导入** - 上传 Excel 文件

### 📊 数据管理

- ✅ 抽签历史记录
- 📈 操作日志追踪
- 🔍 历史查询功能
- 💾 数据持久化存储

### 🎭 精美 UI 设计

- 🌈 暖橙色主题，活泼可爱
- 📱 完全响应式设计
- 🎬 流畅的动画效果
- 🎯 直观的操作界面

---

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/lucky-draw-system.git
cd lucky-draw-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 环境变量

创建 `.env.local` 文件：

```env
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"
```

### 数据库设置

```bash
# 生成数据库迁移
npm run db:generate

# 推送 schema 到数据库
npm run db:push

# 打开数据库管理界面
npm run db:studio
```

---

## 🏗️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | [Next.js 15](https://nextjs.org/) (App Router) |
| **语言** | [TypeScript](https://www.typescriptlang.org/) |
| **样式** | [Tailwind CSS](https://tailwindcss.com/) |
| **组件库** | [shadcn/ui](https://ui.shadcn.com/) |
| **动画** | [Framer Motion](https://www.framer.com/motion/) |
| **状态管理** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **数据库** | [Vercel Postgres](https://vercel.com/storage/postgres) (Neon) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **表单** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **CSV 解析** | [PapaParse](https://www.papaparse.com/) |
| **Excel 解析** | [SheetJS](https://sheetjs.com/) |
| **部署** | [Vercel](https://vercel.com/) |

---

## 📸 界面预览

### 主页 - 项目列表
![主页](https://via.placeholder.com/800x500?text=Project+List+Page)

### 抽签页面 - 卡片风格
![卡片风格](https://via.placeholder.com/800x500?text=Card+Style)

### 抽签页面 - 竹签风格
![竹签风格](https://via.placeholder.com/800x500?text=Stick+Style)

### 抽签页面 - 转盘风格
![转盘风格](https://via.placeholder.com/800x500?text=Wheel+Style)

---

## 🎯 使用场景

- 📚 **课堂提问** - 随机抽取学生回答问题
- 👥 **分组活动** - 随机分配小组
- 🎁 **奖励抽奖** - 课堂小礼品抽奖
- 📜 **诗词学习** - 随机学习古诗词
- 🪑 **座位安排** - 随机安排座位
- 🎮 **游戏环节** - 各种课堂小游戏

---

## 📦 项目结构

```
lucky-draw-system/
├── app/
│   ├── api/              # API 路由
│   │   ├── draw/         # 抽签 API
│   │   ├── projects/     # 项目管理 API
│   │   ├── import/       # 导入 API
│   │   └── logs/         # 日志 API
│   ├── draw/[id]/        # 抽签页面
│   ├── projects/new/     # 创建项目页面
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 主页
├── components/
│   ├── ui/               # shadcn/ui 基础组件
│   ├── draw/             # 抽签组件
│   │   ├── DrawCard.tsx  # 卡片风格
│   │   ├── DrawStick.tsx # 竹签风格
│   │   └── DrawWheel.tsx # 转盘风格
│   ├── import/           # 导入组件
│   └── layout/           # 布局组件
├── lib/
│   ├── db/               # 数据库
│   │   ├── schema.ts     # 数据库 Schema
│   │   └── index.ts      # 数据库连接
│   └── utils/
│       ├── draw.ts       # 抽签引擎
│       ├── logger.ts     # 日志工具
│       └── index.ts      # 工具函数
├── store/                # Zustand 状态管理
├── types/                # TypeScript 类型
└── docs/                 # 项目文档
```

---

## 🚀 部署指南

### Vercel 部署

最简单的部署方式是使用 [Vercel](https://vercel.com)：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### 部署步骤

1. **点击上面的按钮** 或使用 Vercel CLI：

```bash
npm install -g vercel
vercel login
vercel
```

2. **配置环境变量**

   在 Vercel 项目设置中添加：
   ```env
   DATABASE_URL=your_postgresql_connection_string
   ```

3. **设置数据库**

   - 在 Vercel 项目中创建 Postgres 数据库
   - 或使用自己的 PostgreSQL 数据库

4. **运行迁移**

   ```bash
   vercel env pull .env.local
   npm run db:push
   ```

详细部署指南请查看 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Drizzle ORM](https://orm.drizzle.team/) - ORM 工具

---

## 📮 联系方式

- 项目主页: [https://github.com/yourusername/lucky-draw-system](https://github.com/yourusername/lucky-draw-system)
- 问题反馈: [GitHub Issues](https://github.com/yourusername/lucky-draw-system/issues)

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star！**

Made with ❤️ by [Your Name]

</div>
