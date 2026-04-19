<script setup lang="ts">
interface Props {
  label?: string;
  compact?: boolean;
}
withDefaults(defineProps<Props>(), { label: '载入中…' });
</script>

<template>
  <div class="aa-loading" :class="{ 'aa-loading--compact': compact }">
    <div class="aa-loading__dots" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <p class="aa-loading__label">{{ label }}</p>
  </div>
</template>

<style scoped>
.aa-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-10);
  color: var(--color-ink-dim);
}
.aa-loading--compact { padding: var(--space-4); }

.aa-loading__dots { display: flex; gap: 6px; }
.aa-loading__dots span {
  width: 6px; height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: aa-pulse 1.2s ease-in-out infinite;
}
.aa-loading__dots span:nth-child(2) { animation-delay: 0.15s; }
.aa-loading__dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes aa-pulse {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.aa-loading__label {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: var(--color-ink-soft);
}
</style>
