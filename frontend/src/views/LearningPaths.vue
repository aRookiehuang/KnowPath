<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AProgressBar from '@/components/aa/AProgressBar.vue';
import { learningAPI, type LearningPath } from '@/api/learning';

type PathWithStatus = LearningPath & { status?: string; progress?: number; stagesCount?: number };

const loading = ref(true);
const paths = ref<PathWithStatus[]>([]);
const keyword = ref('');
const filter = ref<'all' | 'active' | 'completed' | 'failed'>('all');

const stageCountOf = (path: LearningPath) =>
  path.milestones?.length || path.stages?.length || path.weeks?.length || 0;

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return paths.value
    .filter((p) => {
      if (filter.value === 'active' && (p.status === 'completed' || p.status === 'failed')) return false;
      if (filter.value === 'completed' && p.status !== 'completed') return false;
      if (filter.value === 'failed' && p.status !== 'failed') return false;
      if (!q) return true;
      const hay = [p.name, p.title, p.description, p.subject].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
});

const summary = computed(() => {
  const total = paths.value.length;
  const active = paths.value.filter((p) => p.status !== 'completed' && p.status !== 'failed').length;
  const done = paths.value.filter((p) => p.status === 'completed').length;
  const hours = paths.value.reduce((acc, p) => acc + (p.estimatedHours || 0), 0);
  return { total, active, done, hours };
});

const statusTone = (status?: string) => {
  if (status === 'generating') return 'warn';
  if (status === 'failed') return 'danger';
  if (status === 'completed') return 'success';
  return 'primary';
};
const statusLabel = (status?: string) => {
  if (status === 'generating') return '生成中';
  if (status === 'failed') return '生成失败';
  if (status === 'completed') return '已完成';
  return '进行中';
};

onMounted(async () => {
  try {
    paths.value = await learningAPI.getPaths() as PathWithStatus[];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="Learning pathways"
      title="学习路径总览"
      description="面向目标的每个子计划。让工作结构持续可见，而不是被埋在任务列表里。"
    >
      <template #actions>
        <RouterLink to="/goal-conversation" custom v-slot="{ navigate }">
          <AButton icon="add" @click="navigate">新建路径</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <section class="paths__summary">
      <AStatTile label="路径总数" :value="summary.total" tone="accent" icon="account_tree" />
      <AStatTile label="进行中" :value="summary.active" icon="pending_actions" hint="当前正在推进的路径" />
      <AStatTile label="已完成" :value="summary.done" tone="muted" icon="task_alt" />
      <AStatTile label="累计估时" :value="`${summary.hours}h`" icon="schedule" hint="所有路径预估学习时长之和" />
    </section>

    <div class="paths__toolbar">
      <div class="paths__search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="keyword" type="search" placeholder="搜索路径名称、主题、描述…" />
      </div>
      <div class="paths__filter">
        <button v-for="opt in ([
          { v: 'all', label: '全部' },
          { v: 'active', label: '进行中' },
          { v: 'completed', label: '已完成' },
          { v: 'failed', label: '失败' }
        ] as const)" :key="opt.v"
          type="button"
          :class="['paths__filter-btn', { 'paths__filter-btn--active': filter === opt.v }]"
          @click="filter = opt.v"
        >{{ opt.label }}</button>
      </div>
    </div>

    <APanel eyebrow="Path list" title="你正在推进的路径">
      <ALoading v-if="loading" compact label="正在同步路径…" />

      <div v-else-if="filtered.length" class="paths__list">
        <article v-for="path in filtered" :key="path.id" class="paths__row">
          <div class="paths__row-main">
            <div class="paths__row-head">
              <h3>{{ path.name || path.title || '未命名路径' }}</h3>
              <AChip :tone="statusTone(path.status)">{{ statusLabel(path.status) }}</AChip>
            </div>
            <p>{{ path.description || '暂无路径描述。' }}</p>
            <div class="paths__row-meta">
              <span><span class="material-symbols-outlined">category</span>{{ path.subject || '综合主题' }}</span>
              <span><span class="material-symbols-outlined">schedule</span>{{ path.estimatedHours || 0 }} 小时</span>
              <span><span class="material-symbols-outlined">layers</span>{{ stageCountOf(path) }} 个阶段</span>
              <span v-if="path.aiGenerated"><span class="material-symbols-outlined">auto_awesome</span>AI 生成</span>
            </div>
          </div>
          <div class="paths__row-side">
            <AProgressBar :value="path.progress ?? 0" :max="100" height="sm" :show-label="true" label="完成度" />
            <div class="paths__row-actions">
              <RouterLink
                v-if="path.status !== 'generating' && path.status !== 'failed'"
                :to="`/learning-path/${path.id}`"
                custom
                v-slot="{ navigate }"
              >
                <AButton size="sm" icon-right="arrow_forward" @click="navigate">查看详情</AButton>
              </RouterLink>
              <RouterLink v-else to="/goal-conversation" custom v-slot="{ navigate }">
                <AButton size="sm" variant="secondary" icon="refresh" @click="navigate">重新规划</AButton>
              </RouterLink>
            </div>
          </div>
        </article>
      </div>

      <AEmpty
        v-else
        icon="account_tree"
        title="暂无匹配的路径"
        description="调整过滤条件，或做一次目标澄清生成新路径。"
      >
        <RouterLink to="/goal-conversation" custom v-slot="{ navigate }">
          <AButton icon-right="arrow_forward" @click="navigate">开始规划</AButton>
        </RouterLink>
      </AEmpty>
    </APanel>
  </AppShell>
</template>

<style scoped>
.paths__summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.paths__toolbar {
  display: flex; justify-content: space-between; align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}
.paths__search {
  display: flex; align-items: center; gap: 6px;
  background: var(--color-surface);
  padding: 0 12px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  min-width: 280px;
  flex: 1;
  max-width: 480px;
}
.paths__search .material-symbols-outlined { color: var(--color-ink-soft); font-size: 18px !important; }
.paths__search input {
  flex: 1; border: 0; outline: none; background: transparent;
  padding: 10px 8px; font-size: 0.88rem;
}

.paths__filter { display: flex; gap: 2px; background: var(--color-surface); padding: 4px; border-radius: var(--radius-sm); }
.paths__filter-btn {
  background: transparent; border: 0;
  padding: 7px 14px;
  font-size: 0.82rem;
  color: var(--color-ink-dim);
  font-weight: 500;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background var(--duration-base) var(--easing);
}
.paths__filter-btn:hover { color: var(--color-ink); }
.paths__filter-btn--active {
  background: var(--color-primary);
  color: var(--color-primary-on);
  font-weight: 600;
}

.paths__list { display: flex; flex-direction: column; gap: var(--space-3); }

.paths__row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
  gap: var(--space-5);
  padding: var(--space-5);
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  transition: background var(--duration-base) var(--easing);
}
.paths__row:hover { background: var(--color-surface-high); }

.paths__row-main { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.paths__row-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.paths__row-head h3 { font-family: var(--font-headline); font-size: 1.05rem; font-weight: 600; }
.paths__row-main p { color: var(--color-ink-dim); font-size: 0.88rem; line-height: 1.6; }

.paths__row-meta { display: flex; gap: var(--space-4); flex-wrap: wrap; color: var(--color-ink-soft); font-size: 0.78rem; }
.paths__row-meta span { display: inline-flex; align-items: center; gap: 4px; }
.paths__row-meta .material-symbols-outlined { font-size: 14px !important; }

.paths__row-side {
  display: flex; flex-direction: column; gap: var(--space-3); justify-content: center;
}
.paths__row-actions { display: flex; justify-content: flex-end; }

@media (max-width: 960px) {
  .paths__row { grid-template-columns: 1fr; }
  .paths__row-actions { justify-content: flex-start; }
  .paths__summary { grid-template-columns: repeat(2, 1fr); }
}
</style>
