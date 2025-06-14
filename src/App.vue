<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Yolo from './views/Yolo.vue'
import NavMenu from './components/NavMenu.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { computed } from 'vue'
import { useRoles } from './composables/useRoles'

const { logout, isAuthenticated } = useAuth0()
const { roles } = useRoles()

const isStaff = computed(() => roles.value.includes('staff'))

const handleLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin + '/login' } })
}
</script>

<template>
  <div id="app">
    <nav v-if="isAuthenticated">
      <router-link to="/">ホーム</router-link> |
      <router-link to="/clothes-classification">制服分類</router-link> |
      <router-link to="/music-costume-classification">衣装分類</router-link> |
      <router-link to="/new-image">新規画像登録</router-link>
      | <router-link to="/profile">プロフィール</router-link>
      <span v-if="isStaff">
        | <router-link to="/annotations">アノテーション一覧</router-link> |
        <router-link to="/training">学習</router-link>
      </span>
      | <a href="#" @click.prevent="logout">ログアウト</a>
    </nav>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}

nav a:hover {
  color: #42b983;
}
</style>
