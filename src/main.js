import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import ElementPlus from "element-plus"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import "element-plus/dist/index.css"
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
    { path: "/body", name: "body", component: BodyView, meta: { title: "身体" } },
    { path: "/mine", name: "mine", component: MineView, meta: { title: "我的" } }
  ]
})

router.afterEach((to) => {
  document.title = to.meta.title ? String(to.meta.title) : "gym"
})

createApp(App).use(router).use(ElementPlus, { locale: zhCn }).mount("#app")
