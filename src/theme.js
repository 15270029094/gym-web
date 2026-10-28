import { defineStore } from "pinia"
import { ref } from "vue"

const storageKey = "gym-theme"

function systemMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const useThemeStore = defineStore("theme", () => {
  const saved = localStorage.getItem(storageKey)
  const mode = ref(saved === "light" || saved === "dark" ? saved : systemMode())

  function apply(value) {
    document.documentElement.dataset.theme = value
  }

  function init() {
    if (saved === "light" || saved === "dark") {
      apply(saved)
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      if (localStorage.getItem(storageKey)) return
      mode.value = event.matches ? "dark" : "light"
    })
  }

  function setMode(value) {
    mode.value = value
    localStorage.setItem(storageKey, value)
    apply(value)
  }

  return { mode, init, setMode }
})
