<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

import { useAlerts } from "@/components/alerts/useAlerts.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"
import TagAddModal from "./TagAddModal.vue"
import TagEditModal from "./TagEditModal.vue"

import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const tags = ref([])
const isLoading = ref(false)
const fetchError = ref(null)

const searchQuery = ref("")

const showAddModal = ref(false)

const showEditModal = ref(false)
const tagToEdit = ref(null)

const showDeleteModal = ref(false)
const tagToDelete = ref(null)

const loadTags = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("tags")

    tags.value = response.data.sort((a, b) => {
      const nameA = (a.nazwaTagu || "").toLowerCase()
      const nameB = (b.nazwaTagu || "").toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } catch (error) {
    if (typeof handleErrors === "function") {
      handleErrors(error, fetchError)
    } else {
      fetchError.value = {
        message: "Could not load tags list. Please try again.",
      }
    }
  } finally {
    isLoading.value = false
  }
}

const openEditModal = (tag) => {
  tagToEdit.value = { ...tag }
  showEditModal.value = true
}

const confirmDelete = (id) => {
  tagToDelete.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  tagToDelete.value = null
}

const executeDelete = async () => {
  if (!tagToDelete.value) return

  try {
    await api.delete(`tags/${tagToDelete.value}`)
    showAlert({
      type: "success",
      message: "Tag deleted successfully.",
      position: "top-right",
    })
    await loadTags()
  } catch (error) {
    showAlert({
      type: "error",
      message: "Failed to delete tag.",
      position: "top-right",
    })
  } finally {
    closeDeleteModal()
  }
}

const filteredTags = computed(() => {
  return tags.value.filter((tag) => {
    const query = searchQuery.value.toLowerCase().trim()
    const tagName = (tag.nazwaTagu || "").toLowerCase()

    return tagName.includes(query)
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

onMounted(loadTags)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">Tag Management</span>
        </p>
      </div>
    </div>

    <div class="container main-content">
      <aside class="sidebar">
        <div class="sidebar-card">
          <ul class="menu-list">
            <li @click="router.push('/admin')">
              <span class="icon">🏠</span>
              <span class="menu-text">Dashboard</span>
            </li>
            <li>
              <span class="icon">📦</span>
              <span class="menu-text">Order Management</span>
            </li>
            <li @click="router.push('/admin/product-management')">
              <span class="icon">🛍️</span>
              <span class="menu-text">Product Management</span>
            </li>
            <li @click="router.push('/admin/author-management')">
              <span class="icon">✍️</span>
              <span class="menu-text">Author Management</span>
            </li>
            <li class="active" @click="router.push('/admin/tag-management')">
              <span class="icon menu-icon-fix"
                ><i class="fa-solid fa-hashtag"></i
              ></span>
              <span class="menu-text">Tag Management</span>
            </li>
            <li @click="router.push('/admin/user-management')">
              <span class="icon">👥</span>
              <span class="menu-text">User Management</span>
            </li>
            <li @click="router.push('/admin/discount-codes')">
              <span class="icon">🏷️</span>
              <span class="menu-text">Discount Codes</span>
            </li>
            <li class="divider"></li>
            <li @click="handleLogout" class="logout-item">
              <span class="icon">🚪</span>
              <span class="menu-text">Sign Out</span>
            </li>
          </ul>
        </div>
      </aside>

      <main class="content-area">
        <ErrorCard
          v-if="fetchError"
          :message="fetchError.message"
          @retry="loadTags"
        />

        <div v-else-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Fetching tags data...</span>
        </div>

        <div v-else class="animated-content">
          <div class="modern-toolbar">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by tag name..."
              />
            </div>

            <div class="header-actions">
              <button class="action-btn add" @click="showAddModal = true">
                <i class="fa-solid fa-plus"></i>
                <span>Add Tag</span>
              </button>
            </div>
          </div>

          <div class="catalog-section">
            <div class="catalog-header">
              <h2>
                Tags Collection
                <span class="count-tag">{{ filteredTags.length }}</span>
              </h2>
            </div>

            <div v-if="filteredTags.length === 0" class="empty-state">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                alt="Empty"
              />
              <p>No tags found.</p>
            </div>

            <div v-else class="tag-chip-grid">
              <div
                v-for="tag in filteredTags"
                :key="tag.idTagu"
                class="tag-card"
                @click="openEditModal(tag)"
              >
                <div class="tag-inner-chip">
                  <span class="hash-symbol">#</span>
                  <span class="tag-slug">{{
                    tag.nazwaTagu.toLowerCase().replace(/\s+/g, "")
                  }}</span>
                </div>

                <button
                  class="delete-trigger"
                  title="Remove Tag"
                  @click.stop="confirmDelete(tag.idTagu)"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <TagAddModal
      :show="showAddModal"
      @close="showAddModal = false"
      @tag-added="loadTags"
    />

    <TagEditModal
      :show="showEditModal"
      :tag="tagToEdit"
      @close="showEditModal = false"
      @tag-updated="loadTags"
    />

    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-box confirm-box">
          <div class="modal-header">
            <h3>Delete Tag</h3>
            <button class="close-btn" @click="closeDeleteModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="confirm-text">
              Are you sure you want to delete this tag? This action cannot be
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

<style>
:root {
  --nv-z: 9999;
}
.Notivue__wrapper {
  z-index: 9999 !important;
}
</style>

<style scoped>
/* Reset & Layout */
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

/* Sidebar */
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

.menu-icon-fix {
  color: #8a8fb9;
  width: 22px;
  text-align: center;
}

.menu-list li.active .menu-icon-fix {
  color: #3f509e;
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

/* Toolbar */
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

.action-btn.add {
  background: #3f509e;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.action-btn.add:hover {
  transform: translateY(-3px);
  background: #2e3b75;
}

/* -------------------------------------
   MODERN TAG GRID (BIAŁE KAFELKI)
-------------------------------------- */
.tag-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.tag-card {
  background: #ffffff; /* Białe tło karty */
  border: 1px solid #eae8f5;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 12px rgba(21, 24, 117, 0.02);
}

.tag-card:hover {
  transform: translateY(-4px);
  border-color: #3f509e;
  box-shadow: 0 10px 25px rgba(63, 80, 158, 0.1);
}

/* Stylizacja tagu wewnątrz (Szary Badge) */
.tag-inner-chip {
  background-color: #f1f5f9; /* Szarawe tło samego tagu */
  padding: 6px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;
}

.tag-card:hover .tag-inner-chip {
  background-color: #e2e8f0;
}

.hash-symbol {
  color: #3f509e;
  font-weight: 800;
  font-family: "Courier New", Courier, monospace;
  font-size: 1.1rem;
}

.tag-slug {
  font-family:
    "JetBrains Mono", "Fira Code", "Courier New", monospace; /* Tagowa czcionka */
  font-weight: 700;
  color: #151875;
  font-size: 1rem;
  letter-spacing: -0.2px;
}

/* Delete Button */
.delete-trigger {
  background: #fff0f0;
  color: #fb2e2e;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  margin-left: 4px;
}

.delete-trigger:hover {
  background: #fb2e2e;
  color: white;
  transform: rotate(90deg);
}

/* Rest of the UI (Modals, Headers, etc.) */
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

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #8a8fb9;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #eae8f5;
  border-radius: 16px;
}

.empty-state img {
  width: 80px;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.modal-overlay {
  position: fixed;
  inset: 0;
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

.btn-primary {
  background-color: #3f509e;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary.btn-danger {
  background-color: #e03a5b;
}

.btn-text {
  background: transparent;
  color: #8a8fb9;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
}

@media (max-width: 950px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
