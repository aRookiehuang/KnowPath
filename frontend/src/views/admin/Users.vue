<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AButton from '@/components/aa/AButton.vue';
import AField from '@/components/aa/AField.vue';
import AChip from '@/components/aa/AChip.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import { adminUsersApi } from '@/api/adminApi';

const loading = ref(true);
const keyword = ref('');
const users = ref<any[]>([]);
const selectedId = ref('');

const formatDateTime = (value: unknown) => {
  if (!value) return '暂无记录';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const normalizeUser = (user: any) => {
  const isAdmin = Boolean(user.isAdmin || user.role === 'admin');
  const hasRecentLogin = Boolean(user.lastLoginAt);
  return {
    ...user,
    displayName: user.name || '未命名用户',
    displayEmail: user.email || '-',
    displayLevel: user.level || user.currentLevel || '未分层',
    displayXp: user.xp || 0,
    roleTone: isAdmin ? 'primary' : 'soft',
    roleLabel: isAdmin ? '管理员' : '普通用户',
    statusLabel: user.status || (hasRecentLogin ? '活跃' : '待唤醒'),
    statusTone: user.status === 'error' ? 'danger' : hasRecentLogin ? 'success' : 'soft',
    lastSeenText: formatDateTime(user.lastLoginAt || user.updatedAt || user.createdAt),
    joinedAtText: formatDateTime(user.createdAt),
    avatar: (user.name || user.email || 'U').slice(0, 1).toUpperCase()
  };
};

const normalizedUsers = computed(() => users.value.map(normalizeUser));

const filteredUsers = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return normalizedUsers.value;
  return normalizedUsers.value.filter((user) =>
    `${user.displayName} ${user.displayEmail} ${user.displayLevel}`.toLowerCase().includes(q)
  );
});

const selectedUser = computed(() => {
  return filteredUsers.value.find((user) => String(user.id) === selectedId.value) || filteredUsers.value[0] || null;
});

const stats = computed(() => ({
  total: normalizedUsers.value.length,
  admins: normalizedUsers.value.filter((user) => user.roleLabel === '管理员').length,
  active: normalizedUsers.value.filter((user) => user.statusLabel === '活跃' || user.lastLoginAt).length,
  avgXp: normalizedUsers.value.length
    ? Math.round(normalizedUsers.value.reduce((sum, user) => sum + Number(user.displayXp || 0), 0) / normalizedUsers.value.length)
    : 0
}));

const loadUsers = async () => {
  loading.value = true;
  try {
    const result = await adminUsersApi.getUsers({ page: 1, limit: 80 });
    users.value = result.data?.items || result.data?.data || result.data || result || [];
    if (users.value.length && !selectedId.value) {
      selectedId.value = String(users.value[0].id);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(loadUsers);
</script>

<template>
  <div class="admin-users">
    <APageHeader
      eyebrow="用户管理"
      title="平台用户"
      description="集中查看平台用户规模、角色结构、活跃状态与个人学习成长信息。"
    >
      <template #actions>
        <AButton variant="secondary" icon="refresh" @click="loadUsers">重新加载</AButton>
      </template>
    </APageHeader>

    <section class="admin-users__stats">
      <AStatTile label="用户总数" :value="stats.total" icon="groups" tone="accent" hint="当前纳入后台管理的账户数" />
      <AStatTile label="管理员" :value="stats.admins" icon="shield_person" hint="具备平台维护权限的账号" />
      <AStatTile label="活跃用户" :value="stats.active" icon="bolt" hint="最近有登录或操作记录" />
      <AStatTile label="平均 XP" :value="stats.avgXp" icon="insights" tone="muted" hint="反映整体学习参与度" />
    </section>

    <section class="admin-users__grid admin-users__grid--top">
      <APanel eyebrow="用户名录" title="用户列表" description="支持按姓名、邮箱和等级快速筛选。">
        <div class="admin-users__toolbar">
          <AField v-model="keyword" label="关键词" placeholder="搜索用户名、邮箱或等级" />
          <div class="admin-users__toolbar-meta">
            <AChip tone="soft">{{ filteredUsers.length }} 条结果</AChip>
            <AChip tone="primary">{{ stats.admins }} 位管理员</AChip>
          </div>
        </div>

        <ALoading v-if="loading" label="正在加载用户列表..." />

        <div v-else-if="filteredUsers.length" class="admin-users__table-wrap">
          <table class="admin-users__table">
            <thead>
              <tr>
                <th>用户</th>
                <th>角色</th>
                <th>等级</th>
                <th>XP</th>
                <th>最近活跃</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                :class="{ 'admin-users__row--active': String(user.id) === String(selectedUser?.id) }"
                tabindex="0"
                @click="selectedId = String(user.id)"
                @keydown.enter="selectedId = String(user.id)"
                @keydown.space.prevent="selectedId = String(user.id)"
              >
                <td>
                  <div class="admin-users__identity admin-users__identity--table">
                    <div class="admin-users__avatar admin-users__avatar--sm">{{ user.avatar }}</div>
                    <div>
                      <strong>{{ user.displayName }}</strong>
                      <p>{{ user.displayEmail }}</p>
                    </div>
                  </div>
                </td>
                <td><AChip :tone="user.roleTone">{{ user.roleLabel }}</AChip></td>
                <td>{{ user.displayLevel }}</td>
                <td>{{ user.displayXp }}</td>
                <td>{{ user.lastSeenText }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <AEmpty v-else icon="groups" title="没有匹配用户" description="请尝试调整搜索条件。" />
      </APanel>

      <aside class="admin-users__side">
        <APanel eyebrow="重点观察" title="运营提示">
          <div class="admin-users__summary-card">
            <div>
              <span>用户结构</span>
              <strong>优先关注高 XP 用户与新用户之间的转化差异</strong>
            </div>
            <div>
              <span>活跃判断</span>
              <strong>最近登录时间可用于识别沉默用户与召回对象</strong>
            </div>
          </div>
        </APanel>
      </aside>
    </section>

    <section class="admin-users__grid">
      <APanel eyebrow="用户档案" title="用户详情">
        <div v-if="selectedUser" class="admin-users__profile">
          <div class="admin-users__identity">
            <div class="admin-users__avatar">{{ selectedUser.avatar }}</div>
            <div>
              <div class="admin-users__heading">
                <h3>{{ selectedUser.displayName }}</h3>
                <AChip :tone="selectedUser.roleTone">{{ selectedUser.roleLabel }}</AChip>
              </div>
              <p>{{ selectedUser.displayEmail }}</p>
            </div>
          </div>

          <div class="admin-users__profile-grid">
            <div>
              <span>等级</span>
              <strong>{{ selectedUser.displayLevel }}</strong>
            </div>
            <div>
              <span>经验值</span>
              <strong>{{ selectedUser.displayXp }}</strong>
            </div>
            <div>
              <span>最近活跃</span>
              <strong>{{ selectedUser.lastSeenText }}</strong>
            </div>
            <div>
              <span>加入时间</span>
              <strong>{{ selectedUser.joinedAtText }}</strong>
            </div>
          </div>
        </div>
        <AEmpty v-else compact icon="person" title="未选择用户" description="从上方列表中选择一位用户即可查看详情。" />
      </APanel>

      <APanel eyebrow="状态标签" title="当前状态">
        <div v-if="selectedUser" class="admin-users__status-block">
          <div class="admin-users__status-row">
            <span>账户状态</span>
            <AChip :tone="selectedUser.statusTone">{{ selectedUser.statusLabel }}</AChip>
          </div>
          <div class="admin-users__status-row">
            <span>角色定位</span>
            <AChip :tone="selectedUser.roleTone">{{ selectedUser.roleLabel }}</AChip>
          </div>
          <p class="admin-users__status-copy">
            建议结合最近活跃时间、XP 变化和当前等级，对沉默用户进行召回，对高活跃用户提供更明确的成长激励。
          </p>
        </div>
        <AEmpty v-else compact icon="insights" title="暂无状态信息" description="选择用户后可查看其状态标签。" />
      </APanel>
    </section>
  </div>
</template>

<style scoped>
.admin-users { display: flex; flex-direction: column; gap: var(--space-6); }

.admin-users__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.admin-users__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 1fr);
  gap: var(--space-5);
}

.admin-users__grid--top {
  align-items: start;
}

.admin-users__toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.admin-users__toolbar :deep(.aa-field) {
  max-width: 380px;
}

.admin-users__toolbar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.admin-users__table-wrap { overflow: auto; }

.admin-users__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.admin-users__table th,
.admin-users__table td {
  padding: 16px 14px;
  border-bottom: 1px solid rgba(172, 179, 183, 0.16);
  text-align: left;
  vertical-align: middle;
}

.admin-users__table th {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.admin-users__table tbody tr {
  cursor: pointer;
  transition: background var(--duration-base) var(--easing);
}

.admin-users__table tbody tr:hover,
.admin-users__row--active {
  background: rgba(248, 250, 253, 0.96);
}

.admin-users__identity {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-users__identity--table {
  gap: 10px;
}

.admin-users__identity--table strong {
  display: block;
  font-size: 0.92rem;
}

.admin-users__identity--table p {
  margin-top: 4px;
  color: var(--color-ink-soft);
  font-size: 0.82rem;
}

.admin-users__avatar {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(44, 94, 167, 0.14), rgba(126, 165, 230, 0.2));
  color: var(--color-primary);
  font-family: var(--font-headline);
  font-weight: 700;
}

.admin-users__avatar--sm {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  font-size: 0.88rem;
}

.admin-users__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.admin-users__heading h3 {
  font-size: 1.08rem;
}

.admin-users__profile p {
  margin-top: 8px;
  color: var(--color-ink-soft);
}

.admin-users__profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.admin-users__profile-grid div,
.admin-users__summary-card div,
.admin-users__status-block {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.admin-users__summary-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.admin-users__profile-grid span,
.admin-users__summary-card span {
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  font-weight: 700;
}

.admin-users__profile-grid strong,
.admin-users__summary-card strong {
  display: block;
  margin-top: 8px;
  line-height: 1.6;
}

.admin-users__status-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-users__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.admin-users__status-row span {
  color: var(--color-ink-dim);
  font-size: 0.88rem;
}

.admin-users__status-copy {
  color: var(--color-ink-dim);
  line-height: 1.7;
  margin: 0;
}

@media (max-width: 1080px) {
  .admin-users__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-users__grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .admin-users__stats { grid-template-columns: 1fr; }
  .admin-users__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .admin-users__toolbar :deep(.aa-field) {
    max-width: none;
  }
  .admin-users__profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
