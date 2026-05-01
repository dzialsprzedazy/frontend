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
    {
      path: "/products/:id",
      name: "productDetails",
      component: () => import("../views/Products/ProductDetailsView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Account/LoginView.vue"),
      // meta.requiresGuest means that the page is only for GUESTS (not logged in users)
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Account/RegisterView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/admin",
      name: "adminProfile",
      component: () => import("../views/Admin/AdminProfileView.vue"),
      // meta.requiresAuth means that the page is only for AUTHENTICATED users (logged in users)
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/discount-codes",
      name: "adminDiscountCodes",
      component: () => import("../views/Admin/DiscountCodesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/product-management",
      name: "adminProductManagement",
      component: () => import("../views/Admin/ProductManagementView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/user-management",
      name: "adminUserManagement",
      component: () => import("../views/Admin/UserManagementView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/Account/UserProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/forgot-password",
      name: "forgotPassword",
      component: () => import("../views/Account/ForgotPasswordView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/reset-password",
      name: "resetPassword",
      component: () => import("../views/Account/ResetPasswordView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/ContactView.vue"),
    },
    // ERROR 404 - MUST BE AT THE END OF THE FILE!
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  // If the route requires authentication and there is no token, redirect to login
  if (to.meta.requiresAuth && !token) {
    next("/login")
  }
  // Or if the route is for guests but there is a token, redirect to profile (or home)
  else if (to.meta.requiresGuest && token) {
    next("/profile")
  }
  // Otherwise, allow the navigation
  else {
    next()
  }
})

export default router
