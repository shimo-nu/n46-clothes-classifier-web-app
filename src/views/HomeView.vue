<template>
  <div class="home-container">
    <h1>乃木坂あれこれ</h1>
    <div class="menu-container">
      <router-link to="/clothes-classification" class="menu-item">
        <h2>制服分類</h2>
        <p>乃木坂46の制服を分類します</p>
      </router-link>
      <router-link to="/music-costume-classification" class="menu-item">
        <h2>衣装分類</h2>
        <p>乃木坂46の衣装を分類します</p>
      </router-link>
      <router-link to="/new-image" class="menu-item">
        <h2>新規画像登録</h2>
        <p>新しい画像を登録します</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// コンポーネントのロジックは必要に応じて追加
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
}

.menu-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.menu-item {
  display: block;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.menu-item h2 {
  margin: 0 0 1rem 0;
  color: #42b983;
}

.menu-item p {
  margin: 0;
  color: #666;
}
</style> 