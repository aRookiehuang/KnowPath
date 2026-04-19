<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { authAPI } from '@/api/auth';
import AppAuthLayout from '@/components/aa/AppAuthLayout.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';

const router = useRouter();
const userStore = useUserStore();

const name = ref('');
const password = ref('');
const formError = ref('');
const loading = ref(false);
const registrationEnabled = ref(true);

onMounted(async () => {
  try {
    const res = await authAPI.getRegistrationStatus();
    registrationEnabled.value = !!res.registrationEnabled;
  } catch {
    registrationEnabled.value = true;
  }
});

const submit = async () => {
  formError.value = '';
  if (!name.value.trim() || !password.value) {
    formError.value = '请填写账号与密码';
    return;
  }
  loading.value = true;
  try {
    await userStore.login(name.value.trim(), password.value);
    ElMessage.success('登录成功，欢迎回来');
    router.push('/dashboard');
  } catch (err: any) {
    formError.value = err?.message || '登录失败，请检查账号与密码';
  } finally {
    loading.value = false;
  }
};

const demoFill = () => {
  name.value = '123';
  password.value = '123456';
};
</script>

<template>
  <AppAuthLayout
    eyebrow="Login / 进入工作台"
    title="登录到你的研究工作台"
    subtitle="以结构化的探究方式继续你的学习。提交凭证即可恢复会话与进度。"
  >
    <p class="aa-eyebrow login__eyebrow">创建研究员凭证</p>
    <h2 class="login__heading">启动学习会话</h2>
    <p class="login__hint">输入你的账号与访问密钥开始工作。尚未注册？<RouterLink to="/register" class="login__link">申请访问凭证</RouterLink>。</p>

    <form class="login__form" @submit.prevent="submit">
      <AField
        v-model="name"
        label="账号 / 邮箱"
        placeholder="例如 researcher_01"
        icon="person"
        :required="true"
        autocomplete="username"
      />
      <AField
        v-model="password"
        type="password"
        label="访问密钥"
        placeholder="请输入登录密码"
        icon="lock"
        :required="true"
        autocomplete="current-password"
      />

      <div v-if="formError" class="login__error">
        <span class="material-symbols-outlined">error</span>{{ formError }}
      </div>

      <div class="login__row">
        <label class="login__remember">
          <input type="checkbox" />保持登录状态
        </label>
        <button type="button" class="login__forget">忘记密码？</button>
      </div>

      <AButton type="submit" size="lg" block :loading="loading" icon-right="arrow_forward">
        启动学习会话
      </AButton>

      <button type="button" class="login__demo" @click="demoFill">
        <span class="material-symbols-outlined">auto_awesome</span>使用演示账号 (123 / 123456)
      </button>
    </form>

    <footer class="login__foot">
      <span>CENTRAL SYSTEM OPERATIONAL</span>
      <span v-if="registrationEnabled">· 还没有账号？<RouterLink to="/register" class="login__link">注册</RouterLink></span>
    </footer>
  </AppAuthLayout>
</template>

<style scoped>
.login__eyebrow { color: var(--color-ink-soft); }
.login__heading {
  font-family: var(--font-headline);
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 4px;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.login__hint { color: var(--color-ink-dim); font-size: 0.88rem; }
.login__link { color: var(--color-primary); font-weight: 600; }
.login__link:hover { text-decoration: underline; }

.login__form {
  margin-top: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login__error {
  display: flex; align-items: center; gap: 6px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: 0.84rem;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-danger);
}
.login__error .material-symbols-outlined { font-size: 16px !important; }

.login__row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.82rem;
  color: var(--color-ink-dim);
}
.login__remember { display: inline-flex; gap: 6px; align-items: center; cursor: pointer; }
.login__remember input { accent-color: var(--color-primary); }
.login__forget { background: transparent; border: 0; color: var(--color-primary); cursor: pointer; font-weight: 500; }

.login__demo {
  display: inline-flex; align-items: center; gap: 6px; justify-content: center;
  background: transparent; border: 0;
  color: var(--color-ink-dim);
  font-size: 0.82rem;
  padding: 8px;
  cursor: pointer;
}
.login__demo:hover { color: var(--color-primary); }
.login__demo .material-symbols-outlined { font-size: 16px !important; }

.login__foot {
  margin-top: var(--space-10);
  display: flex; gap: 6px;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(172, 179, 183, 0.25);
}
</style>
