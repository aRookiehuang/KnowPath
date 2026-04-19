# 知途（KnowPath）源代码导读

## 1. 仓库总览
```text
wenflow/
  backend/      # 后端源码
  frontend/     # 前端源码
  docs/         # 文档与素材
  nginx/        # 部署配置
  README.md
  DEPLOYMENT.md
  ADMIN_SETUP.md
  start-dev.ps1
```

## 2. 建议阅读顺序
### 新开发者
1. `frontend/src/router/index.ts`
2. `frontend/src/views/` 下核心页面
3. `frontend/src/api/`
4. `backend/src/index.ts`
5. `backend/src/routes/learning.ts`
6. `backend/src/routes/goal-conversation.ts`
7. `backend/src/services/learning/*`

### AI 接手者
优先抓住三条线：
- **页面线**：用户从哪里进入、可以走到哪里
- **接口线**：前端调用了哪些 API、参数是什么
- **业务线**：后端如何生成路径、开启对话学习、记录状态

## 3. 前端源码导读
### 3.1 入口
- `frontend/src/main.ts`：挂载 Vue 应用、注册 Pinia、Router、Element Plus、全局样式

### 3.2 路由
- `frontend/src/router/index.ts`：定义用户路由、后台路由、页面标题与鉴权要求

### 3.3 设计系统
- `frontend/src/styles/main.css`：统一 token、颜色、间距、圆角、阴影、状态样式
- `frontend/src/components/aa/`：当前前端重构后的核心组件库

建议优先熟悉：
- `AppShell.vue`
- `AppTopNav.vue`
- `AppSideRail.vue`
- `APanel.vue`
- `AButton.vue`
- `AStatTile.vue`

### 3.4 核心页面
按业务流建议阅读：
1. `Home.vue`
2. `Login.vue` / `Register.vue`
3. `Dashboard.vue`
4. `GoalConversation.vue`
5. `LearningPaths.vue`
6. `LearningPathDetail.vue`
7. `TaskDetail.vue`
8. `DialogueLearningPage.vue`
9. `LearningPage.vue`
10. `LearningState.vue`
11. `Achievements.vue`
12. `Profile.vue`
13. `views/admin/*`

### 3.5 API 层
- `auth.ts`
- `user.ts`
- `goalConversation.ts`
- `learning.ts`
- `dialogue.ts`

重点关注接口路径、参数完整性以及返回结构如何映射到页面。

## 4. 后端源码导读
### 4.1 入口
- `backend/src/index.ts`：应用初始化、中间件注册、路由注册、管理员初始化、Gateway 初始化

### 4.2 路由层
优先阅读：
- `routes/auth.ts`
- `routes/learning.ts`
- `routes/goal-conversation.ts`
- `routes/ai-teaching.routes.ts`
- `routes/admin/platform.ts`

### 4.3 服务层
优先阅读：
- `goal-conversation.service.ts`
- `learning.service.ts`
- `dialogue-learning.service.ts`
- `learning-state.service.ts`
- `state-tracking.service.ts`
- `AITeachingOrchestrator.ts`

### 4.4 AI 能力层
- `gateway/index.ts`：统一模型、agent、skill、plugin 编排入口
- `agents/`：多类智能体实现与注册

## 5. 数据模型导读
- `backend/prisma/schema.prisma`：数据库结构核心文件

建议优先理解这些数据块：
- 用户与身份
- 学习路径与任务
- 会话与状态
- 后台日志与统计
- agent 与实验性模块数据

## 6. 主链路与非主链路
### 6.1 主链路
- 登录 / 注册
- 学习总览
- 目标对话
- 学习路径与任务
- 对话学习
- 开放学习
- 学习状态
- 成长成就
- 后台概览 / 用户 / 配置 / 日志

### 6.2 实验性或历史模块
仓库中仍存在一些实验性、历史性或未来扩展模块，例如：
- arena
- agent-lab
- debug-sandbox
- ab-testing
- interactive-learning

维护时应先确保主链路稳定，再考虑实验模块。

## 7. 近期关键修复
1. 前端品牌统一为“知途（KnowPath）”
2. 后台概览统计卡显示对象文本的问题已修复
3. 用户侧显式“开发文档”入口已移除
4. 目标对话页向更沉浸的工作区方向收口
5. 对话学习页 `pathId` 缺失导致的启动失败已修复
6. 部分未使用旧组件、旧壳层、旧页面已清理

## 8. 推荐排查命令
### 前端
```powershell
cd frontend
npm install
npm run dev
npm run build
```

### 后端
```powershell
cd backend
npm install
npm run dev
```

### Prisma
```powershell
cd backend
npx prisma generate
npx prisma db push
```

## 9. 维护注意点
- 优先信任当前运行时行为，不要只看旧注释
- 参数链路要从入口页一路核对到后端 route
- 看到 `WenFlow` 命名先判断是历史遗留还是用户可见内容
- 对实验性模块不要贸然删除，先确认引用关系

## 10. 小结
这个项目最适合以“学习产品主链路 + AI 教学业务服务 + 管理后台运维”三层结构来理解。抓住这三层，接手效率会显著提高。
