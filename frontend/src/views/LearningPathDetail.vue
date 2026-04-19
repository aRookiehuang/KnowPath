<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import AProgressBar from '@/components/aa/AProgressBar.vue';
import AEmpty from '@/components/aa/AEmpty.vue';
import ALoading from '@/components/aa/ALoading.vue';
import AErrorState from '@/components/aa/AErrorState.vue';
import { learningAPI, type LearningPath, type Task } from '@/api/learning';

const route = useRoute();
const path = ref<LearningPath | null>(null);
const loading = ref(true);
const error = ref('');

const stages = computed(() => {
  if (!path.value) return [];
  const source = path.value.stages || path.value.milestones || path.value.weeks || [];
  return source.map((stage: any, index: number) => ({
    id: stage.id,
    index: stage.stageNumber || stage.weekNumber || index + 1,
    title: stage.title || `阶段 ${index + 1}`,
    description: stage.description || stage.goal || '',
    estimatedHours: stage.estimatedHours,
    tasks: stage.subtasks || stage.tasks || []
  }));
});

const summary = computed(() => {
  const allTasks = stages.value.flatMap((s) => s.tasks);
  const completed = allTasks.filter((t) => t.status === 'completed').length;
  const total = allTasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, progress };
});

const dialogueLink = (task: Task) => {
  const query = new URLSearchParams({
    title: task.title,
    pathId: String(path.value?.id || task.pathId || task.learningPathId || '')
  });
  return `/dialogue-learn/${task.id}?${query.toString()}`;
};

const taskDetailLink = (task: Task) => {
  const query = new URLSearchParams({ title: task.title });
  const resolvedPathId = String(path.value?.id || task.pathId || task.learningPathId || '');
  if (resolvedPathId) query.set('pathId', resolvedPathId);
  return `/learn/${task.id}?${query.toString()}`;
};

const taskStatusLabel = (status?: string) => {
  if (status === 'completed') return '已完成';
  if (status === 'in_progress') return '进行中';
  return '未开始';
};
const taskStatusTone = (status?: string) => {
  if (status === 'completed') return 'success';
  if (status === 'in_progress') return 'primary';
  return 'soft';
};

const fetchDetail = async () => {
  loading.value = true;
  error.value = '';
  try {
    path.value = await learningAPI.getPathDetail(String(route.params.id));
  } catch (e: any) {
    error.value = e?.message || '获取路径详情失败';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetail);
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="Pathway detail"
      :title="path?.name || path?.title || '学习路径详情'"
      :description="path?.description || '按阶段展开任务，随时可以切换到对话学习模式。'"
    >
      <template #actions>
        <RouterLink to="/learning-paths" custom v-slot="{ navigate }">
          <AButton variant="ghost" icon="arrow_back" @click="navigate">返回列表</AButton>
        </RouterLink>
      </template>
    </APageHeader>

    <ALoading v-if="loading" label="正在同步路径详情…" />
    <AErrorState v-else-if="error" :description="error" @retry="fetchDetail" />

    <template v-else-if="path">
      <section class="path-detail__summary">
        <AStatTile label="阶段数" :value="stages.length" tone="accent" icon="layers" />
        <AStatTile label="完成任务" :value="`${summary.completed}/${summary.total}`" icon="task_alt" :hint="`完成率 ${summary.progress}%`" />
        <AStatTile label="估算时长" :value="`${path.estimatedHours || 0}h`" tone="muted" icon="schedule" />
        <AStatTile label="生成方式" :value="path.aiGenerated ? 'AI 规划' : '手动'" icon="auto_awesome" />
      </section>

      <APanel eyebrow="Overall progress" title="整体完成度">
        <AProgressBar :value="summary.progress" :max="100" height="md" />
        <p class="path-detail__progress-note">
          路径总共包含 <strong>{{ summary.total }}</strong> 个任务，已完成 <strong>{{ summary.completed }}</strong> 个。
          {{ summary.progress < 40 ? '保持节奏，继续往前推进。' : summary.progress < 80 ? '已经接近主要里程碑，保持专注。' : '马上要完成了，临门一脚最关键。' }}
        </p>
      </APanel>

      <APanel eyebrow="Stages" title="阶段与任务" description="优先进入对话学习，让 AI 带你逐步完成任务。">
        <AEmpty
          v-if="!stages.length"
          icon="stacks"
          title="路径暂无阶段"
          description="该路径的结构可能仍在生成中，可以稍后刷新再查看。"
        />

        <div v-else class="path-detail__stages">
          <section v-for="stage in stages" :key="stage.id" class="path-detail__stage">
            <header class="path-detail__stage-head">
              <AChip tone="primary">阶段 {{ stage.index }}</AChip>
              <h3>{{ stage.title }}</h3>
              <span v-if="stage.estimatedHours" class="path-detail__stage-meta">预计 {{ stage.estimatedHours }}h</span>
            </header>
            <p v-if="stage.description" class="path-detail__stage-desc">{{ stage.description }}</p>

            <div class="path-detail__tasks">
              <article v-for="task in stage.tasks" :key="task.id" class="path-detail__task">
                <div class="path-detail__task-main">
                  <div class="path-detail__task-head">
                    <h4>{{ task.title }}</h4>
                    <AChip :tone="taskStatusTone(task.status)" size="sm">{{ taskStatusLabel(task.status) }}</AChip>
                  </div>
                  <p v-if="task.description">{{ task.description }}</p>
                  <div class="path-detail__task-meta">
                    <span><span class="material-symbols-outlined">timer</span>预计 {{ task.estimatedMinutes || 0 }} 分钟</span>
                    <span v-if="task.taskType"><span class="material-symbols-outlined">label</span>{{ task.taskType }}</span>
                    <span v-if="task.completionRate !== undefined"><span class="material-symbols-outlined">target</span>完成度 {{ task.completionRate }}%</span>
                  </div>
                </div>
                <div class="path-detail__task-actions">
                  <RouterLink :to="dialogueLink(task)" custom v-slot="{ navigate }">
                    <AButton size="sm" icon="forum" @click="navigate">对话学习</AButton>
                  </RouterLink>
                  <RouterLink :to="taskDetailLink(task)" custom v-slot="{ navigate }">
                    <AButton size="sm" variant="ghost" @click="navigate">查看任务</AButton>
                  </RouterLink>
                </div>
              </article>
            </div>
          </section>
        </div>
      </APanel>
    </template>
  </AppShell>
</template>

<style scoped>
.path-detail__summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.path-detail__progress-note {
  margin-top: var(--space-3);
  color: var(--color-ink-dim);
  font-size: 0.88rem;
  line-height: 1.6;
}
.path-detail__progress-note strong { color: var(--color-primary); font-family: var(--font-headline); }

.path-detail__stages { display: flex; flex-direction: column; gap: var(--space-5); }

.path-detail__stage {
  padding: var(--space-5);
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column; gap: var(--space-3);
}
.path-detail__stage-head {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.path-detail__stage-head h3 { font-family: var(--font-headline); font-size: 1.05rem; font-weight: 700; }
.path-detail__stage-meta {
  margin-left: auto; font-size: 0.78rem; color: var(--color-ink-soft);
  font-weight: 600;
}
.path-detail__stage-desc { color: var(--color-ink-dim); font-size: 0.9rem; line-height: 1.65; max-width: 50rem; }

.path-detail__tasks { display: flex; flex-direction: column; gap: 8px; }

.path-detail__task {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-primary);
}

.path-detail__task-head { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.path-detail__task-head h4 { font-family: var(--font-headline); font-size: 0.98rem; font-weight: 600; }
.path-detail__task-main p { color: var(--color-ink-dim); font-size: 0.86rem; line-height: 1.55; margin-top: 4px; }
.path-detail__task-meta {
  display: flex; gap: var(--space-4); margin-top: 6px;
  color: var(--color-ink-soft); font-size: 0.74rem;
}
.path-detail__task-meta span { display: inline-flex; align-items: center; gap: 4px; }
.path-detail__task-meta .material-symbols-outlined { font-size: 14px !important; }

.path-detail__task-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

@media (max-width: 800px) {
  .path-detail__summary { grid-template-columns: repeat(2, 1fr); }
  .path-detail__task { grid-template-columns: 1fr; }
}
</style>
