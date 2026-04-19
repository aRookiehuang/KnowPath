<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'accent' | 'muted';
  icon?: string;
  trend?: 'up' | 'down' | 'flat';
  trendText?: string;
}
withDefaults(defineProps<Props>(), { tone: 'default' });
</script>

<template>
  <div class="aa-stat" :class="`aa-stat--${tone}`">
    <div class="aa-stat__head">
      <span class="aa-stat__label">{{ label }}</span>
      <span v-if="icon" class="material-symbols-outlined aa-stat__icon">{{ icon }}</span>
    </div>
    <div class="aa-stat__value">{{ value }}</div>
    <div v-if="hint || trendText" class="aa-stat__foot">
      <span v-if="trend" class="aa-stat__trend" :class="`aa-stat__trend--${trend}`">
        <span class="material-symbols-outlined">{{ trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat' }}</span>
        <span v-if="trendText">{{ trendText }}</span>
      </span>
      <span v-if="hint" class="aa-stat__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
.aa-stat {
  padding: var(--space-5);
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.aa-stat--accent { background: var(--color-surface); box-shadow: var(--shadow-card); }
.aa-stat--muted { background: var(--color-surface-high); }

.aa-stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.aa-stat__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.aa-stat__icon { color: var(--color-primary); font-size: 18px !important; }

.aa-stat__value {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--color-primary);
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.aa-stat__foot {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.78rem;
  color: var(--color-ink-dim);
  min-height: 16px;
}

.aa-stat__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
}
.aa-stat__trend .material-symbols-outlined { font-size: 14px !important; }
.aa-stat__trend--up { color: var(--color-success); }
.aa-stat__trend--down { color: var(--color-danger); }
.aa-stat__trend--flat { color: var(--color-ink-soft); }
</style>
