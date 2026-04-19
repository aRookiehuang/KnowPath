<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user';
import AButton from '@/components/aa/AButton.vue';

const router = useRouter();
const userStore = useUserStore();

const primaryCta = computed(() => userStore.isLoggedIn
  ? { label: '进入学习工作台', to: '/dashboard' }
  : { label: '立即开启学习之旅', to: '/register' });

const features = [
  {
    span: 7,
    tone: 'alt' as const,
    eyebrow: 'Rational Analysis',
    icon: 'biotech',
    title: '目标澄清 · 把"我想学"变成可执行',
    desc: 'AI 研究员用苏格拉底式追问，帮你把"我想学 AI"拆成"构建一个基于 Transformer 的语义分析器"这样具体可落地的目标。',
    to: '/goal-conversation'
  },
  {
    span: 5,
    tone: 'inverse' as const,
    eyebrow: 'Dynamic Pathway',
    icon: 'account_tree',
    title: '动态路径 · 让知识结构随你生长',
    desc: '实时生成的知识图谱，根据你的掌握程度动态调整权重，跳过冗余、直击核心。',
    to: '/learning-paths'
  }
];

const statusMetrics = [
  { label: '学习压力 LSS', value: '85.4' },
  { label: '知识掌握 KTL', value: '1.2k' },
  { label: '认知平衡 LSB', value: '0.92' },
  { label: '预测成功率', value: '94%' }
];

const goTo = (to: string) => router.push(to);
</script>

<template>
  <div class="landing">
    <nav class="landing__nav">
      <div class="landing__brand">
        <span class="landing__logo-mark">问</span>
        <span>知途 · KnowPath</span>
      </div>
      <div class="landing__nav-links">
        <a href="#features">核心能力</a>
        <a href="#methodology">方法论</a>
      </div>
      <div class="landing__nav-actions">
        <RouterLink to="/login" class="landing__nav-login">登录</RouterLink>
        <AButton size="sm" icon-right="arrow_forward" @click="goTo(primaryCta.to)">{{ primaryCta.label }}</AButton>
      </div>
    </nav>

    <header class="landing__hero">
      <div class="landing__grid-bg"></div>
      <div class="landing__hero-inner">
        <div class="landing__tag">
          <span class="landing__tag-dot"></span>2026 年 · 面向 AI 时代的学习宣言
        </div>
        <h1 class="landing__title">
          让 AI 成为你的<br />
          <span class="landing__accent">长期成长伙伴</span>
        </h1>
        <p class="landing__lead">
          知途并不只是一个学习工具。它是一个构建在理性主义与学术逻辑之上的“思维工作台”——通过精确的目标澄清与动态路径规划，重塑你的知识边界与思考方式。
        </p>
        <div class="landing__actions">
          <AButton size="lg" icon-right="arrow_forward" @click="goTo(primaryCta.to)">{{ primaryCta.label }}</AButton>
        </div>
      </div>
      <div class="landing__hero-decor"></div>
    </header>

    <section id="features" class="landing__features">
      <div class="landing__container">
        <div class="landing__features-head">
          <h2>重新定义学习效率</h2>
          <span class="aa-divider--accent"></span>
          <p>我们摒弃了传统的课程堆砌，采用"实验室级"的模块化设计，把学习过程拆解为三个核心维度。</p>
        </div>

        <div class="landing__features-grid">
          <article
            v-for="feat in features"
            :key="feat.title"
            class="landing__feat"
            :class="[`landing__feat--tone-${feat.tone}`]"
            :style="`--feat-span: ${feat.span}`"
            @click="goTo(feat.to)"
          >
            <span class="material-symbols-outlined landing__feat-icon">{{ feat.icon }}</span>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
            <div class="landing__feat-foot">
              <span class="landing__feat-eyebrow">{{ feat.eyebrow }}</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </div>
          </article>

          <article class="landing__feat landing__feat--wide" @click="goTo('/learning-state')">
            <span class="material-symbols-outlined landing__feat-icon">analytics</span>
            <div class="landing__feat-wide-body">
              <div>
                <h3>状态反馈循环 · 量化你的学习手感</h3>
                <p>
                  我们不提供简单的“对 / 错”反馈。知途基于多维度的学术洞察：认知负荷、概念关联强度与长期记忆保持曲线预测。
                </p>
                <div class="landing__status-grid">
                  <div v-for="m in statusMetrics" :key="m.label" class="landing__status-tile">
                    <span>{{ m.label }}</span>
                    <strong>{{ m.value }}</strong>
                  </div>
                </div>
              </div>
              <div class="landing__feat-orbit" aria-hidden="true">
                <div class="landing__feat-orbit-ring"></div>
                <span class="material-symbols-outlined">query_stats</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="methodology" class="landing__cta">
      <div class="landing__container">
        <h2 class="landing__cta-title">准备好构建你的学术大厦了吗？</h2>
        <p class="landing__cta-sub">
          知途把每一次进步都转化为可量化的学习指标，让“我在成长”成为一种可以看见的事实。
        </p>
        <div class="landing__actions landing__actions--center">
          <AButton size="lg" icon-right="bolt" @click="goTo(primaryCta.to)">{{ primaryCta.label }}</AButton>
        </div>
      </div>
      <div class="landing__cta-lines"></div>
    </section>

    <footer class="landing__footer">
      <div class="landing__container landing__footer-inner">
        <div>
          <p class="landing__brand landing__brand--footer">
            <span class="landing__logo-mark">知</span>知途 · KnowPath
          </p>
          <p class="landing__footer-tag">基于学术逻辑与人工智能的下一代学习工作台。</p>
        </div>
        <div class="landing__footer-cols">
          <div>
            <h4>产品</h4>
            <RouterLink to="/goal-conversation">目标澄清</RouterLink>
            <RouterLink to="/learning-paths">学习路径</RouterLink>
            <RouterLink to="/learning-state">学习状态</RouterLink>
            <RouterLink to="/achievements">成长成就</RouterLink>
          </div>
          <div>
            <h4>资源</h4>
            <a href="/">官方网站</a>
          </div>
          <div>
            <h4>账户</h4>
            <RouterLink to="/login">登录</RouterLink>
            <RouterLink to="/register">创建账户</RouterLink>
          </div>
        </div>
      </div>
      <div class="landing__container landing__footer-bar">
        <span>© {{ new Date().getFullYear() }} 知途 · 为严谨学习而设计</span>
        <span>MIT License · Designed for Academic Excellence</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing { background: var(--color-background); color: var(--color-ink); overflow-x: hidden; }

.landing__nav {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px var(--space-10);
  background: rgba(245, 247, 249, 0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(172, 179, 183, 0.18);
  z-index: 20;
}
.landing__brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-headline);
  font-weight: 700; font-size: 1.05rem;
  color: var(--color-ink);
}
.landing__brand--footer { font-size: 1.15rem; }
.landing__logo-mark {
  display: grid; place-items: center;
  width: 30px; height: 30px;
  background: var(--color-primary);
  color: var(--color-primary-on);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
}

.landing__nav-links { display: flex; gap: var(--space-6); }
.landing__nav-links a,
.landing__nav-links :deep(a) {
  color: var(--color-ink-dim);
  font-size: 0.9rem;
  font-weight: 500;
}
.landing__nav-links a:hover { color: var(--color-primary); }

.landing__nav-actions { display: flex; gap: 12px; align-items: center; }
.landing__nav-login { color: var(--color-ink); font-weight: 500; font-size: 0.9rem; }

.landing__hero {
  position: relative;
  min-height: 78vh;
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-16) var(--space-6);
  overflow: hidden;
}
.landing__grid-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(var(--color-ink) 1px, transparent 1px) 0 0 / 40px 40px,
    linear-gradient(90deg, var(--color-ink) 1px, transparent 1px) 0 0 / 40px 40px;
  opacity: 0.03;
}
.landing__hero-inner { position: relative; max-width: 820px; text-align: center; }

.landing__tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px;
  background: var(--color-surface-high);
  border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--space-8);
}
.landing__tag-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 0 rgba(44, 94, 167, 0.6);
  animation: landing-ping 2s ease-out infinite;
}
@keyframes landing-ping {
  0% { box-shadow: 0 0 0 0 rgba(44, 94, 167, 0.6); }
  100% { box-shadow: 0 0 0 12px rgba(44, 94, 167, 0); }
}

.landing__title {
  font-family: var(--font-headline);
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--color-ink);
  margin-bottom: var(--space-5);
}
.landing__accent {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.landing__lead {
  max-width: 640px;
  margin: 0 auto var(--space-8);
  font-size: 1.08rem; line-height: 1.7;
  color: var(--color-ink-dim);
}
.landing__actions { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
.landing__actions--center { justify-content: center; }

.landing__hero-decor {
  position: absolute; bottom: -120px; left: 50%;
  transform: translateX(-50%); width: 60%; height: 240px;
  background: radial-gradient(closest-side, rgba(44, 94, 167, 0.25), transparent 70%);
  filter: blur(24px); pointer-events: none;
}

.landing__features { background: var(--color-surface); padding: var(--space-16) 0; }
.landing__container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-6); }

.landing__features-head { max-width: 480px; margin-bottom: var(--space-10); }
.landing__features-head h2 { font-size: 2.1rem; margin-bottom: 8px; }
.landing__features-head p { margin-top: var(--space-4); color: var(--color-ink-dim); }

.landing__features-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-5); }

.landing__feat {
  grid-column: span var(--feat-span, 6);
  position: relative;
  padding: var(--space-8);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: transform var(--duration-base) var(--easing),
              background var(--duration-base) var(--easing);
  min-height: 260px;
}
.landing__feat:hover { transform: translateY(-2px); background: var(--color-surface-high); }
.landing__feat--tone-inverse {
  background: #0f1b2e; color: #dbe6f7;
  box-shadow: 0 24px 48px rgba(13, 27, 48, 0.25);
}
.landing__feat--tone-inverse h3 { color: #fff; }
.landing__feat--tone-inverse p { color: #93a8c8; }
.landing__feat--tone-inverse:hover { background: #132541; }

.landing__feat--wide {
  grid-column: span 12;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.landing__feat-icon { color: var(--color-primary); font-size: 32px !important; }
.landing__feat--tone-inverse .landing__feat-icon { color: var(--color-primary-container); }
.landing__feat h3 { font-family: var(--font-headline); font-size: 1.25rem; font-weight: 700; }
.landing__feat p { color: var(--color-ink-dim); line-height: 1.65; max-width: 40rem; }

.landing__feat-foot {
  margin-top: auto;
  display: flex; align-items: center; justify-content: space-between;
  padding-top: var(--space-4);
  border-top: 1px solid rgba(172, 179, 183, 0.2);
}
.landing__feat--tone-inverse .landing__feat-foot { border-top-color: rgba(255,255,255,0.1); }
.landing__feat-eyebrow {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-primary);
}
.landing__feat--tone-inverse .landing__feat-eyebrow { color: var(--color-primary-container); }
.landing__feat-foot .material-symbols-outlined { font-size: 18px !important; color: var(--color-ink-soft); }
.landing__feat--tone-inverse .landing__feat-foot .material-symbols-outlined { color: rgba(255,255,255,0.6); }

.landing__feat-wide-body { display: grid; grid-template-columns: 1fr auto; gap: var(--space-10); align-items: center; }
.landing__status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-top: var(--space-5); }
.landing__status-tile {
  padding: 12px 14px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column; gap: 4px;
}
.landing__status-tile span {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-ink-soft);
}
.landing__status-tile strong {
  font-family: var(--font-headline); font-size: 1.25rem;
  color: var(--color-primary);
}

.landing__feat-orbit {
  position: relative;
  width: 180px; height: 180px;
  display: grid; place-items: center;
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
}
.landing__feat-orbit-ring {
  position: absolute; inset: 16px;
  border: 2px dashed var(--color-outline);
  border-radius: 50%;
  opacity: 0.6;
  animation: landing-orbit 24s linear infinite;
}
@keyframes landing-orbit { to { transform: rotate(360deg); } }
.landing__feat-orbit .material-symbols-outlined { font-size: 64px !important; color: rgba(44, 94, 167, 0.25); }

.landing__cta {
  position: relative;
  padding: var(--space-16) 0;
  background: var(--color-background);
  text-align: center;
  overflow: hidden;
}
.landing__cta-title { font-family: var(--font-headline); font-size: clamp(2rem, 4vw, 2.75rem); margin-bottom: var(--space-4); }
.landing__cta-sub { max-width: 520px; margin: 0 auto var(--space-8); color: var(--color-ink-dim); font-size: 1rem; line-height: 1.7; }
.landing__cta-lines {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(transparent 0, transparent calc(50% - 0.5px), rgba(172,179,183,0.25) calc(50% - 0.5px), rgba(172,179,183,0.25) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
    linear-gradient(90deg, transparent 0, transparent calc(25% - 0.5px), rgba(172,179,183,0.18) calc(25% - 0.5px), rgba(172,179,183,0.18) calc(25% + 0.5px), transparent calc(25% + 0.5px)),
    linear-gradient(90deg, transparent 0, transparent calc(75% - 0.5px), rgba(172,179,183,0.18) calc(75% - 0.5px), rgba(172,179,183,0.18) calc(75% + 0.5px), transparent calc(75% + 0.5px));
}

.landing__footer { background: var(--color-surface-high); padding: var(--space-12) 0 var(--space-6); }
.landing__footer-inner {
  display: grid; grid-template-columns: 1fr 2fr;
  gap: var(--space-10);
  padding-bottom: var(--space-10);
  border-bottom: 1px solid rgba(172, 179, 183, 0.25);
}
.landing__footer-tag { margin-top: var(--space-3); color: var(--color-ink-dim); max-width: 26rem; font-size: 0.9rem; line-height: 1.6; }
.landing__footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.landing__footer-cols h4 {
  font-size: 0.74rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-ink-soft);
  margin-bottom: var(--space-4);
}
.landing__footer-cols a,
.landing__footer-cols :deep(a) {
  display: block;
  color: var(--color-ink);
  font-size: 0.9rem;
  padding: 4px 0;
}
.landing__footer-cols a:hover { color: var(--color-primary); }

.landing__footer-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: var(--space-6);
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}

@media (max-width: 900px) {
  .landing__nav { padding: 12px var(--space-5); }
  .landing__nav-links { display: none; }
  .landing__feat { grid-column: span 12 !important; }
  .landing__feat-wide-body { grid-template-columns: 1fr; }
  .landing__feat-orbit { width: 140px; height: 140px; }
  .landing__status-grid { grid-template-columns: repeat(2, 1fr); }
  .landing__footer-inner { grid-template-columns: 1fr; }
  .landing__footer-cols { grid-template-columns: repeat(2, 1fr); }
  .landing__footer-bar { flex-direction: column; gap: var(--space-2); text-align: center; }
}
</style>
