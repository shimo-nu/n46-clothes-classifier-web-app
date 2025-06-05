<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Yolo from './views/Yolo.vue'
import NavMenu from './components/NavMenu.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { computed } from 'vue'

const { logout, isAuthenticated, user } = useAuth0()

const handleLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin } })
}
</script>

<template>
  <NavMenu />
  <div>
    <div><h1>乃木坂あれこれ</h1></div>
    <!-- <RouterLink to="/">Home</RouterLink>-->
    <router-view />
    <!-- <Yolo /> -->
  </div>

</template>

<style scoped>

</style>
