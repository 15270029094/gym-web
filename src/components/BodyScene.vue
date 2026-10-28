<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { SomakineViewer } from "@somakine/vue"
import { bodyParts3DMusculoskeletal } from "@somakine/bodyparts3d-musculoskeletal"
import { resolveBodyAsset } from "../body/assets.js"
import { createOrientationGizmo } from "../body/gizmo.js"
import { idsFor, labelOf, searchStructures } from "../body/catalog.js"

const props = defineProps({
  part: { type: Object, required: true }
})
const emit = defineEmits(["back"])

const viewer = ref(null)
const gizmo = ref(null)
const stage = ref(null)
let gizmoApi = null
let viewerReady = false
let awaitingShow = false

const status = ref("正在加载模型")
const selectedId = ref("")
const selectedLabel = ref("")
const active = ref("bone")
const menuOpen = ref(false)
const settingsOpen = ref(false)
const query = ref("")
const dark = ref(props.part.scene !== "full")
const tip = ref(props.part.scene !== "full")
const exploded = ref(false)
const showTendon = ref(false)
const favorites = ref(loadFavorites())

const isFull = computed(() => props.part.scene === "full")
const results = computed(() => searchStructures(props.part, query.value))
const menuItems = computed(() =>
  idsFor(props.part, "all").map((id) => ({ id, label: labelOf(id) }))
)
const systems = [
  { id: "muscle", name: "肌肉+" },
  { id: "skin", name: "皮肤", missing: true },
  { id: "muscle-off", name: "肌肉-" },
  { id: "joint", name: "骨连结" },
  { id: "bone", name: "骨骼" },
  { id: "vein", name: "静脉", missing: true },
  { id: "artery", name: "动脉", missing: true },
  { id: "cns", name: "中枢", missing: true },
  { id: "nerve", name: "神经", missing: true },
  { id: "lymph", name: "淋巴", missing: true },
  { id: "organ", name: "器官", missing: true }
]

watch(
  () => props.part.id,
  () => {
    dark.value = props.part.scene !== "full"
    tip.value = props.part.scene !== "full"
    active.value = props.part.scene === "full" ? "all" : "bone"
    menuOpen.value = false
    settingsOpen.value = false
    query.value = ""
    selectedId.value = ""
    selectedLabel.value = ""
    if (viewerReady) {
      openPart()
    }
  }
)

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("gym-body-favs") || "[]")
  } catch {
    return []
  }
}

function notify(message) {
  ElMessage({ message, duration: 2200, grouping: true })
}

function openPart() {
  const handle = viewer.value
  if (!handle || !handle.isReady) {
    return
  }
  if (props.part.scene === "full") {
    awaitingShow = true
    active.value = "all"
    handle.showBody()
    return
  }
  awaitingShow = false
  active.value = "bone"
  const ids = idsFor(props.part, "bone")
  if (ids.length > 0) {
    handle.setVisible(ids)
  }
}

function ghostRightMuscles() {
  const handle = viewer.value
  if (!handle) {
    return
  }
  for (const item of props.part.list()) {
    if (item.type === "muscle" && item.laterality === "paired") {
      handle.setStructureStyle(item.id, { opacity: 0.16, transparent: true, color: "#f4f4f4" }, { side: "right" })
    }
  }
}

function showMode(mode) {
  const handle = viewer.value
  if (!handle || !handle.isReady) {
    return
  }
  active.value = mode
  const ids = idsFor(props.part, mode === "all" ? "all" : mode)
  if (ids.length === 0) {
    notify("这个部位没有对应结构")
    return
  }
  handle.setVisible(ids)
  if (props.part.scene === "full" && mode === "all") {
    awaitingShow = true
  }
}

function showMuscles() {
  showMode("muscle")
}

function hideMuscles() {
  showMode("bone")
}

function onSystem(item) {
  if (item.missing) {
    notify("当前模型没有" + item.name)
    return
  }
  if (item.id === "muscle") {
    showMuscles()
    return
  }
  if (item.id === "muscle-off") {
    hideMuscles()
    return
  }
  showMode(item.id)
}

function resetView() {
  const handle = viewer.value
  if (!handle || !handle.isReady) {
    return
  }
  handle.resetStructureOffsets()
  handle.resetView()
  if (gizmoApi) {
    gizmoApi.restoreUp()
  }
  exploded.value = false
  openPart()
}

function hideSelected() {
  const handle = viewer.value
  if (!handle || !selectedId.value) {
    notify("先点选一个结构")
    return
  }
  handle.setStructureStyle(selectedId.value, { opacity: 0, transparent: true })
  notify("已隐藏 " + selectedLabel.value)
}

function toggleExplode() {
  const handle = viewer.value
  if (!handle || !handle.isReady) {
    return
  }
  exploded.value = !exploded.value
  handle.setExplode(exploded.value ? 0.72 : 0)
}

function toggleTendons() {
  showTendon.value = !showTendon.value
  showMode(showTendon.value ? "tendon" : active.value === "tendon" ? "all" : active.value)
}

function toggleFavorite() {
  if (!selectedId.value) {
    notify("先点选一个结构")
    return
  }
  const next = favorites.value.slice()
  const index = next.indexOf(selectedId.value)
  if (index >= 0) {
    next.splice(index, 1)
    notify("已取消收藏")
  } else {
    next.push(selectedId.value)
    notify("已收藏 " + selectedLabel.value)
  }
  favorites.value = next
  localStorage.setItem("gym-body-favs", JSON.stringify(next))
}

function toggleBackground() {
  dark.value = !dark.value
}

async function toggleFullscreen() {
  const node = stage.value
  if (!node) {
    return
  }
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }
  await node.requestFullscreen()
}

function capture() {
  const canvas = viewer.value && viewer.value.canvas
  if (!canvas) {
    return
  }
  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = props.part.name + ".png"
  link.click()
}

function focusId(id) {
  const handle = viewer.value
  if (!handle || !handle.isReady) {
    return
  }
  handle.selectStructure(id)
  handle.focusStructure(id)
  menuOpen.value = false
  query.value = ""
}

function onDouble(event) {
  const handle = viewer.value
  if (!handle || !handle.isReady) {
    return
  }
  const picks = handle.pickAt(event.clientX, event.clientY)
  const pick = picks[0]
  if (!pick) {
    return
  }
  const side = pick.side === "left" || pick.side === "right" ? pick.side : undefined
  handle.focusStructure(pick.structure.id, side ? { side } : undefined)
  tip.value = false
}

function onSelection(selection) {
  selectedId.value = selection.structure.id
  selectedLabel.value = selection.label
}

function ensureOpen() {
  if (viewer.value && viewer.value.isReady) {
    viewerReady = true
    openPart()
    return
  }
  window.setTimeout(ensureOpen, 40)
}

function onState(state) {
  if (state.phase === "ready") {
    status.value = ""
    if (!viewerReady) {
      ensureOpen()
      return
    }
    if (awaitingShow && props.part.scene === "full") {
      awaitingShow = false
      ghostRightMuscles()
    }
    return
  }
  if (state.phase === "error") {
    status.value = state.message || "模型加载失败"
  }
}

function onProgress(progress) {
  if (!progress || !progress.total || viewerReady) {
    return
  }
  status.value = "正在加载模型 " + progress.completed + "/" + progress.total
}

function onError(error) {
  status.value = error && error.message ? error.message : "模型加载失败"
}

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
  <section class="scene" :class="{ dark }">
    <div ref="stage" class="scene-stage" @dblclick="onDouble">
      <SomakineViewer
        ref="viewer"
        :dataset="bodyParts3DMusculoskeletal"
        :asset-resolver="resolveBodyAsset"
        :initial-view-up="[0, 0, 1]"
        :initial-view-direction="[0, -1, 0]"
        accessible-label="肌肉骨骼模型"
        locale="zh-CN"
        :background="null"
        @selection="onSelection"
        @state-change="onState"
        @asset-progress="onProgress"
        @error="onError"
      />
      <canvas ref="gizmo" class="gizmo dock" width="96" height="96" title="移到轨道上变黄，拖动沿轨道转动"></canvas>
      <button type="button" class="back" @click="emit('back')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5L8 12l7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <p v-if="selectedLabel" class="pick">{{ selectedLabel }}</p>
      <p v-if="status" class="status">{{ status }}</p>

      <div v-if="isFull" class="rail right light-rail">
        <div class="step">
          <button type="button" @click="showMuscles"><b>+</b><span>肌肉+</span></button>
          <button type="button" @click="hideMuscles"><b>−</b><span>肌肉-</span></button>
        </div>
        <button type="button" @click="toggleFullscreen"><i class="ico">⛶</i><span>全屏</span></button>
        <button type="button" @click="hideSelected"><i class="ico">◌</i><span>速隐</span></button>
        <button type="button" @click="toggleTendons"><i class="ico">⌖</i><span>起止点</span></button>
        <button type="button" @click="notify('画笔还不能在这个模型上标注')"><i class="ico">✎</i><span>画笔</span></button>
        <button type="button" @click="notify('拖动旋转，点击结构查看名称')"><i class="ico">↖</i><span>鼠标</span></button>
        <button type="button" @click="notify('左右成对结构已同时显示')"><i class="ico">⧉</i><span>镜像</span></button>
        <button type="button" @click="capture"><i class="ico">▣</i><span>截图</span></button>
        <button type="button" @click="resetView"><i class="ico">◎</i><span>镜头</span></button>
        <button type="button" @click="settingsOpen = !settingsOpen"><i class="ico">⚙</i><span>设置</span></button>
      </div>

      <div v-else class="rail left">
        <button type="button" @click="resetView"><i class="ico">◎</i><span>复位</span></button>
        <button type="button" @click="hideSelected"><i class="ico">◌</i><span>速隐</span></button>
        <button type="button" @click="toggleExplode"><i class="ico">⊞</i><span>拆分</span></button>
        <button type="button" @click="notify('拖动旋转，双击设为旋转中心')"><i class="ico">↖</i><span>鼠标</span></button>
        <button type="button" @click="toggleFavorite"><i class="ico">{{ favorites.includes(selectedId) ? '★' : '☆' }}</i><span>收藏</span></button>
        <button type="button" @click="notify('画笔还不能在这个模型上标注')"><i class="ico">✎</i><span>画笔</span></button>
        <button type="button" @click="capture"><i class="ico">▣</i><span>截图</span></button>
        <button type="button" @click="toggleBackground"><i class="ico">▤</i><span>背景</span></button>
        <button type="button" @click="tip = true"><i class="ico">…</i><span>更多</span></button>
      </div>

      <div v-if="!isFull" class="systems">
        <button type="button" class="sys menu" @click="menuOpen = !menuOpen">菜单</button>
        <button
          v-for="item in systems"
          :key="item.id"
          type="button"
          class="sys"
          :class="{ on: !item.missing && active === item.id, off: item.missing }"
          @click="onSystem(item)"
        >
          {{ item.name }}
        </button>
      </div>

      <div v-if="settingsOpen" class="menu-panel">
        <header>
          <strong>模型说明</strong>
          <button type="button" @click="settingsOpen = false">关闭</button>
        </header>
        <p class="credit">模型来自 BodyParts3D，经 Somakine 封装。BodyParts3D © Database Center for Life Science，CC BY 4.0。全身男女入口使用同一套肌肉骨骼模型。</p>
      </div>
      <div v-if="menuOpen" class="menu-panel">
        <header>
          <strong>{{ part.name }}</strong>
          <button type="button" @click="menuOpen = false">关闭</button>
        </header>
        <button v-for="item in menuItems" :key="item.id" type="button" @click="focusId(item.id)">{{ item.label }}</button>
      </div>

      <form v-if="isFull" class="search" @submit.prevent>
        <el-input v-model="query" clearable placeholder="搜索肌肉、骨骼" />
        <ul v-if="results.length">
          <li v-for="item in results" :key="item.id">
            <button type="button" @click="focusId(item.id)">{{ item.label }}</button>
          </li>
        </ul>
      </form>

      <div v-if="tip && !isFull" class="tip">
        <p><b>小技巧：</b>双击某个解剖结构后，可将此结构设置为旋转中心。</p>
        <button type="button" @click="tip = false">×</button>
      </div>
    </div>
  </section>
</template>
