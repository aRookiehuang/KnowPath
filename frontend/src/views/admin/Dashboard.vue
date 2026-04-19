<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { adminAuthApi } from '@/api/adminApi';

const route = useRoute();
const router = useRouter();

const navGroups = [
  {
    title: '总览',
    items: [{ to: '/admin/dashboard', label: '平台概览', icon: 'dashboard' }]
  },
  {
    title: '管理维护',
    items: [
      { to: '/admin/users', label: '用户管理', icon: 'groups' },
      { to: '/admin/api-config', label: '接口配置', icon: 'tune' },
      { to: '/admin/execution-logs', label: '执行日志', icon: 'receipt_long' }
    ]
  }
];

const adminUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('admin_user') || '{}');
  } catch {
    return {};
  }
});

const pageTitle = computed(() => {
  if (route.path.startsWith('/admin/users')) return '用户管理';
  if (route.path.startsWith('/admin/api-config')) return '接口配置';
  if (route.path.startsWith('/admin/execution-logs')) return '执行日志';
  return '平台概览';
});

const pageDescription = computed(() => {
  if (route.path.startsWith('/admin/users')) return '查看用户分布、权限状态与使用活跃度，支持后续治理与运营决策。';
  if (route.path.startsWith('/admin/api-config')) return '统一维护模型通道、接口参数与默认配置，保证服务稳定输出。';
  if (route.path.startsWith('/admin/execution-logs')) return '审查系统运行日志与异常链路，快速定位失败请求与执行风险。';
  return '聚合查看平台趋势、核心指标、调用热度与系统健康度。';
});

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`);

const logout = () => {
  adminAuthApi.logout();
  router.push('/admin/login');
};
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-shell__rail">
      <RouterLink to="/admin/dashboard" class="admin-shell__brand" aria-label="进入知途管理台首页">
        <span class="admin-shell__brand-mark">知</span>
        <div>
          <strong>知途（KnowPath）管理台</strong>
          <small>统一运营后台</small>
        </div>
      </RouterLink>

      <div class="admin-shell__launch-card">
        <p class="aa-meta">控制中心</p>
        <h2>{{ pageTitle }}</h2>
        <p>{{ pageDescription }}</p>
      </div>

      <nav class="admin-shell__nav" aria-label="后台主导航">
        <div v-for="group in navGroups" :key="group.title" class="admin-shell__group">
          <p class="admin-shell__group-title">{{ group.title }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="admin-shell__nav-item"
            :class="{ 'admin-shell__nav-item--active': isActive(item.to) }"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="admin-shell__footer">
        <button type="button" class="admin-shell__footer-btn" @click="logout" aria-label="退出知途管理台">
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>退出管理台</span>
        </button>
      </div>
    </aside>

    <div class="admin-shell__body">
      <header class="admin-shell__topbar">
        <div>
          <p class="aa-meta">后台工作区</p>
          <h1>{{ pageTitle }}</h1>
        </div>

        <div class="admin-shell__topbar-actions">
          <RouterLink to="/dashboard" class="admin-shell__ghost-link">返回前台</RouterLink>

          <div class="admin-shell__admin-card" aria-label="当前管理员信息">
            <span class="admin-shell__avatar">{{ (adminUser.name || '管').slice(0, 1).toUpperCase() }}</span>
            <div>
              <strong>{{ adminUser.name || '管理员' }}</strong>
              <small>知途（KnowPath）管理台</small>
            </div>
          </div>
        </div>
      </header>

      <main class="admin-shell__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(117, 156, 228, 0.08), transparent 32%),
    linear-gradient(180deg, #f7f9fc 0%, #f3f6fb 100%);
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
}

.admin-shell__rail {
  position: sticky;
  top: 0;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  background: rgba(246, 248, 252, 0.96);
  border-right: 1px solid rgba(172, 179, 183, 0.22);
  backdrop-filter: blur(20px);
}

.admin-shell__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-ink);
}

.admin-shell__brand-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #7ea5e6 100%);
  color: var(--color-primary-on);
  font-family: var(--font-headline);
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(44, 94, 167, 0.22);
}

.admin-shell__brand strong {
  display: block;
  font-family: var(--font-headline);
  font-size: 1.02rem;
}

.admin-shell__brand small { color: var(--color-ink-soft); }

.admin-shell__launch-card {
  padding: var(--space-5);
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(172, 179, 183, 0.18);
  border-radius: var(--radius-md);
  box-shadow: 0 20px 48px rgba(38, 55, 77, 0.08);
}

.admin-shell__launch-card h2 {
  margin: 10px 0 8px;
  font-size: 1.2rem;
}

.admin-shell__launch-card p:last-child {
  color: var(--color-ink-dim);
  line-height: 1.7;
}

.admin-shell__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-shell__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-shell__group-title {
  padding: 0 12px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.admin-shell__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  color: var(--color-ink-dim);
  transition:
    transform var(--duration-base) var(--easing),
    background var(--duration-base) var(--easing),
    color var(--duration-base) var(--easing),
    box-shadow var(--duration-base) var(--easing);
}

.admin-shell__nav-item:hover {
  transform: translateX(2px);
  background: rgba(255, 255, 255, 0.86);
  color: var(--color-primary);
}

.admin-shell__nav-item--active {
  background: #fff;
  color: var(--color-primary);
  box-shadow:
    inset 3px 0 0 var(--color-primary),
    0 12px 24px rgba(39, 61, 94, 0.06);
}

.admin-shell__nav-item .material-symbols-outlined { font-size: 18px !important; }

.admin-shell__footer { margin-top: auto; }

.admin-shell__footer-btn {
  width: 100%;
  border: 0;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-ink-dim);
  background: transparent;
}

.admin-shell__footer-btn:hover {
  background: rgba(255, 255, 255, 0.84);
  color: var(--color-danger);
}

.admin-shell__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-shell__topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-8);
  border-bottom: 1px solid rgba(172, 179, 183, 0.18);
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(18px);
}

.admin-shell__topbar h1 {
  margin-top: 8px;
  font-size: 1.9rem;
}

.admin-shell__topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.admin-shell__ghost-link {
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba(244, 247, 252, 0.9);
  color: var(--color-ink);
  border: 1px solid rgba(172, 179, 183, 0.16);
}

.admin-shell__ghost-link:hover {
  color: var(--color-primary);
  background: #fff;
}

.admin-shell__admin-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: var(--space-4);
  border-left: 1px solid rgba(172, 179, 183, 0.2);
}

.admin-shell__avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(44, 94, 167, 0.1);
  color: var(--color-primary);
  font-family: var(--font-headline);
  font-weight: 700;
}

.admin-shell__admin-card strong { display: block; }
.admin-shell__admin-card small { color: var(--color-ink-soft); }

.admin-shell__content { padding: var(--space-8); }

@media (max-width: 1100px) {
  .admin-shell { grid-template-columns: 1fr; }

  .admin-shell__rail {
    position: static;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid rgba(172, 179, 183, 0.18);
  }
}

@media (max-width: 720px) {
  .admin-shell__topbar,
  .admin-shell__content,
  .admin-shell__rail {
    padding: var(--space-5);
  }

  .admin-shell__topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-shell__topbar-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
