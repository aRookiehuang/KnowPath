<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import AppAuthLayout from '@/components/aa/AppAuthLayout.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';

const router = useRouter();
const userStore = useUserStore();

const name = ref('');
const password = ref('');
const confirm = ref('');
const agree = ref(true);
const formError = ref('');
const loading = ref(false);

const submit = async () => {
  formError.value = '';
  if (!name.value.trim() || !password.value) {
    formError.value = '请填写账号与密码';
    return;
  }
  if (password.value.length < 6) {
    formError.value = '密码至少 6 位';
    return;
  }
  if (password.value !== confirm.value) {
    formError.value = '两次输入的密码不一致';
    return;
  }
  if (!agree.value) {
    formError.value = '请先阅读并同意服务条款';
    return;
  }
  loading.value = true;
  try {
    await userStore.register(name.value.trim(), password.value);
    ElMessage.success('注册成功，已自动登录');
    router.push('/dashboard');
  } catch (err: any) {
    formError.value = err?.message || '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AppAuthLayout
    eyebrow="Register / 创建凭证"
    title="构建你的学术图谱"
    subtitle="加入结构化的研究工作台，在自主、真诚与数据严谨中探索未知的边界。"
  >
    <p class="aa-eyebrow register__eyebrow">创建访问凭证</p>
    <h2 class="register__heading">生成你的研究员账号</h2>
    <p class="register__hint">完成登记即可建立专属研究环境，进入目标澄清 → 路径生成 → 任务追踪的完整闭环。</p>

    <form class="register__form" @submit.prevent="submit">
      <AField
        v-model="name"
        label="账号名称"
        placeholder="例如 researcher_01"
        icon="person"
        :required="true"
        autocomplete="username"
      />
      <AField
        v-model="password"
        type="password"
        label="访问密钥"
        placeholder="至少 6 位，建议包含字母与数字"
        icon="lock"
        :required="true"
        autocomplete="new-password"
      />
      <AField
        v-model="confirm"
        type="password"
        label="再次确认"
        placeholder="再次输入以防止手误"
        icon="lock_reset"
        :required="true"
        autocomplete="new-password"
      />

      <label class="register__agree">
        <input type="checkbox" v-model="agree" />
        我已阅读并同意<RouterLink to="/docs" class="register__link">服务条款</RouterLink>与<RouterLink to="/docs" class="register__link">隐私协议</RouterLink>
      </label>

      <div v-if="formError" class="register__error">
        <span class="material-symbols-outlined">error</span>{{ formError }}
      </div>

      <AButton type="submit" size="lg" block :loading="loading" icon-right="arrow_forward">
        创建研究工坊
      </AButton>
    </form>

    <footer class="register__foot">
      <span>ACADEMIC IDENTITY · v2.0</span>
      <span>已有账号？<RouterLink to="/login" class="register__link">直接登录</RouterLink></span>
    </footer>
  </AppAuthLayout>
</template>

<style scoped>
.register__eyebrow { color: var(--color-ink-soft); }
.register__heading {
  font-family: var(--font-headline);
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 4px; margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.register__hint { color: var(--color-ink-dim); font-size: 0.88rem; }
.register__link { color: var(--color-primary); font-weight: 600; }
.register__link:hover { text-decoration: underline; }

.register__form { margin-top: var(--space-8); display: flex; flex-direction: column; gap: var(--space-4); }

.register__agree {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--color-ink-dim);
  line-height: 1.6;
}
.register__agree input { margin-top: 3px; accent-color: var(--color-primary); }

.register__error {
  display: flex; align-items: center; gap: 6px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: 0.84rem;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-danger);
}
.register__error .material-symbols-outlined { font-size: 16px !important; }

.register__foot {
  margin-top: var(--space-10);
  display: flex; justify-content: space-between; gap: 6px; align-items: center;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(172, 179, 183, 0.25);
}
</style>
