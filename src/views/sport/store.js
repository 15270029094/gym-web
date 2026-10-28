import { defineStore } from "pinia"
import { ref } from "vue"

export const useSportStore = defineStore("sport", () => {
  const menu = ref("part")

  function setMenu(id) {
    menu.value = id
  }

  return { menu, setMenu }
})
