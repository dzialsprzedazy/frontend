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
      path: '/login',
      name: 'login',
      component: () => import('../views/Account/LoginView.vue'),
    },

    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Account/RegisterView.vue'),
    },

    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Account/UserProfileView.vue'),
    },

    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/Account/ForgotPasswordView.vue'),
    },

    {
      path: '/reset-password',
      name: 'resetPassword',
      component: () => import('../views/Account/ResetPasswordView.vue'),
    },

    // ERROR 404 - MUST BE AT THE END OF THE FILE!
    {
      path: "/:catchAll(.*)",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
})

export default router