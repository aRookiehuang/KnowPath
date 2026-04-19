<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AButton from '@/components/aa/AButton.vue';
import AField from '@/components/aa/AField.vue';
import AChip from '@/components/aa/AChip.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import { exportAgentLogs, getAgentLogs } from '@/api/userCustom';

const loading = ref(true);
const keyword = ref('');
const includeSystem = ref(false);
const startDate = ref('');
const endDate = ref('');
const logs = ref<any[]>([]);
const selectedId = ref('');

const normalizeList = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || payload?.list || [];
};

const filteredLogs = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return logs.value.filter((item) => {
    if (!includeSystem.value && item.isSystem) return false;
    if (startDate.value && String(item.createdAt || item.timestamp || '').slice(0, 10) < startDate.value) return false;
    if (endDate.value && String(item.createdAt || item.timestamp || '').slice(0, 10) > endDate.value) return false;
    if (!q) return true;
    const haystack = [item.agentName, item.name, item.message, item.summary, item.action].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  });
});

const selectedLog = computed(() => filteredLogs.value.find((item) => String(item.id) === selectedId.value) || filteredLogs.value[0] || null);

const stats = computed(() => ({
  total: logs.value.length,
  success: logs.value.filter((item) => item.success || item.status === 'success').length,
  failed: logs.value.filter((item) => item.success === false || item.status === 'failed' || item.status === 'error').length,
  system: logs.value.filter((item) => item.isSystem).length
}));

const loadLogs = async () => {
  loading.value = true;
  try {
    const result = await getAgentLogs({ includeSystem: includeSystem.value, limit: 50 });
    logs.value = normalizeList(result);
  } catch (err: any) {
    logs.value = [];
    ElMessage.error(err?.message || '加载运行日志失败。');
  } finally {
    loading.value = false;
  }
};

const handleExport = async (format: 'json' | 'csv') => {
  try {
    const result = await exportAgentLogs({ startDate: startDate.value || undefined, endDate: endDate.value || undefined, format });
    if (result instanceof Blob) {
      const url = URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agent-logs.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agent-logs.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (err: any) {
    ElMessage.error(err?.message || '导出日志失败。');
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
  <AppShell>
    <APageHeader
      eyebrow="运行日志"
      title="智能体日志"
      description="查看智能体执行记录、系统运行结果与关键时间线，便于后续排查和复盘。"
    >
      <template #actions>
        <AButton variant="secondary" icon="download" @click="handleExport('json')">导出 JSON</AButton>
        <AButton icon="download" @click="handleExport('csv')">导出 CSV</AButton>
      </template>
    </APageHeader>

    <div class="agent-log-page">
      <section class="agent-log-page__stats">
        <AStatTile label="日志总数" :value="stats.total" icon="receipt_long" tone="accent" />
        <AStatTile label="成功记录" :value="stats.success" icon="check_circle" />
        <AStatTile label="失败记录" :value="stats.failed" icon="error" />
        <AStatTile label="系统日志" :value="stats.system" icon="memory" tone="muted" />
      </section>

      <APanel eyebrow="筛选条件" title="日志筛选">
        <div class="agent-log-page__filters">
          <AField v-model="keyword" label="关键词" placeholder="搜索智能体名称、消息或行为" />
          <AField v-model="startDate" label="开始日期" type="date" placeholder="YYYY-MM-DD" />
          <AField v-model="endDate" label="结束日期" type="date" placeholder="YYYY-MM-DD" />
          <label class="agent-log-page__switch">
            <input v-model="includeSystem" type="checkbox" />
            <span>包含系统日志</span>
          </label>
          <AButton variant="ghost" icon="refresh" @click="loadLogs">重新加载</AButton>
        </div>
      </APanel>

      <ALoading v-if="loading" label="正在加载日志..." />

      <div v-else class="agent-log-page__grid">
        <APanel eyebrow="时间线" title="日志列表" class="agent-log-page__main">
          <div v-if="filteredLogs.length" class="agent-log-page__list">
            <button
              v-for="item in filteredLogs"
              :key="item.id"
              type="button"
              class="agent-log-page__item"
              :class="{ 'agent-log-page__item--active': String(item.id) === String(selectedId) }"
              @click="selectedId = String(item.id)"
            >
              <div>
                <div class="agent-log-page__item-head">
                  <h3>{{ item.agentName || item.name || '未命名智能体' }}</h3>
                  <AChip :tone="item.success || item.status === 'success' ? 'success' : item.status === 'warning' ? 'warn' : 'soft'">
                    {{ item.success || item.status === 'success' ? '成功' : item.status === 'warning' ? '警告' : item.status || '未知' }}
                  </AChip>
                </div>
                <p>{{ item.message || item.summary || item.action || '暂无详细描述' }}</p>
              </div>
              <span class="agent-log-page__time">{{ item.createdAt || item.timestamp || '时间未知' }}</span>
            </button>
          </div>
          <AEmpty
            v-else
            icon="history"
            title="暂无匹配日志"
            description="你可以调整筛选条件，或等待新的智能体执行记录产生。"
          />
        </APanel>

        <aside class="agent-log-page__side">
          <APanel eyebrow="日志详情" title="详情面板">
            <div v-if="selectedLog" class="agent-log-page__detail">
              <div class="agent-log-page__detail-grid">
                <div>
                  <span>智能体</span>
                  <strong>{{ selectedLog.agentName || selectedLog.name || '未命名智能体' }}</strong>
                </div>
                <div>
                  <span>时间</span>
                  <strong>{{ selectedLog.createdAt || selectedLog.timestamp || '未知' }}</strong>
                </div>
              </div>
              <p>{{ selectedLog.message || selectedLog.summary || '暂无可展示的详情描述。' }}</p>
              <pre>{{ JSON.stringify(selectedLog, null, 2) }}</pre>
            </div>
            <AEmpty v-else compact icon="description" title="还没有选中日志" description="从左侧列表中选择一条记录，即可在这里查看详细信息。" />
          </APanel>
        </aside>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.agent-log-page { display: flex; flex-direction: column; gap: var(--space-6); }
.agent-log-page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.agent-log-page__filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: end;
}
.agent-log-page__switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--color-surface-high);
  border-radius: var(--radius-sm);
  cursor: pointer;
  min-height: 46px;
}
.agent-log-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.agent-log-page__list { display: flex; flex-direction: column; gap: var(--space-3); }
.agent-log-page__item {
  width: 100%;
  padding: var(--space-4);
  border: 0;
  text-align: left;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  transition: background var(--duration-base) var(--easing);
}
.agent-log-page__item:hover,
.agent-log-page__item--active {
  background: var(--color-surface-high);
}
.agent-log-page__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: 8px;
}
.agent-log-page__item h3 { font-size: 0.98rem; }
.agent-log-page__item p { color: var(--color-ink-dim); line-height: 1.6; margin: 0; }
.agent-log-page__time { color: var(--color-ink-soft); font-size: 0.76rem; white-space: nowrap; }
.agent-log-page__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}
.agent-log-page__detail-grid div {
  padding: 12px 14px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
}
.agent-log-page__detail-grid span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}
.agent-log-page__detail-grid strong { display: block; margin-top: 8px; font-size: 0.94rem; }
.agent-log-page__detail p { color: var(--color-ink-dim); line-height: 1.7; margin: var(--space-4) 0; }
.agent-log-page__detail pre {
  padding: var(--space-4);
  background: #10141a;
  color: #d7deea;
  border-radius: var(--radius-sm);
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .agent-log-page__stats { grid-template-columns: repeat(2, 1fr); }
  .agent-log-page__filters,
  .agent-log-page__grid { grid-template-columns: 1fr; }
}
</style>
