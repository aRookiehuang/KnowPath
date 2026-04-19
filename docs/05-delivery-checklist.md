# 知途（KnowPath）源代码与交付清单

## 1. 交付目标
本清单用于说明当前项目已经交付的源码、文档、运行方式与能力边界，便于评审、验收与后续接手。

## 2. 源代码交付范围
### 2.1 前端源码
目录：`frontend/`

已交付内容包括：
- Vue 3 + TypeScript 前端工程
- 用户端主要页面
- 管理后台主要页面
- 路由系统
- Pinia 状态管理
- API 封装层
- `aa` 设计系统组件
- 全局样式与设计 token

### 2.2 后端源码
目录：`backend/`

已交付内容包括：
- Express + TypeScript 服务端工程
- 认证接口
- 学习路径、任务、状态相关接口
- 目标对话接口
- 对话学习与开放学习接口
- 管理后台接口
- AI Gateway 与 agents 模块
- Prisma 数据模型

### 2.3 部署辅助内容
- `nginx/`
- `start-dev.ps1`
- `DEPLOYMENT.md`
- `ADMIN_SETUP.md`

### 2.4 文档交付
目录：`docs/`

当前文档包括：
- 软件设计说明书
- 作品说明书
- 用户手册
- 源代码导读
- AI 接手提示词

## 3. 功能交付清单
### 3.1 用户主链路
- [x] 注册 / 登录
- [x] 学习总览
- [x] 目标对话
- [x] 学习路径生成与查看
- [x] 路径详情与任务查看
- [x] 对话学习
- [x] 开放学习
- [x] 学习状态
- [x] 成长成就
- [x] 用户资料与设置
- [x] 运行日志

### 3.2 管理后台
- [x] 后台登录
- [x] 平台概览
- [x] 用户管理
- [x] 接口配置
- [x] 执行日志

### 3.3 工程能力
- [x] 统一设计系统
- [x] 全中文文案
- [x] 品牌统一为知途（KnowPath）
- [x] 前端构建通过
- [x] 路由守卫
- [x] API 分层封装

## 4. 当前版本已完成的关键整理
- 前端已从旧页面体系中抽离，重构为产品级界面
- 用户主流程与后台主流程已打通
- 后台概览统计映射问题已修复
- 主界面显式“开发文档”模块已移除
- 对话学习 `taskId/pathId` 参数缺失问题已修复
- 部分未使用旧组件与旧壳层已清理

## 5. 运行与构建说明
### 5.1 前端
```powershell
cd frontend
npm install
npm run dev
npm run build
```

### 5.2 后端
```powershell
cd backend
npm install
npm run dev
npm run build
```

### 5.3 数据库
```powershell
cd backend
npx prisma generate
npx prisma db push
```

## 6. 环境要求
### 基础要求
- Node.js 18+
- npm
- SQLite（开发默认）或 PostgreSQL（生产建议）

### 关键环境变量
#### 后端
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CORS_ORIGIN`
- `AI_API_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_MODEL_REASONING`
- `INIT_ADMIN_NAME`
- `INIT_ADMIN_PASSWORD`

#### 前端
- `VITE_API_BASE_URL`
- `VITE_APP_TITLE`

## 7. 阅读建议
### 优先阅读
- `frontend/src/router/index.ts`
- `frontend/src/views/`
- `frontend/src/api/`
- `backend/src/routes/learning.ts`
- `backend/src/routes/goal-conversation.ts`
- `backend/src/services/learning/`
- `backend/prisma/schema.prisma`

### 次级阅读
- `backend/src/gateway/`
- `backend/src/agents/`
- `backend/src/routes/admin/`

### 审慎阅读
- arena
- agent-lab
- debug-sandbox
- interactive-learning
- ab-testing 等实验性模块

## 8. 当前交付边界
当前版本已经是“可运行、可构建、可继续开发”的完整原型，但仍以比赛展示和主链路验证为优先，不等同于全量生产级系统。

## 9. 结论
本项目已完成从“概念型页面集合”向“产品级前后端工程原型”的跃迁，足以支持比赛展示、功能演示、二次开发和 AI 接手维护。
