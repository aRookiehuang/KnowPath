<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AButton from '@/components/aa/AButton.vue';
import AField from '@/components/aa/AField.vue';
import AChip from '@/components/aa/AChip.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import { adminAgentsApi } from '@/api/adminApi';

const loading = ref(true);
const keyword = ref('');
const logs = ref<any[]>([]);
const selectedId = ref('');

const formatDateTime = (value: unknown) => {
  if (!value) return '时间未知';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusTone = (log: any) => {
  if (log.status === 'success' || log.success) return 'success';
  if (log.status === 'warning') return 'warn';
  return 'danger';
};

const statusText = (log: any) => {
  return log.status || (log.success ? 'success' : 'unknown');
};

const normalizedLogs = computed(() => logs.value.map((log) => ({
  ...log,
  displayName: log.agentName || log.name || '未命名智能体',
  displayMessage: log.message || log.summary || '暂无详细描述',
  displayTime: formatDateTime(log.createdAt || log.updatedAt),
  tone: statusTone(log),
  statusText: statusText(log)
})));

const filteredLogs = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return normalizedLogs.value;
  return normalizedLogs.value.filter((log) =>
    `${log.displayName} ${log.displayMessage} ${log.statusText}`.toLowerCase().includes(q)
  );
});

const selectedLog = computed(() => filteredLogs.value.find((log) => String(log.id) === selectedId.value) || filteredLogs.value[0] || null);

const stats = computed(() => ({
  total: normalizedLogs.value.length,
  success: normalizedLogs.value.filter((log) => log.tone === 'success').length,
  warning: normalizedLogs.value.filter((log) => log.tone === 'warn').length,
  failed: normalizedLogs.value.filter((log) => log.tone === 'danger').length
}));

const loadLogs = async () => {
  loading.value = true;
  try {
    const result = await adminAgentsApi.getLogs({ page: 1, limit: 40 });
    logs.value = result.data?.items || result.data?.data || result.data || result || [];
  } finally {
    loading.value = false;
  }
};

watch(filteredLogs, (list) => {
  if (!list.length) {
    selectedId.value = '';
    return;
  }
  if (!list.some((item) => String(item.id) === selectedId.value)) {
    selectedId.value = String(list[0].id);
  }
}, { immediate: true });

onMounted(loadLogs);
</script>

<template>
  <div class="admin-execution-logs">
    <APageHeader
      eyebrow="执行日志"
      title="智能体执行审计"
      description="按时间线查看后台智能体执行结果、告警与失败详情，便于快速复盘异常。"
    >
      <template #actions>
        <AButton variant="secondary" icon="refresh" @click="loadLogs">重新加载</AButton>
      </template>
    </APageHeader>

    <section class="admin-execution-logs__stats">
      <AStatTile label="日志总数" :value="stats.total" icon="receipt_long" tone="accent" hint="当前检索范围内的执行记录" />
      <AStatTile label="成功" :value="stats.success" icon="check_circle" hint="执行状态正常" />
      <AStatTile label="警告" :value="stats.warning" icon="warning" hint="需要人工复核" />
      <AStatTile label="失败" :value="stats.failed" icon="error" tone="muted" hint="建议优先排查" />
    </section>

    <APanel eyebrow="日志检索" title="搜索与筛选">
      <div class="admin-execution-logs__toolbar">
        <AField v-model="keyword" label="关键词" placeholder="搜索智能体名称、状态或日志内容" />
        <div class="admin-execution-logs__toolbar-meta">
          <AChip tone="soft">{{ filteredLogs.length }} 条记录</AChip>
          <AChip tone="warn">{{ stats.failed + stats.warning }} 条需关注</AChip>
        </div>
      </div>
    </APanel>

    <ALoading v-if="loading" label="正在加载执行日志..." />

    <section v-else class="admin-execution-logs__grid">
      <APanel eyebrow="时间线" title="日志列表">
        <div v-if="filteredLogs.length" class="admin-execution-logs__list">
          <button
            v-for="log in filteredLogs"
            :key="log.id"
            type="button"
            class="admin-execution-logs__item"
            :class="{ 'admin-execution-logs__item--active': String(log.id) === String(selectedLog?.id) }"
            @click="selectedId = String(log.id)"
          >
            <div class="admin-execution-logs__item-main">
              <div class="admin-execution-logs__item-head">
                <h3>{{ log.displayName }}</h3>
                <AChip :tone="log.tone">{{ log.statusText }}</AChip>
              </div>
              <p>{{ log.displayMessage }}</p>
            </div>
            <span>{{ log.displayTime }}</span>
          </button>
        </div>
        <AEmpty v-else icon="history" title="暂无日志" description="当前还没有匹配的执行记录。" />
      </APanel>

      <aside class="admin-execution-logs__side">
        <APanel eyebrow="日志详情" title="详情面板">
          <div v-if="selectedLog" class="admin-execution-logs__detail">
            <div class="admin-execution-logs__detail-grid">
              <div>
                <span>智能体</span>
                <strong>{{ selectedLog.displayName }}</strong>
              </div>
              <div>
                <span>状态</span>
                <strong>{{ selectedLog.statusText }}</strong>
              </div>
              <div>
                <span>记录时间</span>
                <strong>{{ selectedLog.displayTime }}</strong>
              </div>
              <div>
                <span>日志编号</span>
                <strong>{{ selectedLog.id || '-' }}</strong>
              </div>
            </div>
            <p>{{ selectedLog.displayMessage }}</p>
            <pre>{{ JSON.stringify(selectedLog, null, 2) }}</pre>
          </div>
          <AEmpty v-else compact icon="description" title="未选择日志" description="从左侧列表中选择一条日志后即可查看详细内容。" />
        </APanel>

        <APanel eyebrow="处理建议" title="运维动作">
          <div class="admin-execution-logs__guide">
            <div>
              <span>失败记录</span>
              <strong>优先核查模型配置、权限异常与上下游接口可用性。</strong>
            </div>
            <div>
              <span>警告记录</span>
              <strong>建议重点关注重试次数与响应时延，避免问题积累为系统性故障。</strong>
            </div>
          </div>
        </APanel>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.admin-execution-logs { display: flex; flex-direction: column; gap: var(--space-6); }

.admin-execution-logs__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.admin-execution-logs__toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
}

.admin-execution-logs__toolbar :deep(.aa-field) {
  max-width: 420px;
}

.admin-execution-logs__toolbar-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.admin-execution-logs__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr);
  gap: var(--space-5);
}

.admin-execution-logs__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.admin-execution-logs__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.admin-execution-logs__item {
  width: 100%;
  border: 0;
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  text-align: left;
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  transition:
    transform var(--duration-base) var(--easing),
    background var(--duration-base) var(--easing);
}

.admin-execution-logs__item:hover,
.admin-execution-logs__item--active {
  background: var(--color-surface-high);
  transform: translateY(-1px);
}

.admin-execution-logs__item-main {
  min-width: 0;
}

.admin-execution-logs__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: 8px;
}

.admin-execution-logs__item h3 { font-size: 0.98rem; }

.admin-execution-logs__item p {
  margin: 0;
  color: var(--color-ink-dim);
  line-height: 1.6;
}

.admin-execution-logs__item span {
  color: var(--color-ink-soft);
  font-size: 0.78rem;
  white-space: nowrap;
}

.admin-execution-logs__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.admin-execution-logs__detail-grid div,
.admin-execution-logs__guide div {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.admin-execution-logs__detail-grid span,
.admin-execution-logs__guide span {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-ink-soft);
  font-weight: 700;
}

.admin-execution-logs__detail-grid strong,
.admin-execution-logs__guide strong {
  display: block;
  margin-top: 8px;
  line-height: 1.65;
}

.admin-execution-logs__detail p {
  color: var(--color-ink-dim);
  line-height: 1.7;
  margin: var(--space-4) 0;
}

.admin-execution-logs__detail pre {
  padding: var(--space-4);
  background: #10141a;
  color: #d7deea;
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.6;
}

.admin-execution-logs__guide {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (max-width: 1080px) {
  .admin-execution-logs__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-execution-logs__grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .admin-execution-logs__stats { grid-template-columns: 1fr; }
  .admin-execution-logs__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .admin-execution-logs__toolbar :deep(.aa-field) {
    max-width: none;
  }
  .admin-execution-logs__detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
