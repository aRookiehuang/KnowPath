<script setup lang="ts">
interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}
defineProps<Props>();
</script>

<template>
  <header class="aa-page-header">
    <div class="aa-page-header__text">
      <p v-if="eyebrow" class="aa-eyebrow">{{ eyebrow }}</p>
      <h1 class="aa-page-header__title">{{ title }}</h1>
      <p v-if="description" class="aa-page-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="aa-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.aa-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  flex-wrap: wrap;
  padding-bottom: var(--space-6);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid rgba(172, 179, 183, 0.2);
}
.aa-page-header__title {
  font-family: var(--font-headline);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
  margin-top: 4px;
}
.aa-page-header__desc {
  margin-top: 10px;
  color: var(--color-ink-dim);
  font-size: 0.95rem;
  max-width: 44rem;
}
.aa-page-header__actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
