# AI 协作配置

## 语言设置

**重要**: 请始终使用中文进行所有对话、代码注释和文档编写。

## 项目概述

这是一个为课堂教学设计的多功能抽签系统，具有活泼可爱的 UI 设计。

## 快速参考

### 关键文件位置
- 数据库 Schema: `lib/db/schema.ts`
- 抽签引擎: `lib/utils/draw.ts`
- API 路由: `app/api/`
- 组件目录: `components/`
- 文档目录: `docs/`

### 数据库表
- `draw_projects` - 抽签项目配置
- `draw_records` - 抽签历史记录
- `activity_logs` - 操作日志

### 开发命令
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run db:generate  # 生成数据库迁移
npm run db:push      # 推送 schema 到数据库
npm run db:studio    # 打开数据库管理界面
```

## 工作流程

1. **每次任务前**: 查看 `docs/PROGRESS.md` 了解当前进度
2. **执行任务**: 按计划实施功能
3. **每次任务后**: 更新 `docs/PROGRESS.md` 记录进度

## UI 风格规范

- 主色: `#FF6B6B` (暖橙色)
- 辅色: `#4ECDC4` (天蓝色)
- 背景: `#FFF9F0` (米白色)
- 圆角: 使用较大的圆角值 (12px-16px)
- 阴影: 柔和的阴影效果
- 动画: 使用 Framer Motion 实现流畅动画

## 三种展示风格

1. **竹签风格** (`DrawStick.tsx`): 传统中式设计，摇晃动画
2. **卡片风格** (`DrawCard.tsx`): 现代设计，3D 翻转动画
3. **转盘风格** (`DrawWheel.tsx`): 经典转盘，旋转减速动画
