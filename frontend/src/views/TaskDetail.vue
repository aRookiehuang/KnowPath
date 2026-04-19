<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AErrorState from '@/components/aa/AErrorState.vue';
import api from '@/utils/api';

interface Props {
  modelValue: boolean;
  taskId?: string;
}

interface TaskDetailData {
  id: string;
  title: string;
  description?: string;
  taskType?: string;
  status?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  aiHints?: string[];
  resources?: Array<{ title?: string; url?: string } | string>;
  learningPath?: { id?: string; name?: string };
  week?: { title?: string; weekNumber?: number };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'taskCompleted'): void;
}>();

const loading = ref(false);
const error = ref('');
const task = ref<TaskDetailData | null>(null);

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const statusText = computed(() => {
  const status = task.value?.status;
  if (status === 'completed') return '已完成';
  if (status === 'in_progress') return '进行中';
  if (status === 'skipped') return '已跳过';
  return '待开始';
});

const statusTone = computed(() => {
  const status = task.value?.status;
  if (status === 'completed') return 'success';
  if (status === 'in_progress') return 'primary';
  if (status === 'skipped') return 'warn';
  return 'soft';
});

const fetchTask = async () => {
  if (!props.taskId || !visible.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result: any = await api.get(`/learning/tasks/${props.taskId}`);
    task.value = result?.data || result;
  } catch (err: any) {
    error.value = err?.message || '加载任务详情失败。';
  } finally {
    loading.value = false;
  }
};

watch(() => [props.taskId, props.modelValue], fetchTask, { immediate: true });
</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="task-modal">
      <div class="task-modal__backdrop" @click="visible = false"></div>
      <div class="task-modal__panel" role="dialog" aria-modal="true">
        <header class="task-modal__head">
          <div>
            <p class="aa-eyebrow aa-eyebrow--muted">任务详情</p>
            <h2>{{ task?.title || '未命名任务' }}</h2>
          </div>
          <button type="button" class="task-modal__close" @click="visible = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <ALoading v-if="loading" compact label="正在加载任务详情..." />
        <AErrorState v-else-if="error" :description="error" @retry="fetchTask" />

        <div v-else-if="task" class="task-modal__body">
          <div class="task-modal__meta">
            <AChip :tone="statusTone">{{ statusText }}</AChip>
            <AChip tone="soft">{{ task.taskType || '学习任务' }}</AChip>
            <AChip tone="soft">预计 {{ task.estimatedMinutes || 0 }} 分钟</AChip>
          </div>

          <p class="task-modal__desc">{{ task.description || '当前任务暂无详细描述。' }}</p>

          <div v-if="task.aiHints?.length" class="task-modal__block">
            <h3>AI 提示</h3>
            <ul>
              <li v-for="(item, index) in task.aiHints" :key="index">{{ item }}</li>
            </ul>
          </div>

          <div v-if="task.resources?.length" class="task-modal__block">
            <h3>学习资源</h3>
            <ul>
              <li v-for="(item, index) in task.resources" :key="index">{{ typeof item === 'string' ? item : item.title || item.url }}</li>
            </ul>
          </div>
        </div>

        <footer class="task-modal__foot">
          <RouterLink
            v-if="task"
            :to="`/dialogue-learn/${task.id}?title=${encodeURIComponent(task.title)}${task.learningPath?.id || task.learningPathId || task.pathId ? `&pathId=${encodeURIComponent(String(task.learningPath?.id || task.learningPathId || task.pathId))}` : ''}`"
            custom
            v-slot="{ navigate }"
          >
            <AButton icon="forum" @click="navigate">对话学习</AButton>
          </RouterLink>
          <RouterLink
            v-if="task"
            :to="`/learn/${task.id}?title=${encodeURIComponent(task.title)}${task.learningPath?.id || task.learningPathId || task.pathId ? `&pathId=${encodeURIComponent(String(task.learningPath?.id || task.learningPathId || task.pathId))}` : ''}`"
            custom
            v-slot="{ navigate }"
          >
            <AButton variant="secondary" icon="menu_book" @click="navigate">开放学习</AButton>
          </RouterLink>
          <AButton variant="ghost" icon="close" @click="visible = false">关闭</AButton>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.task-modal {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: var(--space-6);
}
.task-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(10, 16, 24, 0.42);
  backdrop-filter: blur(8px);
}
.task-modal__panel {
  position: relative;
  width: min(780px, 100%);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elevated);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.task-modal__head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: flex-start;
}
.task-modal__head h2 { margin-top: 6px; font-size: 1.6rem; }
.task-modal__close {
  border: 0;
  background: var(--color-surface-alt);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
}
.task-modal__meta { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.task-modal__desc { color: var(--color-ink-dim); line-height: 1.7; }
.task-modal__block {
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.task-modal__block h3 { font-size: 0.98rem; margin-bottom: 10px; }
.task-modal__block ul { margin: 0; padding-left: 18px; color: var(--color-ink-dim); line-height: 1.7; }
.task-modal__foot { display: flex; gap: var(--space-2); flex-wrap: wrap; }
</style>
