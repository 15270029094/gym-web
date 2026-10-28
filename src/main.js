import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"
import "./styles.css"
import SportView from "./views/SportView.vue"
import DietView from "./views/DietView.vue"
import BodyView from "./views/BodyView.vue"
import MineView from "./views/MineView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/sport" },
    { path: "/sport", name: "sport", component: SportView, meta: { title: "运动" } },
    { path: "/diet", name: "diet", component: DietView, meta: { title: "饮食" } },
    { path: "/body", name: "body", component: BodyView, meta: { title: "body" } },
    { path: "/mine", name: "mine", component: MineView, meta: { title: "我的" } }
  ]
})

router.afterEach((to) => {
  document.title = to.meta.title ? String(to.meta.title) : "gym"
})

createApp(App).use(router).mount("#app")
