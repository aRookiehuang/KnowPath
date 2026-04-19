<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import aiTeachingAPI from '@/api/aiTeaching';

const subject = ref('计算机基础');
const topic = ref('请围绕当前主题完成一轮课堂问答测试');
const difficulty = ref('5');
const sessionId = ref('');
const loading = ref(false);
const draft = ref('');
const summary = ref<any>(null);
const lastAnalysis = ref<any>(null);
const messages = ref<Array<{ role: 'assistant' | 'user'; content: string }>>([]);

const active = computed(() => !!sessionId.value);

const start = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const result = await aiTeachingAPI.startSession(subject.value.trim() || '课堂测试', topic.value.trim() || '课堂测试', Number(difficulty.value) || 5);
    sessionId.value = result.sessionId;
    messages.value = [{ role: 'assistant', content: result.welcomeMessage || '测试已开始，请根据提问逐步作答。' }];
    summary.value = null;
  } catch (err: any) {
    ElMessage.error(err?.message || '启动测试失败。');
  } finally {
    loading.value = false;
  }
};

const send = async () => {
  if (!sessionId.value || !draft.value.trim() || loading.value) return;
  const content = draft.value.trim();
  draft.value = '';
  messages.value.push({ role: 'user', content });
  loading.value = true;
  try {
    const result = await aiTeachingAPI.sendMessage(sessionId.value, content);
    lastAnalysis.value = result;
    messages.value.push({ role: 'assistant', content: result.aiResponse || '系统已收到你的回答。' });
  } catch (err: any) {
    ElMessage.error(err?.message || '发送回答失败。');
  } finally {
    loading.value = false;
  }
};

const finish = async () => {
  if (!sessionId.value || loading.value) return;
  loading.value = true;
  try {
    const result = await aiTeachingAPI.endSession(sessionId.value);
    summary.value = result.summary || null;
    sessionId.value = '';
    ElMessage.success('测试已结束。');
  } catch (err: any) {
    ElMessage.error(err?.message || '结束测试失败。');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="课堂实验室"
      title="课堂测试"
      description="使用 AI Teaching 引擎模拟一次课堂问答测试，观察理解、投入与反馈策略。"
    >
      <template #actions>
        <AButton variant="secondary" icon="science" :loading="loading" @click="start">开始测试</AButton>
        <AButton v-if="active" variant="ghost" icon="stop_circle" :loading="loading" @click="finish">结束测试</AButton>
      </template>
    </APageHeader>

    <div class="class-test-page">
      <APanel eyebrow="测试设置" title="测试参数" description="配置学科、主题与难度后，即可发起一轮课堂问答。">
        <div class="class-test-page__form">
          <AField v-model="subject" label="学科" placeholder="例如：计算机网络 / 数学 / 英语" />
          <AField v-model="topic" label="测试主题" placeholder="请输入你希望本轮测试围绕的内容" />
          <AField v-model="difficulty" label="难度（1-10）" type="number" placeholder="5" />
        </div>
      </APanel>

      <section class="class-test-page__grid">
        <APanel eyebrow="测试对话" title="问答记录" class="class-test-page__main">
          <div v-if="messages.length" class="class-test-page__feed">
            <article v-for="(message, index) in messages" :key="index" class="class-test-page__message" :class="message.role === 'user' ? 'class-test-page__message--user' : 'class-test-page__message--assistant'">
              <span class="class-test-page__message-role">{{ message.role === 'user' ? '我的回答' : '测试系统' }}</span>
              <div class="class-test-page__message-body">{{ message.content }}</div>
            </article>
          </div>
          <div v-else class="class-test-page__placeholder">点击“开始测试”后，这里会显示完整的课堂问答记录。</div>

          <AField
            v-model="draft"
            label="回答内容"
            placeholder="输入你的答案或补充说明"
            textarea
            :rows="4"
            :disabled="!active"
            @enter="send"
          />

          <template #footer>
            <AButton icon="send" :disabled="!active || !draft.trim()" :loading="loading" @click="send">发送回答</AButton>
          </template>
        </APanel>

        <aside class="class-test-page__side">
          <APanel eyebrow="实时反馈" title="分析结果">
            <div v-if="lastAnalysis" class="class-test-page__analysis">
              <div class="class-test-page__analysis-grid">
                <div>
                  <span>理解程度</span>
                  <strong>{{ lastAnalysis.analysis?.understanding || '待评估' }}</strong>
                </div>
                <div>
                  <span>投入程度</span>
                  <strong>{{ lastAnalysis.analysis?.engagement || '待评估' }}</strong>
                </div>
              </div>
              <div v-if="lastAnalysis.strategies?.length" class="class-test-page__strategy-box">
                <h3>推荐策略</h3>
                <ul>
                  <li v-for="(item, index) in lastAnalysis.strategies" :key="index">{{ item }}</li>
                </ul>
              </div>
            </div>
            <div v-else class="class-test-page__placeholder">在测试进行中，系统会持续给出实时反馈。</div>
          </APanel>

          <APanel eyebrow="阶段总结" title="测试总结">
            <div v-if="summary" class="class-test-page__summary">
              <h3>{{ summary.topicSummary || '系统已生成测试总结' }}</h3>
              <p>{{ summary.learningEvaluation || summary.knowledgeSummary }}</p>
              <AChip tone="primary">{{ summary.summaryVersion || '最新版本' }}</AChip>
            </div>
            <div v-else class="class-test-page__placeholder">结束测试后，这里会展示本轮课堂总结。</div>
          </APanel>
        </aside>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.class-test-page { display: flex; flex-direction: column; gap: var(--space-5); }
.class-test-page__form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}
.class-test-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.class-test-page__main { min-height: 600px; }
.class-test-page__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: 420px;
  overflow-y: auto;
  padding-left: var(--space-4);
  border-left: 1px solid rgba(172, 179, 183, 0.28);
}
.class-test-page__message { display: flex; flex-direction: column; gap: 6px; }
.class-test-page__message-role {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-ink-soft);
  font-weight: 700;
}
.class-test-page__message-body {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  line-height: 1.7;
  white-space: pre-wrap;
}
.class-test-page__message--assistant .class-test-page__message-body { background: var(--color-surface-alt); }
.class-test-page__message--user .class-test-page__message-role { color: var(--color-primary); }
.class-test-page__message--user .class-test-page__message-body {
  background: var(--color-surface);
  border-left: 2px solid var(--color-primary);
}
.class-test-page__side { display: flex; flex-direction: column; gap: var(--space-4); }
.class-test-page__analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}
.class-test-page__analysis-grid div,
.class-test-page__summary {
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.class-test-page__analysis-grid span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}
.class-test-page__analysis-grid strong { display: block; margin-top: 8px; font-size: 1rem; }
.class-test-page__strategy-box { margin-top: var(--space-4); }
.class-test-page__strategy-box ul { margin: 8px 0 0; padding-left: 18px; color: var(--color-ink-dim); line-height: 1.7; }
.class-test-page__summary h3 { font-size: 1rem; margin-bottom: 10px; }
.class-test-page__summary p { color: var(--color-ink-dim); line-height: 1.65; margin-bottom: 12px; }
.class-test-page__placeholder { color: var(--color-ink-dim); line-height: 1.7; }

@media (max-width: 1080px) {
  .class-test-page__grid,
  .class-test-page__form { grid-template-columns: 1fr; }
}
</style>
