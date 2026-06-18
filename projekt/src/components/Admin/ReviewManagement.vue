<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

import { useAlerts } from "@/components/alerts/useAlerts.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const reviews = ref([])
const isLoading = ref(false)
const fetchError = ref(null)

const searchQuery = ref("")

const showDeleteModal = ref(false)
const reviewToDelete = ref(null)

const loadReviews = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("reviews/all")
    reviews.value = response.data
  } catch (error) {
    if (typeof handleErrors === "function") {
      handleErrors(error, fetchError)
    } else {
      fetchError.value = {
        message: "Could not load reviews. Please try again.",
      }
    }
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = (id) => {
  reviewToDelete.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  reviewToDelete.value = null
}

const executeDelete = async () => {
  if (!reviewToDelete.value) return

  try {
    await api.delete(`reviews/${reviewToDelete.value}`)
    showAlert({
      type: "success",
      message: "Review deleted successfully.",
      position: "top-right",
    })
    await loadReviews()
  } catch (error) {
    showAlert({
      type: "error",
      message: "Failed to delete review.",
      position: "top-right",
    })
  } finally {
    closeDeleteModal()
  }
}

const filteredReviews = computed(() => {
  return reviews.value.filter((review) => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchProduct = review.nazwaProduktu?.toLowerCase().includes(query)
    const matchUser = review.uzytkownikLogin?.toLowerCase().includes(query)
    const matchComment = review.komentarz?.toLowerCase().includes(query)
    return matchProduct || matchUser || matchComment
  })
})

const handleLogout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  showAlert({
    type: "success",
    message: "Successfully logged out.",
    position: "top-right",
  })
  router.push("/login")
}

onMounted(loadReviews)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">Review Management</span>
        </p>
      </div>
    </div>

    <div class="container main-content">
      <aside class="sidebar">
        <div class="sidebar-card">
          <ul class="menu-list">
            <li @click="router.push('/admin')">
              <span class="icon">🏠</span
              ><span class="menu-text">Dashboard</span>
            </li>
            <li @click="router.push('/admin/task-management')">
              <span class="icon">📋</span>
              <span class="menu-text">Task Management</span>
            </li>
            <li @click="router.push('/admin/product-management')">
              <span class="icon">🛍️</span
              ><span class="menu-text">Product Management</span>
            </li>
            <li @click="router.push('/admin/author-management')">
              <span class="icon">✍️</span
              ><span class="menu-text">Author Management</span>
            </li>
            <li @click="router.push('/admin/tag-management')">
              <span class="icon menu-icon-fix"
                ><i class="fa-solid fa-hashtag"></i></span
              ><span class="menu-text">Tag Management</span>
            </li>
            <li @click="router.push('/admin/order-management')">
              <span class="icon">📦</span>
              <span class="menu-text">Order Management</span>
            </li>
            <li @click="router.push('/admin/issue-management')">
              <span class="icon">⚠️</span>
              <span class="menu-text">Issue Management</span>
            </li>
            <li @click="router.push('/admin/user-management')">
              <span class="icon">👥</span
              ><span class="menu-text">User Management</span>
            </li>
            <li class="active">
              <span class="icon">⭐</span
              ><span class="menu-text">Review Management</span>
            </li>
            <li @click="router.push('/admin/discount-codes')">
              <span class="icon">🏷️</span
              ><span class="menu-text">Discount Codes</span>
            </li>

            <li class="divider"></li>
            <li @click="handleLogout" class="logout-item">
              <span class="icon">🚪</span
              ><span class="menu-text">Sign Out</span>
            </li>
          </ul>
        </div>
      </aside>

      <main class="content-area">
        <ErrorCard
          v-if="fetchError"
          :message="fetchError.message"
          @retry="loadReviews"
        />

        <div v-else-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Fetching reviews data...</span>
        </div>

        <div v-else class="animated-content">
          <div class="modern-toolbar">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by product, user or content..."
              />
            </div>
          </div>

          <div class="catalog-section">
            <div class="catalog-header">
              <h2>
                Reviews Catalog
                <span class="count-tag">{{ filteredReviews.length }}</span>
              </h2>
            </div>

            <div class="author-list-container">
              <div v-if="filteredReviews.length === 0" class="empty-state">
                <i
                  class="fa-regular fa-comment-dots"
                  style="font-size: 3rem; color: #8a8fb9; margin-bottom: 1rem"
                ></i>
                <p>No reviews found.</p>
              </div>

              <div
                v-for="review in filteredReviews"
                :key="review.idOpinii"
                class="author-list-item review-row"
              >
                <div class="review-details-wrap">
                  <div class="review-meta">
                    <span class="review-product">{{
                      review.nazwaProduktu
                    }}</span>
                    <span class="review-user"
                      ><i
                        class="fa-solid fa-user"
                        style="font-size: 0.8rem"
                      ></i>
                      {{ review.uzytkownikLogin }}</span
                    >
                    <span class="review-stars">
                      <span
                        v-for="n in 5"
                        :key="n"
                        :style="{
                          color: n <= review.ocena ? '#ffc416' : '#eae8f5',
                        }"
                        >★</span
                      >
                    </span>
                    <span class="review-date">{{
                      new Date(review.dataWystawienia).toLocaleDateString()
                    }}</span>
                  </div>
                  <p class="review-text">"{{ review.komentarz }}"</p>
                </div>

                <div class="product-actions">
                  <button
                    class="icon-btn delete"
                    title="Delete Review"
                    @click="confirmDelete(review.idOpinii)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-box confirm-box">
          <div class="modal-header">
            <h3>Delete Review</h3>
            <button class="close-btn" @click="closeDeleteModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-text" @click="closeDeleteModal">Cancel</button>
            <button class="btn-primary btn-danger" @click="executeDelete">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

.page-wrapper {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #ffffff;
  color: #150e24;
  min-height: 100vh;
  padding-bottom: 8rem;
}

.header-banner {
  background-color: #f6f5ff;
  padding: 3.5rem 0;
  width: 100%;
  margin-bottom: 3.5rem;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-title {
  color: #151875;
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.breadcrumbs {
  color: #8a8fb9;
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
}

.dot-separator {
  margin: 0 0.6rem;
  color: #dcdcdc;
}

.active-page {
  color: #fb2e86;
  font-weight: 600;
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  align-items: start;
}

.sidebar-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #eae8f5;
}

.menu-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0;
  margin: 0;
}

.menu-list li {
  font-size: 1.05rem;
  color: #4a405c;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.menu-list li:hover:not(.divider) {
  color: #151875;
  background-color: #fbfbfe;
  transform: translateX(4px);
}

.menu-list li.active {
  color: #3f509e;
  font-weight: 600;
  background-color: #f6f5ff;
}

.icon {
  margin-right: 14px;
  font-size: 1.25rem;
  transition: transform 0.2s ease;
  display: inline-block;
}

.menu-list li:hover:not(.divider) .icon,
.menu-list li.active .icon {
  transform: scale(1.15);
}

.divider {
  height: 1px;
  background-color: #eae8f5;
  margin: 1rem 0;
  padding: 0 !important;
  cursor: default !important;
}

.logout-item {
  color: #e03a5b !important;
}
.logout-item:hover {
  background-color: #fdf2f4 !important;
}

.animated-content {
  animation: fadeSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #eae8f5;
  position: relative;
  margin-bottom: 2rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #3f509e;
  font-weight: 600;
  gap: 12px;
}

.loader-circle {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3f509e;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.modern-toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: center;
  background: white;
  padding: 1.25rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(21, 24, 117, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #f0f0f5;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-wrapper i {
  position: absolute;
  left: 15px;
  color: #8a8fb9;
}

.search-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 45px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f8f9ff;
  transition: all 0.3s;
}

.search-wrapper input:focus {
  background: white;
  border-color: #3f509e;
  box-shadow: 0 0 0 4px rgba(63, 80, 158, 0.1);
  outline: none;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.action-btn.add {
  background: #3f509e;
  color: white;
  box-shadow: 0 8px 20px rgba(63, 80, 158, 0.3);
}

.action-btn:hover {
  transform: translateY(-3px);
  opacity: 0.9;
}

.catalog-header h2 {
  font-size: 1.5rem;
  color: #151875;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.count-tag {
  font-size: 0.8rem;
  background: #e1e1f9;
  color: #3f509e;
  padding: 4px 12px;
  border-radius: 20px;
}

.author-list-container {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.author-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.author-list-item:last-child {
  border-bottom: none;
}

.author-list-item:hover {
  background-color: #f8fafc;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-initials {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: 1px solid #e2e8f0;
}

.author-name {
  font-weight: 500;
  color: #0f172a;
  font-size: 1rem;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn.edit {
  background: #f0f2f8;
  color: #3f509e;
}

.icon-btn.delete {
  background: #fff0f0;
  color: #fb2e2e;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #8a8fb9;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state img {
  width: 80px;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(21, 14, 36, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eae8f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #151875;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8a8fb9;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.close-btn:hover {
  background-color: #f6f5ff;
  color: #151875;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background-color: #fbfbfe;
  border-top: 1px solid #eae8f5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-text {
  background: transparent;
  color: #8a8fb9;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
}
.btn-text:hover {
  color: #151875;
  background-color: #f6f5ff;
}

.btn-primary {
  background-color: #3f509e;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover:not(:disabled) {
  background-color: #2e3b75;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(63, 80, 158, 0.2);
}

.confirm-box {
  max-width: 420px;
}

.confirm-text {
  font-size: 1.05rem;
  color: #4a405c;
  margin: 0;
  line-height: 1.5;
}

.btn-danger {
  background-color: #e03a5b !important;
}

.btn-danger:hover {
  background-color: #c22948 !important;
  box-shadow: 0 4px 12px rgba(224, 58, 91, 0.2) !important;
}

.review-row {
  align-items: flex-start !important;
  flex-direction: row;
}

.review-details-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 90%;
}

.review-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
}

.review-product {
  font-weight: 700;
  color: #151875;
  font-size: 1rem;
}

.review-user {
  color: #3f509e;
  font-weight: 600;
  background: #f6f5ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.review-date {
  color: #8a8fb9;
}

.review-text {
  color: #4a405c;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}
</style>
