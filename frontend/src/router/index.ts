import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页 · 知途（KnowPath）' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录 · 知途（KnowPath）' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册 · 知途（KnowPath）' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '学习总览 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/goal-conversation',
    name: 'GoalConversation',
    component: () => import('@/views/GoalConversation.vue'),
    meta: { title: '目标对话 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/learning-paths',
    name: 'LearningPaths',
    component: () => import('@/views/LearningPaths.vue'),
    meta: { title: '学习路径 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/learning-path/:id',
    name: 'LearningPathDetail',
    component: () => import('@/views/LearningPathDetail.vue'),
    meta: { title: '路径详情 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/learning-state',
    name: 'LearningState',
    component: () => import('@/views/LearningState.vue'),
    meta: { title: '学习状态 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('@/views/Achievements.vue'),
    meta: { title: '成长成就 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/learn/:taskId',
    name: 'LearningPage',
    component: () => import('@/views/LearningPage.vue'),
    meta: { title: '学习会话 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/dialogue-learn/:taskId',
    name: 'DialogueLearningPage',
    component: () => import('@/views/DialogueLearningPage.vue'),
    meta: { title: '对话学习 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/class-test',
    name: 'ClassTest',
    component: () => import('@/views/ClassTest.vue'),
    meta: { title: '课堂测试 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/docs',
    name: 'DeveloperDocs',
    component: () => import('@/views/DeveloperDocs.vue'),
    meta: { title: '开发文档 · 知途（KnowPath）' }
  },
  {
    path: '/demo/question-cards',
    redirect: '/docs'
  },
  {
    path: '/user',
    redirect: '/user/account',
    meta: { requiresAuth: true }
  },
  {
    path: '/user/account',
    name: 'UserAccount',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人资料 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/user/agent-logs',
    name: 'UserAgentLogs',
    component: () => import('@/views/user/AgentLogs.vue'),
    meta: { title: '运行日志 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/user/settings',
    name: 'UserSettings',
    component: () => import('@/views/user/Settings.vue'),
    meta: { title: '接口设置 · 知途（KnowPath）', requiresAuth: true }
  },
  {
    path: '/user/skills',
    redirect: '/user/agent-logs',
    meta: { requiresAuth: true }
  },
  {
    path: '/user/code-repo',
    redirect: '/user/agent-logs',
    meta: { requiresAuth: true }
  },
  {
    path: '/user/agents',
    redirect: '/user/agent-logs',
    meta: { requiresAuth: true }
  },
  {
    path: '/user/developer',
    redirect: '/docs',
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '后台登录 · 知途（KnowPath）' }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAdminAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Overview.vue'),
        meta: { title: '后台概览 · 知途（KnowPath）管理台', requiresAdminAuth: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { title: '用户管理 · 知途（KnowPath）管理台', requiresAdminAuth: true }
      },
      {
        path: 'api-config',
        name: 'AdminApiConfig',
        component: () => import('@/views/admin/ApiConfig.vue'),
        meta: { title: '接口配置 · 知途（KnowPath）管理台', requiresAdminAuth: true }
      },
      {
        path: 'execution-logs',
        name: 'AdminExecutionLogs',
        component: () => import('@/views/admin/ExecutionLogs.vue'),
        meta: { title: '执行日志 · 知途（KnowPath）管理台', requiresAdminAuth: true }
      },
      { path: 'conversations', redirect: '/admin/dashboard' },
      { path: 'agents', redirect: '/admin/execution-logs' },
      { path: 'sandbox', redirect: '/admin/dashboard' },
      { path: 'debug-sandbox', redirect: '/admin/dashboard' },
      { path: 'debug-sandbox/:id', redirect: '/admin/dashboard' },
      { path: 'arena', redirect: '/admin/dashboard' },
      { path: 'arena/:id', redirect: '/admin/dashboard' },
      { path: 'student-state', redirect: '/admin/dashboard' },
      { path: 'skills', redirect: '/admin/dashboard' },
      { path: 'agent-lab', redirect: '/admin/dashboard' }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到 · 知途（KnowPath）' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundFallback',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到 · 知途（KnowPath）' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  document.title = String(to.meta.title || '首页 · 知途（KnowPath）');

  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('admin_token');

  if (to.meta.requiresAdminAuth && !adminToken) {
    next('/admin/login');
    return;
  }

  if (to.meta.requiresAuth && !token) {
    next('/login');
    return;
  }

  if ((to.name === 'Login' || to.name === 'Register') && token) {
    next('/dashboard');
    return;
  }

  if (to.name === 'AdminLogin' && adminToken) {
    next('/admin/dashboard');
    return;
  }

  next();
});

export default router;
