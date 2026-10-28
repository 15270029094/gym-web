<script setup>
import { computed, ref, watch } from "vue"
import { gearGroups, partGroups } from "./catalog.js"
import { useSportStore } from "./store.js"

const powerTypes = new Set(["chest", "shoulder", "back", "glute_leg"])
const recoverTypes = new Set(["stretch", "release"])
const coreTypes = new Set(["core", "arm", "upper_trap"])

const sport = useSportStore()
const shownGroups = computed(() => (sport.menu === "gear" ? gearGroups : partGroups))

function tone(id) {
  if (sport.menu !== "part") return ""
  if (powerTypes.has(id)) return "tone-power"
  if (recoverTypes.has(id)) return "tone-recover"
  if (coreTypes.has(id)) return "tone-core"
  return ""
}
const active = ref(partGroups[0].id)
const current = computed(() => shownGroups.value.find((group) => group.id === active.value) || shownGroups.value[0])

watch(
  () => sport.menu,
  () => {
    active.value = shownGroups.value[0].id
  }
)
</script>

<template>
  <section class="sport">
    <nav class="sport-tabs" aria-label="训练部位">
      <button
        v-for="group in shownGroups"
        :key="group.id"
        type="button"
        :class="[{ on: group.id === active }, tone(group.id)]"
        @click="active = group.id"
      >
        {{ group.name }}
      </button>
    </nav>
    <ul class="sport-list">
      <li v-for="item in current.items" :key="item.uuid">
        <div class="sport-photo" :style="item.url ? { backgroundImage: `url(${item.url})` } : null" aria-hidden="true"></div>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </section>
</template>
