<script setup lang="ts">
import AppTopNav from './AppTopNav.vue';
import AppSideRail from './AppSideRail.vue';

interface Props {
  fullWidth?: boolean;
  noRail?: boolean;
}
withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div class="aa-shell">
    <AppTopNav />
    <AppSideRail v-if="!noRail" />
    <main class="aa-shell__main" :class="{ 'aa-shell__main--no-rail': noRail, 'aa-shell__main--full': fullWidth }">
      <div class="aa-shell__inner">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.aa-shell {
  min-height: 100vh;
  background: var(--color-background);
}
.aa-shell__main {
  padding-top: var(--topnav-h);
  padding-left: var(--siderail-w);
  min-height: 100vh;
}
.aa-shell__main--no-rail { padding-left: 0; }
.aa-shell__inner {
  padding: var(--space-8) var(--space-8);
  max-width: 1360px;
  margin: 0 auto;
}
.aa-shell__main--full .aa-shell__inner { max-width: none; padding: 0; }

@media (max-width: 960px) {
  .aa-shell__main { padding-left: 0; }
  .aa-shell__inner { padding: var(--space-6); }
}
</style>
