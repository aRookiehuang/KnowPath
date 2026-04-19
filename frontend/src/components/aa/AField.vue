<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'date';
  hint?: string;
  error?: string;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  autocomplete?: string;
  id?: string;
  textarea?: boolean;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 4
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'enter'): void;
}>();

const inputId = computed(() => props.id || `aa-field-${Math.random().toString(36).slice(2, 8)}`);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="aa-field" :class="{ 'aa-field--error': error }">
    <label v-if="label" :for="inputId" class="aa-field__label">
      {{ label }}
      <span v-if="required" class="aa-field__required" aria-hidden="true">*</span>
    </label>
    <div class="aa-field__control">
      <span v-if="icon && !textarea" class="material-symbols-outlined aa-field__icon">{{ icon }}</span>
      <textarea
        v-if="textarea"
        :id="inputId"
        class="aa-field__input aa-field__input--textarea"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="modelValue as string"
        @input="onInput"
        @keydown.ctrl.enter.prevent="$emit('enter')"
        @keydown.meta.enter.prevent="$emit('enter')"
      />
      <input
        v-else
        :id="inputId"
        :type="type"
        class="aa-field__input"
        :class="{ 'aa-field__input--has-icon': icon }"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :value="modelValue"
        @input="onInput"
        @keydown.enter="$emit('enter')"
      />
    </div>
    <div v-if="error" class="aa-field__feedback aa-field__feedback--error">{{ error }}</div>
    <div v-else-if="hint" class="aa-field__feedback">{{ hint }}</div>
  </div>
</template>

<style scoped>
.aa-field { display: flex; flex-direction: column; gap: 6px; }

.aa-field__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.aa-field__required { color: var(--color-danger); margin-left: 2px; }

.aa-field__control {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-surface-high);
  border-radius: var(--radius-sm);
  transition: background var(--duration-base) var(--easing),
              box-shadow var(--duration-base) var(--easing);
  border-bottom: 2px solid transparent;
}
.aa-field__control:hover { background: var(--color-surface-highest); }
.aa-field__control:focus-within {
  background: var(--color-surface);
  border-bottom-color: var(--color-primary);
}

.aa-field__icon {
  position: absolute;
  left: 12px;
  color: var(--color-ink-soft);
  font-size: 18px !important;
  pointer-events: none;
}

.aa-field__input {
  width: 100%;
  background: transparent;
  border: 0;
  outline: none;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--color-ink);
}
.aa-field__input::placeholder { color: var(--color-ink-soft); }
.aa-field__input--has-icon { padding-left: 38px; }

.aa-field__input--textarea {
  resize: vertical;
  min-height: 96px;
  line-height: 1.55;
}

.aa-field__input:disabled {
  color: var(--color-ink-soft);
  cursor: not-allowed;
}

.aa-field--error .aa-field__control {
  border-bottom-color: var(--color-danger);
  background: var(--color-danger-soft);
}

.aa-field__feedback {
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}
.aa-field__feedback--error { color: var(--color-danger); }
</style>
