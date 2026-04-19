<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import { useUserStore } from '@/stores/user';
import { userAPI } from '@/api/user';

const userStore = useUserStore();
const saving = ref(false);
const sessions = ref<any[]>([]);
const achievementsCount = ref(0);

const form = reactive({
  name: '',
  avatarUrl: '',
  skillLevel: '',
  learningStyle: '',
  timePerDay: '',
  learningGoal: ''
});

const profile = computed(() => userStore.user);
const summaryTiles = computed(() => [
  { label: '当前等级', value: profile.value?.level || 1, icon: 'military_tech', tone: 'accent' as const },
  { label: '累计经验', value: profile.value?.xp || 0, icon: 'bolt' },
  { label: '学习会话', value: sessions.value.length, icon: 'history' },
  { label: '成就数量', value: achievementsCount.value, icon: 'emoji_events', tone: 'muted' as const }
]);

const avatarText = computed(() => (profile.value?.name || '?').trim().charAt(0).toUpperCase());

const fillForm = () => {
  Object.assign(form, {
    name: profile.value?.name || '',
    avatarUrl: profile.value?.avatarUrl || '',
    skillLevel: profile.value?.skillLevel || '',
    learningStyle: profile.value?.learningStyle || '',
    timePerDay: profile.value?.timePerDay || '',
    learningGoal: profile.value?.learningGoal || ''
  });
};

const saveProfile = async () => {
  saving.value = true;
  try {
    await userStore.updateProfile({ ...form });
    ElMessage.success('个人资料已保存。');
  } catch (err: any) {
    ElMessage.error(err?.message || '保存个人资料失败。');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    await userStore.fetchProfile();
    fillForm();
    const [sessionResult, achievementResult] = await Promise.all([
      userAPI.getSessions(6),
      userAPI.getAchievements()
    ]);
    sessions.value = Array.isArray(sessionResult) ? sessionResult : (sessionResult?.items || sessionResult?.data || []);
    const items = Array.isArray(achievementResult)
      ? achievementResult
      : (achievementResult?.items || achievementResult?.achievements || []);
    achievementsCount.value = items.length;
  } catch {
    sessions.value = [];
  }
});
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="个人资料"
      title="账户中心"
      description="维护你的学习身份、偏好与目标，为后续路径生成和 AI 引导提供更准确的上下文。"
    >
      <template #actions>
        <RouterLink to="/user/settings" custom v-slot="{ navigate }">
          <AButton variant="secondary" icon="tune" @click="navigate">接口设置</AButton>
        </RouterLink>
        <RouterLink to="/user/agent-logs" custom v-slot="{ navigate }">
          <AButton icon="history" @click="navigate">运行日志</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <div class="profile-page">
      <section class="profile-page__stats">
        <AStatTile v-for="item in summaryTiles" :key="item.label" v-bind="item" />
      </section>

      <section class="profile-page__grid">
        <div class="profile-page__main">
          <APanel eyebrow="身份信息" title="基础资料" description="这些信息将用于优化学习路径生成与个性化建议。">
            <div class="profile-page__form">
              <AField v-model="form.name" label="姓名" placeholder="请输入你的昵称或姓名" />
              <AField v-model="form.learningGoal" label="学习目标" placeholder="例如：8 周内掌握数据结构与算法基础" />
              <div class="profile-page__field">
                <label>能力水平</label>
                <select v-model="form.skillLevel">
                  <option value="">请选择</option>
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
              <div class="profile-page__field">
                <label>偏好方式</label>
                <select v-model="form.learningStyle">
                  <option value="">请选择</option>
                  <option value="mixed">理论与实践结合</option>
                  <option value="practice">偏实践</option>
                  <option value="theory">偏理论</option>
                </select>
              </div>
              <AField v-model="form.timePerDay" label="每日可投入时长" placeholder="例如：1.5 小时 / 晚上 2 小时" />
              <AField v-model="form.avatarUrl" label="头像地址" type="url" placeholder="输入一张可访问的头像图片地址" />
            </div>
            <template #footer>
              <AButton :loading="saving" icon="save" @click="saveProfile">保存资料</AButton>
            </template>
          </APanel>

          <APanel eyebrow="最近会话" title="学习记录">
            <div v-if="sessions.length" class="profile-page__sessions">
              <article v-for="(session, index) in sessions" :key="session.id || index" class="profile-page__session">
                <div>
                  <h3>{{ session.topic || session.subject || `学习会话 ${index + 1}` }}</h3>
                  <p>{{ session.startTime || session.createdAt || '时间待补充' }}</p>
                </div>
                <AChip :tone="session.status === 'completed' ? 'success' : 'soft'">{{ session.status === 'completed' ? '已完成' : '进行中' }}</AChip>
              </article>
            </div>
            <div v-else class="profile-page__empty-copy">你还没有最近学习记录。开始一轮新任务后，这里会显示最近会话。</div>
          </APanel>
        </div>

        <aside class="profile-page__side">
          <APanel eyebrow="学习名片" title="个人卡片">
            <div class="profile-page__identity-card">
              <div class="profile-page__avatar" :style="form.avatarUrl ? `background-image:url(${form.avatarUrl})` : ''">
                <span v-if="!form.avatarUrl">{{ avatarText }}</span>
              </div>
              <div>
                <h3>{{ profile?.name || '未设置姓名' }}</h3>
                <p>{{ profile?.email || '暂无邮箱' }}</p>
              </div>
            </div>
            <div class="profile-page__identity-meta">
              <div>
                <span>学习等级</span>
                <strong>Level {{ profile?.level || 1 }}</strong>
              </div>
              <div>
                <span>累计经验</span>
                <strong>{{ profile?.xp || 0 }} XP</strong>
              </div>
            </div>
            <div class="profile-page__chips">
              <AChip tone="primary">{{ form.skillLevel || '未设置能力水平' }}</AChip>
              <AChip tone="soft">{{ form.learningStyle || '未设置学习方式' }}</AChip>
              <AChip tone="soft">{{ form.timePerDay || '未设置可投入时长' }}</AChip>
            </div>
          </APanel>

          <APanel eyebrow="下一步" title="快速入口">
            <div class="profile-page__links">
              <RouterLink to="/learning-paths" class="profile-page__link">查看学习路径</RouterLink>
              <RouterLink to="/learning-state" class="profile-page__link">查看学习状态</RouterLink>
              <RouterLink to="/achievements" class="profile-page__link">查看成长成就</RouterLink>
            </div>
          </APanel>
        </aside>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.profile-page { display: flex; flex-direction: column; gap: var(--space-6); }
.profile-page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.profile-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
  gap: var(--space-5);
  align-items: start;
}
.profile-page__main,
.profile-page__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.profile-page__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.profile-page__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.profile-page__field label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.profile-page__field select {
  width: 100%;
  border: 0;
  outline: none;
  background: var(--color-surface-high);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  border-bottom: 2px solid transparent;
  font: inherit;
  color: var(--color-ink);
}
.profile-page__field select:focus { border-bottom-color: var(--color-primary); background: var(--color-surface); }
.profile-page__sessions { display: flex; flex-direction: column; gap: var(--space-3); }
.profile-page__session {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.profile-page__session h3 { font-size: 0.98rem; }
.profile-page__session p { margin-top: 6px; color: var(--color-ink-soft); font-size: 0.82rem; }
.profile-page__empty-copy { color: var(--color-ink-dim); line-height: 1.7; }
.profile-page__identity-card {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}
.profile-page__avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
  color: var(--color-primary-on);
  display: grid;
  place-items: center;
  font-family: var(--font-headline);
  font-size: 1.6rem;
  font-weight: 700;
  background-size: cover;
  background-position: center;
}
.profile-page__identity-card h3 { font-size: 1.15rem; }
.profile-page__identity-card p { margin-top: 6px; color: var(--color-ink-soft); }
.profile-page__identity-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.profile-page__identity-meta div {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.profile-page__identity-meta span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}
.profile-page__identity-meta strong {
  display: block;
  margin-top: 6px;
  font-family: var(--font-headline);
  font-size: 1.1rem;
}
.profile-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.profile-page__links { display: flex; flex-direction: column; gap: 10px; }
.profile-page__link {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  color: var(--color-ink);
  transition: background var(--duration-base) var(--easing), color var(--duration-base) var(--easing);
}
.profile-page__link:hover { background: var(--color-surface-high); color: var(--color-primary); }

@media (max-width: 1100px) {
  .profile-page__stats { grid-template-columns: repeat(2, 1fr); }
  .profile-page__grid,
  .profile-page__form { grid-template-columns: 1fr; }
}
</style>
