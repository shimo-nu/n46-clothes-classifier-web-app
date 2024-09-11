<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Yolo from './views/Yolo.vue'
import NavMenu from './components/NavMenu.vue'
</script>

<template>
  <NavMenu />
  <div>
    <div><h1>乃木坂衣装識別</h1></div>
    <!-- <RouterLink to="/">Home</RouterLink>-->
    <router-view />
    <!-- <Yolo /> -->
  </div>

</template>

<style scoped>

</style>
