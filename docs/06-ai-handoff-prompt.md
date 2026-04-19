# 知途（KnowPath）AI 项目接手提示词

以下内容可直接复制给另一个 AI，用于高保真接手本项目。

---

## 提示词正文

你现在要接手一个名为 **知途（KnowPath）** 的前后端一体项目。请严格按以下上下文理解项目，不要把它误判成普通聊天网站，也不要被仓库中的历史名称和实验性模块干扰。

### 一、项目身份
- 当前产品统一名称：**知途（KnowPath）**
- 历史仓库名称：`WenFlow / wenflow / 问流`
- 项目性质：**AI 学习平台 / 比赛作品 / 可继续扩展的产品原型**
- 项目目标：帮助用户从模糊目标出发，通过目标澄清、学习路径生成、对子任务的对话学习、开放学习和状态反馈，逐步形成可执行学习闭环

### 二、你要优先理解的不是“聊天”，而是“学习工作流”
主流程：
1. 注册 / 登录
2. 学习总览
3. 目标对话
4. 学习路径生成
5. 路径详情与任务拆解
6. 对话学习 / 开放学习
7. 学习状态
8. 成长成就
9. 管理后台（概览 / 用户 / 配置 / 日志）

### 三、仓库结构
- `frontend/`：Vue 3 前端
- `backend/`：Express + Prisma 后端
- `docs/`：文档
- `nginx/`：部署配置

### 四、前端技术栈
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus
- 自定义 `aa` 设计系统

关键前端文件：
- `frontend/src/router/index.ts`
- `frontend/src/styles/main.css`
- `frontend/src/components/aa/*`
- `frontend/src/views/Dashboard.vue`
- `frontend/src/views/GoalConversation.vue`
- `frontend/src/views/LearningPaths.vue`
- `frontend/src/views/LearningPathDetail.vue`
- `frontend/src/views/DialogueLearningPage.vue`
- `frontend/src/views/LearningPage.vue`
- `frontend/src/views/LearningState.vue`
- `frontend/src/views/Achievements.vue`
- `frontend/src/views/admin/*`

### 五、后端技术栈
- Node.js
- Express
- TypeScript
- Prisma
- JWT
- bcrypt
- OpenAI 兼容模型调用
- Gateway + Agents 架构

关键后端文件：
- `backend/src/index.ts`
- `backend/src/routes/learning.ts`
- `backend/src/routes/goal-conversation.ts`
- `backend/src/routes/ai-teaching.routes.ts`
- `backend/src/routes/admin/platform.ts`
- `backend/src/services/learning/*`
- `backend/src/services/ai-teaching/AITeachingOrchestrator.ts`
- `backend/src/gateway/index.ts`
- `backend/prisma/schema.prisma`

### 六、主链路与实验模块要分清
优先关注主链路：
- 登录 / 注册
- 学习总览
- 目标对话
- 学习路径与任务
- 对话学习
- 开放学习
- 学习状态
- 成长成就
- 后台概览 / 用户 / 配置 / 日志

实验性模块可能包括：
- `arena`
- `agent-lab`
- `debug-sandbox`
- `ab-testing`
- `interactive-learning`

不要一上来就围绕这些模块做主判断，也不要在未确认引用关系前随意删除。

### 七、近期已经完成的重要改造
1. 前端已统一品牌为“知途（KnowPath）”
2. 用户界面已统一中文文案
3. 已建立 `aa/` 设计系统与全局 token
4. 后台页面已做一轮视觉统一收口
5. 用户主界面显式“开发文档”模块已移除
6. 后台概览统计卡显示对象文本的问题已修复
7. 对话学习启动报错已修复：后端要求 `taskId + pathId`，前端现已补齐参数链路
8. 前端最近一次 `npm run build` 已通过

### 八、阅读代码时必须注意的事实
- 不要机械相信旧文案、旧注释、旧文件名
- 以“当前运行中的主路由、主页面、主 API”为准
- 对话学习后端启动接口是 `POST /api/learning/dialogue/start`，必须传 `taskId` 与 `pathId`
- 管理后台统计接口返回的是结构化对象，不能直接把整个对象渲染到统计卡

### 九、推荐阅读顺序
1. `frontend/src/router/index.ts`
2. `frontend/src/views/Dashboard.vue`
3. `frontend/src/views/GoalConversation.vue`
4. `frontend/src/views/LearningPathDetail.vue`
5. `frontend/src/views/DialogueLearningPage.vue`
6. `frontend/src/api/learning.ts`
7. `frontend/src/api/dialogue.ts`
8. `backend/src/routes/learning.ts`
9. `backend/src/routes/goal-conversation.ts`
10. `backend/src/services/learning/*`
11. `backend/prisma/schema.prisma`
12. `backend/src/routes/admin/platform.ts`

### 十、推荐先执行的命令
```powershell
cd frontend
npm install
npm run dev
npm run build

cd ../backend
npm install
npm run dev
```

若数据库未初始化，再执行：
```powershell
npx prisma generate
npx prisma db push
```

### 十一、接手后输出建议
如果你要继续工作，请尽量按以下顺序：
1. 先说明你理解到的产品主链路
2. 再说明你定位到的关键文件与模块
3. 再执行具体修改
4. 修改后给出：改了哪些文件、为什么改、哪些功能已验证、剩余风险是什么

### 十二、你不应丢失的一句话
这不是一个普通聊天产品，而是一个围绕“**目标澄清 → 路径规划 → 学习推进 → 状态反馈**”构建的 AI 学习工作台。
