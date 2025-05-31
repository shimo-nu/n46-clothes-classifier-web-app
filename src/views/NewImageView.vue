<template>
  <div class="new-image-container">
    <h1>新規画像追加</h1>
    <div class="options-container">
      <div class="option-card" @click="navigateToNewAnnotation">
        <h2>新規アノテーション</h2>
        <p>新しい画像をアップロードしてアノテーションを行います</p>
      </div>
      <div class="option-card" @click="navigateToNewLabel">
        <h2>新規ラベル追加</h2>
        <p>新しいラベルカテゴリを追加します</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToNewAnnotation = () => {
  router.push({
    name: 'new-annotation',
    params: {
      handleImage: 'new',
      labelCategoryName: 'uniform' // デフォルトで制服カテゴリを選択
    }
  })
}

const navigateToNewLabel = () => {
  // TODO: 新規ラベル追加ページへの遷移を実装
  console.log('Navigate to new label page')
}
</script>

<style scoped>
.new-image-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.options-container {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  justify-content: center;
}

.option-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 2rem;
  width: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.option-card h2 {
  margin-bottom: 1rem;
  color: #333;
}

.option-card p {
  color: #666;
  line-height: 1.5;
}
</style> 