<script setup lang="ts">
interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}
defineProps<Props>();
</script>

<template>
  <div class="aa-auth">
    <section class="aa-auth__aside">
      <RouterLink to="/" class="aa-auth__logo">
        <span class="aa-auth__logo-mark">知</span>
        <span>知途 KnowPath</span>
      </RouterLink>
      <div class="aa-auth__pitch">
        <p v-if="eyebrow" class="aa-eyebrow">{{ eyebrow }}</p>
        <h1 class="aa-auth__title">{{ title }}</h1>
        <p v-if="subtitle" class="aa-auth__subtitle">{{ subtitle }}</p>
      </div>
      <div class="aa-auth__foot">
        <p class="aa-auth__foot-line">以结构化探索驱动长期学习效率。</p>
        <p class="aa-auth__foot-line aa-auth__foot-line--muted">© {{ new Date().getFullYear() }} 知途（KnowPath）· 面向正式产品迭代的学习工作台</p>
      </div>
    </section>

    <section class="aa-auth__form">
      <div class="aa-auth__form-inner">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.aa-auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 5fr 6fr;
  background: var(--color-background);
}

.aa-auth__aside {
  position: relative;
  padding: var(--space-10) var(--space-12);
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}
.aa-auth__aside::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(var(--color-ink) 1px, transparent 1px) 0 0 / 40px 40px,
    linear-gradient(90deg, var(--color-ink) 1px, transparent 1px) 0 0 / 40px 40px;
  opacity: 0.04;
  pointer-events: none;
}

.aa-auth__logo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-headline);
  font-weight: 700;
  color: var(--color-ink);
  font-size: 1.1rem;
}
.aa-auth__logo-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
  color: var(--color-primary-on);
  border-radius: var(--radius-sm);
}

.aa-auth__pitch { position: relative; }
.aa-auth__title {
  font-family: var(--font-headline);
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-top: 20px;
}
.aa-auth__subtitle {
  margin-top: 20px;
  color: var(--color-ink-dim);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 26rem;
}

.aa-auth__foot { position: relative; }
.aa-auth__foot-line { font-size: 0.78rem; color: var(--color-ink-dim); }
.aa-auth__foot-line--muted { color: var(--color-ink-soft); margin-top: 6px; }

.aa-auth__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
}
.aa-auth__form-inner {
  width: min(420px, 100%);
}

@media (max-width: 900px) {
  .aa-auth { grid-template-columns: 1fr; }
  .aa-auth__aside { display: none; }
}
</style>
