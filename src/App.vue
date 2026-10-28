<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import TabBar from "./components/TabBar.vue"

const route = useRoute()
const title = computed(() => route.meta.title || "gym")
</script>

<template>
  <div class="shell">
    <header class="nav">{{ title }}</header>
    <main class="main">
      <router-view />
    </main>
    <TabBar />
  </div>
</template>
