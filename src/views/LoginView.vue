<template>
  <div class="login-container">
    <h1>ログイン</h1>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <button @click="handleLogin" class="login-button" :disabled="isLoading">
      {{ isLoading ? 'ログイン中...' : 'ログイン' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { loginWithRedirect, isAuthenticated, error: auth0Error } = useAuth0()
const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // 認証後のリダイレクト先を設定
    const returnTo = route.query.returnTo as string || '/'
    await loginWithRedirect({
      appState: { returnTo }
    })
  } catch (e) {
    error.value = 'ログイン中にエラーが発生しました。'
    console.error('Login error:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // すでに認証済みの場合はホームページにリダイレクト
  if (isAuthenticated.value) {
    const returnTo = route.query.returnTo as string || '/'
    router.push(returnTo)
  }
  
  // Auth0からのエラーがある場合は表示
  if (auth0Error.value) {
    error.value = auth0Error.value.message || '認証エラーが発生しました。'
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #45a049;
}

.login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}
</style> 