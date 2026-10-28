<script setup>
import { useRoute } from "vue-router"

const route = useRoute()
const tabs = [
  { to: "/home", text: "首页", icon: "/images/tab/home.svg", active: "/images/tab/home-active.svg" },
  { to: "/sport", text: "运动", icon: "/images/tab/sport.png", active: "/images/tab/sport-active.png" },
  { to: "/diet", text: "饮食", icon: "/images/tab/diet.png", active: "/images/tab/diet-active.png" },
  { to: "/body", text: "图解", icon: "/images/tab/body.png", active: "/images/tab/body-active.png" },
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
      <span
        class="tab-icon"
        :style="{
          maskImage: `url(${route.path === tab.to ? tab.active : tab.icon})`,
          WebkitMaskImage: `url(${route.path === tab.to ? tab.active : tab.icon})`
        }"
      ></span>
      <span>{{ tab.text }}</span>
    </router-link>
  </nav>
</template>
