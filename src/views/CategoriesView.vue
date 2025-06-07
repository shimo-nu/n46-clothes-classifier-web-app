<template>
  <div class="categories-container">
    <h1>カテゴリ一覧</h1>
    <div v-if="loading" class="loading">
      読み込み中...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="categories-grid">
      <div v-for="category in categories" :key="category.id" class="category-card">
        <h2>{{ category.name }}</h2>
        <div class="subcategories-list">
          <div v-for="subCategory in category.subCategories" 
               :key="subCategory.id" 
               class="subcategory-item">
            {{ subCategory.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { categoriesApi, type Category } from '@/api/categories';

const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const { getAccessTokenSilently, isAuthenticated } = useAuth0();

const fetchCategories = async () => {
  try {
    loading.value = true;
    error.value = null;
    let token;
    if (isAuthenticated.value) {
      token = await getAccessTokenSilently();
    }
    const result = await categoriesApi.getCategories(token);
    console.log('Fetched categories:', JSON.stringify(result, null, 2));
    // 各カテゴリのsubCategoriesの存在を確認
    result.forEach((category, index) => {
      console.log(`Category ${index}:`, {
        id: category.id,
        name: category.name,
        hasSubCategories: !!category.subCategories,
        subCategoriesLength: category.subCategories?.length || 0,
        subCategories: category.subCategories
      });
    });
    categories.value = result;
    } catch (e) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = 'カテゴリの取得に失敗しました';
    }
    console.error('Failed to fetch categories:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #dc3545;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.category-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.subcategories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.subcategory-item {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  transition: background-color 0.2s;
}

.subcategory-item:hover {
  background: #e9ecef;
  cursor: pointer;
}
</style>
