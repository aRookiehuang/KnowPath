<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import AButton from '@/components/aa/AButton.vue';

const router = useRouter();
</script>

<template>
  <AppShell noRail>
    <div class="not-found">
      <div class="not-found__grid"></div>
      <div class="not-found__card">
        <p class="aa-eyebrow">404 / 页面未找到</p>
        <h1>你访问的页面不存在</h1>
        <p>当前链接可能已经失效、被移动，或暂未开放。你可以返回首页继续浏览，或前往学习总览重新进入主要流程。</p>
        <div class="not-found__actions">
          <AButton variant="secondary" icon="home" @click="router.push('/')">返回首页</AButton>
          <AButton icon-right="arrow_forward" @click="router.push('/dashboard')">前往学习总览</AButton>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  padding: calc(var(--topnav-h) + var(--space-10)) var(--space-6) var(--space-10);
  overflow: hidden;
}
.not-found__grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(var(--color-ink) 1px, transparent 1px) 0 0 / 40px 40px,
    linear-gradient(90deg, var(--color-ink) 1px, transparent 1px) 0 0 / 40px 40px;
  opacity: 0.03;
}
.not-found__card {
  position: relative;
  width: min(720px, 100%);
  padding: var(--space-10);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-elevated);
  text-align: center;
}
.not-found__card h1 {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  margin: 12px 0 16px;
}
.not-found__card p:last-of-type {
  max-width: 42rem;
  margin: 0 auto;
  color: var(--color-ink-dim);
  line-height: 1.75;
}
.not-found__actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-8);
  flex-wrap: wrap;
}
</style>
