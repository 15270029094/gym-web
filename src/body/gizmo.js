import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

// Somakine renders through the same shared `three` instance, so its viewer
// camera is driven by a single OrbitControls instance. We can't read that
// camera from the public handle, so we capture the controls by wrapping the
// shared prototype's `update`. `controls.object` is the live scene camera and
// `controls.target` is its focus point — enough to mirror and drive the view.
let captured = null
if (!OrbitControls.prototype.__gizmoPatched) {
  const originalUpdate = OrbitControls.prototype.update
  OrbitControls.prototype.update = function patchedUpdate(...args) {
    if (this.object && this.object.isPerspectiveCamera) {
      captured = this
    }
    return originalUpdate.apply(this, args)
  }
  OrbitControls.prototype.__gizmoPatched = true
}

// Pack coordinate system (determined empirically):
//   +Z = superior (上), -Z = inferior (下)
//   -Y = anterior (前), +Y = posterior (后)
//   +X = the body's left (左), -X = the body's right (右)
const DIRECTIONS = [
  { text: "上", axis: [0, 0, 1] },
  { text: "下", axis: [0, 0, -1] },
  { text: "前", axis: [0, -1, 0] },
  { text: "后", axis: [0, 1, 0] },
  { text: "左", axis: [1, 0, 0] },
  { text: "右", axis: [-1, 0, 0] }
]

function makeLabelTexture(text) {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  ctx.font = "bold 74px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  // Subtle shadow keeps the plain white glyph legible on the gray ball.
  ctx.shadowColor = "rgba(0,0,0,0.55)"
  ctx.shadowBlur = 6
  ctx.fillStyle = "#ffffff"
  ctx.fillText(text, size / 2, size / 2 + 4)
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  return texture
}

function makeHighlightTexture() {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 2
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  gradient.addColorStop(0, "rgba(255,206,0,0.75)")
  gradient.addColorStop(0.55, "rgba(255,206,0,0.5)")
  gradient.addColorStop(1, "rgba(255,206,0,0)")
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

export function createOrientationGizmo(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2))
  renderer.setSize(canvas.clientWidth || 96, canvas.clientHeight || 96, false)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1.6, 1.6, 1.6, -1.6, 0.1, 100)
  camera.up.set(0, 0, 1)
  camera.position.set(0, -4, 0)
  camera.lookAt(0, 0, 0)

  // Solid gray ball. Emissive keeps the whole surface at full colour so the
  // shaded side does not fade into the dark stage and look translucent.
  scene.add(new THREE.AmbientLight(0xffffff, 0.2))
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.35)
  keyLight.position.set(1.2, -1.5, 2)
  scene.add(keyLight)
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 48, 36),
    new THREE.MeshStandardMaterial({
      color: 0x9099a5,
      emissive: 0x9099a5,
      emissiveIntensity: 1,
      roughness: 0.85,
      metalness: 0,
      transparent: false,
      opacity: 1
    })
  )
  scene.add(ball)

  // Two orbit rings. Each has a thin visible torus and a fatter invisible
  // twin used only for hover picking — the visible tube is a fraction of a
  // pixel on the 96px canvas, so it cannot be hovered on its own.
  const ringGeometry = new THREE.TorusGeometry(0.98, 0.026, 12, 96)
  const hitGeometry = new THREE.TorusGeometry(0.98, 0.12, 8, 48)
  const rings = []

  function makeRing(euler) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xcfd6e2,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    })
    const visual = new THREE.Mesh(ringGeometry, material)
    visual.rotation.copy(euler)
    visual.renderOrder = 1
    scene.add(visual)
    const hit = new THREE.Mesh(hitGeometry, new THREE.MeshBasicMaterial())
    hit.rotation.copy(euler)
    hit.visible = false
    const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(hit.quaternion).normalize()
    const ring = { visual, hit, material, axis }
    hit.userData.ring = ring
    scene.add(hit)
    rings.push(ring)
  }

  makeRing(new THREE.Euler(0, 0, 0))
  makeRing(new THREE.Euler(Math.PI / 2, 0, 0))

  // Six direction labels sitting on the ball surface. depthTest keeps the ones
  // on the far hemisphere hidden behind the opaque sphere.
  for (const dir of DIRECTIONS) {
    const axis = new THREE.Vector3().fromArray(dir.axis)
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: makeLabelTexture(dir.text), depthTest: true, depthWrite: false })
    )
    sprite.position.copy(axis).multiplyScalar(0.74)
    sprite.scale.set(0.46, 0.46, 0.46)
    sprite.renderOrder = 3
    scene.add(sprite)
  }

  // Fixed screen-facing highlight. The gizmo camera always looks at the origin,
  // so a billboard sprite there stays centred on the view while the ball and
  // its labels orbit underneath. Twice the previous face marker (0.52 → 1.04).
  const highlight = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeHighlightTexture(),
      transparent: true,
      depthTest: false,
      depthWrite: false
    })
  )
  highlight.scale.set(1.04, 1.04, 1.04)
  highlight.renderOrder = 2
  scene.add(highlight)

  const worldDir = new THREE.Vector3()

  function syncToScene() {
    if (!captured || !captured.object) {
      return
    }
    captured.object.getWorldDirection(worldDir)
    if (worldDir.lengthSq() < 1e-6) {
      return
    }
    camera.position.copy(worldDir).multiplyScalar(-4)
    camera.up.copy(captured.object.up)
    camera.lookAt(0, 0, 0)
  }

  let frame = 0
  function tick() {
    frame = requestAnimationFrame(tick)
    syncToScene()
    renderer.render(scene, camera)
  }
  tick()

  // Drag on the ball orbits freely. Drag on a highlighted ring rotates only
  // around that ring's axis, so the view travels along the orbit.
  const ROTATE_SPEED = 0.01
  const offset = new THREE.Vector3()
  const forward = new THREE.Vector3()
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const prevOnPlane = new THREE.Vector3()
  const currOnPlane = new THREE.Vector3()
  const tmpCross = new THREE.Vector3()
  const plane = new THREE.Plane()
  const planePoint = new THREE.Vector3()
  const ndcOrigin = new THREE.Vector3()
  const ndcTip = new THREE.Vector3()
  let hoveredRing = null
  let dragAxis = null
  let dragging = false
  let lastX = 0
  let lastY = 0

  function orbit(dx, dy) {
    const controls = captured
    if (!controls || !controls.object) {
      return
    }
    const cam = controls.object
    const target = controls.target
    up.copy(cam.up).normalize()
    offset.copy(cam.position).sub(target)
    offset.applyAxisAngle(up, -dx)
    forward.copy(offset).negate().normalize()
    right.crossVectors(forward, up).normalize()
    offset.applyAxisAngle(right, -dy)
    cam.position.copy(target).add(offset)
    cam.lookAt(target)
    controls.update()
  }

  function rotateAroundAxis(axis, angle) {
    const controls = captured
    if (!controls || !controls.object || !angle) {
      return
    }
    const cam = controls.object
    const target = controls.target
    offset.copy(cam.position).sub(target)
    const alongView = Math.abs(offset.normalize().dot(axis))
    offset.copy(cam.position).sub(target)
    if (alongView > 0.85) {
      // This ring faces the camera, so travelling along it rolls the view.
      cam.up.applyAxisAngle(axis, angle)
    } else {
      offset.applyAxisAngle(axis, angle)
      cam.position.copy(target).add(offset)
    }
    cam.lookAt(target)
    controls.update()
  }

  function clientToNdc(clientX, clientY) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  }

  function pickRing(clientX, clientY) {
    clientToNdc(clientX, clientY)
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(rings.map((ring) => ring.hit), false)
    return hits.length > 0 ? hits[0].object.userData.ring : null
  }

  function setHover(ring) {
    if (ring === hoveredRing) {
      return
    }
    if (hoveredRing) {
      hoveredRing.material.color.set(0xcfd6e2)
      hoveredRing.material.opacity = 0.8
    }
    hoveredRing = ring
    if (hoveredRing) {
      hoveredRing.material.color.set(0xffce00)
      hoveredRing.material.opacity = 1
      canvas.style.cursor = dragging ? "grabbing" : "grab"
    } else if (!dragging) {
      canvas.style.cursor = ""
    }
  }

  function screenFallback(axis, dx, dy) {
    ndcOrigin.set(0, 0, 0).project(camera)
    ndcTip.copy(axis).project(camera)
    const rect = canvas.getBoundingClientRect()
    const px = (ndcTip.x - ndcOrigin.x) * 0.5 * rect.width
    const py = (ndcOrigin.y - ndcTip.y) * 0.5 * rect.height
    const len = Math.hypot(px, py)
    if (len < 6) {
      return dx * ROTATE_SPEED
    }
    return (dx * (-py / len) + dy * (px / len)) * ROTATE_SPEED
  }

  function angleAroundAxis(axis, x0, y0, x1, y1) {
    plane.setFromNormalAndCoplanarPoint(axis, planePoint)
    clientToNdc(x0, y0)
    raycaster.setFromCamera(pointer, camera)
    const hit0 = raycaster.ray.intersectPlane(plane, prevOnPlane)
    clientToNdc(x1, y1)
    raycaster.setFromCamera(pointer, camera)
    const hit1 = raycaster.ray.intersectPlane(plane, currOnPlane)
    if (hit0 && hit1) {
      const len0 = prevOnPlane.length()
      const len1 = currOnPlane.length()
      if (len0 > 0.2 && len1 > 0.2 && len0 < 6 && len1 < 6) {
        prevOnPlane.multiplyScalar(1 / len0)
        currOnPlane.multiplyScalar(1 / len1)
        tmpCross.crossVectors(prevOnPlane, currOnPlane)
        const angle = Math.atan2(tmpCross.dot(axis), Math.min(1, Math.max(-1, prevOnPlane.dot(currOnPlane))))
        if (Number.isFinite(angle) && Math.abs(angle) < 0.45) {
          return angle
        }
      }
    }
    return screenFallback(axis, x1 - x0, y1 - y0)
  }

  function onCanvasMove(event) {
    if (dragging) {
      return
    }
    setHover(pickRing(event.clientX, event.clientY))
  }

  function onCanvasLeave() {
    if (dragging) {
      return
    }
    setHover(null)
  }

  function onPointerMove(event) {
    if (!dragging) {
      return
    }
    if (dragAxis) {
      rotateAroundAxis(dragAxis, angleAroundAxis(dragAxis, lastX, lastY, event.clientX, event.clientY))
    } else {
      orbit((event.clientX - lastX) * ROTATE_SPEED, (event.clientY - lastY) * ROTATE_SPEED)
    }
    lastX = event.clientX
    lastY = event.clientY
  }

  function onPointerUp(event) {
    dragging = false
    dragAxis = null
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", onPointerUp)
    setHover(pickRing(event.clientX, event.clientY))
    if (!hoveredRing) {
      canvas.style.cursor = ""
    }
  }

  function onPointerDown(event) {
    setHover(pickRing(event.clientX, event.clientY))
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    dragAxis = hoveredRing ? hoveredRing.axis : null
    if (dragAxis) {
      canvas.style.cursor = "grabbing"
    }
    event.preventDefault()
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  canvas.addEventListener("pointerdown", onPointerDown)
  canvas.addEventListener("pointermove", onCanvasMove)
  canvas.addEventListener("pointerleave", onCanvasLeave)

  function restoreUp() {
    if (!captured || !captured.object) {
      return
    }
    captured.object.up.set(0, 0, 1)
    captured.object.lookAt(captured.target)
    captured.update()
  }

  return { restoreUp, dispose() {
    cancelAnimationFrame(frame)
    canvas.removeEventListener("pointerdown", onPointerDown)
    canvas.removeEventListener("pointermove", onCanvasMove)
    canvas.removeEventListener("pointerleave", onCanvasLeave)
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", onPointerUp)
    renderer.dispose()
  } }
}
