<script setup>
import { computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { partById, parts } from "../body/catalog.js"
import BodyScene from "../components/BodyScene.vue"
import RegionGlyph from "../components/RegionGlyph.vue"

const route = useRoute()
const router = useRouter()
const part = computed(() => (typeof route.query.part === "string" ? partById(route.query.part) : null))

watch(
  part,
  (item) => {
    document.title = item ? item.name : "身体"
  },
  { immediate: true }
)

function open(id) {
  router.push({ name: "body", query: { part: id } })
}

function back() {
  router.push({ name: "body" })
}
</script>

<template>
  <BodyScene v-if="part" :part="part" @back="back" />
  <section v-else class="catalog">
    <div class="catalog-grid">
      <button v-for="item in parts" :key="item.id" type="button" class="part-card" @click="open(item.id)">
        <RegionGlyph :name="item.name" />
        <span>{{ item.name }}</span>
      </button>
    </div>
  </section>
</template>
