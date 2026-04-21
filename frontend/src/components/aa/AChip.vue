<script setup lang="ts">
interface Props {
  tone?: 'neutral' | 'primary' | 'success' | 'warn' | 'danger' | 'soft';
  icon?: string;
  size?: 'sm' | 'md';
}
withDefaults(defineProps<Props>(), { tone: 'neutral', size: 'md' });
</script>

<template>
  <span class="aa-chip" :class="[`aa-chip--${tone}`, `aa-chip--${size}`]">
    <span v-if="icon" class="material-symbols-outlined" aria-hidden="true">{{ icon }}</span>
    <slot />
  </span>
</template>

<style scoped>
.aa-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-surface-highest);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  border-radius: var(--radius-xs);
  line-height: 1.4;
  white-space: nowrap;
}
.aa-chip--sm { padding: 2px 8px; font-size: 0.68rem; }

.aa-chip--primary { background: var(--color-primary-soft); color: var(--color-primary); }
.aa-chip--success { background: #e4f4ea; color: var(--color-success); }
.aa-chip--warn { background: #fbf1e2; color: var(--color-warn); }
.aa-chip--danger { background: var(--color-danger-soft); color: var(--color-danger); }
.aa-chip--soft { background: var(--color-surface-alt); color: var(--color-ink-dim); }

.aa-chip .material-symbols-outlined { font-size: 14px !important; }
</style>
