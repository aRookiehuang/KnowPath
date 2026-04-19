<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import AStatTile from '@/components/aa/AStatTile.vue';
import ALoading from '@/components/aa/ALoading.vue';
import { adminApiConfigApi } from '@/api/adminApi';

const loading = ref(true);
const saving = ref(false);
const testing = ref(false);

const form = reactive({
  apiUrl: '',
  apiKey: '',
  availableModels: '',
  defaultModel: '',
  defaultReasoningModel: '',
  defaultEvaluationModel: ''
});

const splitModels = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

const modelList = computed(() => splitModels(form.availableModels));
const configStats = computed(() => ({
  models: modelList.value.length,
  configuredDefaults: [form.defaultModel, form.defaultReasoningModel, form.defaultEvaluationModel].filter(Boolean).length,
  secureProtocol: form.apiUrl.startsWith('https://') ? 'HTTPS' : form.apiUrl ? '待确认' : '未设置',
  keyStatus: form.apiKey ? '已配置' : '未配置'
}));

const loadConfig = async () => {
  loading.value = true;
  try {
    const result: any = await adminApiConfigApi.getConfig();
    const data = result.data || result;
    form.apiUrl = data.apiUrl || data.baseURL || '';
    form.apiKey = data.apiKey || '';
    form.availableModels = Array.isArray(data.availableModels)
      ? data.availableModels.join('\n')
      : Array.isArray(data.models)
        ? data.models.join('\n')
        : (data.availableModels || '');
    form.defaultModel = data.defaultModel || '';
    form.defaultReasoningModel = data.defaultReasoningModel || '';
    form.defaultEvaluationModel = data.defaultEvaluationModel || data.defaultJudgeModel || '';
  } catch (err: any) {
    ElMessage.error(err?.message || '加载接口配置失败。');
  } finally {
    loading.value = false;
  }
};

const handleTest = async () => {
  if (!form.apiUrl || !form.apiKey) {
    ElMessage.warning('请先填写 API URL 和 API Key。');
    return;
  }
  testing.value = true;
  try {
    await adminApiConfigApi.testConnection({ apiUrl: form.apiUrl, apiKey: form.apiKey });
    ElMessage.success('连接测试成功。');
  } catch (err: any) {
    ElMessage.error(err?.message || '连接测试失败。');
  } finally {
    testing.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    await adminApiConfigApi.updateConfig({
      apiUrl: form.apiUrl,
      apiKey: form.apiKey,
      availableModels: modelList.value,
      defaultModel: form.defaultModel,
      defaultReasoningModel: form.defaultReasoningModel,
      defaultEvaluationModel: form.defaultEvaluationModel
    });
    ElMessage.success('平台接口配置已保存。');
  } catch (err: any) {
    ElMessage.error(err?.message || '保存接口配置失败。');
  } finally {
    saving.value = false;
  }
};

onMounted(loadConfig);
</script>

<template>
  <div class="admin-api-config">
    <APageHeader
      eyebrow="接口配置"
      title="平台模型与连接策略"
      description="统一维护模型入口、默认路由与模型清单，为整个平台提供稳定一致的接入策略。"
    >
      <template #actions>
        <AButton variant="secondary" icon="network_check" :loading="testing" @click="handleTest">测试连接</AButton>
        <AButton icon="save" :loading="saving" @click="handleSave">保存配置</AButton>
      </template>
    </APageHeader>

    <section class="admin-api-config__stats">
      <AStatTile label="已登记模型" :value="configStats.models" icon="stacks" tone="accent" hint="支持在后台统一路由" />
      <AStatTile label="默认模型项" :value="configStats.configuredDefaults" icon="tune" hint="对话 / 推理 / 评估" />
      <AStatTile label="协议状态" :value="configStats.secureProtocol" icon="lock" />
      <AStatTile label="密钥状态" :value="configStats.keyStatus" icon="key" tone="muted" />
    </section>

    <ALoading v-if="loading" label="正在加载接口配置..." />

    <div v-else class="admin-api-config__grid">
      <APanel eyebrow="连接信息" title="默认接入配置" description="这些配置会作为平台级默认值应用到大部分学习流程。">
        <div class="admin-api-config__form">
          <AField v-model="form.apiUrl" label="API URL" type="url" placeholder="https://api.openai.com/v1" />
          <AField v-model="form.apiKey" label="API Key" type="password" placeholder="sk-..." />
          <AField v-model="form.defaultModel" label="默认对话模型" placeholder="例如：gpt-4o-mini" />
          <AField v-model="form.defaultReasoningModel" label="默认推理模型" placeholder="例如：o3 / deepseek-reasoner" />
          <AField v-model="form.defaultEvaluationModel" label="默认评估模型" placeholder="例如：gpt-4.1-mini" />
          <AField v-model="form.availableModels" label="可用模型列表" placeholder="每行一个模型名，或使用逗号分隔" textarea :rows="8" />
        </div>
      </APanel>

      <aside class="admin-api-config__side">
        <APanel eyebrow="当前默认值" title="模型路由摘要">
          <div class="admin-api-config__summary-card">
            <div>
              <span>对话模型</span>
              <strong>{{ form.defaultModel || '未设置' }}</strong>
            </div>
            <div>
              <span>推理模型</span>
              <strong>{{ form.defaultReasoningModel || '未设置' }}</strong>
            </div>
            <div>
              <span>评估模型</span>
              <strong>{{ form.defaultEvaluationModel || '未设置' }}</strong>
            </div>
          </div>
        </APanel>

        <APanel eyebrow="模型注册表" title="已登记模型">
          <div v-if="modelList.length" class="admin-api-config__model-list">
            <AChip v-for="item in modelList" :key="item" tone="soft">{{ item }}</AChip>
          </div>
          <p v-else class="admin-api-config__empty-copy">当前还没有登记任何模型。</p>
        </APanel>

        <APanel eyebrow="配置建议" title="运维提示">
          <div class="admin-api-config__guide">
            <div>
              <span>连接策略</span>
              <strong>建议优先使用 HTTPS，避免在浏览器端暴露测试密钥。</strong>
            </div>
            <div>
              <span>模型拆分</span>
              <strong>推理模型与评估模型建议分离，以便控制成本与质量。</strong>
            </div>
          </div>
        </APanel>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.admin-api-config { display: flex; flex-direction: column; gap: var(--space-6); }

.admin-api-config__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.admin-api-config__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
  gap: var(--space-5);
}

.admin-api-config__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.admin-api-config__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-api-config__summary-card,
.admin-api-config__guide {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.admin-api-config__summary-card div,
.admin-api-config__guide div {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}

.admin-api-config__summary-card span,
.admin-api-config__guide span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.admin-api-config__summary-card strong,
.admin-api-config__guide strong {
  display: block;
  margin-top: 8px;
  line-height: 1.65;
}

.admin-api-config__model-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.admin-api-config__empty-copy {
  color: var(--color-ink-dim);
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .admin-api-config__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-api-config__grid,
  .admin-api-config__form { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .admin-api-config__stats { grid-template-columns: 1fr; }
}
</style>
