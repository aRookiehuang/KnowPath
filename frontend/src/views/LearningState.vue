<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import { metricsAPI, type CurrentState, type TrendDataPoint } from '@/api/metrics';

const loading = ref(true);
const state = ref<CurrentState | null>(null);
const trends = ref<TrendDataPoint[]>([]);
const advice = ref<string[]>([]);
const sessionHistory = ref<Array<{ date: string; durationMinutes: number; lssScore: number; completed: boolean; taskId?: string }>>([]);

const suggestionLevel = computed(() => state.value?.suggestion?.level || 'steady');
const suggestionText = computed(() => state.value?.suggestion?.message || '当前状态整体稳定，建议继续沿着既定路径推进学习。');
const suggestionAction = computed(() => state.value?.suggestion?.action || '优先处理核心任务，并在每轮学习后查看状态变化。');

const tiles = computed(() => [
  { label: '认知负荷 LSS', value: state.value?.lss ?? '—', icon: 'speed', hint: '理解压力指数', tone: 'accent' as const },
  { label: '知识迁移 KTL', value: state.value?.ktl ?? '—', icon: 'school', hint: '迁移应用能力' },
  { label: '学习流 LF', value: state.value?.lf ?? '—', icon: 'self_improvement', hint: '节奏顺畅程度' },
  { label: '学习平衡 LSB', value: state.value?.lsb ?? '—', icon: 'balance', hint: '整体稳定水平', tone: 'muted' as const }
]);

const trendBars = computed(() => {
  return trends.value.slice(-10).map((item) => {
    const raw = item.lsb ?? 0;
    const normalized = Math.max(10, Math.min(100, ((raw + 100) / 200) * 100));
    return {
      label: item.date.slice(5),
      lsb: item.lsb ?? 0,
      lss: item.lss ?? 0,
      height: `${normalized}%`
    };
  });
});

const focusAreas = computed(() => {
  const source = state.value;
  return [
    {
      title: '加强知识迁移',
      value: source?.ktl ?? 0,
      description: '当前 KTL 反映你把知识转化到任务中的能力，建议结合实际任务多做迁移练习。'
    },
    {
      title: '控制认知负荷',
      value: source?.lss ?? 0,
      description: 'LSS 偏高时，可以拆小问题、增加提示或先做基础复习。'
    },
    {
      title: '保持学习稳定性',
      value: 100 - (source?.lf ?? 0),
      description: '通过稳定节奏与阶段复盘，让学习表现更加持续可控。'
    }
  ];
});

onMounted(async () => {
  loading.value = true;
  try {
    const [stateResult, trendResult, adviceResult, historyResult] = await Promise.all([
      metricsAPI.getCurrentState(),
      metricsAPI.getTrends(14),
      metricsAPI.getAdvice(),
      metricsAPI.getHistory()
    ]);
    state.value = stateResult;
    trends.value = trendResult?.data || [];
    advice.value = adviceResult || [];
    sessionHistory.value = historyResult?.sessionHistory || [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="学习分析"
      title="学习状态"
      description="从趋势、建议与历史会话三个维度观察你的长期学习表现。"
    >
      <template #actions>
        <RouterLink to="/class-test" custom v-slot="{ navigate }">
          <AButton variant="secondary" icon="experiment" @click="navigate">进入课堂测试</AButton>
        </RouterLink>
        <RouterLink to="/learning-paths" custom v-slot="{ navigate }">
          <AButton icon-right="arrow_forward" @click="navigate">查看学习路径</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <ALoading v-if="loading" label="正在加载学习状态..." />

    <div v-else class="state-page">
      <section class="state-page__stats">
        <AStatTile v-for="item in tiles" :key="item.label" v-bind="item" />
      </section>

      <section class="state-page__grid">
        <APanel eyebrow="7 日趋势" title="最近 10 次波动" description="通过学习平衡指标快速判断整体状态是否稳定。">
          <div v-if="trendBars.length" class="state-page__chart">
            <div v-for="bar in trendBars" :key="bar.label" class="state-page__chart-bar">
              <div class="state-page__chart-track">
                <span :style="{ height: bar.height }"></span>
              </div>
              <strong>{{ bar.lsb }}</strong>
              <small>{{ bar.label }}</small>
            </div>
          </div>
          <AEmpty
            v-else
            compact
            icon="timeline"
            title="暂无趋势数据"
            description="当你完成更多任务后，这里会显示近期状态走势。"
          />
        </APanel>

        <APanel eyebrow="AI 建议" title="当前建议">
          <div class="state-page__recommendation">
            <AChip :tone="suggestionLevel === 'danger' ? 'danger' : suggestionLevel === 'warning' ? 'warn' : 'primary'">
              {{ suggestionLevel === 'danger' ? '需立即调整' : suggestionLevel === 'warning' ? '建议关注' : '状态稳定' }}
            </AChip>
            <h3>{{ suggestionText }}</h3>
            <p>{{ suggestionAction }}</p>
          </div>

          <div class="state-page__advice-list">
            <div v-for="(item, index) in advice" :key="index" class="state-page__advice-item">
              <span>{{ index + 1 }}</span>
              <p>{{ item }}</p>
            </div>
            <AEmpty
              v-if="!advice.length"
              compact
              icon="tips_and_updates"
              title="暂时没有额外建议"
              description="继续完成学习任务后，系统会给出更具体的优化方向。"
            />
          </div>
        </APanel>
      </section>

      <section class="state-page__grid state-page__grid--bottom">
        <APanel eyebrow="重点优化" title="建议优先关注的维度">
          <div class="state-page__focus-list">
            <article v-for="item in focusAreas" :key="item.title" class="state-page__focus-item">
              <div class="state-page__focus-head">
                <h3>{{ item.title }}</h3>
                <strong>{{ item.value }}%</strong>
              </div>
              <div class="state-page__focus-track"><span :style="{ width: `${item.value}%` }"></span></div>
              <p>{{ item.description }}</p>
            </article>
          </div>
        </APanel>

        <APanel eyebrow="最近会话" title="学习记录">
          <div v-if="sessionHistory.length" class="state-page__session-list">
            <article v-for="(session, index) in sessionHistory.slice(0, 6)" :key="`${session.date}-${index}`" class="state-page__session-item">
              <div>
                <h3>{{ session.taskId ? `任务 ${session.taskId}` : '未命名任务' }}</h3>
                <p>{{ session.date }} · {{ session.durationMinutes }} 分钟</p>
              </div>
              <div class="state-page__session-side">
                <AChip :tone="session.completed ? 'success' : 'soft'">{{ session.completed ? '已完成' : '进行中' }}</AChip>
                <span>LSS {{ session.lssScore }}</span>
              </div>
            </article>
          </div>
          <AEmpty
            v-else
            compact
            icon="history"
            title="还没有学习记录"
            description="完成一轮学习或测试后，这里会保留最近的会话历史。"
          />
        </APanel>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.state-page { display: flex; flex-direction: column; gap: var(--space-6); }
.state-page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.state-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.state-page__chart {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: var(--space-3);
  min-height: 280px;
  align-items: end;
}
.state-page__chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.state-page__chart-track {
  width: 100%;
  height: 220px;
  background: linear-gradient(to top, var(--color-surface-high) 0%, transparent 100%);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: end;
  padding: 6px;
}
.state-page__chart-track span {
  width: 100%;
  border-radius: var(--radius-xs);
  background: linear-gradient(180deg, var(--color-primary-container) 0%, var(--color-primary) 100%);
}
.state-page__chart-bar strong {
  font-family: var(--font-headline);
  font-size: 0.96rem;
  color: var(--color-primary);
}
.state-page__chart-bar small {
  color: var(--color-ink-soft);
  font-size: 0.74rem;
}
.state-page__recommendation {
  padding: var(--space-4);
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.state-page__recommendation h3 { font-size: 1.08rem; }
.state-page__recommendation p { color: var(--color-ink-dim); line-height: 1.65; }
.state-page__advice-list { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4); }
.state-page__advice-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;
}
.state-page__advice-item span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-surface-high);
  color: var(--color-primary);
  font-weight: 700;
  font-family: var(--font-headline);
}
.state-page__advice-item p { margin: 0; color: var(--color-ink-dim); line-height: 1.6; }
.state-page__focus-list { display: flex; flex-direction: column; gap: var(--space-4); }
.state-page__focus-item {
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.state-page__focus-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: baseline;
}
.state-page__focus-head h3 { font-size: 1rem; }
.state-page__focus-head strong {
  font-family: var(--font-headline);
  color: var(--color-primary);
}
.state-page__focus-track {
  margin: 10px 0 8px;
  height: 4px;
  background: var(--color-surface-highest);
  border-radius: 999px;
  overflow: hidden;
}
.state-page__focus-track span { display: block; height: 100%; background: var(--color-primary); }
.state-page__focus-item p { color: var(--color-ink-dim); font-size: 0.86rem; line-height: 1.6; }
.state-page__session-list { display: flex; flex-direction: column; gap: var(--space-3); }
.state-page__session-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.state-page__session-item h3 { font-size: 0.98rem; }
.state-page__session-item p { margin-top: 6px; color: var(--color-ink-soft); font-size: 0.82rem; }
.state-page__session-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; color: var(--color-ink-soft); font-size: 0.76rem; }

@media (max-width: 1100px) {
  .state-page__stats { grid-template-columns: repeat(2, 1fr); }
  .state-page__grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .state-page__chart { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
</style>

