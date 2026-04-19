<script setup lang="ts">
interface Props {
  icon?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}
withDefaults(defineProps<Props>(), { icon: 'inventory_2', title: '暂无内容' });
</script>

<template>
  <div class="aa-empty" :class="{ 'aa-empty--compact': compact }">
    <div class="aa-empty__icon">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </div>
    <h4 class="aa-empty__title">{{ title }}</h4>
    <p v-if="description" class="aa-empty__desc">{{ description }}</p>
    <div v-if="$slots.default" class="aa-empty__actions"><slot /></div>
  </div>
</template>

<style scoped>
.aa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-6);
  color: var(--color-ink-dim);
}
.aa-empty--compact { padding: var(--space-6); }

.aa-empty__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-surface-high);
  display: grid;
  place-items: center;
}
.aa-empty__icon .material-symbols-outlined {
  color: var(--color-ink-soft);
  font-size: 28px !important;
}
.aa-empty__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
}
.aa-empty__desc {
  font-size: 0.88rem;
  max-width: 28rem;
  color: var(--color-ink-dim);
}
.aa-empty__actions { margin-top: var(--space-3); display: flex; gap: var(--space-2); }
</style>
