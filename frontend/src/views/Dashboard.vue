<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AProgressBar from '@/components/aa/AProgressBar.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import { learningAPI, type LearningPath, type LearningStats, type Task } from '@/api/learning';
import { metricsAPI, type CurrentState } from '@/api/metrics';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const stats = ref<LearningStats | null>(null);
const state = ref<CurrentState | null>(null);
const paths = ref<Array<LearningPath & { status?: string; progress?: number }>>([]);
const loading = ref(true);

const greeting = computed(() => {
  const hour = new Date().getHours();
  const prefix = hour < 6 ? '凌晨好' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
  return `${prefix}，${userStore.user?.name || '学习者'}`;
});

const today = computed(() => new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }));
const pathCount = computed(() => paths.value.length);
const completedTasks = computed(() => stats.value?.tasks?.completed ?? 0);
const totalTasks = computed(() => stats.value?.tasks?.total ?? 0);
const completionRate = computed(() => stats.value?.tasks?.completionRate ?? 0);
const totalMinutes = computed(() => stats.value?.time?.totalMinutes ?? stats.value?.time?.totalCompleted ?? 0);
const totalHours = computed(() => (totalMinutes.value / 60).toFixed(1));
const focusPath = computed(() => paths.value.find((item) => item.status !== 'completed') || paths.value[0]);

const nextTasks = computed<Array<Task & { pathId?: string }>>(() => {
  return paths.value
    .flatMap((path) => [
      ...(path.weeks?.flatMap((week) => (week.tasks || []).map((task) => ({ ...task, pathId: path.id }))) || []),
      ...(path.stages?.flatMap((stage) => (stage.subtasks || []).map((task) => ({ ...task, pathId: path.id }))) || []),
      ...(path.milestones?.flatMap((stage) => (stage.subtasks || []).map((task) => ({ ...task, pathId: path.id }))) || [])
    ])
    .filter((task) => task.status !== 'completed')
    .slice(0, 4);
});

const stateRows = computed(() => {
  const source = state.value;
  return [
    { label: '认知负荷 LSS', value: source?.lss ?? 0, hint: '衡量当前学习内容对你造成的处理压力。' },
    { label: '知识迁移 KTL', value: source?.ktl ?? 0, hint: '反映你把新知识迁移到任务中的能力。' },
    { label: '学习流 LF', value: source?.lf ?? 0, hint: '显示当前学习节奏是否顺畅稳定。' },
    { label: '学习平衡 LSB', value: source?.lsb ?? 0, hint: '用于判断整体学习状态是否均衡。' }
  ];
});

const loadDashboard = async () => {
  loading.value = true;
  try {
    await userStore.fetchProfile();
  } catch {}

  try {
    const [statsResult, stateResult, pathResult] = await Promise.all([
      learningAPI.getStats(),
      metricsAPI.getCurrentState(),
      learningAPI.getPaths()
    ]);
    stats.value = statsResult;
    state.value = stateResult;
    paths.value = pathResult as Array<LearningPath & { status?: string; progress?: number }>;
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboard);
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="学习工作台"
      :title="greeting"
      :description="`${today} · 继续推进你的学习路径、任务与状态优化。`"
    >
      <template #actions>
        <AButton variant="secondary" icon="refresh" size="sm" @click="loadDashboard">刷新数据</AButton>
        <RouterLink to="/goal-conversation" custom v-slot="{ navigate }">
          <AButton icon="add" size="sm" @click="navigate">创建新目标</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <ALoading v-if="loading" label="正在加载学习总览..." />

    <div v-else class="dashboard-page">
      <section class="dashboard-page__top">
        <APanel eyebrow="当前焦点" title="重点路径" description="围绕当前最值得推进的路径快速进入下一步。">
          <template v-if="focusPath">
            <div class="dashboard-page__focus-row">
              <div>
                <AChip tone="primary">{{ focusPath.aiGenerated ? 'AI 生成' : '手动创建' }}</AChip>
                <h3>{{ focusPath.name || focusPath.title }}</h3>
                <p>{{ focusPath.description || '这条路径已经准备就绪，可以继续拆解任务、推进执行并跟踪状态。' }}</p>
              </div>
              <div class="dashboard-page__focus-actions">
                <RouterLink :to="`/learning-path/${focusPath.id}`" custom v-slot="{ navigate }">
                  <AButton icon-right="arrow_forward" @click="navigate">查看路径</AButton>
                </RouterLink>
                <RouterLink :to="`/learning-path/${focusPath.id}`" custom v-slot="{ navigate }">
                  <AButton variant="ghost" @click="navigate">继续推进</AButton>
                </RouterLink>
              </div>
            </div>
            <AProgressBar :value="completionRate" :max="100" height="sm" :show-label="true" label="整体完成度" />
          </template>
          <AEmpty
            v-else
            icon="auto_awesome"
            title="还没有学习路径"
            description="从一次目标对话开始，系统会帮助你生成可执行的学习路径。"
          >
            <RouterLink to="/goal-conversation" custom v-slot="{ navigate }">
              <AButton icon-right="arrow_forward" @click="navigate">开始规划</AButton>
            </RouterLink>
          </AEmpty>
        </APanel>

        <APanel eyebrow="状态快照" title="学习状态" description="快速查看四项关键学习指标的当前表现。">
          <div class="dashboard-page__state-list">
            <div v-for="row in stateRows" :key="row.label" class="dashboard-page__state-item">
              <div class="dashboard-page__state-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
              <div class="dashboard-page__state-track"><span :style="{ width: `${Math.max(0, Math.min(100, row.value))}%` }"></span></div>
              <p>{{ row.hint }}</p>
            </div>
          </div>
          <template #footer>
            <RouterLink to="/learning-state" custom v-slot="{ navigate }">
              <AButton variant="ghost" icon-right="arrow_forward" @click="navigate">查看完整分析</AButton>
            </RouterLink>
          </template>
        </APanel>
      </section>

      <section class="dashboard-page__stats">
        <AStatTile label="学习路径" :value="pathCount" tone="accent" icon="account_tree" hint="已生成并可继续维护的路径数量" />
        <AStatTile label="任务进度" :value="`${completedTasks}/${totalTasks}`" icon="task_alt" :hint="`完成率 ${completionRate}%`" />
        <AStatTile label="学习时长" :value="`${totalHours}h`" icon="schedule" hint="按累计完成时长估算" />
        <AStatTile label="当前等级" :value="`Lv.${userStore.userLevel}`" tone="muted" icon="military_tech" :hint="`${userStore.userXP} XP`" />
      </section>

      <section class="dashboard-page__bottom">
        <APanel eyebrow="下一步建议" title="优先处理的任务" description="按照当前路径状态挑选最值得立即推进的任务。">
          <div v-if="nextTasks.length" class="dashboard-page__task-list">
            <article v-for="task in nextTasks" :key="task.id" class="dashboard-page__task">
              <div class="dashboard-page__task-meta">
                <span class="dashboard-page__task-dot"></span>
                <span>{{ task.taskType || '学习任务' }}</span>
              </div>
              <h4>{{ task.title }}</h4>
              <p v-if="task.description">{{ task.description }}</p>
              <div class="dashboard-page__task-foot">
                <AChip size="sm" tone="soft">{{ task.estimatedMinutes ? `${task.estimatedMinutes} 分钟` : '时间待定' }}</AChip>
                <RouterLink :to="`/dialogue-learn/${task.id}?title=${encodeURIComponent(task.title)}${task.pathId ? `&pathId=${encodeURIComponent(task.pathId)}` : ''}`" custom v-slot="{ navigate }">
                  <AButton size="sm" variant="ghost" icon-right="arrow_forward" @click="navigate">进入对话学习</AButton>
                </RouterLink>
              </div>
            </article>
          </div>
          <AEmpty v-else compact icon="check_circle" title="当前没有待处理任务" description="你已经完成了现阶段任务，可以继续创建新目标或复盘学习状态。" />
        </APanel>

        <APanel eyebrow="路径概览" title="最近路径">
          <div v-if="paths.length" class="dashboard-page__path-list">
            <RouterLink v-for="path in paths.slice(0, 4)" :key="path.id" :to="`/learning-path/${path.id}`" class="dashboard-page__path-item">
              <div>
                <h4>{{ path.name || path.title }}</h4>
                <p>{{ path.description || '这条路径已建立，适合继续拆解阶段任务与学习计划。' }}</p>
              </div>
              <span class="material-symbols-outlined">arrow_forward</span>
            </RouterLink>
          </div>
          <AEmpty v-else compact icon="inventory_2" title="还没有路径记录" description="先创建一个目标，再由系统为你生成完整学习路径。" />
        </APanel>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; gap: var(--space-6); }
.dashboard-page__top {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.dashboard-page__focus-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}
.dashboard-page__focus-row h3 { font-size: 1.2rem; margin: 8px 0 6px; }
.dashboard-page__focus-row p { color: var(--color-ink-dim); line-height: 1.65; max-width: 42rem; }
.dashboard-page__focus-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.dashboard-page__state-list { display: flex; flex-direction: column; gap: var(--space-4); }
.dashboard-page__state-item { display: flex; flex-direction: column; gap: 6px; }
.dashboard-page__state-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.82rem;
  color: var(--color-ink-dim);
}
.dashboard-page__state-head strong { color: var(--color-primary); font-family: var(--font-headline); }
.dashboard-page__state-track {
  height: 4px;
  background: var(--color-surface-highest);
  border-radius: 999px;
  overflow: hidden;
}
.dashboard-page__state-track span { display: block; height: 100%; background: var(--color-primary); }
.dashboard-page__state-item p { color: var(--color-ink-soft); font-size: 0.78rem; line-height: 1.55; margin: 0; }
.dashboard-page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.dashboard-page__bottom {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.dashboard-page__task-list,
.dashboard-page__path-list { display: flex; flex-direction: column; gap: var(--space-3); }
.dashboard-page__task {
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dashboard-page__task-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.dashboard-page__task-dot { width: 6px; height: 6px; background: var(--color-primary); border-radius: 50%; }
.dashboard-page__task h4 { font-size: 1rem; }
.dashboard-page__task p { color: var(--color-ink-dim); font-size: 0.86rem; line-height: 1.6; }
.dashboard-page__task-foot { display: flex; justify-content: space-between; gap: 8px; align-items: center; flex-wrap: wrap; }
.dashboard-page__path-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: 14px 16px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  color: inherit;
}
.dashboard-page__path-item:hover { background: var(--color-surface-high); }
.dashboard-page__path-item h4 { font-size: 0.96rem; }
.dashboard-page__path-item p { color: var(--color-ink-soft); font-size: 0.8rem; margin-top: 4px; }
.dashboard-page__path-item .material-symbols-outlined { color: var(--color-primary); font-size: 20px !important; }

@media (max-width: 1080px) {
  .dashboard-page__top,
  .dashboard-page__bottom,
  .dashboard-page__stats { grid-template-columns: 1fr; }
  .dashboard-page__stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
