<template>
  <div>
    <h1>アノテーション一覧</h1>
    <div v-if="annotations.length === 0">データがありません</div>
    <ul>
      <li v-for="(ann, index) in annotations" :key="index">
        <div>カテゴリ: {{ ann.labelCategory }}</div>
        <div>画像: <img :src="ann.image" alt="img" style="max-width: 200px" /></div>
        <pre>{{ ann.boxes }}</pre>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { annotationsApi, Annotation } from '../api/annotations'
import { useAuth0 } from '@auth0/auth0-vue'

const { getAccessTokenSilently } = useAuth0()
const annotations = ref<Annotation[]>([])

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()
    annotations.value = await annotationsApi.getAnnotations(token)
  } catch (e) {
    console.error(e)
  }
})
</script>
