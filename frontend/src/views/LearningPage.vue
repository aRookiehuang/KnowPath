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
import AEmpty from '@/components/aa/AEmpty.vue';
import aiTeachingAPI, { type MessageResult, type TaskEvaluationDetail } from '@/api/aiTeaching';

const route = useRoute();
const taskId = computed(() => String(route.params.taskId || ''));
const taskTitle = computed(() => String(route.query.title || `任务 ${taskId.value}`));
const taskDescription = computed(() => String(route.query.description || '进入更自由的学习会话，通过追问、解释与总结完成知识巩固。'));
const pathId = computed(() => String(route.query.pathId || ''));

const sessionId = ref('');
const loading = ref(false);
const sending = ref(false);
const ending = ref(false);
const draft = ref('');
const summary = ref<any>(null);
const lastResult = ref<MessageResult | null>(null);
const latestEvaluation = ref<TaskEvaluationDetail | null>(null);
const messages = ref<Array<{ role: 'assistant' | 'user'; content: string }>>([]);

const active = computed(() => !!sessionId.value);
const knowledgePoints = computed(() => lastResult.value?.knowledgePoints || latestEvaluation.value?.knowledgePoints || []);
const stateRows = computed(() => {
  const source = lastResult.value?.state || latestEvaluation.value?.evaluation;
  return [
    { label: '认知负荷', value: Math.round(source?.lss || 0) },
    { label: '知识迁移', value: Math.round(source?.ktl || 0) },
    { label: '学习流', value: Math.round(source?.lf || 0) },
    { label: '学习平衡', value: Math.round(source?.lsb || 0) }
  ];
});

const fetchLatestEvaluation = async () => {
  try {
    latestEvaluation.value = await aiTeachingAPI.getLatestTaskEvaluation(taskId.value);
  } catch {
    latestEvaluation.value = null;
  }
};

const startSession = async () => {
  if (active.value || loading.value) return;
  loading.value = true;
  try {
    const result = await aiTeachingAPI.startSession('学习任务', taskTitle.value, 5, taskId.value);
    sessionId.value = result.sessionId;
    messages.value = [{ role: 'assistant', content: result.welcomeMessage || '会话已开始，你可以围绕当前任务自由提问、回答或展开讨论。' }];
    summary.value = null;
  } catch (err: any) {
    ElMessage.error(err?.message || '启动学习会话失败。');
  } finally {
    loading.value = false;
  }
};

const sendMessage = async () => {
  if (!draft.value.trim() || !sessionId.value || sending.value) return;
  const content = draft.value.trim();
  draft.value = '';
  messages.value.push({ role: 'user', content });
  sending.value = true;
  try {
    const result = await aiTeachingAPI.sendMessage(sessionId.value, content);
    lastResult.value = result;
    messages.value.push({ role: 'assistant', content: result.aiResponse || '系统已收到你的输入，并生成了新的学习反馈。' });
  } catch (err: any) {
    ElMessage.error(err?.message || '发送消息失败，请重试。');
  } finally {
    sending.value = false;
  }
};

const endSession = async () => {
  if (!sessionId.value || ending.value) return;
  ending.value = true;
  try {
    const result = await aiTeachingAPI.endSession(sessionId.value);
    summary.value = result.summary || null;
    sessionId.value = '';
    await fetchLatestEvaluation();
    ElMessage.success('学习会话已结束，系统已生成总结。');
  } catch (err: any) {
    ElMessage.error(err?.message || '结束会话失败。');
  } finally {
    ending.value = false;
  }
};

onMounted(fetchLatestEvaluation);
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="开放学习"
      :title="taskTitle"
      :description="taskDescription"
    >
      <template #actions>
        <RouterLink :to="`/dialogue-learn/${taskId}?title=${encodeURIComponent(taskTitle)}${pathId ? `&pathId=${encodeURIComponent(pathId)}` : ''}`" custom v-slot="{ navigate }">
          <AButton variant="secondary" icon="forum" @click="navigate">切换对话学习</AButton>
        </RouterLink>
        <AButton v-if="!active" :loading="loading" icon="play_arrow" @click="startSession">开始学习会话</AButton>
        <AButton v-else variant="ghost" :loading="ending" icon="stop_circle" @click="endSession">结束本轮会话</AButton>
      </template>
    </APageHeader>

    <div class="learning-page">
      <APanel eyebrow="学习对话" title="会话记录" :description="active ? '当前会话进行中，系统会持续给出反馈与建议。' : '开始会话后即可与系统围绕当前任务展开自由学习。'" class="learning-page__main">
        <div v-if="messages.length" class="learning-page__feed">
          <article
            v-for="(message, index) in messages"
            :key="index"
            class="learning-page__message"
            :class="message.role === 'user' ? 'learning-page__message--user' : 'learning-page__message--assistant'"
          >
            <span class="learning-page__message-role">{{ message.role === 'user' ? '我的输入' : 'AI 导师' }}</span>
            <div class="learning-page__message-body">{{ message.content }}</div>
          </article>
        </div>
        <AEmpty
          v-else
          icon="forum"
          title="还没有学习消息"
          description="开始学习会话后，你可以针对任务提出问题、描述思路，或请 AI 导师帮你梳理重点。"
        />

        <AField
          v-model="draft"
          label="输入内容"
          placeholder="输入你的问题、思路或阶段性总结，AI 导师会继续引导你学习。"
          hint="按 Ctrl / ⌘ + Enter 可快速发送"
          textarea
          :rows="4"
          :disabled="!active"
          @enter="sendMessage"
        />

        <template #footer>
          <AButton icon="send" :loading="sending" :disabled="!active || !draft.trim()" @click="sendMessage">发送消息</AButton>
        </template>
      </APanel>

      <aside class="learning-page__side">
        <APanel eyebrow="即时洞察" title="状态指标">
          <div class="learning-page__state-list">
            <div v-for="row in stateRows" :key="row.label" class="learning-page__state-item">
              <div class="learning-page__state-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
              <div class="learning-page__state-track"><span :style="{ width: `${Math.max(0, Math.min(100, row.value))}%` }"></span></div>
            </div>
          </div>

          <div v-if="lastResult?.strategies?.length" class="learning-page__strategy-list">
            <h3>推荐策略</h3>
            <ul>
              <li v-for="(item, index) in lastResult.strategies" :key="index">{{ item }}</li>
            </ul>
          </div>
        </APanel>

        <APanel eyebrow="知识点" title="掌握情况">
          <div v-if="knowledgePoints.length" class="learning-page__knowledge-list">
            <article v-for="point in knowledgePoints" :key="point.name" class="learning-page__knowledge-item">
              <div class="learning-page__knowledge-head">
                <h3>{{ point.name }}</h3>
                <AChip :tone="point.status === 'mastered' ? 'success' : point.status === 'learning' ? 'primary' : 'soft'">
                  {{ point.status === 'mastered' ? '已掌握' : point.status === 'learning' ? '学习中' : point.status === 'review' ? '需复习' : '待判断' }}
                </AChip>
              </div>
              <div class="learning-page__state-track"><span :style="{ width: `${point.progress}%` }"></span></div>
            </article>
          </div>
          <AEmpty v-else compact icon="school" title="暂无知识点记录" description="会话推进后，系统会自动提炼知识点并评估掌握程度。" />
        </APanel>

        <APanel eyebrow="最新总结" title="学习结论">
          <div v-if="summary || latestEvaluation?.summary" class="learning-page__summary">
            <h3>{{ (summary || latestEvaluation?.summary)?.topicSummary || '系统已生成阶段总结' }}</h3>
            <p>{{ (summary || latestEvaluation?.summary)?.learningEvaluation || (summary || latestEvaluation?.summary)?.knowledgeSummary }}</p>
            <ul v-if="(summary || latestEvaluation?.summary)?.actionPlan?.length">
              <li v-for="(item, index) in (summary || latestEvaluation?.summary)?.actionPlan" :key="index">{{ item }}</li>
            </ul>
          </div>
          <AEmpty v-else compact icon="summarize" title="暂时还没有总结" description="结束会话后，系统会自动生成本轮学习总结和行动建议。" />
        </APanel>
      </aside>
    </div>
  </AppShell>
</template>

<style scoped>
.learning-page {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
  gap: var(--space-5);
}
.learning-page__main { min-height: 680px; }
.learning-page__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: 460px;
  overflow-y: auto;
  padding-left: var(--space-4);
  border-left: 1px solid rgba(172, 179, 183, 0.28);
}
.learning-page__message { display: flex; flex-direction: column; gap: 6px; }
.learning-page__message-role {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  font-weight: 700;
}
.learning-page__message-body {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  line-height: 1.7;
  white-space: pre-wrap;
}
.learning-page__message--assistant .learning-page__message-body { background: var(--color-surface-alt); }
.learning-page__message--user .learning-page__message-role { color: var(--color-primary); }
.learning-page__message--user .learning-page__message-body {
  background: var(--color-surface);
  border-left: 2px solid var(--color-primary);
}
.learning-page__side { display: flex; flex-direction: column; gap: var(--space-4); }
.learning-page__state-list { display: flex; flex-direction: column; gap: var(--space-3); }
.learning-page__state-item { display: flex; flex-direction: column; gap: 6px; }
.learning-page__state-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.82rem;
  color: var(--color-ink-dim);
}
.learning-page__state-head strong { color: var(--color-primary); font-family: var(--font-headline); }
.learning-page__state-track {
  height: 4px;
  border-radius: 999px;
  background: var(--color-surface-highest);
  overflow: hidden;
}
.learning-page__state-track span { display: block; height: 100%; background: var(--color-primary); }
.learning-page__strategy-list { margin-top: var(--space-4); }
.learning-page__strategy-list h3 { margin-bottom: 10px; font-size: 0.96rem; }
.learning-page__strategy-list ul,
.learning-page__summary ul {
  margin: 0;
  padding-left: 18px;
  color: var(--color-ink-dim);
  line-height: 1.7;
}
.learning-page__knowledge-list { display: flex; flex-direction: column; gap: var(--space-3); }
.learning-page__knowledge-item {
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.learning-page__knowledge-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: 10px;
}
.learning-page__knowledge-head h3 { font-size: 0.96rem; }
.learning-page__summary h3 { font-size: 1rem; margin-bottom: 10px; }
.learning-page__summary p { color: var(--color-ink-dim); line-height: 1.7; margin-bottom: 12px; }

@media (max-width: 1080px) {
  .learning-page { grid-template-columns: 1fr; }
}
</style>
