<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import TabBar from "./components/TabBar.vue"
import { useSportStore } from "./views/sport/store.js"

const route = useRoute()
const isSport = computed(() => route.name === "sport")
const sport = useSportStore()
const headerMenus = [
  { id: "part", name: "部位" },
  { id: "gear", name: "器械" }
]
</script>

<template>
  <div class="shell">
    <header v-if="isSport" class="nav">
      <nav class="nav-menu" aria-label="训练分类">
        <button
          v-for="item in headerMenus"
          :key="item.id"
          type="button"
          :class="{ on: sport.menu === item.id }"
          @click="sport.setMenu(item.id)"
        >
          {{ item.name }}
        </button>
      </nav>
    </header>
    <main class="main">
      <router-view />
    </main>
    <TabBar />
  </div>
</template>
