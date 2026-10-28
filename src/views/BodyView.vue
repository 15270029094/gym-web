<script setup>
import { ref } from "vue"
import { SomakineViewer } from "@somakine/vue"
import { bodyParts3DMusculoskeletal } from "@somakine/bodyparts3d-musculoskeletal"
import { resolveBodyAsset } from "../body/assets.js"

const layers = [
  { id: "all", name: "全部", type: null, blurb: "显示全部肌肉骨骼结构。拖动旋转，点击结构查看名称" },
  { id: "muscle", name: "肌肉", type: "muscle", blurb: "只显示肌肉" },
  { id: "bone", name: "骨骼", type: "bone", blurb: "只显示骨骼" },
  { id: "joint", name: "关节", type: "joint", blurb: "只显示关节" },
  { id: "ligament", name: "韧带", type: "ligament", blurb: "只显示韧带" },
  { id: "tendon", name: "肌腱", type: "tendon", blurb: "只显示肌腱" }
]

const typeNames = {
  muscle: "肌肉",
  bone: "骨骼",
  joint: "关节",
  ligament: "韧带",
  tendon: "肌腱"
}

const viewer = ref(null)
const activeLayer = ref("all")
const title = ref("肌肉骨骼")
const detail = ref(layers[0].blurb)
const status = ref("正在加载模型")
const ready = ref(false)

function sidePrefix(side) {
  if (side === "left") return "左侧"
  if (side === "right") return "右侧"
  if (side === "bilateral") return "双侧"
  return ""
}

function applyLayer() {
  const layer = layers.find((item) => item.id === activeLayer.value)
  if (!layer || !viewer.value || !viewer.value.isReady) {
    return
  }
  viewer.value.setLayer(layer.type)
}

function selectLayer(id) {
  const layer = layers.find((item) => item.id === id)
  if (!layer) {
    return
  }
  activeLayer.value = id
  title.value = layer.name
  detail.value = layer.blurb
  applyLayer()
}

function onSelection(selection) {
  const kind = typeNames[selection.structure.type] || ""
  title.value = sidePrefix(selection.side) + selection.label
  detail.value = kind
}

function onState(state) {
  if (state.phase === "ready") {
    ready.value = true
    status.value = ""
    applyLayer()
    return
  }
  if (state.phase === "error") {
    status.value = state.message || "模型加载失败"
    return
  }
  if (state.message) {
    status.value = state.message
  }
}

function onProgress(progress) {
  if (!progress || !progress.total || ready.value) {
    return
  }
  status.value = "正在加载模型 " + progress.completed + "/" + progress.total
}

function onError(error) {
  status.value = error && error.message ? error.message : "模型加载失败"
}
</script>

<template>
  <section class="body-page">
    <div class="stage">
      <SomakineViewer
        ref="viewer"
        :dataset="bodyParts3DMusculoskeletal"
        :asset-resolver="resolveBodyAsset"
        accessible-label="肌肉骨骼模型"
        locale="zh-CN"
        background="#1b2330"
        @selection="onSelection"
        @state-change="onState"
        @asset-progress="onProgress"
        @error="onError"
      />
      <div class="hint">拖动旋转</div>
      <div v-if="status" class="status">{{ status }}</div>
    </div>
    <div class="layers">
      <button
        v-for="layer in layers"
        :key="layer.id"
        type="button"
        class="chip"
        :class="{ on: activeLayer === layer.id }"
        @click="selectLayer(layer.id)"
      >
        {{ layer.name }}
      </button>
    </div>
    <div class="detail">
      <h2>{{ title }}</h2>
      <p>{{ detail }}</p>
      <p class="credit">模型来自 BodyParts3D，经 Somakine 封装。BodyParts3D © Database Center for Life Science，CC BY 4.0。</p>
    </div>
  </section>
</template>
