<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import TabBar from "./components/TabBar.vue"

const route = useRoute()
const title = computed(() => route.meta.title || "gym")
const inScene = computed(() => route.name === "body" && typeof route.query.part === "string")
</script>

<template>
  <div class="shell">
    <header v-if="!inScene" class="nav">{{ title }}</header>
    <main class="main">
      <router-view />
    </main>
    <TabBar />
  </div>
</template>
