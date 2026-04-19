<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import { getDeveloperOverview, getDeveloperQuickstart } from '@/api/userCustom';

const overview = ref<any>(null);
const quickstart = ref<any>(null);

const sections = [
  {
    id: 'overview',
    title: '系统概览',
    body: '知途（KnowPath）由目标对话、学习路径、对话学习、开放学习、状态分析与后台控制台组成，是一套面向长期学习的产品化前端。'
  },
  {
    id: 'flow',
    title: '核心流程',
    body: '产品围绕“明确目标 → 生成路径 → 执行任务 → 跟踪状态 → 复盘优化”的闭环展开，所有页面都服务于这个核心学习链路。'
  },
  {
    id: 'api',
    title: '关键接口',
    body: '前端通过学习路径、对话学习、AI Teaching、状态监控与用户自定义配置等接口协作，形成完整可扩展的数据流。'
  },
  {
    id: 'principles',
    title: '设计原则',
    body: '当前界面遵循 Academic Architect 设计系统，强调清晰层级、稳定反馈、统一密度与可持续迭代。'
  }
];

onMounted(async () => {
  try {
    const [overviewResult, quickstartResult] = await Promise.all([
      getDeveloperOverview(),
      getDeveloperQuickstart()
    ]);
    overview.value = overviewResult;
    quickstart.value = quickstartResult;
  } catch {
    overview.value = null;
    quickstart.value = null;
  }
});
</script>

<template>
  <AppShell noRail>
    <div class="docs-page">
      <aside class="docs-page__nav">
        <div class="docs-page__nav-inner">
          <p class="aa-meta">文档导航</p>
          <h2>开发文档</h2>
          <nav>
            <a v-for="item in sections" :key="item.id" :href="`#${item.id}`">{{ item.title }}</a>
          </nav>
        </div>
      </aside>

      <main class="docs-page__main">
        <header class="docs-page__hero">
          <div>
            <p class="aa-eyebrow">文档中心</p>
            <h1>知途（KnowPath）开发文档</h1>
            <p>
              这里汇总产品结构、核心流程、接口入口与平台设计原则，便于后续继续接入真实业务接口、扩展页面与重构交互。
            </p>
          </div>
          <div class="docs-page__hero-actions">
            <RouterLink to="/dashboard" custom v-slot="{ navigate }">
              <AButton icon-right="arrow_forward" @click="navigate">返回学习总览</AButton>
            </RouterLink>
            <AChip tone="primary">产品级重构版</AChip>
          </div>
        </header>

        <section id="overview" class="docs-page__section docs-page__section--intro">
          <div class="docs-page__intro-card">
            <span class="material-symbols-outlined">schema</span>
            <div>
              <h3>当前信息架构</h3>
              <p>用户侧、学习侧、个人配置侧与后台管理侧已经完成统一重构，结构可继续扩展。</p>
            </div>
          </div>
          <div class="docs-page__code-block">
            <span>主链路</span>
            <code>/goal-conversation → /learning-paths → /dialogue-learn/:taskId → /learning-state</code>
          </div>
        </section>

        <section v-for="item in sections" :id="item.id" :key="item.id" class="docs-page__section">
          <div class="docs-page__section-head">
            <span class="aa-divider--accent"></span>
            <h2>{{ item.title }}</h2>
          </div>
          <p>{{ item.body }}</p>

          <div v-if="item.id === 'flow'" class="docs-page__flow-grid">
            <article>
              <strong>01 / 目标定义</strong>
              <p>通过目标对话明确学习主题、范围、节奏与阶段目标。</p>
            </article>
            <article>
              <strong>02 / 路径生成</strong>
              <p>把抽象目标转成可执行的阶段、任务与推进顺序。</p>
            </article>
            <article>
              <strong>03 / 任务执行</strong>
              <p>在对话学习与开放学习之间切换，完成理解、验证与巩固。</p>
            </article>
            <article>
              <strong>04 / 状态复盘</strong>
              <p>结合学习状态、成就与日志，持续优化学习策略。</p>
            </article>
          </div>

          <div v-if="item.id === 'api'" class="docs-page__api-grid">
            <article>
              <span>学习路径</span>
              <code>GET /learning/paths</code>
            </article>
            <article>
              <span>对话学习</span>
              <code>POST /learning/dialogue/start</code>
            </article>
            <article>
              <span>AI 教学</span>
              <code>POST /ai-teaching/sessions</code>
            </article>
            <article>
              <span>学习状态</span>
              <code>GET /state/current</code>
            </article>
          </div>
        </section>

        <section class="docs-page__section">
          <div class="docs-page__section-head">
            <span class="aa-divider--accent"></span>
            <h2>动态数据</h2>
          </div>
          <div class="docs-page__dynamic-grid">
            <article>
              <strong>平台概览数据</strong>
              <pre>{{ overview ? JSON.stringify(overview, null, 2) : '当前未获取到概览数据。' }}</pre>
            </article>
            <article>
              <strong>快速开始数据</strong>
              <pre>{{ quickstart ? JSON.stringify(quickstart, null, 2) : '当前未获取到快速开始配置。' }}</pre>
            </article>
          </div>
        </section>
      </main>

      <aside class="docs-page__toc">
        <div class="docs-page__toc-inner">
          <p class="aa-meta">本页目录</p>
          <a v-for="item in sections" :key="item.id" :href="`#${item.id}`">{{ item.title }}</a>
        </div>
      </aside>
    </div>
  </AppShell>
</template>

<style scoped>
.docs-page {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 220px;
  gap: var(--space-6);
  padding-top: calc(var(--topnav-h) + var(--space-8));
  min-height: 100vh;
}
.docs-page__nav,
.docs-page__toc {
  position: sticky;
  top: calc(var(--topnav-h) + var(--space-6));
  align-self: start;
}
.docs-page__nav-inner,
.docs-page__toc-inner {
  padding: var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.docs-page__nav-inner h2 { font-size: 1.1rem; }
.docs-page__nav a,
.docs-page__toc a {
  color: var(--color-ink-dim);
  line-height: 1.5;
}
.docs-page__nav a:hover,
.docs-page__toc a:hover { color: var(--color-primary); }
.docs-page__main { display: flex; flex-direction: column; gap: var(--space-8); padding-bottom: var(--space-12); }
.docs-page__hero {
  display: flex;
  justify-content: space-between;
  gap: var(--space-6);
  align-items: flex-start;
  padding-bottom: var(--space-6);
  border-bottom: 1px solid rgba(172, 179, 183, 0.2);
}
.docs-page__hero h1 {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  margin: 10px 0 14px;
}
.docs-page__hero p { max-width: 56rem; color: var(--color-ink-dim); line-height: 1.75; font-size: 1rem; }
.docs-page__hero-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.docs-page__section { display: flex; flex-direction: column; gap: var(--space-4); }
.docs-page__section-head { display: flex; flex-direction: column; gap: 10px; }
.docs-page__section h2 { font-size: 1.8rem; }
.docs-page__section p { color: var(--color-ink-dim); line-height: 1.75; }
.docs-page__intro-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.docs-page__intro-card .material-symbols-outlined { color: var(--color-primary); font-size: 28px !important; }
.docs-page__code-block {
  padding: var(--space-5);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.docs-page__code-block span {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 700;
  color: var(--color-ink-soft);
}
.docs-page__code-block code,
.docs-page__api-grid code,
.docs-page__dynamic-grid pre {
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.docs-page__flow-grid,
.docs-page__api-grid,
.docs-page__dynamic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.docs-page__flow-grid article,
.docs-page__api-grid article,
.docs-page__dynamic-grid article {
  padding: var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.docs-page__flow-grid strong,
.docs-page__api-grid span,
.docs-page__dynamic-grid strong {
  display: block;
  margin-bottom: 8px;
  font-size: 0.92rem;
  color: var(--color-ink);
}
.docs-page__api-grid code { color: var(--color-primary); }
.docs-page__dynamic-grid pre {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-ink-dim);
  margin: 0;
}

@media (max-width: 1180px) {
  .docs-page { grid-template-columns: 1fr; }
  .docs-page__nav,
  .docs-page__toc { display: none; }
}
@media (max-width: 900px) {
  .docs-page__hero,
  .docs-page__flow-grid,
  .docs-page__api-grid,
  .docs-page__dynamic-grid { grid-template-columns: 1fr; display: grid; }
}
</style>

