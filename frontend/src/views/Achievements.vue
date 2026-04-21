<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AChip from '@/components/aa/AChip.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AProgressBar from '@/components/aa/AProgressBar.vue';
import { userAPI } from '@/api/user';
import { useUserStore } from '@/stores/user';

interface AchievementProgress {
  current: number;
  total: number;
  percentage: number;
}

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  type: string;
  unlocked: boolean;
  progress?: AchievementProgress;
  earnedAt?: string | null;
}

const ACHIEVEMENT_TYPES: Record<string, { label: string; eyebrow: string; description: string }> = {
  milestone: {
    label: '里程碑成就',
    eyebrow: 'MILESTONE',
    description: '通过任务完成数量与关键节点，记录成长的起点与跃迁。'
  },
  streak: {
    label: '连续学习',
    eyebrow: 'STREAK',
    description: '面向长期坚持而设计，适合演示学习节奏的持续性。'
  },
  completion: {
    label: '路径完成',
    eyebrow: 'COMPLETION',
    description: '围绕学习路径的整体推进情况，强调系统性完成。'
  },
  mastery: {
    label: '知识掌握',
    eyebrow: 'MASTERY',
    description: '根据 KTL 或学习效率点亮，体现能力深度与质量。'
  },
  social: {
    label: '特殊成就',
    eyebrow: 'SPECIAL',
    description: '用于承载活动型、触发型或实验性质的奖励条件。'
  }
};

const TYPE_ORDER = ['milestone', 'streak', 'completion', 'mastery', 'social'];

const userStore = useUserStore();
const loading = ref(true);
const achievements = ref<AchievementItem[]>([]);
const sessions = ref<any[]>([]);

const profile = computed(() => userStore.user);

const xpTarget = computed(() => {
  const level = profile.value?.level || 1;
  return profile.value?.xpToNextLevel || Math.max(1000, level * 1500);
});

const xpProgress = computed(() => {
  const current = profile.value?.xp || 0;
  return Math.min(100, Math.round((current / xpTarget.value) * 100));
});

const unlockedAchievements = computed(() => achievements.value.filter((item) => item.unlocked));
const lockedAchievements = computed(() => achievements.value.filter((item) => !item.unlocked));
const unlockedCount = computed(() => unlockedAchievements.value.length);
const lockedCount = computed(() => lockedAchievements.value.length);
const totalCount = computed(() => achievements.value.length);
const completionRate = computed(() => (totalCount.value ? Math.round((unlockedCount.value / totalCount.value) * 100) : 0));

const groupedAchievements = computed(() =>
  TYPE_ORDER
    .map((type) => {
      const items = achievements.value.filter((item) => item.type === type);
      if (!items.length) return null;

      return {
        type,
        meta: getTypeMeta(type),
        items,
        unlocked: items.filter((item) => item.unlocked).length
      };
    })
    .filter(Boolean) as Array<{
    type: string;
    meta: { label: string; eyebrow: string; description: string };
    items: AchievementItem[];
    unlocked: number;
  }>
);

const normalizeAchievement = (item: any, index: number): AchievementItem => ({
  id: item?.id || `achievement-${index + 1}`,
  name: item?.name || item?.title || `成就 ${index + 1}`,
  description: item?.description || item?.summary || '这项成就记录了某个关键成长时刻。',
  icon: item?.icon || item?.iconUrl || '🏆',
  xpReward: Number(item?.xpReward || 0),
  type: item?.type || 'milestone',
  unlocked: Boolean(item?.unlocked || item?.earnedAt || item?.unlockedAt),
  progress: item?.progress
    ? {
        current: Number(item.progress.current || 0),
        total: Math.max(Number(item.progress.total || 1), 1),
        percentage: Math.max(0, Math.min(100, Number(item.progress.percentage || 0)))
      }
    : undefined,
  earnedAt: item?.earnedAt || item?.unlockedAt || null
});

function getTypeMeta(type: string) {
  return ACHIEVEMENT_TYPES[type] || {
    label: '特殊成就',
    eyebrow: 'ARCHIVE',
    description: '用于展示尚未归类的成长记录。'
  };
}

function hasProgress(item: AchievementItem) {
  return Boolean(item.progress && Number.isFinite(item.progress.total) && item.progress.total > 0);
}

function getProgressCurrent(item: AchievementItem) {
  return item.progress?.current || 0;
}

function getProgressTotal(item: AchievementItem) {
  return Math.max(item.progress?.total || 1, 1);
}

function getProgressPercentage(item: AchievementItem) {
  return Math.max(0, Math.min(100, item.progress?.percentage || 0));
}

function getProgressText(item: AchievementItem) {
  if (!item.progress) return '满足条件后即可点亮';

  if (item.id === 'perfect_week') {
    return `本周完成率 ${item.progress.current}%`;
  }

  if (item.id === 'speed_learner') {
    return `效率进度 ${item.progress.current} / ${item.progress.total}`;
  }

  return `当前进度 ${item.progress.current} / ${item.progress.total}`;
}

function formatDate(value?: string | null) {
  if (!value) return '时间待记录';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '时间待记录';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchProfile();
    const [achievementResult, sessionResult] = await Promise.all([userAPI.getAchievementOverview(), userAPI.getSessions(8)]);

    const overviewSource = Array.isArray(achievementResult)
      ? achievementResult
      : achievementResult?.items || achievementResult?.achievements || achievementResult?.data || [];

    const sessionSource = Array.isArray(sessionResult)
      ? sessionResult
      : sessionResult?.items || sessionResult?.data || [];

    achievements.value = overviewSource.map((item: any, index: number) => normalizeAchievement(item, index));
    sessions.value = sessionSource;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="成就档案馆"
      title="成长成就总览"
      description="已解锁与未解锁成就都会在此陈列，便于完整展示成长系统。"
    >
      <template #actions>
        <RouterLink to="/learning-paths" custom v-slot="{ href, navigate }">
          <a :href="href" class="achievement-page__action-link achievement-page__action-link--secondary" @click="navigate">
            查看学习路径
          </a>
        </RouterLink>
        <RouterLink to="/goal-conversation" custom v-slot="{ href, navigate }">
          <a :href="href" class="achievement-page__action-link" @click="navigate">
            创建新的目标
          </a>
        </RouterLink>
      </template>
    </APageHeader>

    <div v-if="loading" aria-live="polite">
      <ALoading label="正在加载成长成就档案…" />
    </div>

    <div v-else class="achievement-page">
      <section class="achievement-page__stats">
        <AStatTile label="当前等级" :value="profile?.level || 1" icon="military_tech" tone="accent" />
        <AStatTile label="已解锁成就" :value="unlockedCount" icon="emoji_events" />
        <AStatTile label="待解锁成就" :value="lockedCount" icon="lock" tone="muted" />
        <AStatTile label="图鉴完成度" :value="`${completionRate}%`" icon="stacked_bar_chart" hint="按已解锁数量计算" />
      </section>

      <section class="achievement-page__grid">
        <APanel eyebrow="等级进度" title="当前成长阶段" description="成长经验与等级会持续推动更多成就被点亮。">
          <div class="achievement-page__level-card">
            <div>
              <p class="aa-meta">CURRENT ARC</p>
              <h3>等级 {{ profile?.level || 1 }} · 研究者轨道</h3>
              <p>
                当前经验值为 {{ profile?.xp || 0 }}，距离下一阶段参考目标 {{ xpTarget }}。
                这部分会与任务完成、路径推进和成就奖励一起构成完整成长闭环。
              </p>
            </div>
            <div class="achievement-page__level-progress">
              <AProgressBar :value="profile?.xp || 0" :max="xpTarget" height="md" />
              <div class="achievement-page__progress-caption">
                <span>升级进度 {{ profile?.xp || 0 }} / {{ xpTarget }}</span>
                <strong>{{ xpProgress }}%</strong>
              </div>
            </div>
          </div>
        </APanel>

        <APanel eyebrow="近期势能" title="学习会话轨迹" description="最近的学习节奏，会直接影响连续学习与里程碑型成就。">
          <div v-if="sessions.length" class="achievement-page__timeline">
            <article v-for="(session, index) in sessions.slice(0, 5)" :key="session.id || index" class="achievement-page__timeline-item">
              <div class="achievement-page__timeline-copy">
                <h3>{{ session.topic || session.subject || `学习会话 ${index + 1}` }}</h3>
                <p>{{ session.startTime || session.createdAt || '时间待补充' }}</p>
              </div>
              <AChip :tone="session.status === 'completed' ? 'success' : 'soft'">
                {{ session.status === 'completed' ? '已完成' : '进行中' }}
              </AChip>
            </article>
          </div>
          <AEmpty
            v-else
            compact
            icon="history"
            title="还没有最近会话"
            description="开始一次学习后，这里会显示最近的成长节奏与时间轨迹。"
          />
        </APanel>
      </section>

      <APanel eyebrow="全量成就" title="成就图鉴" description="所有成就按类别陈列，未解锁成就也会显示条件与实时进度。">
        <div class="achievement-page__legend">
          <AChip tone="success" icon="emoji_events">已解锁</AChip>
          <AChip tone="soft" icon="lock">未解锁</AChip>
          <AChip tone="primary" icon="trophy">展示奖励、类型与推进度</AChip>
        </div>

        <div class="achievement-page__groups">
          <section v-for="group in groupedAchievements" :key="group.type" class="achievement-page__group">
            <div class="achievement-page__group-head">
              <div>
                <p class="aa-meta">{{ group.meta.eyebrow }}</p>
                <h3>{{ group.meta.label }}</h3>
                <p>{{ group.meta.description }}</p>
              </div>
              <div class="achievement-page__group-metric">
                <strong>{{ group.unlocked }}/{{ group.items.length }}</strong>
                <span>已点亮</span>
              </div>
            </div>

            <div class="achievement-page__cards">
              <article
                v-for="item in group.items"
                :key="item.id"
                class="achievement-page__card"
                :class="{
                  'achievement-page__card--locked': !item.unlocked,
                  'achievement-page__card--unlocked': item.unlocked
                }"
              >
                <div class="achievement-page__card-top">
                  <div class="achievement-page__card-icon" aria-hidden="true">{{ item.icon }}</div>
                  <AChip size="sm" :tone="item.unlocked ? 'success' : 'soft'">
                    {{ item.unlocked ? '已解锁' : '未解锁' }}
                  </AChip>
                </div>

                <div class="achievement-page__card-meta">
                  <AChip size="sm" tone="primary">{{ getTypeMeta(item.type).label }}</AChip>
                  <span>+{{ item.xpReward }} XP</span>
                </div>

                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>

                <div class="achievement-page__card-footer">
                  <template v-if="item.unlocked">
                    <div class="achievement-page__stamp">达成于 {{ formatDate(item.earnedAt) }}</div>
                  </template>
                  <template v-else-if="hasProgress(item)">
                    <AProgressBar :value="getProgressCurrent(item)" :max="getProgressTotal(item)" height="md" />
                    <div class="achievement-page__progress-caption">
                      <span>{{ getProgressText(item) }}</span>
                      <strong>{{ getProgressPercentage(item) }}%</strong>
                    </div>
                  </template>
                  <div v-else class="achievement-page__progress-caption achievement-page__progress-caption--muted">
                    <span>这是触发型成就，满足特殊条件后点亮</span>
                    <strong>待达成</strong>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </APanel>
    </div>
  </AppShell>
</template>

<style scoped>
.achievement-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.achievement-page__action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-primary-on);
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  transition:
    background var(--duration-base) var(--easing),
    color var(--duration-base) var(--easing),
    transform var(--duration-fast) var(--easing),
    box-shadow var(--duration-base) var(--easing);
  box-shadow: 0 8px 20px rgba(44, 94, 167, 0.16);
}

.achievement-page__action-link:hover {
  background: var(--color-primary-dim);
  color: var(--color-primary-on);
}

.achievement-page__action-link:focus-visible {
  outline: 2px solid rgba(129, 174, 253, 0.9);
  outline-offset: 2px;
}

.achievement-page__action-link:active {
  transform: scale(0.98);
}

.achievement-page__action-link--secondary {
  background: var(--color-surface-high);
  color: var(--color-ink);
  box-shadow: none;
}

.achievement-page__action-link--secondary:hover {
  background: var(--color-surface-highest);
  color: var(--color-ink);
}

.achievement-page__group-head h3,
.achievement-page__group-head h3,
.achievement-page__card h4,
.achievement-page__timeline-item h3,
.achievement-page__level-card h3 {
  margin: 0;
}

.achievement-page__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.achievement-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 1fr);
  gap: var(--space-5);
}

.achievement-page__level-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: var(--space-6);
  align-items: center;
}

.achievement-page__level-card p {
  margin: 10px 0 0;
  color: var(--color-ink-dim);
  line-height: 1.75;
}

.achievement-page__level-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, rgba(129, 174, 253, 0.14) 0%, rgba(129, 174, 253, 0.04) 100%);
}

.achievement-page__timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.achievement-page__timeline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  border: 1px solid rgba(44, 94, 167, 0.08);
}

.achievement-page__timeline-copy {
  min-width: 0;
}

.achievement-page__timeline-item p {
  margin: 6px 0 0;
  color: var(--color-ink-soft);
  font-size: 0.82rem;
}

.achievement-page__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.achievement-page__groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.achievement-page__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.achievement-page__group-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: end;
}

.achievement-page__group-head p {
  margin: 8px 0 0;
  color: var(--color-ink-dim);
  line-height: 1.7;
  max-width: 62ch;
}

.achievement-page__group-metric {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 2px;
  min-width: 92px;
}

.achievement-page__group-metric strong {
  font-family: var(--font-headline);
  font-size: 1.5rem;
  color: var(--color-primary);
}

.achievement-page__group-metric span {
  color: var(--color-ink-soft);
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.achievement-page__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}

.achievement-page__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 250px;
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid rgba(44, 94, 167, 0.08);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--duration-base) var(--easing),
    box-shadow var(--duration-base) var(--easing),
    border-color var(--duration-base) var(--easing);
}

.achievement-page__card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at top right, rgba(129, 174, 253, 0.15), transparent 35%);
  opacity: 0;
  transition: opacity var(--duration-base) var(--easing);
  pointer-events: none;
}

.achievement-page__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-elevated);
  border-color: rgba(44, 94, 167, 0.2);
}

.achievement-page__card:hover::before {
  opacity: 1;
}

.achievement-page__card--locked {
  background: linear-gradient(180deg, #fcfdff 0%, #f2f5f8 100%);
}

.achievement-page__card--locked .achievement-page__card-icon {
  opacity: 0.72;
}

.achievement-page__card--unlocked {
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
}

.achievement-page__card-top,
.achievement-page__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.achievement-page__card-meta span {
  color: var(--color-primary);
  font-family: var(--font-headline);
  font-size: 0.82rem;
}

.achievement-page__card-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  background: linear-gradient(145deg, rgba(129, 174, 253, 0.28), rgba(129, 174, 253, 0.08));
}

.achievement-page__card p {
  margin: 0;
  color: var(--color-ink-dim);
  line-height: 1.72;
  overflow-wrap: anywhere;
}

.achievement-page__card-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.achievement-page__progress-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-ink-soft);
  font-size: 0.8rem;
}

.achievement-page__progress-caption strong {
  color: var(--color-primary);
  font-family: var(--font-headline);
  font-size: 1rem;
}

.achievement-page__progress-caption--solo {
  margin-top: auto;
}

.achievement-page__progress-caption--muted strong {
  color: var(--color-ink-dim);
}

.achievement-page__stamp {
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(47, 122, 77, 0.12);
  color: var(--color-success);
  font-size: 0.78rem;
  font-weight: 600;
}

@media (max-width: 1180px) {
  .achievement-page__grid {
    grid-template-columns: 1fr;
  }

  .achievement-page__level-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .achievement-page__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .achievement-page__group-head {
    flex-direction: column;
    align-items: start;
  }

  .achievement-page__group-metric {
    align-items: start;
  }
}

@media (max-width: 640px) {
  .achievement-page__stats {
    grid-template-columns: 1fr;
  }

  .achievement-page__cards {
    grid-template-columns: 1fr;
  }

  .achievement-page__card-top,
  .achievement-page__card-meta,
  .achievement-page__progress-caption,
  .achievement-page__timeline-item {
    align-items: start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .achievement-page__card,
  .achievement-page__card::before {
    transition: none;
  }

  .achievement-page__card:hover {
    transform: none;
  }
}
</style>
