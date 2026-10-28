<script setup>
import { useThemeStore } from "../../theme.js"
import pkg from "../../../package.json"

const theme = useThemeStore()
const nickname = "健身用户"
</script>

<template>
  <section class="mine">
    <div class="mine-profile">
      <span class="mine-avatar" aria-hidden="true">{{ nickname.slice(0, 1) }}</span>
      <strong>{{ nickname }}</strong>
    </div>
    <ul class="mine-list">
      <li>运动日记</li>
      <li class="mine-mode">
        <span>模式</span>
        <div class="mine-switch" role="group" aria-label="显示模式">
          <button type="button" :class="{ on: theme.mode === 'light' }" @click="theme.setMode('light')">日间</button>
          <button type="button" :class="{ on: theme.mode === 'dark' }" @click="theme.setMode('dark')">夜间</button>
        </div>
      </li>
      <li class="mine-version">
        <span>版本号</span>
        <span>{{ pkg.version }}</span>
      </li>
      <li>设置</li>
    </ul>
  </section>
</template>
