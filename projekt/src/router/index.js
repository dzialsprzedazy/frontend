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
      path: "/kontakt",
      name: "kontakt",
      component: () => import("../views/ContactView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/Dashboard/DashboardView.vue"),
    },
    {
      path: "/admin/cennik",
      name: "adminCennik",
      component: () => import("../views/admin/PriceList/PricesView.vue"),
    },
    {
      path: "/admin/cennik/edit/:id",
      name: "EditTicket",
      component: () => import("../views/admin/PriceList/EditPriceView.vue"),
    },
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
})

export default router
