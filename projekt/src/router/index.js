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
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/task-management",
      name: "adminTaskManagement",
      component: () => import("../views/Admin/TaskManagementView.vue"),
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/discount-codes",
      name: "adminDiscountCodes",
      component: () => import("../views/Admin/DiscountCodesView.vue"),
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/product-management",
      name: "adminProductManagement",
      component: () => import("../views/Admin/ProductManagementView.vue"),
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/user-management",
      name: "adminUserManagement",
      component: () => import("../views/Admin/UserManagementView.vue"),
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/author-management",
      name: "adminAuthorManagement",
      component: () => import("../views/Admin/AuthorManagementView.vue"),
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/tag-management",
      name: "adminTagManagement",
      component: () => import("../views/Admin/TagManagementView.vue"),
      meta: {     
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/review-management",
      name: "adminReviewManagement",
      component: () => import("../views/Admin/ReviewManagementView.vue"),
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
      component: () => import("../views/Others/ContactView.vue"),
    },
    {
      path: "/wishlist",
      name: "wishlist",
      component: () => import("../views/Others/WishlistView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("../views/Others/CartView.vue"), 
    },
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (to.meta.requiresAuth && !token) {
    next("/login")
  } else if (to.meta.requiresGuest && token) {
    next("/profile")
  } else if (to.meta.requiresAdmin) {
    const isAdmin = user.roles?.includes("Admin")

    if (!isAdmin) {
      next("/")
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router