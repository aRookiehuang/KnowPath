<script setup lang="ts">
interface Props {
  tone?: 'base' | 'raised' | 'inverse' | 'soft' | 'primary';
  pad?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}
withDefaults(defineProps<Props>(), { tone: 'raised', pad: 'md' });
</script>

<template>
  <section class="aa-card" :class="[`aa-card--${tone}`, `aa-card--pad-${pad}`, { 'aa-card--interactive': interactive }]">
    <slot />
  </section>
</template>

<style scoped>
.aa-card {
  position: relative;
  border-radius: var(--radius-md);
  transition: background var(--duration-base) var(--easing),
              box-shadow var(--duration-base) var(--easing),
              transform var(--duration-base) var(--easing);
}

.aa-card--raised { background: var(--color-surface); box-shadow: var(--shadow-card); }
.aa-card--base { background: var(--color-surface-alt); }
.aa-card--soft { background: var(--color-surface-high); }
.aa-card--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1a3f78 100%);
  color: var(--color-primary-on);
}
.aa-card--primary :deep(h1),
.aa-card--primary :deep(h2),
.aa-card--primary :deep(h3),
.aa-card--primary :deep(h4) { color: var(--color-primary-on); }

.aa-card--inverse {
  background: #0f1b2e;
  color: #dbe6f7;
}
.aa-card--inverse :deep(h1),
.aa-card--inverse :deep(h2),
.aa-card--inverse :deep(h3),
.aa-card--inverse :deep(h4) { color: #fff; }

.aa-card--pad-sm { padding: var(--space-4); }
.aa-card--pad-md { padding: var(--space-6); }
.aa-card--pad-lg { padding: var(--space-8); }

.aa-card--interactive { cursor: pointer; }
.aa-card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}
</style>
