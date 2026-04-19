<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
}
withDefaults(defineProps<Props>(), { title: '出现异常' });
defineEmits<{ (e: 'retry'): void }>();
</script>

<template>
  <div class="aa-error">
    <div class="aa-error__icon">
      <span class="material-symbols-outlined">error</span>
    </div>
    <div class="aa-error__text">
      <h4>{{ title }}</h4>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="aa-error__actions">
      <slot>
        <button type="button" class="aa-btn aa-btn--outline aa-btn--sm" @click="$emit('retry')">
          <span class="material-symbols-outlined">refresh</span>重试
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.aa-error {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  background: var(--color-danger-soft);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  flex-wrap: wrap;
}
.aa-error__icon {
  display: grid; place-items: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #fff;
}
.aa-error__icon .material-symbols-outlined { font-size: 20px !important; }
.aa-error__text { flex: 1; min-width: 200px; }
.aa-error__text h4 { font-size: 0.98rem; font-weight: 700; color: var(--color-danger); }
.aa-error__text p { font-size: 0.84rem; color: #7d2c2c; margin-top: 2px; }

.aa-error__actions .aa-btn {
  display: inline-flex; gap: 6px; align-items: center;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  background: transparent;
  color: var(--color-danger);
  box-shadow: inset 0 0 0 1.5px var(--color-danger);
  cursor: pointer;
}
.aa-error__actions .aa-btn:hover { background: rgba(168, 56, 54, 0.08); }
.aa-error__actions .aa-btn .material-symbols-outlined { font-size: 16px !important; }
</style>
