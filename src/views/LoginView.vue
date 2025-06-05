<template>
  <v-container class="login-container">
    <v-row justify="center" align="center" style="height: 100vh">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="login-card">
          <v-card-title class="text-center text-h4 mb-4">
            ログイン
          </v-card-title>
          <v-card-text>
            <div v-if="!isAuthenticated" class="text-center">
              <p class="mb-4">アノテーションツールを使用するにはログインが必要です。</p>
              <v-btn
                color="primary"
                size="large"
                block
                @click="login"
                :loading="isLoading"
              >
                ログイン
              </v-btn>
            </div>
            <div v-else class="text-center">
              <p class="mb-4">ログイン済みです。</p>
              <v-btn
                color="primary"
                size="large"
                block
                @click="goToHome"
              >
                ホームへ
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
const router = useRouter()

const login = () => {
  loginWithRedirect()
}

const goToHome = () => {
  router.push('/clothes-classification')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 