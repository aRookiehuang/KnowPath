<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconRight?: string;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button'
});

defineEmits<{ (e: 'click', ev: MouseEvent): void }>();

const slots = useSlots();

const classes = computed(() => [
  'aa-btn',
  `aa-btn--${props.variant}`,
  `aa-btn--${props.size}`,
  { 'aa-btn--block': props.block, 'aa-btn--loading': props.loading, 'aa-btn--icon-only': !slots.default && props.icon }
]);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="aa-btn__spin" aria-hidden="true"></span>
    <span v-else-if="icon" class="material-symbols-outlined aa-btn__icon">{{ icon }}</span>
    <span v-if="$slots.default" class="aa-btn__label"><slot /></span>
    <span v-if="iconRight && !loading" class="material-symbols-outlined aa-btn__icon aa-btn__icon--right">{{ iconRight }}</span>
  </button>
</template>

<style scoped>
.aa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border: 0;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  letter-spacing: 0.01em;
  background: var(--color-primary);
  color: var(--color-primary-on);
  transition: background var(--duration-base) var(--easing),
              color var(--duration-base) var(--easing),
              transform var(--duration-fast) var(--easing),
              box-shadow var(--duration-base) var(--easing);
}
.aa-btn:active { transform: scale(0.98); }
.aa-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.aa-btn--sm { padding: 7px 12px; font-size: 0.8rem; }
.aa-btn--lg { padding: 14px 22px; font-size: 1rem; }

.aa-btn--block { width: 100%; }

.aa-btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-on);
  box-shadow: 0 8px 20px rgba(44, 94, 167, 0.16);
}
.aa-btn--primary:hover:not(:disabled) { background: var(--color-primary-dim); }

.aa-btn--secondary {
  background: var(--color-surface-high);
  color: var(--color-ink);
}
.aa-btn--secondary:hover:not(:disabled) { background: var(--color-surface-highest); }

.aa-btn--ghost {
  background: transparent;
  color: var(--color-ink);
  padding-left: 12px;
  padding-right: 12px;
}
.aa-btn--ghost:hover:not(:disabled) { background: var(--color-surface-high); color: var(--color-primary); }

.aa-btn--outline {
  background: transparent;
  color: var(--color-primary);
  box-shadow: inset 0 0 0 1.5px var(--color-primary);
}
.aa-btn--outline:hover:not(:disabled) { background: var(--color-primary-soft); }

.aa-btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.aa-btn--danger:hover:not(:disabled) { filter: brightness(0.92); }

.aa-btn--link {
  background: transparent;
  color: var(--color-primary);
  padding: 0;
  height: auto;
  font-weight: 500;
}
.aa-btn--link:hover:not(:disabled) { color: var(--color-primary-dim); text-decoration: underline; }

.aa-btn__icon { font-size: 18px !important; }
.aa-btn--sm .aa-btn__icon { font-size: 16px !important; }
.aa-btn--lg .aa-btn__icon { font-size: 20px !important; }

.aa-btn--icon-only { padding: 8px; }
.aa-btn--icon-only .aa-btn__icon { margin: 0; }

.aa-btn__spin {
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: aa-btn-spin 0.7s linear infinite;
}
@keyframes aa-btn-spin { to { transform: rotate(360deg); } }
</style>
