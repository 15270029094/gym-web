<script setup>
import { useRoute } from "vue-router"

const route = useRoute()
const tabs = [
  { to: "/sport", text: "运动", icon: "/images/tab/sport.png", active: "/images/tab/sport-active.png" },
  { to: "/diet", text: "饮食", icon: "/images/tab/diet.png", active: "/images/tab/diet-active.png" },
  { to: "/body", text: "body", icon: "/images/tab/body.png", active: "/images/tab/body-active.png" },
  { to: "/mine", text: "我的", icon: "/images/tab/mine.png", active: "/images/tab/mine-active.png" }
]
</script>

<template>
  <nav class="tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab-item"
      active-class="active"
    >
      <img class="tab-icon" :src="route.path === tab.to ? tab.active : tab.icon" alt="" />
      <span>{{ tab.text }}</span>
    </router-link>
  </nav>
</template>
