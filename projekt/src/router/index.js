import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/products",
      name: "products",
      component: () => import("../views/Products/ProductsListView.vue"),
    },

    // ERROR 404 - MUST BE AT THE END OF THE FILE!
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
})

export default router
