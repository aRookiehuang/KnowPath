<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import ALoading from '@/components/aa/ALoading.vue';
import { userAPI } from '@/api/user';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const loading = ref(true);
const achievements = ref<any[]>([]);
const sessions = ref<any[]>([]);

const profile = computed(() => userStore.user);
const xpProgress = computed(() => {
  const current = profile.value?.xp || 0;
  const target = profile.value?.xpToNextLevel || Math.max(1000, (profile.value?.level || 1) * 1500);
  return Math.min(100, Math.round((current / target) * 100));
});

const achievementItems = computed(() => {
  const source = achievements.value;
  if (Array.isArray(source)) return source;
  return [];
});

const stats = computed(() => ({
  level: profile.value?.level || 1,
  xp: profile.value?.xp || 0,
  achievements: achievementItems.value.length,
  sessions: sessions.value.length
}));

onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchProfile();
    const [achievementResult, sessionResult] = await Promise.all([
      userAPI.getAchievements(),
      userAPI.getSessions(8)
    ]);
    achievements.value = Array.isArray(achievementResult)
      ? achievementResult
      : (achievementResult?.items || achievementResult?.achievements || []);
    sessions.value = Array.isArray(sessionResult)
      ? sessionResult
      : (sessionResult?.items || sessionResult?.data || []);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="成长档案"
      title="成长成就"
      description="集中查看等级、经验、已解锁成就与近期学习势能，形成完整成长记录。"
    >
      <template #actions>
        <RouterLink to="/learning-state" custom v-slot="{ navigate }">
          <AButton variant="secondary" icon="analytics" @click="navigate">查看学习状态</AButton>
        </RouterLink>
        <RouterLink to="/goal-conversation" custom v-slot="{ navigate }">
          <AButton icon-right="arrow_forward" @click="navigate">创建新的目标</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <ALoading v-if="loading" label="正在加载成长成就..." />

    <div v-else class="achievement-page">
      <section class="achievement-page__stats">
        <AStatTile label="当前等级" :value="stats.level" icon="military_tech" tone="accent" />
        <AStatTile label="累计经验" :value="stats.xp" icon="bolt" hint="用于解锁更高等级与更多记录" />
        <AStatTile label="成就数量" :value="stats.achievements" icon="emoji_events" />
        <AStatTile label="学习会话" :value="stats.sessions" icon="history" tone="muted" />
      </section>

      <section class="achievement-page__grid">
        <APanel eyebrow="等级进度" title="当前成长阶段" description="查看从当前等级继续升级所需的整体推进情况。">
          <div class="achievement-page__level-card">
            <div>
              <p class="aa-meta">成长等级</p>
              <h3>等级 {{ stats.level }} · 研究者</h3>
              <p>{{ profile?.name || '学习者' }} 正在持续积累经验值，逐步形成更稳定、更高质量的学习成长曲线。</p>
            </div>
            <div class="achievement-page__level-progress">
              <div class="achievement-page__level-track"><span :style="{ width: `${xpProgress}%` }"></span></div>
              <strong>{{ xpProgress }}%</strong>
            </div>
          </div>
        </APanel>

        <APanel eyebrow="近期势能" title="最近会话">
          <div v-if="sessions.length" class="achievement-page__timeline">
            <article v-for="(session, index) in sessions.slice(0, 5)" :key="session.id || index" class="achievement-page__timeline-item">
              <div>
                <h3>{{ session.topic || session.subject || `学习会话 ${index + 1}` }}</h3>
                <p>{{ session.startTime || session.createdAt || '时间待补充' }}</p>
              </div>
              <AChip :tone="session.status === 'completed' ? 'success' : 'soft'">{{ session.status === 'completed' ? '已完成' : '进行中' }}</AChip>
            </article>
          </div>
          <AEmpty
            v-else
            compact
            icon="history"
            title="还没有最近会话"
            description="当你开始更多学习任务后，这里会展示最近一段时间的成长节奏。"
          />
        </APanel>
      </section>

      <APanel eyebrow="已解锁成就" title="成就墙" description="汇总你已经获得的重要里程碑与成长记录。">
        <div v-if="achievementItems.length" class="achievement-page__cards">
          <article v-for="(item, index) in achievementItems" :key="item.id || index" class="achievement-page__card">
            <div class="achievement-page__card-head">
              <AChip tone="primary">{{ item.category || item.type || '学习成就' }}</AChip>
              <span class="material-symbols-outlined">workspace_premium</span>
            </div>
            <h3>{{ item.title || item.name || `成就 ${index + 1}` }}</h3>
            <p>{{ item.description || item.summary || '这项成就记录了你在某个阶段完成的重要学习里程碑。' }}</p>
            <div class="achievement-page__card-foot">
              <span>{{ item.unlockedAt || item.createdAt || '解锁时间待补充' }}</span>
            </div>
          </article>
        </div>
        <AEmpty
          v-else
          icon="emoji_events"
          title="还没有已解锁成就"
          description="继续完成任务、推进路径与参与测试后，你的成就墙会逐渐丰富起来。"
        >
          <RouterLink to="/learning-paths" custom v-slot="{ navigate }">
            <AButton icon-right="arrow_forward" @click="navigate">前往学习路径</AButton>
          </RouterLink>
        </AEmpty>
      </APanel>
    </div>
  </AppShell>
</template>

<style scoped>
.achievement-page { display: flex; flex-direction: column; gap: var(--space-6); }
.achievement-page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.achievement-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.achievement-page__level-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: var(--space-6);
  align-items: center;
}
.achievement-page__level-card h3 { margin: 8px 0; font-size: 1.4rem; }
.achievement-page__level-card p { color: var(--color-ink-dim); line-height: 1.7; }
.achievement-page__level-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-surface-highest);
  overflow: hidden;
}
.achievement-page__level-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
}
.achievement-page__level-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.achievement-page__level-progress strong {
  font-family: var(--font-headline);
  font-size: 1.8rem;
  color: var(--color-primary);
}
.achievement-page__timeline { display: flex; flex-direction: column; gap: var(--space-3); }
.achievement-page__timeline-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.achievement-page__timeline-item h3 { font-size: 0.98rem; }
.achievement-page__timeline-item p { margin-top: 6px; color: var(--color-ink-soft); font-size: 0.82rem; }
.achievement-page__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}
.achievement-page__card {
  padding: var(--space-5);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 220px;
}
.achievement-page__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.achievement-page__card-head .material-symbols-outlined {
  color: var(--color-primary);
  font-size: 22px !important;
}
.achievement-page__card h3 { font-size: 1.04rem; }
.achievement-page__card p { color: var(--color-ink-dim); line-height: 1.65; }
.achievement-page__card-foot {
  margin-top: auto;
  color: var(--color-ink-soft);
  font-size: 0.78rem;
}

@media (max-width: 1100px) {
  .achievement-page__stats { grid-template-columns: repeat(2, 1fr); }
  .achievement-page__grid,
  .achievement-page__level-card,
  .achievement-page__cards { grid-template-columns: 1fr; }
}
</style>

