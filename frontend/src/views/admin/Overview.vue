<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AChip from '@/components/aa/AChip.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import { adminDashboardApi } from '@/api/adminApi';

const loading = ref(true);
const stats = ref<any>({});
const activity = ref<any[]>([]);

const source = computed(() => stats.value?.data || stats.value || {});
const usersStats = computed(() => source.value.users || {});
const learningStats = computed(() => source.value.learning || {});
const conversationStats = computed(() => source.value.conversations || {});
const agentStats = computed(() => source.value.agents || {});

const pickMetric = (...candidates: any[]): string | number => {
  for (const item of candidates) {
    if (item === undefined || item === null || item === '') continue;
    if (typeof item === 'number' || typeof item === 'string') return item;
    if (typeof item === 'object') {
      const nested = item.total ?? item.totalPaths ?? item.active ?? item.count ?? item.value ?? item.totalCalls;
      if (nested !== undefined && nested !== null && nested !== '') return nested;
    }
  }
  return '-';
};

const formatValue = (value: string | number) => {
  if (typeof value === 'number') return value.toLocaleString('zh-CN');
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
    return value.includes('.') ? value : Number(value).toLocaleString('zh-CN');
  }
  return value;
};

const formatPercent = (value: unknown, suffix = '%') => {
  if (value === undefined || value === null || value === '') return '-';
  const text = String(value);
  return text.endsWith(suffix) ? text : `${text}${suffix}`;
};

const summaryTiles = computed(() => [
  {
    label: '用户总数',
    value: formatValue(pickMetric(usersStats.value.total, source.value.userCount)),
    hint: `今日新增 ${pickMetric(usersStats.value.newToday, '-')}`,
    icon: 'groups',
    tone: 'accent' as const
  },
  {
    label: '路径总数',
    value: formatValue(pickMetric(learningStats.value.totalPaths, source.value.pathCount)),
    hint: `进行中 ${pickMetric(learningStats.value.activePaths, '-')}`,
    icon: 'account_tree'
  },
  {
    label: '活跃会话',
    value: formatValue(pickMetric(conversationStats.value.active, source.value.activeSessions)),
    hint: `累计 ${formatValue(pickMetric(conversationStats.value.total, '-'))}`,
    icon: 'forum'
  },
  {
    label: '智能体调用',
    value: formatValue(pickMetric(agentStats.value.totalCalls, source.value.agentCount)),
    hint: `成功率 ${formatPercent(agentStats.value.successRate)}`,
    icon: 'smart_toy',
    tone: 'muted' as const
  }
]);

const routeStats = computed(() => {
  const candidates = source.value?.routeStats || source.value?.routes || [];
  if (Array.isArray(candidates) && candidates.length) return candidates;
  return [
    {
      path: '/learning-paths',
      value: formatValue(pickMetric(learningStats.value.totalPaths, '-')),
      qps: `完成率 ${formatPercent(learningStats.value.completionRate)}`
    },
    {
      path: '/goal-conversation',
      value: formatValue(pickMetric(conversationStats.value.active, '-')),
      qps: `累计 ${formatValue(pickMetric(conversationStats.value.total, '-'))}`
    },
    {
      path: '/api/admin/overview/stats',
      value: formatValue(pickMetric(usersStats.value.total, '-')),
      qps: `新增 ${pickMetric(usersStats.value.newToday, '-')}`
    }
  ];
});

const healthRows = computed(() => {
  const health = source.value?.health || source.value?.system || {};
  return [
    { label: '调用成功率', value: formatPercent(agentStats.value.successRate || health.successRate || source.value?.successRate || '100') },
    { label: '路径完成率', value: formatPercent(learningStats.value.completionRate) },
    { label: '用户活跃率', value: formatPercent(usersStats.value.activeRate) },
    { label: '进行中路径', value: formatValue(pickMetric(learningStats.value.activePaths, '-')) }
  ];
});

const normalizeActivity = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  const data = payload?.data || payload;
  if (Array.isArray(data?.items)) return data.items;

  const recentSessions = Array.isArray(data?.recentSessions)
    ? data.recentSessions.map((item: any) => ({
        id: `session-${item.id}`,
        title: item.users?.name ? `${item.users.name} 开始新的学习会话` : '有学习者开始新的学习会话',
        description: item.topic || item.goal || '系统已记录该学习会话。',
        createdAt: item.startTime || item.createdAt
      }))
    : [];

  const recentUsers = Array.isArray(data?.recentUsers)
    ? data.recentUsers.map((item: any) => ({
        id: `user-${item.id}`,
        title: `${item.name || item.email || '新用户'} 完成注册`,
        description: item.email || '新的学习者已加入平台。',
        createdAt: item.createdAt
      }))
    : [];

  const completedTasks = Array.isArray(data?.completedTasks)
    ? data.completedTasks.map((item: any) => ({
        id: `task-${item.id}`,
        title: `${item.users?.name || '学习者'} 完成任务`,
        description: item.title || item.name || '一项学习任务已完成。',
        createdAt: item.completedAt || item.updatedAt || item.createdAt
      }))
    : [];

  return [...recentSessions, ...recentUsers, ...completedTasks]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);
};

onMounted(async () => {
  loading.value = true;
  try {
    const [statsResult, activityResult] = await Promise.all([
      adminDashboardApi.getStats(),
      adminDashboardApi.getActivity(8)
    ]);

    stats.value = statsResult.data || statsResult;
    activity.value = normalizeActivity(activityResult.data || activityResult);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="admin-overview">
    <APageHeader
      eyebrow="平台概览"
      title="后台总览"
      description="聚合查看平台运行态势、核心指标、调用热度与最新动态。"
    />

    <ALoading v-if="loading" label="正在加载后台概览..." />

    <template v-else>
      <section class="admin-overview__stats">
        <AStatTile v-for="item in summaryTiles" :key="item.label" v-bind="item" />
      </section>

      <section class="admin-overview__grid">
        <APanel eyebrow="近期动态" title="活动流">
          <div v-if="activity.length" class="admin-overview__activity-list">
            <article v-for="(item, index) in activity" :key="item.id || index" class="admin-overview__activity-item">
              <div>
                <h3>{{ item.title || item.action || item.type || '未命名事件' }}</h3>
                <p>{{ item.description || item.message || '暂无详情' }}</p>
              </div>
              <span>{{ item.createdAt ? String(item.createdAt).slice(5, 16) : '--' }}</span>
            </article>
          </div>
          <AEmpty v-else compact icon="history" title="暂无平台动态" description="最近还没有新的后台活动记录。" />
        </APanel>

        <APanel eyebrow="系统健康" title="运行健康度">
          <div class="admin-overview__health-card">
            <AChip tone="success">系统运行稳定</AChip>
            <div class="admin-overview__health-list">
              <div v-for="row in healthRows" :key="row.label">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
          </div>
        </APanel>
      </section>

      <section class="admin-overview__grid admin-overview__grid--bottom">
        <APanel eyebrow="核心入口" title="关注路径">
          <div class="admin-overview__routes">
            <article v-for="(item, index) in routeStats" :key="item.path || index" class="admin-overview__route-item">
              <div>
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <h3>{{ item.path || item.name || '未命名接口' }}</h3>
              </div>
              <div class="admin-overview__route-side">
                <strong>{{ item.value || item.count || '-' }}</strong>
                <small>{{ item.qps || item.rate || '-' }}</small>
              </div>
            </article>
          </div>
        </APanel>

        <APanel eyebrow="运维提示" title="当前建议">
          <div class="admin-overview__note-card">
            <h3>建议优先关注学习完成率与会话转化</h3>
            <p>如果活跃会话增长明显但路径完成率走低，建议优先检查目标对话质量、路径粒度和模型配置稳定性。</p>
          </div>
        </APanel>
      </section>
    </template>
  </div>
</template>

<style scoped>
.admin-overview { display: flex; flex-direction: column; gap: var(--space-6); }

.admin-overview__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.admin-overview__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: var(--space-5);
}

.admin-overview__activity-list,
.admin-overview__routes {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.admin-overview__activity-item,
.admin-overview__route-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.admin-overview__activity-item h3,
.admin-overview__route-item h3 { font-size: 0.98rem; }

.admin-overview__activity-item p,
.admin-overview__route-item span,
.admin-overview__route-item small { color: var(--color-ink-soft); }

.admin-overview__activity-item p { margin-top: 6px; line-height: 1.6; }

.admin-overview__health-card,
.admin-overview__note-card {
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.admin-overview__health-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: var(--space-4);
}

.admin-overview__health-list div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  font-size: 0.88rem;
}

.admin-overview__route-item div:first-child {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-overview__route-item span {
  font-family: var(--font-headline);
  font-weight: 700;
}

.admin-overview__route-side { text-align: right; }

.admin-overview__route-side strong {
  display: block;
  font-family: var(--font-headline);
  color: var(--color-primary);
}

.admin-overview__note-card h3 {
  font-size: 1rem;
  margin-bottom: 10px;
}

.admin-overview__note-card p {
  color: var(--color-ink-dim);
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .admin-overview__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-overview__grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .admin-overview__stats { grid-template-columns: 1fr; }
}
</style>
