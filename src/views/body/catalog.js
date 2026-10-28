import { bodyParts3DMusculoskeletal as pack } from "@somakine/bodyparts3d-musculoskeletal"
import muscleDoc from "./muscles.json"

const structures = pack.structures
const zh = pack.locales.find((item) => item.locale === "zh-CN")
const labels = zh ? zh.labels : {}

function inRegion(regionId) {
  return structures.filter((item) => item.regionIds.includes(regionId))
}

function inRegions(regionIds) {
  const set = new Set(regionIds)
  return structures.filter((item) => item.regionIds.some((id) => set.has(id)))
}

function trunk(pattern) {
  return inRegion("somakine:region:spine-trunk").filter((item) => pattern.test(item.id))
}

export const parts = [
  { id: "head-neck", name: "头颈", scene: "head", list: () => inRegion("somakine:region:head-neck") },
  { id: "shoulder", name: "肩", scene: "region", list: () => inRegion("somakine:region:shoulder") },
  { id: "arm", name: "手和肘", scene: "region", list: () => inRegions(["somakine:region:elbow-forearm", "somakine:region:wrist-hand"]) },
  { id: "spine", name: "脊柱", scene: "region", list: () => trunk(/vertebra|intervertebral|sacrum|erector-spinae|multifidus|anterior-longitudinal/) },
  { id: "chest", name: "胸", scene: "region", list: () => trunk(/rib|pectoralis/) },
  { id: "abdomen", name: "腹", scene: "region", list: () => trunk(/oblique|rectus-abdominis|transversus-abdominis|lumbar/) },
  { id: "pelvis-f", name: "盆(女)", scene: "region", list: () => inRegion("somakine:region:hip-pelvis") },
  { id: "pelvis-m", name: "盆(男)", scene: "region", list: () => inRegion("somakine:region:hip-pelvis") },
  { id: "hip", name: "髋", scene: "region", list: () => inRegion("somakine:region:hip-pelvis") },
  { id: "leg", name: "膝和足", scene: "region", list: () => inRegions(["somakine:region:knee", "somakine:region:ankle-foot"]) },
  { id: "body-m", name: "全身(男)", scene: "full", list: () => structures },
  { id: "body-f", name: "全身(女)", scene: "full", list: () => structures }
]

export function partById(id) {
  return parts.find((item) => item.id === id) || null
}

export function labelOf(id) {
  return labels[id] || id
}

export function muscleLayerName(layer) {
  const found = muscleDoc.layers.find((item) => item.layer === layer)
  return found ? found.name : ""
}

const groupedNames = {
  "股四头肌": ["股直肌", "股外侧肌", "股内侧肌", "股中间肌"]
}

export function musclesForStructure(structureId) {
  const label = labelOf(structureId)
  const names = groupedNames[label]
  if (names) {
    return muscleDoc.muscles.filter((item) => names.includes(item.肌肉名称))
  }
  const matched = muscleDoc.muscles.filter((item) => item.structureId === structureId)
  if (matched.length > 0) {
    return matched
  }
  return muscleDoc.muscles.filter((item) => item.肌肉名称 === label)
}

export function idsForMuscleLayer(part, layer) {
  const ids = new Set(
    muscleDoc.muscles.filter((item) => item.layer === layer && item.structureId).map((item) => item.structureId)
  )
  return part
    .list()
    .filter((item) => ids.has(item.id))
    .map((item) => item.id)
}

export function idsFor(part, mode) {
  let list = part.list()
  if (mode === "bone") {
    list = list.filter((item) => item.type === "bone")
  } else if (mode === "muscle") {
    list = list.filter((item) => item.type === "muscle")
  } else if (mode === "joint") {
    list = list.filter((item) => item.type === "joint" || item.type === "ligament")
  } else if (mode === "tendon") {
    list = list.filter((item) => item.type === "tendon")
  }
  return list.map((item) => item.id)
}

export function searchStructures(part, query) {
  const text = query.trim().toLowerCase()
  if (!text) {
    return []
  }
  return part
    .list()
    .map((item) => ({ id: item.id, label: labelOf(item.id), type: item.type }))
    .filter((item) => item.label.toLowerCase().includes(text) || item.id.toLowerCase().includes(text))
    .slice(0, 8)
}
