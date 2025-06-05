<template>
  <v-overlay
    :model-value="isLoading"
    class="align-center justify-center"
    persistent
  >
    <v-card class="loading-container pa-4">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="8"
      ></v-progress-circular>
      <h2 class="loading-text mt-4">モデルを読み込み中...</h2>
      <p class="loading-subtext">しばらくお待ちください</p>
    </v-card>
  </v-overlay>
</template>

<script>
export default {
  props: {
    isLoading: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>
.loading-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
}

.loading-text {
  color: #1976d2;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.loading-subtext {
  color: #666;
  font-size: 1rem;
}
</style>
