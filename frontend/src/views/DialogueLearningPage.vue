<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AField from '@/components/aa/AField.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AErrorState from '@/components/aa/AErrorState.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import AProgressBar from '@/components/aa/AProgressBar.vue';
import dialogueAPI from '@/api/dialogue';
import api from '@/utils/api';
import type { DialogueLearningSession, SubmitResponseResult, DialogueMessage, StudentState } from '@/types/learning';

const route = useRoute();
const taskId = computed(() => String(route.params.taskId || ''));
const routeTaskTitle = computed(() => String(route.query.title || ''));
const taskTitle = computed(() => routeTaskTitle.value || taskMeta.value?.title || `任务 ${taskId.value}`);
const routePathId = computed(() => String(route.query.pathId || ''));

const loading = ref(true);
const sending = ref(false);
const hintLoading = ref(false);
const error = ref('');
const session = ref<DialogueLearningSession | null>(null);
const conversation = ref<DialogueMessage[]>([]);
const draft = ref('');
const currentQuestion = ref('');
const currentHint = ref('');
const completed = ref(false);
const state = ref<StudentState | null>(null);
const roundNumber = ref(1);
const totalRounds = ref<number | null>(null);
const resolvedPathId = ref('');
const taskMeta = ref<{ title?: string; learningPath?: { id?: string; name?: string }; learningPathId?: string; pathId?: string } | null>(null);

const roundProgress = computed(() => {
  if (!totalRounds.value) return Math.min(95, roundNumber.value * 18);
  return Math.min(100, Math.round((roundNumber.value / totalRounds.value) * 100));
});

const insightRows = computed(() => {
  const source = state.value;
  return [
    { label: '认知负荷', value: Math.round((source?.cognitive || 0) * 100), hint: '数值越高，说明当前问题对理解和加工能力要求越高。' },
    { label: '压力指数', value: Math.round((source?.stress || 0) * 100), hint: '用于判断当前学习难度是否需要降低或增加辅助提示。' },
    { label: '投入程度', value: Math.round((source?.engagement || 0) * 100), hint: '帮助观察你是否持续参与并保持专注。' }
  ];
});

const latestAssistant = computed(() => [...conversation.value].reverse().find((item) => item.role === 'assistant'));

const normalizeHistory = (history: DialogueMessage[] = [], firstQuestion?: string) => {
  if (history.length) return history;
  if (!firstQuestion) return [];
  return [{ role: 'assistant' as const, content: firstQuestion, timestamp: new Date().toISOString() }];
};

const backToPathLink = computed(() => resolvedPathId.value ? `/learning-path/${resolvedPathId.value}` : '/learning-paths');

const resolveTaskContext = async () => {
  if (!taskId.value) {
    throw new Error('缺少任务编号，请从学习路径或任务详情重新进入。');
  }

  if (routePathId.value) {
    resolvedPathId.value = routePathId.value;
  }

  if (resolvedPathId.value && routeTaskTitle.value) {
    return;
  }

  const result: any = await api.get(`/learning/tasks/${taskId.value}`);
  const data = result?.data || result || {};
  taskMeta.value = data;

  if (!resolvedPathId.value) {
    resolvedPathId.value = String(data.learningPath?.id || data.learningPathId || data.pathId || '');
  }

  if (!resolvedPathId.value) {
    throw new Error('缺少学习路径上下文，请从学习路径详情页重新进入对话学习。');
  }
};

const syncState = async () => {
  if (!session.value?.sessionId) return;
  try {
    const snapshot = await dialogueAPI.getDialogueState(session.value.sessionId);
    conversation.value = snapshot.conversationHistory || conversation.value;
    state.value = snapshot.studentState || state.value;
    roundNumber.value = snapshot.roundNumber || roundNumber.value;
    totalRounds.value = snapshot.totalRounds || totalRounds.value;
  } catch {
    // 状态轮询失败时保留当前界面数据，避免打断学习流程。
  }
};

const bootstrap = async () => {
  loading.value = true;
  error.value = '';
  try {
    await resolveTaskContext();
    const result = await dialogueAPI.startDialogueTask(taskId.value, resolvedPathId.value);
    session.value = result;
    currentQuestion.value = result.initialContent?.question || '系统已准备好，请开始你的第一轮回答。';
    conversation.value = normalizeHistory(result.conversationHistory, result.initialContent?.question);
    state.value = result.studentState || null;
    completed.value = false;
    await syncState();
  } catch (err: any) {
    error.value = err?.message || '对话学习任务启动失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

const applyResult = async (result: SubmitResponseResult) => {
  conversation.value = result.conversationHistory || conversation.value;
  state.value = result.studentState || state.value;
  currentQuestion.value = result.nextContent?.question || '当前轮次已结束，请查看系统给出的下一步建议。';
  completed.value = !!result.dialogueComplete;
  draft.value = '';
  currentHint.value = '';
  await syncState();
};

const submitAnswer = async () => {
  if (!draft.value.trim() || !session.value?.sessionId || sending.value || completed.value) return;
  sending.value = true;
  try {
    const result = await dialogueAPI.submitResponse(session.value.sessionId, draft.value.trim());
    await applyResult(result);
  } catch (err: any) {
    ElMessage.error(err?.message || '提交回答失败，请检查网络后重试。');
  } finally {
    sending.value = false;
  }
};

const requestHint = async () => {
  if (!session.value?.sessionId || hintLoading.value || completed.value) return;
  hintLoading.value = true;
  try {
    currentHint.value = await dialogueAPI.getHint(session.value.sessionId);
  } catch (err: any) {
    ElMessage.error(err?.message || '获取提示失败。');
  } finally {
    hintLoading.value = false;
  }
};

const skipCurrent = async () => {
  if (!session.value?.sessionId || sending.value || completed.value) return;
  sending.value = true;
  try {
    await dialogueAPI.skipTask(session.value.sessionId);
    ElMessage.success('当前轮次已跳过，系统已为你切换到下一步。');
    await syncState();
    currentQuestion.value = latestAssistant.value?.content || currentQuestion.value;
  } catch (err: any) {
    ElMessage.error(err?.message || '跳过当前轮次失败。');
  } finally {
    sending.value = false;
  }
};

onMounted(bootstrap);
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="对话学习"
      :title="taskTitle"
      description="通过循序追问、即时反馈与学习状态追踪，完成一轮高互动的任务训练。"
    >
      <template #actions>
        <RouterLink :to="`/learn/${taskId}?title=${encodeURIComponent(taskTitle)}${resolvedPathId ? `&pathId=${encodeURIComponent(resolvedPathId)}` : ''}`" custom v-slot="{ navigate }">
          <AButton variant="ghost" icon="menu_book" @click="navigate">切换开放学习</AButton>
        </RouterLink>
        <RouterLink :to="backToPathLink" custom v-slot="{ navigate }">
          <AButton variant="secondary" icon="arrow_back" @click="navigate">返回学习路径</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <ALoading v-if="loading" label="正在初始化对话学习..." />
    <AErrorState v-else-if="error" :description="error" @retry="bootstrap" />

    <div v-else class="dialogue-page">
      <APanel eyebrow="运行记录" title="对话进度" :description="completed ? '本轮任务已经完成，你可以继续进入开放学习阶段。' : '系统会记录每一轮师生对话与反馈结果。'" class="dialogue-page__main">
        <template #head>
          <AChip :tone="completed ? 'success' : 'primary'">
            {{ completed ? '已完成' : `第 ${roundNumber} 轮` }}
          </AChip>
        </template>

        <AProgressBar :value="roundProgress" height="sm" :show-label="true" label="轮次进度" />

        <div class="dialogue-page__feed">
          <article
            v-for="(message, index) in conversation"
            :key="`${message.timestamp}-${index}`"
            class="dialogue-page__message"
            :class="message.role === 'user' ? 'dialogue-page__message--user' : 'dialogue-page__message--assistant'"
          >
            <span class="dialogue-page__message-role">{{ message.role === 'user' ? '我的回答' : '系统提问' }}</span>
            <div class="dialogue-page__message-body">{{ message.content }}</div>
          </article>
        </div>

        <AEmpty
          v-if="completed"
          compact
          icon="task_alt"
          title="对话学习已完成"
          description="你已经完成当前任务的结构化问答，可以继续进入开放学习，巩固理解并查看总结。"
        >
          <RouterLink :to="`/learn/${taskId}?title=${encodeURIComponent(taskTitle)}${resolvedPathId ? `&pathId=${encodeURIComponent(resolvedPathId)}` : ''}`" custom v-slot="{ navigate }">
            <AButton icon-right="arrow_forward" @click="navigate">进入开放学习</AButton>
          </RouterLink>
        </AEmpty>

        <template v-else>
          <div class="dialogue-page__question-card">
            <p class="aa-eyebrow aa-eyebrow--muted">当前问题</p>
            <h3>{{ currentQuestion }}</h3>
          </div>

          <AField
            v-model="draft"
            label="我的回答"
            placeholder="请输入你的思考过程、答案或反问。按 Ctrl / ⌘ + Enter 可快速提交。"
            hint="建议尽量说明你的判断依据，这样系统才能给出更准确的反馈。"
            textarea
            :rows="4"
            @enter="submitAnswer"
          />
        </template>

        <template #footer>
          <AButton icon="send" :loading="sending" :disabled="!draft.trim() || completed" @click="submitAnswer">提交回答</AButton>
          <AButton variant="secondary" icon="lightbulb" :loading="hintLoading" :disabled="completed" @click="requestHint">获取提示</AButton>
          <AButton variant="ghost" icon="skip_next" :disabled="completed || sending" @click="skipCurrent">跳过当前轮次</AButton>
        </template>
      </APanel>

      <aside class="dialogue-page__side">
        <APanel eyebrow="任务上下文" title="学习任务" description="帮助你在回答前快速明确目标与当前进度。">
          <div class="dialogue-page__side-block">
            <h3>{{ taskTitle }}</h3>
            <p>当前任务采用“追问—回答—反馈”的引导式学习方式，适合用于理解过程性问题和纠正思路偏差。</p>
          </div>
          <div class="dialogue-page__meta-grid">
            <div>
              <span>当前轮次</span>
              <strong>{{ roundNumber }}</strong>
            </div>
            <div>
              <span>预计轮次</span>
              <strong>{{ totalRounds || '待定' }}</strong>
            </div>
          </div>
        </APanel>

        <APanel eyebrow="学生状态" title="即时反馈面板" description="实时观察理解、压力与投入变化，辅助调整答题策略。">
          <div class="dialogue-page__state-list">
            <div v-for="row in insightRows" :key="row.label" class="dialogue-page__state-item">
              <div class="dialogue-page__state-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}%</strong>
              </div>
              <div class="dialogue-page__state-track"><span :style="{ width: `${row.value}%` }"></span></div>
              <p>{{ row.hint }}</p>
            </div>
          </div>
          <div v-if="state?.anomaly" class="dialogue-page__alert">
            <span class="material-symbols-outlined">warning</span>
            <div>
              <strong>检测到异常状态</strong>
              <p>{{ state.anomalyReason || state.intervention || '系统建议你适当降低难度或先查看提示。' }}</p>
            </div>
          </div>
        </APanel>

        <APanel eyebrow="提示板" title="学习提示">
          <p v-if="currentHint" class="dialogue-page__hint">{{ currentHint }}</p>
          <AEmpty
            v-else
            compact
            icon="tips_and_updates"
            title="暂时还没有提示"
            description="如果你卡住了，可以点击“获取提示”，系统会基于当前轮次给出更具体的引导。"
          />
        </APanel>
      </aside>
    </div>
  </AppShell>
</template>

<style scoped>
.dialogue-page {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(300px, 0.95fr);
  gap: var(--space-5);
  align-items: start;
}
.dialogue-page__main { min-height: 720px; }
.dialogue-page__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: 460px;
  overflow-y: auto;
  padding-left: var(--space-4);
  border-left: 1px solid rgba(172, 179, 183, 0.28);
}
.dialogue-page__message { display: flex; flex-direction: column; gap: 6px; }
.dialogue-page__message-role {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  font-weight: 700;
}
.dialogue-page__message-body {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  line-height: 1.7;
  white-space: pre-wrap;
}
.dialogue-page__message--assistant .dialogue-page__message-body { background: var(--color-surface-alt); }
.dialogue-page__message--user .dialogue-page__message-role { color: var(--color-primary); }
.dialogue-page__message--user .dialogue-page__message-body {
  background: var(--color-surface);
  border-left: 2px solid var(--color-primary);
}
.dialogue-page__question-card {
  padding: var(--space-5);
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
}
.dialogue-page__question-card h3 {
  margin-top: 8px;
  font-size: 1.05rem;
  line-height: 1.55;
}
.dialogue-page__side { display: flex; flex-direction: column; gap: var(--space-4); }
.dialogue-page__side-block h3 {
  font-size: 1.06rem;
  margin-bottom: 8px;
}
.dialogue-page__side-block p { color: var(--color-ink-dim); line-height: 1.65; }
.dialogue-page__meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.dialogue-page__meta-grid div {
  padding: 12px 14px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
}
.dialogue-page__meta-grid span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}
.dialogue-page__meta-grid strong {
  display: block;
  margin-top: 6px;
  font-family: var(--font-headline);
  font-size: 1.3rem;
}
.dialogue-page__state-list { display: flex; flex-direction: column; gap: var(--space-4); }
.dialogue-page__state-item { display: flex; flex-direction: column; gap: 6px; }
.dialogue-page__state-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--color-ink-dim);
}
.dialogue-page__state-head strong {
  font-family: var(--font-headline);
  color: var(--color-primary);
  font-size: 1rem;
}
.dialogue-page__state-track {
  height: 4px;
  background: var(--color-surface-highest);
  border-radius: 999px;
  overflow: hidden;
}
.dialogue-page__state-track span {
  display: block;
  height: 100%;
  background: var(--color-primary);
}
.dialogue-page__state-item p { margin: 0; color: var(--color-ink-soft); font-size: 0.78rem; line-height: 1.55; }
.dialogue-page__alert {
  display: flex;
  gap: 12px;
  margin-top: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.dialogue-page__alert .material-symbols-outlined { font-size: 20px !important; }
.dialogue-page__alert p { margin-top: 4px; color: #7d2c2c; }
.dialogue-page__hint {
  padding: var(--space-4);
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-primary);
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .dialogue-page { grid-template-columns: 1fr; }
}
</style>
