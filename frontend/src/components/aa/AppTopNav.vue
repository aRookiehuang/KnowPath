<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const userInitial = computed(() => {
  const name = userStore.user?.name || '?';
  return name.trim().charAt(0).toUpperCase();
});

const userName = computed(() => userStore.user?.name || '访客');
const userLevelText = computed(() => userStore.user ? `Lv.${userStore.userLevel} · ${userStore.userXP} XP` : '尚未登录');

const topLinks = [
  { to: '/dashboard', label: '总览' },
  { to: '/learning-paths', label: '路径' },
  { to: '/learning-state', label: '状态' },
  { to: '/achievements', label: '成就' }
];

const isActive = (to: string) => {
  if (to === '/dashboard') return route.path === '/dashboard' || route.path === '/';
  return route.path.startsWith(to);
};

const goProfile = () => router.push('/user/account');
const goSettings = () => router.push('/user/settings');

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<template>
  <nav class="aa-topnav">
    <div class="aa-topnav__brand">
      <RouterLink to="/dashboard" class="aa-topnav__logo">
        <span class="aa-topnav__logo-mark">知</span>
        <span class="aa-topnav__logo-text">知途 KnowPath</span>
      </RouterLink>

      <div class="aa-topnav__links">
        <RouterLink
          v-for="link in topLinks"
          :key="link.to"
          :to="link.to"
          class="aa-topnav__link"
          :class="{ 'aa-topnav__link--active': isActive(link.to) }"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </div>

    <div class="aa-topnav__actions">
      <div class="aa-topnav__search" aria-label="全局搜索">
        <span class="material-symbols-outlined">search</span>
        <input type="search" aria-label="搜索路径、任务或学习记录" placeholder="搜索路径、任务、状态..." />
      </div>

      <button type="button" class="aa-topnav__icon-btn" title="接口设置" @click="goSettings">
        <span class="material-symbols-outlined">tune</span>
      </button>

      <div class="aa-topnav__user">
        <button type="button" class="aa-topnav__avatar" @click="goProfile" :title="userName">
          {{ userInitial }}
        </button>
        <div class="aa-topnav__user-meta">
          <span class="aa-topnav__user-name">{{ userName }}</span>
          <span class="aa-topnav__user-sub">{{ userLevelText }}</span>
        </div>
        <button
          v-if="userStore.user"
          type="button"
          class="aa-topnav__logout"
          title="退出登录"
          @click="logout"
        >
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.aa-topnav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--topnav-h);
  padding: 0 var(--space-6);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(172, 179, 183, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  z-index: 50;
}
.aa-topnav__brand { display: flex; align-items: center; gap: var(--space-8); }

.aa-topnav__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-ink);
  font-family: var(--font-headline);
}
.aa-topnav__logo-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
  color: var(--color-primary-on);
  font-weight: 700;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}
.aa-topnav__logo-text {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.aa-topnav__links { display: flex; gap: var(--space-6); }
.aa-topnav__link {
  position: relative;
  color: var(--color-ink-dim);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 22px 0;
  transition: color var(--duration-base) var(--easing);
}
.aa-topnav__link:hover { color: var(--color-primary); }
.aa-topnav__link--active { color: var(--color-primary); font-weight: 600; }
.aa-topnav__link--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--color-primary);
}

.aa-topnav__actions { display: flex; align-items: center; gap: var(--space-3); }

.aa-topnav__search {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  min-width: 260px;
  transition: background var(--duration-base) var(--easing);
}
.aa-topnav__search:focus-within { background: var(--color-surface-high); }
.aa-topnav__search .material-symbols-outlined { font-size: 18px !important; color: var(--color-ink-soft); }
.aa-topnav__search input {
  background: transparent;
  border: 0;
  outline: none;
  padding: 9px 10px;
  width: 100%;
  font-size: 0.86rem;
  color: var(--color-ink);
  font-family: var(--font-body);
}

.aa-topnav__icon-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-ink-soft);
}
.aa-topnav__icon-btn:hover { background: var(--color-surface-high); color: var(--color-primary); }
.aa-topnav__icon-btn .material-symbols-outlined { font-size: 20px !important; }

.aa-topnav__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: var(--space-3);
  border-left: 1px solid rgba(172, 179, 183, 0.25);
  margin-left: 4px;
}
.aa-topnav__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-family: var(--font-headline);
  font-weight: 700;
  border: 0;
  display: grid;
  place-items: center;
}
.aa-topnav__user-meta { display: flex; flex-direction: column; line-height: 1.2; }
.aa-topnav__user-name { font-size: 0.86rem; font-weight: 600; color: var(--color-ink); }
.aa-topnav__user-sub { font-size: 0.7rem; color: var(--color-ink-soft); letter-spacing: 0.08em; }

.aa-topnav__logout {
  background: transparent;
  border: 0;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: var(--color-ink-soft);
  display: grid;
  place-items: center;
}
.aa-topnav__logout:hover { background: var(--color-surface-high); color: var(--color-danger); }
.aa-topnav__logout .material-symbols-outlined { font-size: 18px !important; }

@media (max-width: 960px) {
  .aa-topnav__links,
  .aa-topnav__user-meta,
  .aa-topnav__search {
    display: none;
  }
}
</style>
