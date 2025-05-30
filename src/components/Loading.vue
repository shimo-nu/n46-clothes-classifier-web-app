<template>
  <v-container>
    <v-row justify="center" align="center" style="height: 100vh;">
      <!-- ローディングスピナー -->
      <v-col cols="12" v-if="isLoading" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p>ロード中...</p>
      </v-col>

      <!-- ローディングが終わった後のコンテンツ -->
      <v-col cols="12" v-else>
        <v-card>
          <v-card-title>コンテンツが表示されました！</v-card-title>
          <v-card-subtitle>ここにメインコンテンツが表示されます。</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
.text-center {
  text-align: center;
}
</style>
