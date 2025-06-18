<template>
  <div>
    <h1>ユーザー情報</h1>
    <div v-if="user">
      <p><strong>名前:</strong> {{ user.name }}</p>
      <p><strong>メール:</strong> {{ user.email }}</p>
      <p><strong>ロール:</strong></p>
      <ul>
        <li v-for="role in roles" :key="role">{{ role }}</li>
      </ul>
      <p><strong>残りアノテーション回数:</strong> {{ annotationRemaining }}</p>
      <p><strong>残り検出回数:</strong> {{ detectionRemaining }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRoles } from '../composables/useRoles'

const { user } = useAuth0()
const { roles } = useRoles()

console.log('[ProfileView] user', user.value)
console.log('[ProfileView] roles', roles.value)

// TODO: Replace with values from backend when available
const annotationRemaining = ref('--')
const detectionRemaining = ref('--')
</script>
