<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import AppAuthLayout from '@/components/aa/AppAuthLayout.vue';
import AField from '@/components/aa/AField.vue';
import AButton from '@/components/aa/AButton.vue';
import APanel from '@/components/aa/APanel.vue';
import { adminAuthApi } from '@/api/adminApi';

const router = useRouter();
const loading = ref(false);
const form = reactive({ name: '', password: '' });

const handleLogin = async () => {
  if (!form.name.trim() || !form.password.trim()) {
    ElMessage.warning('请输入管理员账号和密码。');
    return;
  }
  loading.value = true;
  try {
    const result: any = await adminAuthApi.login({ name: form.name.trim(), password: form.password });
    const payload = result.data || result;
    const token = payload.token || payload.data?.token || '';
    const user = payload.user || payload.data?.user || { name: form.name.trim() };
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    router.push('/admin/dashboard');
  } catch (err: any) {
    ElMessage.error(err?.message || '管理员登录失败，请检查账号信息。');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AppAuthLayout
    eyebrow="管理控制台"
    title="登录知途（KnowPath）管理台"
    subtitle="用于查看平台概览、维护用户、调整模型配置与审计运行日志。仅管理员可访问。"
  >
    <APanel eyebrow="管理员入口" title="后台登录" description="请输入管理员账号信息" pad="lg">
      <div class="admin-login__form">
        <AField v-model="form.name" label="管理员账号" placeholder="请输入管理员账号" autocomplete="username" />
        <AField v-model="form.password" label="密码" type="password" placeholder="请输入登录密码" autocomplete="current-password" />
      </div>
      <template #footer>
        <AButton block icon="login" :loading="loading" @click="handleLogin">登录管理台</AButton>
      </template>
    </APanel>
  </AppAuthLayout>
</template>

<style scoped>
.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
