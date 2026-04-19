<script setup lang="ts">
interface Props {
  eyebrow?: string;
  title?: string;
  description?: string;
  pad?: 'sm' | 'md' | 'lg' | 'none';
}
withDefaults(defineProps<Props>(), { pad: 'md' });
</script>

<template>
  <section class="aa-panel" :class="`aa-panel--pad-${pad}`">
    <header v-if="eyebrow || title || $slots.head" class="aa-panel__head">
      <div class="aa-panel__title-block">
        <p v-if="eyebrow" class="aa-eyebrow aa-eyebrow--muted">{{ eyebrow }}</p>
        <h3 v-if="title" class="aa-panel__title">{{ title }}</h3>
        <p v-if="description" class="aa-panel__desc">{{ description }}</p>
      </div>
      <div v-if="$slots.head" class="aa-panel__head-extra">
        <slot name="head" />
      </div>
    </header>
    <div class="aa-panel__body"><slot /></div>
    <footer v-if="$slots.footer" class="aa-panel__foot"><slot name="footer" /></footer>
  </section>
</template>

<style scoped>
.aa-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}
.aa-panel--pad-none { padding: 0; }
.aa-panel--pad-sm { padding: var(--space-4); }
.aa-panel--pad-md { padding: var(--space-6); }
.aa-panel--pad-lg { padding: var(--space-8); }

.aa-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.aa-panel__title {
  font-family: var(--font-headline);
  font-size: 1.15rem;
  font-weight: 600;
  margin: 4px 0 0;
}
.aa-panel__desc {
  color: var(--color-ink-dim);
  margin-top: 6px;
  font-size: 0.88rem;
}
.aa-panel__body { min-width: 0; }
.aa-panel__foot {
  padding-top: var(--space-4);
  border-top: 1px solid rgba(172, 179, 183, 0.2);
  display: flex;
  gap: var(--space-2);
}
</style>
