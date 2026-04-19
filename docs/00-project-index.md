# 知途（KnowPath）项目文档索引

## 1. 文档说明
本目录用于集中交付“知途（KnowPath）”项目的完整说明材料，面向三类读者：

- **评审/答辩方**：快速理解作品定位、创新点、应用场景和技术方案
- **开发/维护方**：快速定位前后端结构、核心模块、关键接口与部署方法
- **AI 接手方**：在不丢失上下文的前提下继续分析、开发和排障

> 说明：仓库历史命名中仍可能出现 `WenFlow`、`wenflow`、`问流` 等字样，这些均为项目历史名称。当前统一产品名称为：**知途（KnowPath）**。

## 2. 文档清单
1. `01-software-design-spec.md`：软件设计说明书
2. `02-product-brief.md`：作品说明书
3. `03-user-manual.md`：用户手册
4. `04-source-code-guide.md`：源代码导读
5. `05-delivery-checklist.md`：源代码与交付清单
6. `06-ai-handoff-prompt.md`：AI 项目接手提示词

## 3. 推荐阅读顺序
### 面向评审/展示
- `02-product-brief.md`
- `01-software-design-spec.md`
- `03-user-manual.md`

### 面向开发/维护
- `04-source-code-guide.md`
- `01-software-design-spec.md`
- `05-delivery-checklist.md`

### 面向 AI 接手
- `06-ai-handoff-prompt.md`
- `04-source-code-guide.md`
- `01-software-design-spec.md`

## 4. 当前工程状态摘要
- 项目形态：前后端分离的 AI 学习平台原型 / 比赛作品
- 前端技术栈：Vue 3 + TypeScript + Vite + Pinia + Element Plus
- 后端技术栈：Node.js + Express + TypeScript + Prisma
- 数据库：开发默认 SQLite，可扩展到 PostgreSQL
- 当前主链路：注册登录、学习总览、目标对话、学习路径、对话学习、开放学习、学习状态、成长成就、后台管理
- 品牌状态：前端用户可见界面已统一为 **知途（KnowPath）**
- 最近验证：前端 `npm run build` 已通过

## 5. 目录位置
- 文档目录：`docs/`
- 前端源码：`frontend/`
- 后端源码：`backend/`
- 部署配置：`nginx/`
