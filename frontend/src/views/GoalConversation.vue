<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppShell from '@/components/aa/AppShell.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AProgressBar from '@/components/aa/AProgressBar.vue';
import AConfirmDialog from '@/components/aa/AConfirmDialog.vue';
import APanel from '@/components/aa/APanel.vue';
import { goalConversationAPI } from '@/api/goalConversation';

interface QuickReply {
  text: string;
}

interface MessageItem {
  role: 'ai' | 'user';
  content: string;
}

const initialAssistantMessage = '告诉我你现在最想解决的学习问题。哪怕只是一个模糊目标，也足够开始。';

const draft = ref('');
const loading = ref(false);
const conversationId = ref('');
const currentStage = ref<'understanding' | 'proposing' | 'ready' | 'completed'>('understanding');
const confidence = ref(0);
const quickReplies = ref<QuickReply[]>([]);
const generatedPathId = ref('');
const messages = ref<MessageItem[]>([{ role: 'ai', content: initialAssistantMessage }]);
const understanding = ref<any>({ background: { constraints: [] } });
const confirmResetOpen = ref(false);
const feedEl = ref<HTMLElement | null>(null);
const composerEl = ref<HTMLTextAreaElement | null>(null);

const suggestionSeeds = [
  '我想在两个月内把比赛项目做得更系统，但不知道先补基础还是先做实战。',
  '我已经学过一些前端，但做复杂产品时总是没有完整方法。',
  '我每天只有 1 小时，希望制定一条能长期坚持的学习路径。'
];

const stageMeta = computed(() => {
  const map = {
    understanding: {
      label: '理解阶段',
      tone: 'primary' as const,
      title: '先把问题说清楚',
      description: '我会先理解你的目标、卡点、时间条件和真实动机，再决定路径应该如何展开。'
    },
    proposing: {
      label: '形成方向',
      tone: 'warn' as const,
      title: '正在整理关键判断',
      description: '当前信息已经足够形成方向，我会继续把模糊目标收束成可以执行的方案。'
    },
    ready: {
      label: '可生成路径',
      tone: 'success' as const,
      title: '已经具备规划条件',
      description: '现在可以生成一条正式学习路径，也可以继续细化目标边界。'
    },
    completed: {
      label: '已生成路径',
      tone: 'success' as const,
      title: '路径已经准备好',
      description: '你已经拥有一条可执行路径，可以直接进入详情页继续推进。'
    }
  };

  return map[currentStage.value] || map.understanding;
});

const confidencePercent = computed(() => Math.max(0, Math.min(100, Math.round((confidence.value || 0) * 100))));

const summaryRows = computed(() => {
  const u = understanding.value || {};
  return [
    { label: '表层目标', value: u.surface_goal || '', width: u.surface_goal ? 84 : 12 },
    { label: '真实问题', value: u.real_problem || '', width: u.real_problem ? 90 : 12 },
    { label: '学习动机', value: u.motivation || '', width: u.motivation ? 72 : 10 },
    { label: '当前水平', value: u.background?.current_level || '', width: u.background?.current_level ? 58 : 10 }
  ];
});

const sidebar = computed(() => {
  const u = understanding.value || {};
  const constraints = Array.isArray(u.background?.constraints) ? u.background.constraints.filter(Boolean) : [];
  return [
    { label: '表层目标', value: u.surface_goal || '等待识别' },
    { label: '真实问题', value: u.real_problem || '等待识别' },
    { label: '学习动机', value: u.motivation || '等待识别' },
    { label: '当前水平', value: u.background?.current_level || '等待识别' },
    { label: '预期时间', value: u.background?.expected_time || '等待识别' },
    { label: '现实约束', value: constraints.length ? constraints.join('、') : '尚未识别' }
  ];
});

const journeyStats = computed(() => ({
  totalMessages: messages.value.length,
  userMessages: messages.value.filter((item) => item.role === 'user').length,
  quickReplies: quickReplies.value.length
}));

const scrollToBottom = async (behavior: ScrollBehavior = 'smooth') => {
  await nextTick();
  if (feedEl.value) {
    feedEl.value.scrollTo({ top: feedEl.value.scrollHeight, behavior });
  }
};

const resizeComposer = async () => {
  await nextTick();
  if (!composerEl.value) return;
  composerEl.value.style.height = '0px';
  composerEl.value.style.height = `${Math.min(composerEl.value.scrollHeight, 220)}px`;
};

watch(
  messages,
  async () => {
    await scrollToBottom();
  },
  { deep: true }
);

watch(draft, async () => {
  await resizeComposer();
});

onMounted(async () => {
  await resizeComposer();
});

const consumeResponse = (response: any) => {
  const internal = response?.internal || response?.data || {};
  const visible = response?.userVisible || internal.message || '我已经记录下这条信息，并会据此继续细化你的目标。';

  conversationId.value = internal.conversationId || internal.sessionId || conversationId.value;
  currentStage.value = (internal.stage || currentStage.value) as typeof currentStage.value;
  confidence.value = internal.confidence ?? confidence.value;
  quickReplies.value = Array.isArray(internal.quickReplies) ? internal.quickReplies : [];

  if (internal.understanding) {
    understanding.value = {
      ...understanding.value,
      ...internal.understanding,
      background: {
        ...(understanding.value.background || {}),
        ...(internal.understanding?.background || {})
      }
    };
  }

  if (internal.learningPath?.id) {
    generatedPathId.value = internal.learningPath.id;
  }

  messages.value.push({ role: 'ai', content: visible });
};

const submit = async () => {
  if (!draft.value.trim() || loading.value) return;

  const content = draft.value.trim();
  draft.value = '';
  messages.value.push({ role: 'user', content });
  loading.value = true;

  try {
    const response = conversationId.value
      ? await goalConversationAPI.reply(conversationId.value, content)
      : await goalConversationAPI.start(content);

    consumeResponse(response);
  } catch (error: any) {
    ElMessage.error(error?.message || '发送失败，请稍后再试。');
  } finally {
    loading.value = false;
    await resizeComposer();
  }
};

const send = async (text: string) => {
  draft.value = text;
  await submit();
};

const quickStart = async () => {
  if (loading.value) return;

  const goal = draft.value.trim() || understanding.value.surface_goal || suggestionSeeds[0];
  loading.value = true;
  messages.value.push({ role: 'user', content: `快速生成：${goal}` });

  try {
    const response = await goalConversationAPI.quickGenerate({
      goal,
      level: 'beginner',
      timePerDay: '2 小时',
      learningStyle: 'mixed'
    });

    consumeResponse(response);
    ElMessage.success('已生成一版学习路径建议。');
  } catch (error: any) {
    ElMessage.error(error?.message || '快速生成失败，请稍后再试。');
  } finally {
    loading.value = false;
  }
};

const regeneratePath = async () => {
  if (!conversationId.value || loading.value) return;

  loading.value = true;
  try {
    const response = await goalConversationAPI.regenerate(conversationId.value);
    consumeResponse(response);
    ElMessage.success('已根据当前上下文重新生成路径。');
  } catch (error: any) {
    ElMessage.error(error?.message || '重新生成失败。');
  } finally {
    loading.value = false;
  }
};

const doReset = async () => {
  if (conversationId.value) {
    try {
      await goalConversationAPI.reset(conversationId.value);
    } catch {
      // ignore
    }
  }

  draft.value = '';
  conversationId.value = '';
  currentStage.value = 'understanding';
  confidence.value = 0;
  quickReplies.value = [];
  generatedPathId.value = '';
  understanding.value = { background: { constraints: [] } };
  messages.value = [{ role: 'ai', content: initialAssistantMessage }];

  ElMessage.success('已重置当前目标对话。');
  void resizeComposer();
};

const handleComposerKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    void submit();
  }
};
</script>

<template>
  <AppShell noRail fullWidth>
    <section class="goal-studio">
      <div class="goal-studio__main">
        <div class="goal-studio__backdock">
          <RouterLink to="/dashboard" custom v-slot="{ navigate }">
            <button type="button" class="goal-studio__back-button" aria-label="返回学习总览" @click="navigate">
              <span class="material-symbols-outlined">west</span>
            </button>
          </RouterLink>
        </div>

        <div class="goal-studio__chat-shell">
          <div ref="feedEl" class="goal-studio__feed" aria-live="polite">
            <section class="goal-studio__welcome">
              <div class="goal-studio__welcome-card">
                <div class="goal-studio__welcome-head">
                  <div class="goal-studio__welcome-copy">
                    <AChip :tone="stageMeta.tone" icon="target">{{ stageMeta.label }}</AChip>
                    <p class="aa-eyebrow">沉浸式目标澄清</p>
                  </div>
                  <div class="goal-studio__welcome-actions">
                    <AButton variant="secondary" icon="bolt" :loading="loading" @click="quickStart">快速生成路径</AButton>
                    <RouterLink v-if="generatedPathId" :to="`/learning-path/${generatedPathId}`" custom v-slot="{ navigate }">
                      <AButton icon-right="arrow_forward" @click="navigate">进入路径详情</AButton>
                    </RouterLink>
                  </div>
                </div>
                <h2>像真正的对话一样，把一个模糊念头慢慢说清楚。</h2>
                <p>
                  你可以直接描述问题、限制、动机和期望结果。我会先理解，再帮助你形成结构化路径，而不是马上给出空泛建议。
                </p>
              </div>

              <div class="goal-studio__seed-list">
                <button
                  v-for="seed in suggestionSeeds"
                  :key="seed"
                  type="button"
                  class="goal-studio__seed"
                  @click="send(seed)"
                >
                  <span class="material-symbols-outlined">arrow_outward</span>
                  <span>{{ seed }}</span>
                </button>
              </div>
            </section>

            <article
              v-for="(message, index) in messages"
              :key="`${message.role}-${index}`"
              class="goal-studio__bubble"
              :class="message.role === 'user' ? 'goal-studio__bubble--user' : 'goal-studio__bubble--ai'"
            >
              <div class="goal-studio__bubble-meta">
                <span class="goal-studio__bubble-avatar">{{ message.role === 'user' ? '你' : 'AI' }}</span>
                <div>
                  <strong>{{ message.role === 'user' ? '你' : '目标规划助手' }}</strong>
                  <small>{{ message.role === 'user' ? '你的输入' : '系统回应与追问' }}</small>
                </div>
              </div>
              <div class="goal-studio__bubble-body">{{ message.content }}</div>
            </article>

            <article v-if="loading" class="goal-studio__bubble goal-studio__bubble--ai">
              <div class="goal-studio__bubble-meta">
                <span class="goal-studio__bubble-avatar">AI</span>
                <div>
                  <strong>目标规划助手</strong>
                  <small>正在整理你的上下文</small>
                </div>
              </div>
              <div class="goal-studio__typing" aria-label="正在输入">
                <span></span><span></span><span></span>
              </div>
            </article>
          </div>

          <footer class="goal-studio__composer-wrap">
            <div v-if="quickReplies.length" class="goal-studio__quick-replies">
              <button
                v-for="reply in quickReplies"
                :key="reply.text"
                type="button"
                class="goal-studio__quick-reply"
                @click="send(reply.text)"
              >
                {{ reply.text }}
              </button>
            </div>

            <div class="goal-studio__composer">
              <textarea
                ref="composerEl"
                v-model="draft"
                class="goal-studio__textarea"
                rows="1"
                name="goal-message"
                aria-label="目标对话输入框"
                placeholder="直接告诉我：你想达成什么、现在卡在哪里、你有哪些时间或能力限制…"
                @keydown="handleComposerKeydown"
              ></textarea>

              <div class="goal-studio__composer-bar">
                <div class="goal-studio__composer-hint">
                  <span class="material-symbols-outlined">lightbulb</span>
                  <span>越具体越好：目标、卡点、时间、动机，都可以直接说。</span>
                </div>

                <div class="goal-studio__composer-actions">
                  <AButton
                    v-if="conversationId"
                    variant="ghost"
                    icon="refresh"
                    :loading="loading"
                    @click="regeneratePath"
                  >重新生成路径</AButton>
                  <AButton icon="send" :loading="loading" :disabled="!draft.trim()" @click="submit">
                    {{ conversationId ? '发送回复' : '开始对话' }}
                  </AButton>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <aside class="goal-studio__rail">
        <APanel eyebrow="离开与控制" title="当前工作区">
          <div class="goal-studio__utility">
            <RouterLink to="/learning-paths" custom v-slot="{ navigate }">
              <AButton variant="ghost" icon="route" @click="navigate">退出到路径列表</AButton>
            </RouterLink>
            <RouterLink to="/dashboard" custom v-slot="{ navigate }">
              <AButton variant="ghost" icon="dashboard" @click="navigate">返回学习总览</AButton>
            </RouterLink>
            <AButton variant="ghost" icon="restart_alt" @click="confirmResetOpen = true">重置对话</AButton>
          </div>
        </APanel>

        <APanel eyebrow="理解进度" title="目标清晰度" description="我会持续把对话内容沉淀成结构化理解，避免建议和上下文脱节。">
          <div class="goal-studio__confidence">
            <div class="goal-studio__confidence-head">
              <strong>{{ confidencePercent }}%</strong>
              <AChip :tone="stageMeta.tone">{{ stageMeta.label }}</AChip>
            </div>
            <AProgressBar :value="confidencePercent" :show-label="true" label="理解完成度" height="sm" />
          </div>

          <div class="goal-studio__progress-list">
            <div v-for="row in summaryRows" :key="row.label" class="goal-studio__progress-row">
              <div class="goal-studio__progress-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.value ? '已识别' : '待补充' }}</strong>
              </div>
              <div class="goal-studio__progress-track">
                <span :style="{ width: `${row.width}%` }"></span>
              </div>
            </div>
          </div>
        </APanel>

        <APanel eyebrow="当前摘要" title="结构化理解">
          <ul class="goal-studio__summary">
            <li v-for="row in sidebar" :key="row.label">
              <span class="goal-studio__summary-label">{{ row.label }}</span>
              <span class="goal-studio__summary-value" :class="{ 'goal-studio__summary-value--muted': row.value.includes('等待') || row.value.includes('尚未') }">
                {{ row.value }}
              </span>
            </li>
          </ul>
        </APanel>

        <APanel eyebrow="会话态势" title="当前对话状态">
          <div class="goal-studio__stats">
            <article>
              <span>消息总数</span>
              <strong>{{ journeyStats.totalMessages }}</strong>
            </article>
            <article>
              <span>你的输入</span>
              <strong>{{ journeyStats.userMessages }}</strong>
            </article>
            <article>
              <span>推荐追问</span>
              <strong>{{ journeyStats.quickReplies }}</strong>
            </article>
          </div>
        </APanel>

        <APanel v-if="generatedPathId" eyebrow="已生成路径" title="下一步行动" class="goal-studio__generated-panel">
          <p class="goal-studio__path-note">
            当前理解已经足够支撑一条正式路径。进入详情页后，你可以继续拆阶段、看任务，并开始学习执行。
          </p>
          <template #footer>
            <RouterLink :to="`/learning-path/${generatedPathId}`" custom v-slot="{ navigate }">
              <AButton icon-right="arrow_forward" @click="navigate">进入路径详情</AButton>
            </RouterLink>
          </template>
        </APanel>
      </aside>
    </section>

    <AConfirmDialog
      v-model="confirmResetOpen"
      title="重置当前目标对话？"
      description="重置后，本轮对话上下文会清空，但已经生成的学习路径不会被删除。"
      confirm-text="确认重置"
      tone="danger"
      @confirm="doReset"
    />
  </AppShell>
</template>

<style scoped>
.goal-studio {
  min-height: calc(100vh - var(--topnav-h));
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 0;
  background:
    radial-gradient(circle at top left, rgba(129, 174, 253, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(245, 247, 249, 0.96) 100%);
}

.goal-studio__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 0 0;
}

.goal-studio__backdock {
  width: min(920px, calc(100% - 48px));
  margin: 0 auto 12px;
}

.goal-studio__back-button {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-ink);
  box-shadow: 0 18px 38px rgba(44, 52, 55, 0.08);
  border: 1px solid rgba(172, 179, 183, 0.16);
  transition:
    transform var(--duration-fast) var(--easing),
    background var(--duration-base) var(--easing),
    color var(--duration-base) var(--easing);
}

.goal-studio__back-button:hover {
  transform: translateY(-1px);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.goal-studio__back-button .material-symbols-outlined {
  font-size: 20px !important;
}

.goal-studio__chat-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.goal-studio__feed {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 24px 188px;
  scroll-padding-bottom: 180px;
}

.goal-studio__feed > * {
  width: min(920px, 100%);
  margin-inline: auto;
}

.goal-studio__welcome {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 18px;
}

.goal-studio__welcome-card {
  padding: 26px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 50px rgba(44, 94, 167, 0.08);
  border: 1px solid rgba(172, 179, 183, 0.18);
}

.goal-studio__welcome-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 10px;
}

.goal-studio__welcome-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.goal-studio__welcome-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.goal-studio__welcome-card h2 {
  margin: 8px 0 12px;
  font-size: clamp(1.45rem, 2vw, 1.9rem);
}

.goal-studio__welcome-card p {
  color: var(--color-ink-dim);
  line-height: 1.72;
}

.goal-studio__seed-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.goal-studio__seed {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  padding: 16px 18px;
  border: 1px solid rgba(172, 179, 183, 0.18);
  background: rgba(255, 255, 255, 0.76);
  border-radius: 18px;
  color: var(--color-ink);
  transition:
    transform var(--duration-fast) var(--easing),
    border-color var(--duration-base) var(--easing),
    background var(--duration-base) var(--easing),
    box-shadow var(--duration-base) var(--easing);
}

.goal-studio__seed:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(44, 94, 167, 0.26);
  box-shadow: 0 16px 28px rgba(44, 94, 167, 0.08);
}

.goal-studio__seed .material-symbols-outlined {
  font-size: 18px !important;
  color: var(--color-primary);
}

.goal-studio__bubble {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.goal-studio__bubble--user {
  align-items: flex-end;
}

.goal-studio__bubble-meta {
  width: min(100%, 760px);
  display: flex;
  align-items: center;
  gap: 12px;
}

.goal-studio__bubble--user .goal-studio__bubble-meta {
  justify-content: flex-end;
}

.goal-studio__bubble-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-surface-high);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-ink);
  flex: 0 0 auto;
}

.goal-studio__bubble--user .goal-studio__bubble-avatar {
  background: var(--color-primary);
  color: var(--color-primary-on);
}

.goal-studio__bubble-meta strong {
  display: block;
  font-size: 0.92rem;
}

.goal-studio__bubble-meta small {
  color: var(--color-ink-soft);
  font-size: 0.76rem;
}

.goal-studio__bubble-body,
.goal-studio__typing {
  width: min(100%, 760px);
  padding: 18px 20px;
  border-radius: 24px;
  line-height: 1.78;
  font-size: 0.98rem;
  white-space: pre-wrap;
  box-shadow: 0 16px 32px rgba(44, 52, 55, 0.05);
}

.goal-studio__bubble--ai .goal-studio__bubble-body,
.goal-studio__typing {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(172, 179, 183, 0.18);
}

.goal-studio__bubble--user .goal-studio__bubble-body {
  background: linear-gradient(135deg, rgba(44, 94, 167, 0.98) 0%, rgba(27, 82, 155, 0.96) 100%);
  color: #fff;
}

.goal-studio__typing {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.goal-studio__typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: goal-typing 1.1s ease-in-out infinite;
}

.goal-studio__typing span:nth-child(2) { animation-delay: 0.16s; }
.goal-studio__typing span:nth-child(3) { animation-delay: 0.32s; }

@keyframes goal-typing {
  0%, 80%, 100% {
    opacity: 0.24;
    transform: translateY(0) scale(0.9);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px) scale(1);
  }
}

.goal-studio__composer-wrap {
  position: sticky;
  bottom: 0;
  z-index: 8;
  padding: 0 24px 24px;
  background: linear-gradient(180deg, rgba(245, 247, 249, 0) 0%, rgba(245, 247, 249, 0.92) 20%, rgba(245, 247, 249, 1) 100%);
  backdrop-filter: blur(12px);
}

.goal-studio__composer-wrap > * {
  width: min(920px, 100%);
  margin-inline: auto;
}

.goal-studio__quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.goal-studio__quick-reply {
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: var(--color-ink);
  padding: 10px 14px;
  font-size: 0.84rem;
  line-height: 1.4;
  box-shadow: 0 10px 20px rgba(44, 52, 55, 0.05);
  border: 1px solid rgba(172, 179, 183, 0.18);
  transition:
    transform var(--duration-fast) var(--easing),
    border-color var(--duration-base) var(--easing),
    background var(--duration-base) var(--easing);
}

.goal-studio__quick-reply:hover {
  transform: translateY(-1px);
  border-color: rgba(44, 94, 167, 0.3);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.goal-studio__composer {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(172, 179, 183, 0.18);
  box-shadow: 0 28px 44px rgba(44, 52, 55, 0.08);
}

.goal-studio__composer:focus-within {
  border-color: rgba(44, 94, 167, 0.26);
  box-shadow: 0 30px 48px rgba(44, 94, 167, 0.12);
}

.goal-studio__textarea {
  width: 100%;
  min-height: 64px;
  max-height: 220px;
  resize: none;
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  font-size: 1rem;
  line-height: 1.72;
  color: var(--color-ink);
}

.goal-studio__textarea::placeholder {
  color: var(--color-ink-soft);
}

.goal-studio__composer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(172, 179, 183, 0.18);
}

.goal-studio__composer-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-ink-soft);
  font-size: 0.8rem;
}

.goal-studio__composer-hint .material-symbols-outlined {
  font-size: 16px !important;
  color: var(--color-primary);
}

.goal-studio__composer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.goal-studio__rail {
  border-left: 1px solid rgba(172, 179, 183, 0.18);
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(16px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-studio__utility {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-studio__confidence {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goal-studio__confidence-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.goal-studio__confidence-head strong {
  font-family: var(--font-headline);
  font-size: 2rem;
  color: var(--color-primary);
}

.goal-studio__progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-studio__progress-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.goal-studio__progress-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 0.8rem;
}

.goal-studio__progress-head strong {
  color: var(--color-primary);
  font-weight: 700;
}

.goal-studio__progress-track {
  height: 6px;
  border-radius: 999px;
  background: var(--color-surface-highest);
  overflow: hidden;
}

.goal-studio__progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
}

.goal-studio__summary {
  display: flex;
  flex-direction: column;
  gap: 14px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.goal-studio__summary li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goal-studio__summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.goal-studio__summary-value {
  line-height: 1.65;
  color: var(--color-ink);
}

.goal-studio__summary-value--muted {
  color: var(--color-ink-soft);
  font-style: italic;
}

.goal-studio__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.goal-studio__stats article {
  padding: 14px 12px;
  border-radius: 16px;
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goal-studio__stats span {
  font-size: 0.76rem;
  color: var(--color-ink-soft);
}

.goal-studio__stats strong {
  font-family: var(--font-headline);
  font-size: 1.2rem;
}

.goal-studio__generated-panel {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dim) 100%);
  color: var(--color-primary-on);
}

.goal-studio__generated-panel :deep(.aa-panel__title),
.goal-studio__generated-panel :deep(.aa-eyebrow),
.goal-studio__generated-panel :deep(.aa-panel__desc) {
  color: rgba(255, 255, 255, 0.88);
}

.goal-studio__generated-panel :deep(.aa-panel__foot) {
  border-top-color: rgba(255, 255, 255, 0.18);
}

.goal-studio__path-note {
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.68;
}

@media (max-width: 1280px) {
  .goal-studio {
    grid-template-columns: minmax(0, 1fr) 320px;
  }

  .goal-studio__seed-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1080px) {
  .goal-studio {
    grid-template-columns: 1fr;
  }

  .goal-studio__rail {
    border-left: 0;
    border-top: 1px solid rgba(172, 179, 183, 0.18);
  }
}

@media (max-width: 720px) {
  .goal-studio__main {
    padding-top: 18px;
  }

  .goal-studio__backdock,
  .goal-studio__feed,
  .goal-studio__composer-wrap,
  .goal-studio__rail {
    padding-left: 16px;
    padding-right: 16px;
  }

  .goal-studio__welcome-head,
  .goal-studio__composer-bar {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .goal-studio__composer-actions {
    width: 100%;
    justify-content: stretch;
    flex-direction: column;
  }

  .goal-studio__composer-actions :deep(.aa-btn) {
    width: 100%;
  }

  .goal-studio__welcome-actions :deep(.aa-btn) {
    width: 100%;
  }

  .goal-studio__bubble-body,
  .goal-studio__typing,
  .goal-studio__bubble-meta {
    width: 100%;
  }

  .goal-studio__stats {
    grid-template-columns: 1fr;
  }
}
</style>
