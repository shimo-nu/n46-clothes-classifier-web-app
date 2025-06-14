<template>
  <div>
    <h1>学習ページ</h1>
    <button @click="startTraining" :disabled="loading">
      {{ loading ? '学習中...' : '学習開始' }}
    </button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { annotationsApi } from '../api/annotations'
import { useAuth0 } from '@auth0/auth0-vue'

const { getAccessTokenSilently } = useAuth0()
const loading = ref(false)
const message = ref('')

const startTraining = async () => {
  try {
    loading.value = true
    const token = await getAccessTokenSilently()
    await annotationsApi.triggerTraining(token)
    message.value = '学習を開始しました'
  } catch (e) {
    console.error(e)
    message.value = '学習開始に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
