<script setup lang="ts">
import { watch } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'primary' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  confirmText: '确认',
  cancelText: '取消',
  tone: 'primary'
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

watch(() => props.modelValue, (open) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : '';
  }
});

const close = () => emit('update:modelValue', false);
const onConfirm = () => { emit('confirm'); close(); };
const onCancel = () => { emit('cancel'); close(); };
</script>

<template>
  <Teleport to="body">
    <transition name="aa-dialog">
      <div v-if="modelValue" class="aa-dialog-mask" @click.self="onCancel">
        <div class="aa-dialog" role="dialog" aria-modal="true">
          <header class="aa-dialog__head">
            <h3>{{ title }}</h3>
            <button type="button" class="aa-dialog__close" @click="onCancel" aria-label="关闭">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>
          <div class="aa-dialog__body">
            <p v-if="description">{{ description }}</p>
            <slot />
          </div>
          <footer class="aa-dialog__foot">
            <button type="button" class="aa-dialog__btn aa-dialog__btn--ghost" @click="onCancel">{{ cancelText }}</button>
            <button type="button" class="aa-dialog__btn" :class="`aa-dialog__btn--${tone}`" @click="onConfirm">{{ confirmText }}</button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.aa-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(14, 18, 22, 0.45);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: var(--space-6);
}
.aa-dialog {
  width: min(480px, 100%);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.aa-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid rgba(172, 179, 183, 0.2);
}
.aa-dialog__head h3 { font-size: 1.05rem; font-weight: 700; }

.aa-dialog__close {
  background: transparent;
  border: 0;
  padding: 4px;
  border-radius: var(--radius-sm);
  color: var(--color-ink-soft);
  display: grid;
  place-items: center;
}
.aa-dialog__close:hover { background: var(--color-surface-high); color: var(--color-ink); }

.aa-dialog__body {
  padding: var(--space-6);
  color: var(--color-ink-dim);
  font-size: 0.92rem;
  line-height: 1.6;
}

.aa-dialog__foot {
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface-alt);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.aa-dialog__btn {
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  border: 0;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background var(--duration-base) var(--easing);
}
.aa-dialog__btn--ghost { background: transparent; color: var(--color-ink-dim); }
.aa-dialog__btn--ghost:hover { background: var(--color-surface-high); color: var(--color-ink); }
.aa-dialog__btn--primary { background: var(--color-primary); color: var(--color-primary-on); }
.aa-dialog__btn--primary:hover { background: var(--color-primary-dim); }
.aa-dialog__btn--danger { background: var(--color-danger); color: #fff; }
.aa-dialog__btn--danger:hover { filter: brightness(0.92); }

.aa-dialog-enter-active, .aa-dialog-leave-active { transition: opacity var(--duration-base); }
.aa-dialog-enter-active .aa-dialog, .aa-dialog-leave-active .aa-dialog {
  transition: transform var(--duration-base) var(--easing);
}
.aa-dialog-enter-from, .aa-dialog-leave-to { opacity: 0; }
.aa-dialog-enter-from .aa-dialog, .aa-dialog-leave-to .aa-dialog { transform: translateY(8px) scale(0.98); }
</style>
