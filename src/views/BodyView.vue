<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { SomakineViewer } from "@somakine/vue"
import { bodyParts3DMusculoskeletal } from "@somakine/bodyparts3d-musculoskeletal"
import { resolveBodyAsset } from "../body/assets.js"
import { createOrientationGizmo } from "../body/gizmo.js"

const layers = [
  { id: "all", name: "全部", type: null, blurb: "显示全部肌肉骨骼结构。拖动旋转，点击结构查看名称" },
  { id: "muscle", name: "肌肉", type: "muscle", blurb: "只显示肌肉" },
  { id: "bone", name: "骨骼", type: "bone", blurb: "只显示骨骼" },
  { id: "joint", name: "关节", type: "joint", blurb: "关节连接相邻骨骼。切到活动模式后拖动关节可移动查看" },
  { id: "ligament", name: "韧带", type: "ligament", blurb: "韧带连接骨与骨、稳定关节。切到活动模式后拖动韧带可移动查看" },
  { id: "tendon", name: "肌腱", type: "tendon", blurb: "肌腱把肌肉连到骨上。切到活动模式后拖动可移动查看" }
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
const mode = ref("rotate")
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

function applyMode() {
  if (!viewer.value || !viewer.value.isReady) {
    return
  }
  viewer.value.setInteractionMode(mode.value)
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
  if (layer.type === null && viewer.value && viewer.value.isReady) {
    viewer.value.resetView()
    if (gizmoApi) {
      gizmoApi.restoreUp()
    }
  }
}

function setMode(next) {
  mode.value = next
  applyMode()
}

function resetModel() {
  if (!viewer.value || !viewer.value.isReady) {
    return
  }
  viewer.value.resetStructureOffsets()
  viewer.value.resetView()
  if (gizmoApi) {
    gizmoApi.restoreUp()
  }
}

function onSelection(selection) {
  const kind = typeNames[selection.structure.type] || ""
  title.value = sidePrefix(selection.side) + selection.label
  detail.value = mode.value === "move" ? kind + " · 拖动可移动" : kind
}

function onTransform(change) {
  if (change && change.structureId) {
    detail.value = "结构已移动。点击复位恢复原位"
  }
}

function onState(state) {
  if (state.phase === "ready") {
    ready.value = true
    status.value = ""
    applyLayer()
    applyMode()
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

const gizmo = ref(null)
let gizmoApi = null
onMounted(() => {
  if (gizmo.value) {
    gizmoApi = createOrientationGizmo(gizmo.value)
  }
})
onBeforeUnmount(() => {
  if (gizmoApi) {
    gizmoApi.dispose()
    gizmoApi = null
  }
})
</script>

<template>
  <section class="body-page">
    <div class="stage">
      <SomakineViewer
        ref="viewer"
        :dataset="bodyParts3DMusculoskeletal"
        :asset-resolver="resolveBodyAsset"
        :initial-view-up="[0, 0, 1]"
        :initial-view-direction="[0, -1, 0]"
        accessible-label="肌肉骨骼模型"
        locale="zh-CN"
        background="#1b2330"
        @selection="onSelection"
        @structure-transform-change="onTransform"
        @state-change="onState"
        @asset-progress="onProgress"
        @error="onError"
      />
      <canvas ref="gizmo" class="gizmo" width="96" height="96" title="移到轨道上变黄，拖动沿轨道转动"></canvas>
      <div class="hint">{{ mode === "move" ? "拖动结构可移动，右键拖动旋转" : "拖动旋转，点击查看名称" }}</div>
      <div v-if="status" class="status">{{ status }}</div>
    </div>
    <div class="toolbar">
      <div class="seg">
        <button
          type="button"
          class="seg-item"
          :class="{ on: mode === 'rotate' }"
          @click="setMode('rotate')"
        >
          旋转
        </button>
        <button
          type="button"
          class="seg-item"
          :class="{ on: mode === 'move' }"
          @click="setMode('move')"
        >
          活动
        </button>
      </div>
      <button type="button" class="reset" @click="resetModel">复位</button>
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
