import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/home/HomeView.vue"
import SportView from "../views/sport/SportView.vue"
import DietView from "../views/diet/DietView.vue"
import BodyView from "../views/body/BodyView.vue"
import MineView from "../views/mine/MineView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", name: "home", component: HomeView, meta: { title: "首页" } },
    { path: "/sport", name: "sport", component: SportView, meta: { title: "运动" } },
    { path: "/diet", name: "diet", component: DietView, meta: { title: "饮食" } },
    { path: "/body", name: "body", component: BodyView, meta: { title: "图解" } },
    { path: "/mine", name: "mine", component: MineView, meta: { title: "我的" } }
  ]
})

router.afterEach((to) => {
  document.title = to.meta.title ? String(to.meta.title) : "gym"
})

export default router
