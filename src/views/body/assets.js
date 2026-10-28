const glbModules = import.meta.glob(
  "../../../node_modules/@somakine/bodyparts3d-musculoskeletal/public/assets/**/*.glb",
  { query: "?url", import: "default", eager: true }
)

export function resolveBodyAsset(asset, signal) {
  const uri = String(asset.uri).replaceAll("\\", "/")
  const found = Object.entries(glbModules).find(([key]) => key.replaceAll("\\", "/").endsWith(uri))
  if (!found) {
    throw new Error("找不到模型 " + uri)
  }
  return fetch(found[1], { signal }).then((response) => {
    if (!response.ok) {
      throw new Error("模型加载失败 " + response.status)
    }
    return response.arrayBuffer()
  })
}
