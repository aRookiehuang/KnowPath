<script setup lang="ts">
interface Props {
  value: number;
  max?: number;
  height?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
}
withDefaults(defineProps<Props>(), { max: 100, height: 'sm' });
</script>

<template>
  <div class="aa-progress">
    <div v-if="showLabel || label" class="aa-progress__head">
      <span class="aa-progress__label">{{ label ?? '进度' }}</span>
      <span class="aa-progress__value">{{ Math.round((value / max) * 100) }}%</span>
    </div>
    <div class="aa-progress__track" :class="`aa-progress__track--${height}`">
      <span class="aa-progress__fill" :style="{ width: `${Math.min(100, (value / max) * 100)}%` }"></span>
    </div>
  </div>
</template>

<style scoped>
.aa-progress { display: flex; flex-direction: column; gap: 6px; }
.aa-progress__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.78rem;
}
.aa-progress__label { color: var(--color-ink-dim); }
.aa-progress__value { font-family: var(--font-headline); color: var(--color-primary); font-weight: 700; }

.aa-progress__track {
  width: 100%;
  background: var(--color-surface-highest);
  border-radius: 999px;
  overflow: hidden;
}
.aa-progress__track--xs { height: 2px; }
.aa-progress__track--sm { height: 4px; }
.aa-progress__track--md { height: 8px; }

.aa-progress__fill {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: inherit;
  transition: width var(--duration-base) var(--easing);
}
</style>
