<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import AppShell from '@/components/aa/AppShell.vue';
import APageHeader from '@/components/aa/APageHeader.vue';
import APanel from '@/components/aa/APanel.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';
import AChip from '@/components/aa/AChip.vue';
import { getPlatformDefault, getUserApiConfig, testApiConnection, updateUserApiConfig } from '@/api/userCustom';

const loading = ref(true);
const saving = ref(false);
const testing = ref(false);
const platformDefault = ref<any>(null);

const form = reactive({
  enabled: false,
  endpoint: '',
  apiKey: '',
  chatModel: 'deepseek-chat',
  reasoningModel: 'deepseek-reasoner'
});

const activeSummary = computed(() => {
  if (!form.enabled) return '当前未启用自定义推理配置。';
  return `当前使用 ${form.endpoint || '未填写地址'} / ${form.chatModel || '未填写模型'}`;
});

const loadConfig = async () => {
  loading.value = true;
  try {
    const [platformResult, configResult] = await Promise.all([
      getPlatformDefault(),
      getUserApiConfig()
    ]);
    platformDefault.value = platformResult;
    const data = configResult?.data || configResult || {};
    form.enabled = !!data.enabled;
    form.endpoint = data.endpoint || '';
    form.apiKey = data.apiKey || '';
    form.chatModel = data.chatModel || 'deepseek-chat';
    form.reasoningModel = data.reasoningModel || 'deepseek-reasoner';
  } catch (err: any) {
    ElMessage.error(err?.message || '加载用户配置失败。');
  } finally {
    loading.value = false;
  }
};

const handleTest = async () => {
  if (!form.endpoint || !form.apiKey) {
    ElMessage.warning('请先填写接口地址和 API Key。');
    return;
  }
  testing.value = true;
  try {
    await testApiConnection({ endpoint: form.endpoint, apiKey: form.apiKey, model: form.chatModel });
    ElMessage.success('连接测试成功。');
  } catch (err: any) {
    ElMessage.error(err?.message || '连接测试失败。');
  } finally {
    testing.value = false;
  }
};

const handleSave = async () => {
  if (form.enabled && (!form.endpoint || !form.apiKey)) {
    ElMessage.warning('启用自定义配置前，请先填写完整的接口地址和 API Key。');
    return;
  }
  saving.value = true;
  try {
    await updateUserApiConfig({
      enabled: form.enabled,
      endpoint: form.endpoint,
      apiKey: form.apiKey,
      chatModel: form.chatModel,
      reasoningModel: form.reasoningModel
    });
    ElMessage.success('接口设置已保存。');
  } catch (err: any) {
    ElMessage.error(err?.message || '保存接口设置失败。');
  } finally {
    saving.value = false;
  }
};

onMounted(loadConfig);
</script>

<template>
  <AppShell>
    <APageHeader
      eyebrow="推理设置"
      title="接口设置"
      description="为当前账户配置专属模型接入信息，便于后续使用个人推理通道。"
    >
      <template #actions>
        <AButton variant="secondary" icon="refresh" @click="loadConfig">重新加载</AButton>
        <AButton icon="save" :loading="saving" @click="handleSave">保存设置</AButton>
      </template>
    </APageHeader>

    <div v-if="loading" class="user-settings-page__loading">正在加载接口配置...</div>

    <div v-else class="user-settings-page">
      <section class="user-settings-page__grid">
        <APanel eyebrow="用户配置" title="自定义推理接入" description="你可以覆盖平台默认 API 配置，为个人学习任务指定独立通道。">
          <div class="user-settings-page__switch-card">
            <div>
              <h3>启用个人 API</h3>
              <p>{{ activeSummary }}</p>
            </div>
            <label class="user-settings-page__switch">
              <input v-model="form.enabled" type="checkbox" />
              <span>{{ form.enabled ? '已启用' : '未启用' }}</span>
            </label>
          </div>

          <div class="user-settings-page__form">
            <AField v-model="form.endpoint" label="接口地址" type="url" placeholder="https://api.openai.com/v1" />
            <AField v-model="form.apiKey" label="API Key" type="password" placeholder="sk-..." />
            <AField v-model="form.chatModel" label="对话模型" placeholder="例如：gpt-4o-mini / deepseek-chat" />
            <AField v-model="form.reasoningModel" label="推理模型" placeholder="例如：o3 / deepseek-reasoner" />
          </div>

          <template #footer>
            <AButton variant="secondary" icon="network_check" :loading="testing" @click="handleTest">测试连接</AButton>
            <AButton icon="save" :loading="saving" @click="handleSave">保存设置</AButton>
          </template>
        </APanel>

        <aside class="user-settings-page__side">
          <APanel eyebrow="平台默认" title="默认接入配置">
            <div class="user-settings-page__default-list">
              <div>
                <span>默认地址</span>
                <strong>{{ platformDefault?.endpoint || platformDefault?.baseURL || '平台暂未提供默认地址' }}</strong>
              </div>
              <div>
                <span>默认对话模型</span>
                <strong>{{ platformDefault?.chatModel || platformDefault?.defaultModel || '未设置' }}</strong>
              </div>
              <div>
                <span>默认推理模型</span>
                <strong>{{ platformDefault?.reasoningModel || platformDefault?.defaultReasoningModel || '未设置' }}</strong>
              </div>
            </div>
            <div class="user-settings-page__note">
              <AChip tone="primary">使用说明</AChip>
              <p>如果你未启用个人配置，系统会自动回退到平台默认模型；启用后，相关学习任务将优先使用你的个人配置。</p>
            </div>
          </APanel>

          <APanel eyebrow="使用建议" title="配置建议">
            <ul class="user-settings-page__tips">
              <li>建议将对话模型与推理模型分开设置，以便获得更稳定的成本与效果平衡。</li>
              <li>测试连接通过后再保存，可以减少后续运行时的失败概率。</li>
              <li>如果模型不可用，优先检查接口地址、权限范围与模型名称是否正确。</li>
            </ul>
          </APanel>
        </aside>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.user-settings-page { display: flex; flex-direction: column; gap: var(--space-5); }
.user-settings-page__loading { color: var(--color-ink-dim); }
.user-settings-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: var(--space-5);
}
.user-settings-page__side { display: flex; flex-direction: column; gap: var(--space-4); }
.user-settings-page__switch-card {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}
.user-settings-page__switch-card h3 { font-size: 1rem; margin-bottom: 6px; }
.user-settings-page__switch-card p { color: var(--color-ink-dim); line-height: 1.6; }
.user-settings-page__switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  color: var(--color-ink);
  font-weight: 600;
}
.user-settings-page__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.user-settings-page__default-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.user-settings-page__default-list div {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.user-settings-page__default-list span {
  display: block;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}
.user-settings-page__default-list strong { display: block; margin-top: 8px; line-height: 1.5; }
.user-settings-page__note {
  margin-top: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.user-settings-page__note p { margin-top: 10px; color: var(--color-ink-dim); line-height: 1.65; }
.user-settings-page__tips {
  margin: 0;
  padding-left: 18px;
  color: var(--color-ink-dim);
  line-height: 1.8;
}

@media (max-width: 1080px) {
  .user-settings-page__grid,
  .user-settings-page__form { grid-template-columns: 1fr; }
}
</style>
