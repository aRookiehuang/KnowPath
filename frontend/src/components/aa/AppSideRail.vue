<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();

const sections: Array<{ title: string; items: Array<{ to: string; label: string; icon: string }> }> = [
  {
    title: '学习空间',
    items: [
      { to: '/dashboard', label: '学习总览', icon: 'dashboard' },
      { to: '/goal-conversation', label: '目标对话', icon: 'biotech' },
      { to: '/learning-paths', label: '学习路径', icon: 'account_tree' }
    ]
  },
  {
    title: '学习反馈',
    items: [
      { to: '/learning-state', label: '学习状态', icon: 'analytics' },
      { to: '/achievements', label: '成长成就', icon: 'military_tech' },
      { to: '/user/agent-logs', label: '运行日志', icon: 'history' }
    ]
  },
  {
    title: '个人与配置',
    items: [
      { to: '/user/account', label: '个人资料', icon: 'person' },
      { to: '/user/settings', label: '接口设置', icon: 'tune' }
    ]
  }
];

const userCard = computed(() => ({
  name: userStore.user?.name || '访客',
  level: userStore.user ? `Lv.${userStore.userLevel} 学习者` : '尚未登录',
  sub: userStore.user ? `${userStore.userXP} XP 已累计` : '登录后查看你的学习成长记录'
}));

const isActive = (to: string) => {
  if (to === '/dashboard') return route.path === '/dashboard';
  return route.path.startsWith(to);
};
</script>

<template>
  <aside class="aa-rail">
    <div class="aa-rail__card">
      <div class="aa-rail__avatar">
        <span class="material-symbols-outlined">school</span>
      </div>
      <div class="aa-rail__card-text">
        <p class="aa-rail__card-name">{{ userCard.name }}</p>
        <p class="aa-rail__card-level">{{ userCard.level }}</p>
        <p class="aa-rail__card-sub">{{ userCard.sub }}</p>
      </div>
    </div>

    <RouterLink to="/goal-conversation" class="aa-rail__cta">
      <span class="material-symbols-outlined">auto_awesome</span>
      开始规划目标
    </RouterLink>

    <nav class="aa-rail__nav">
      <div v-for="section in sections" :key="section.title" class="aa-rail__section">
        <p class="aa-rail__section-title">{{ section.title }}</p>
        <RouterLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="aa-rail__item"
          :class="{ 'aa-rail__item--active': isActive(item.to) }"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <footer class="aa-rail__foot">
      <p class="aa-rail__foot-meta">Academic Architect · 学习工作台</p>
      <p class="aa-rail__foot-meta aa-rail__foot-meta--muted">围绕路径、状态与反馈持续迭代</p>
    </footer>
  </aside>
</template>

<style scoped>
.aa-rail {
  position: fixed;
  top: var(--topnav-h);
  left: 0;
  bottom: 0;
  width: var(--siderail-w);
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  gap: var(--space-4);
  overflow-y: auto;
  z-index: 40;
}

.aa-rail__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}
.aa-rail__avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}
.aa-rail__avatar .material-symbols-outlined { font-size: 22px !important; }

.aa-rail__card-text { min-width: 0; }
.aa-rail__card-name {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 0.94rem;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aa-rail__card-level {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 0.06em;
}
.aa-rail__card-sub {
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  margin-top: 2px;
  line-height: 1.45;
}

.aa-rail__cta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dim) 100%);
  color: var(--color-primary-on);
  font-weight: 600;
  font-size: 0.9rem;
  justify-content: center;
  transition: background var(--duration-base) var(--easing);
}
.aa-rail__cta:hover { background: var(--color-primary-dim); color: var(--color-primary-on); }
.aa-rail__cta .material-symbols-outlined { font-size: 18px !important; }

.aa-rail__nav { flex: 1; display: flex; flex-direction: column; gap: var(--space-4); }
.aa-rail__section { display: flex; flex-direction: column; gap: 2px; }
.aa-rail__section-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  padding: 4px 12px;
}

.aa-rail__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  color: var(--color-ink-dim);
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: background var(--duration-base) var(--easing),
              color var(--duration-base) var(--easing);
}
.aa-rail__item:hover { background: var(--color-surface); color: var(--color-primary); }
.aa-rail__item .material-symbols-outlined { font-size: 18px !important; color: var(--color-ink-soft); }
.aa-rail__item--active {
  background: var(--color-surface);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--color-primary);
}
.aa-rail__item--active .material-symbols-outlined { color: var(--color-primary); }

.aa-rail__foot { padding: var(--space-3); }
.aa-rail__foot-meta {
  font-size: 0.7rem;
  color: var(--color-ink-soft);
  letter-spacing: 0.06em;
}
.aa-rail__foot-meta--muted { opacity: 0.7; margin-top: 2px; }

@media (max-width: 960px) {
  .aa-rail { display: none; }
}
</style>
