<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

import { useAlerts } from "@/components/alerts/useAlerts.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"
import ProductAddModal from "./ProductAddModal.vue"

import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const products = ref([])
const isLoading = ref(false)
const fetchError = ref(null)

const searchQuery = ref("")
const selectedCategory = ref("All")

const showImportModal = ref(false)
const showAddModal = ref(false)

const showDeleteModal = ref(false)
const productToDelete = ref(null)

const csvFile = ref(null)
const isDragging = ref(false)
const fileInput = ref(null)
const isUploading = ref(false) // New state for import button

const loadProducts = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("products")
    products.value = response.data
  } catch (error) {
    if (typeof handleErrors === "function") {
      handleErrors(error, fetchError)
    } else {
      fetchError.value = {
        message: "Could not load products list. Please try again.",
      }
    }
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = (id) => {
  productToDelete.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const openEditModal = (id) => {
  productToEditId.value = id
  showEditModal.value = true
}

const executeDelete = async () => {
  if (!productToDelete.value) return

  try {
    await api.delete(`products/${productToDelete.value}`)
    showAlert({
      type: "success",
      message: "Product deleted successfully.",
      position: "top-right",
    })
    await loadProducts()
  } catch (error) {
    showAlert({
      type: "error",
      message: "Failed to delete product.",
      position: "top-right",
    })
  } finally {
    closeDeleteModal()
  }
}

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const query = searchQuery.value.toLowerCase().trim()
    const nameMatch = product.nazwaProduktu?.toLowerCase().includes(query)
    const authorStr =
      `${product.autorImie || ""} ${product.autorNazwisko || ""}`.toLowerCase()
    const authorMatch = authorStr.includes(query)

    let categoryMatch = true
    if (selectedCategory.value !== "All") {
      const targetCat = selectedCategory.value.toLowerCase()
      categoryMatch = product.kategorie?.some((c) => {
        const catName = c.nazwaKategorii.toLowerCase()
        if (
          targetCat === "music" &&
          (catName.includes("music") || catName.includes("muzyka"))
        )
          return true
        if (
          targetCat === "books" &&
          (catName.includes("book") || catName.includes("książk"))
        )
          return true
        if (
          targetCat === "movies" &&
          (catName.includes("movie") || catName.includes("film"))
        )
          return true
        return false
      })
    }

    return (nameMatch || authorMatch) && categoryMatch
  })
})

const getCategoryClass = (product) => {
  const cat = product.kategorie?.[0]?.nazwaKategorii.toLowerCase() || ""
  if (cat.includes("muzyka") || cat.includes("music")) return "cat-music"
  if (cat.includes("książk") || cat.includes("book")) return "cat-book"
  if (cat.includes("film") || cat.includes("movie")) return "cat-movie"
  return "cat-default"
}

const getIcon = (product) => {
  const cat = product.kategorie?.[0]?.nazwaKategorii.toLowerCase() || ""
  if (cat.includes("muzyka") || cat.includes("music"))
    return "fa-solid fa-compact-disc"
  if (cat.includes("książk") || cat.includes("book"))
    return "fa-solid fa-book-open"
  if (cat.includes("film") || cat.includes("movie")) return "fa-solid fa-film"
  return "fa-solid fa-box-archive"
}

const triggerFileInput = () => fileInput.value.click()

const handleFileDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  validateAndSetFile(files[0])
}

const handleFileChange = (event) => {
  const files = event.target.files
  validateAndSetFile(files[0])
}

const validateAndSetFile = (file) => {
  if (!file) return
  if (file.name.endsWith(".csv") || file.type === "text/csv") {
    csvFile.value = file
  } else {
    showAlert({
      type: "error",
      message: "Invalid file format. Please upload a .csv file.",
      position: "top-right",
    })
    csvFile.value = null
  }
}

const closeImportModal = () => {
  showImportModal.value = false
  setTimeout(() => removeFile(), 300)
}

const uploadCsv = async () => {
  if (!csvFile.value) return

  isUploading.value = true

  const formData = new FormData()
  formData.append("file", csvFile.value)

  try {
    const response = await api.post("products/csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    showAlert({
      type: "success",
      message: "File imported successfully.",
      position: "top-right",
    })

    closeImportModal()
    await loadProducts()
  } catch (error) {
    let errorMessage = "An error occurred while importing the file."

    if (error.response) {
      errorMessage =
        error.response.data.message || `Server error: ${error.response.status}`
    } else if (error.request) {
      errorMessage = "No connection to the server. Please check your internet."
    }

    showAlert({
      type: "error",
      message: errorMessage,
      position: "top-right",
    })
  } finally {
    isUploading.value = false
  }
}

const removeFile = () => {
  csvFile.value = null
  if (fileInput.value) fileInput.value.value = ""
}

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

const updateStock = async (product) => {
  if (product.stanMagazynowy < 0) {
    showAlert({
      type: "error",
      message: "Stan magazynowy nie może być ujemny.",
      position: "top-right",
    })
    await loadProducts()
    return
  }

  try {
    await api.patch(`products/${product.idProduktu}/stock`, {
      stanMagazynowy: product.stanMagazynowy,
    })

    showAlert({
      type: "success",
      message: `Zaktualizowano stan dla: ${product.nazwaProduktu}`,
      position: "top-right",
    })
  } catch (error) {
    showAlert({
      type: "error",
      message: "Błąd podczas aktualizacji stanu magazynowego.",
      position: "top-right",
    })
    await loadProducts()
  }
}

onMounted(loadProducts)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">Product Management</span>
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
            <li
              class="active"
              @click="router.push('/admin/product-management')"
            >
              <span class="icon">🛍️</span>
              <span class="menu-text">Product Management</span>
            </li>
            <li @click="router.push('/admin/author-management')">
              <span class="icon">✍️</span>
              <span class="menu-text">Author Management</span>
            </li>
            <li @click="router.push('/admin/tag-management')">
              <span class="icon menu-icon-fix"
                ><i class="fa-solid fa-hashtag"></i
              ></span>
              <span class="menu-text">Tag Management</span>
            </li>
            <li @click="router.push('/admin/order-management')">
              <span class="icon">📦</span>
              <span class="menu-text">Order Management</span>
            </li>
            <li @click="router.push('/admin/user-management')">
              <span class="icon">👥</span>
              <span class="menu-text">User Management</span>
            </li>
            <li @click="router.push('/admin/review-management')">
              <span class="icon">⭐</span>
              <span class="menu-text">Review Management</span>
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
          @retry="loadProducts"
        />

        <div v-else-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Fetching catalog data...</span>
        </div>

        <div v-else class="animated-content">
          <div class="modern-toolbar">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or author..."
              />
            </div>

            <div class="filter-pills">
              <button
                v-for="cat in ['All', 'Music', 'Books', 'Movies']"
                :key="cat"
                :class="['pill-btn', { active: selectedCategory === cat }]"
                @click="selectedCategory = cat"
              >
                {{ cat }}
              </button>
            </div>

            <div class="header-actions">
              <button class="action-btn import" @click="showImportModal = true">
                <i class="fa-solid fa-file-import"></i>
                <span>Import</span>
              </button>
              <button class="action-btn add" @click="showAddModal = true">
                <i class="fa-solid fa-plus"></i>
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div class="catalog-section">
            <div class="catalog-header">
              <h2>
                Product Catalog
                <span class="count-tag">{{ filteredProducts.length }}</span>
              </h2>
            </div>

            <div class="product-grid">
              <div v-if="filteredProducts.length === 0" class="empty-state">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                  alt="Empty"
                />
                <p>No products found in this category.</p>
              </div>

              <div
                v-for="product in filteredProducts"
                :key="product.idProduktu"
                class="product-row-card"
              >
                <div class="product-main-info">
                  <div :class="['type-icon', getCategoryClass(product)]">
                    <i :class="getIcon(product)"></i>
                  </div>
                  <div class="name-details">
                    <span class="p-name">{{ product.nazwaProduktu }}</span>
                    <span class="p-author"
                      >by {{ product.autorImie }}
                      {{ product.autorNazwisko }}</span
                    >
                  </div>
                </div>

                <div class="product-tags">
                  <span
                    v-for="cat in product.kategorie"
                    :key="cat.idKategorii"
                    class="tag"
                  >
                    {{ cat.nazwaKategorii }}
                  </span>
                </div>
                <div class="product-stock-edit">
                  <label>Stan:</label>
                  <input
                    type="number"
                    min="0"
                    v-model.number="product.stanMagazynowy"
                    @change="updateStock(product)"
                    title="Naciśnij Enter lub kliknij poza polem, aby zapisać"
                  />
                </div>
                <div class="product-pricing">
                  <span class="amount">{{ product.cena.toFixed(2) }}</span>
                  <span class="currency">PLN</span>
                </div>

                <div class="product-actions">
                  <button
                    class="icon-btn edit"
                    title="Edit"
                    @click="openEditModal(product.idProduktu)"
                  >
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button
                    class="icon-btn delete"
                    title="Delete"
                    @click="confirmDelete(product.idProduktu)"
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

    <ProductAddModal
      :show="showAddModal"
      @close="showAddModal = false"
      @product-added="loadProducts"
    />

    <Transition name="modal">
      <div
        v-if="showImportModal"
        class="modal-overlay"
        @click.self="closeImportModal"
      >
        <div class="modal-box">
          <div class="modal-header">
            <h3>Import Products via CSV</h3>
            <button class="close-btn" @click="closeImportModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <div
              class="upload-zone"
              :class="{ 'is-dragging': isDragging, 'has-file': csvFile }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
            >
              <input
                type="file"
                accept=".csv"
                class="hidden-input"
                ref="fileInput"
                @change="handleFileChange"
              />

              <div
                v-if="!csvFile"
                class="upload-prompt"
                @click="triggerFileInput"
              >
                <div class="upload-icon-circle">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <p class="upload-text">
                  <strong>Click to select</strong> or drag file here
                </p>
                <p class="upload-hint">Only .csv formats are supported</p>
              </div>

              <div v-else class="file-preview">
                <div class="file-info">
                  <i class="fa-solid fa-file-csv file-icon"></i>
                  <div class="file-details">
                    <span class="file-name">{{ csvFile.name }}</span>
                    <span class="file-size"
                      >{{ (csvFile.size / 1024).toFixed(1) }} KB</span
                    >
                  </div>
                </div>
                <button
                  class="remove-btn"
                  @click="removeFile"
                  title="Remove file"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-text" @click="closeImportModal">Cancel</button>
            <button
              class="btn-primary"
              @click="uploadCsv"
              :disabled="!csvFile || isUploading"
            >
              <template v-if="!isUploading">
                <i class="fa-solid fa-check"></i> Import Data
              </template>
              <template v-else>
                <div class="loader-circle small"></div>
                Sending...
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-box confirm-box">
          <div class="modal-header">
            <h3>Delete Product</h3>
            <button class="close-btn" @click="closeDeleteModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="confirm-text">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-text" @click="closeDeleteModal">Anuluj</button>
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
  grid-template-columns: 1.5fr 1fr auto;
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
.filter-pills {
  display: flex;
  gap: 8px;
  background: #f0f2f8;
  padding: 5px;
  border-radius: 14px;
}
.pill-btn {
  flex: 1;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  background: transparent;
  color: #555;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}
.pill-btn.active {
  background: white;
  color: #3f509e;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
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
.action-btn.import {
  background: #f0f2f8;
  color: #3f509e;
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
.product-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* NASZA PRAWIDŁOWA SIATKA Z 5 KOLUMNAMI */
.product-row-card {
  display: grid;
  grid-template-columns: 2fr 1fr 140px 110px 90px;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  transition: all 0.3s;
  gap: 10px;
}
.product-row-card:hover {
  border-color: #3f509e;
  box-shadow: 0 10px 25px rgba(63, 80, 158, 0.08);
  transform: scale(1.01);
}

.product-main-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.type-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.cat-music {
  background: #e8f5ff;
  color: #2e86fb;
}
.cat-book {
  background: #f3f0ff;
  color: #8e44ad;
}
.cat-movie {
  background: #fff8e6;
  color: #ffb800;
}
.cat-default {
  background: #f0f0f5;
  color: #888;
}
.name-details {
  display: flex;
  flex-direction: column;
}
.p-name {
  font-weight: 700;
  color: #151875;
  font-size: 1.05rem;
}
.p-author {
  font-size: 0.85rem;
  color: #8a8fb9;
}
.tag {
  background: #f4f4f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
}

/* STYLE STANU MAGAZYNOWEGO */
.product-stock-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-stock-edit label {
  font-size: 0.8rem;
  color: #8a8fb9;
  font-weight: 600;
  text-transform: uppercase;
}
.product-stock-edit input {
  width: 65px;
  padding: 6px 8px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  color: #151875;
  outline: none;
  background-color: #f8f9ff;
  transition: all 0.2s ease;
}
.product-stock-edit input:focus {
  border-color: #3f509e;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(63, 80, 158, 0.1);
}

.amount {
  font-weight: 800;
  color: #151875;
  font-size: 1.1rem;
}
.currency {
  font-size: 0.8rem;
  color: #8a8fb9;
  margin-left: 4px;
}
.product-actions {
  display: flex;
  justify-content: flex-end;
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
  border-radius: 12px;
  border: 1px solid #eae8f5;
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
.upload-zone {
  border: 2px dashed #dcdcdc;
  border-radius: 12px;
  background-color: #fbfbfe;
  transition: all 0.2s ease;
  position: relative;
}
.upload-zone:hover,
.upload-zone.is-dragging {
  border-color: #3f509e;
  background-color: #f6f5ff;
}
.hidden-input {
  display: none;
}
.upload-prompt {
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
}
.upload-icon-circle {
  width: 50px;
  height: 50px;
  background-color: #ffffff;
  color: #3f509e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(63, 80, 158, 0.15);
}
.upload-text {
  color: #150e24;
  font-size: 1rem;
  margin: 0 0 0.4rem 0;
  font-weight: 500;
}
.upload-text strong {
  color: #3f509e;
}
.upload-hint {
  color: #8a8fb9;
  font-size: 0.85rem;
  margin: 0;
}
.file-preview {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 2px;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.file-icon {
  color: #21a366;
  font-size: 2rem;
}
.file-details {
  display: flex;
  flex-direction: column;
}
.file-name {
  font-weight: 600;
  color: #151875;
  font-size: 0.95rem;
}
.file-size {
  color: #8a8fb9;
  font-size: 0.8rem;
}
.remove-btn {
  background: #fdf2f4;
  border: none;
  color: #e03a5b;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.remove-btn:hover {
  background-color: #fad2db;
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
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #8a8fb9;
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

@media (max-width: 1024px) {
  .modern-toolbar {
    grid-template-columns: 1fr 1fr;
  }
  .header-actions {
    grid-column: span 2;
    justify-content: center;
  }
}
@media (max-width: 950px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  .header-banner {
    padding: 2.5rem 0;
  }
}
@media (max-width: 768px) {
  .product-row-card {
    grid-template-columns: 1fr auto;
    gap: 15px;
  }
  .product-tags,
  .product-pricing,
  .product-stock-edit {
    display: none;
  }
}
</style>
