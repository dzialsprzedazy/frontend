<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

import { useAlerts } from "@/components/alerts/useAlerts.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const users = ref([])
const isLoading = ref(false)
const fetchError = ref(null)

const searchQuery = ref("")
const selectedStatus = ref("All")

const showDeleteModal = ref(false)
const userToDelete = ref(null)

const showAddAdminModal = ref(false)
const adminEmail = ref("")
const adminPassword = ref("")
const adminConfirmPassword = ref("")
const isCreatingAdmin = ref(false)

const loadUsers = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("users")
    users.value = response.data
  } catch (error) {
    if (typeof handleErrors === "function") {
      handleErrors(error, fetchError)
    } else {
      fetchError.value = {
        message: "Could not load users list. Please try again.",
      }
    }
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = (id) => {
  userToDelete.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const executeDelete = async () => {
  if (!userToDelete.value) return

  try {
    await api.delete(`users/${userToDelete.value}`)

    showAlert({
      type: "success",
      message: "User account deactivated successfully.",
      position: "top-right",
    })
    await loadUsers()
  } catch (error) {
    showAlert({
      type: "error",
      message: "Failed to deactivate user account.",
      position: "top-right",
    })
  } finally {
    closeDeleteModal()
  }
}

const openAddAdminModal = () => {
  showAddAdminModal.value = true
}

const closeAddAdminModal = () => {
  showAddAdminModal.value = false
  adminEmail.value = ""
  adminPassword.value = ""
  adminConfirmPassword.value = ""
}

const createAdmin = async () => {
  if (!adminEmail.value || !adminPassword.value || !adminConfirmPassword.value) {
    showAlert({
      type: "error",
      message: "Please fill in all fields.",
      position: "top-right",
    })
    return
  }

  if (adminPassword.value !== adminConfirmPassword.value) {
    showAlert({
      type: "error",
      message: "Passwords do not match.",
      position: "top-right",
    })
    return
  }

  try {
    isCreatingAdmin.value = true

    await api.post("users/admin", {
      email: adminEmail.value,
      password: adminPassword.value,
    })

    showAlert({
      type: "success",
      message: "Admin account created successfully.",
      position: "top-right",
    })

    closeAddAdminModal()
    await loadUsers()
  } catch (error) {
    const errorData = error.response?.data

    const message = Array.isArray(errorData)
      ? errorData.map(e => e.description).join(" ")
      : errorData || "Failed to create admin account."

    showAlert({
      type: "error",
      message,
      position: "top-right",
    })
  } finally {
    isCreatingAdmin.value = false
  }
}

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const query = searchQuery.value.toLowerCase().trim()

    const name = (user.name || "").toLowerCase()
    const surname = (user.surname || "").toLowerCase()
    const email = (user.email || "").toLowerCase()

    const nameSurname = `${name} ${surname}`.trim()
    const surnameName = `${surname} ${name}`.trim()

    const textMatch =
      name.includes(query) ||
      surname.includes(query) ||
      nameSurname.includes(query) ||
      surnameName.includes(query) ||
      email.includes(query)

    let statusMatch = true
    if (selectedStatus.value === "Active") statusMatch = !user.czyUsuniety
    if (selectedStatus.value === "Deleted") statusMatch = user.czyUsuniety

    return textMatch && statusMatch
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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

onMounted(loadUsers)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">User Management</span>
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
            <li @click="router.push('/admin/product-management')">
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
            <li class="active" @click="router.push('/admin/user-management')">
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
          @retry="loadUsers"
        />

        <div v-else-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Fetching user directory...</span>
        </div>

        <div v-else class="animated-content">
          <div class="modern-toolbar">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, surname or email..."
              />
            </div>

            <div class="filter-pills">
              <button
                v-for="status in ['All', 'Active', 'Deleted']"
                :key="status"
                :class="['pill-btn', { active: selectedStatus === status }]"
                @click="selectedStatus = status"
              >
                {{ status }}
              </button>
            </div>

            <div class="header-actions">
              <button class="action-btn add" @click="openAddAdminModal">
                <i class="fa-solid fa-user-plus"></i>
                <span>Add Admin</span>
              </button>
            </div>
          </div>

          <div class="catalog-section">
            <div class="catalog-header">
              <h2>
                User Accounts
                <span class="count-tag">{{ filteredUsers.length }}</span>
              </h2>
            </div>

            <div class="user-grid">
              <div v-if="filteredUsers.length === 0" class="empty-state">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                  alt="Empty"
                />
                <p>No users found matching these filters.</p>
              </div>

              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-row-card"
                :class="{ 'soft-deleted': user.czyUsuniety }"
              >
                <div class="user-main-info">
                  <div class="user-avatar-circle">
                    <i class="fa-solid fa-user"></i>
                  </div>
                  <div class="name-details">
                    <span class="u-name">
                      <template v-if="user.name || user.surname">
                        {{ user.name || "" }} {{ user.surname || "" }}
                      </template>
                      <template v-else>
                        {{ user.userName }}
                      </template>
                    </span>
                    <span class="u-email">{{ user.email }}</span>
                  </div>
                </div>

                <div class="user-meta">
                  <div class="meta-item">
                    <i class="fa-regular fa-calendar-check"></i>
                    <span>{{ formatDate(user.dataRejestracji) }}</span>
                  </div>
                </div>

                <div class="user-status-tag">
                  <span v-if="!user.czyUsuniety" class="badge active"
                    >Active</span
                  >
                  <span v-else class="badge deleted">Deleted</span>
                </div>

                <div class="product-actions">
                  <button
                    class="icon-btn delete"
                    title="Delete User"
                    :disabled="user.czyUsuniety"
                    @click="confirmDelete(user.id)"
                  >
                    <i class="fa-solid fa-trash-can"></i>
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
            <h3>Delete User Account</h3>
            <button class="close-btn" @click="closeDeleteModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="confirm-text">
              Are you sure you want to delete this user? This action will mark
              the account as deleted in the system.
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-text" @click="closeDeleteModal">Cancel</button>
            <button class="btn-primary btn-danger" @click="executeDelete">
              <i class="fa-solid fa-user-slash"></i> Delete User
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div
        v-if="showAddAdminModal"
        class="modal-overlay"
        @click.self="closeAddAdminModal"
      >
        <div class="modal-box confirm-box">
          <div class="modal-header">
            <h3>Add Admin Account</h3>
            <button class="close-btn" @click="closeAddAdminModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Email</label>
              <input v-model="adminEmail" type="email" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input v-model="adminPassword" type="password" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Confirm Password</label>
              <input v-model="adminConfirmPassword" type="password" class="modal-input" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-text" @click="closeAddAdminModal">Cancel</button>
            <button class="btn-primary" @click="createAdmin" :disabled="isCreatingAdmin">
              {{ isCreatingAdmin ? "Creating..." : "Create Admin" }}
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
  border: none;
}

.action-btn.add {
  background: #3f509e;
  color: white;
  box-shadow: 0 8px 20px rgba(63, 80, 158, 0.3);
}

.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed;
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

.user-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-row-card {
  display: grid;
  grid-template-columns: 2fr 1fr 120px 80px;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  transition: all 0.3s;
  position: relative;
}

.user-row-card:hover:not(.soft-deleted) {
  border-color: #3f509e;
  box-shadow: 0 10px 25px rgba(63, 80, 158, 0.08);
  transform: scale(1.01);
}

.user-row-card.soft-deleted {
  background-color: #f9f9fb;
  opacity: 0.65;
  filter: grayscale(0.4);
}

.user-main-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f2f8;
  color: #3f509e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.name-details {
  overflow: hidden;
}

.u-name {
  font-weight: 700;
  color: #151875;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.u-email {
  font-size: 0.85rem;
  color: #8a8fb9;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #4a405c;
}

.meta-item i {
  color: #8a8fb9;
}

.badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.badge.active {
  background: #e6f6f0;
  color: #21a366;
}

.badge.deleted {
  background: #fff0f0;
  color: #fb2e2e;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn.delete {
  background: #fff0f0;
  color: #fb2e2e;
}

.icon-btn.delete:disabled {
  background: #f0f0f5;
  color: #ccc;
  cursor: not-allowed;
}

.icon-btn:hover:not(:disabled) {
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
  background: rgba(21, 14, 36, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
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
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f6f5ff;
  color: #151875;
}

.modal-body {
  padding: 2rem 1.5rem;
}

.confirm-text {
  font-size: 1.05rem;
  color: #4a405c;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  padding: 1.2rem;
  background: #fbfbfe;
  border-top: 1px solid #eae8f5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover {
  background-color: #2e3b75;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(63, 80, 158, 0.2);
}

.btn-primary.btn-danger {
  background-color: #fb2e2e;
}

.btn-primary.btn-danger:hover {
  background-color: #d32525;
  box-shadow: 0 4px 12px rgba(251, 46, 46, 0.2);
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

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 860px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .sidebar-card {
    padding: 1rem;
  }

  .menu-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .menu-list li {
    white-space: nowrap;
    padding: 0.6rem 1rem;
  }

  .menu-list li:hover:not(.divider) {
    transform: translateY(-2px);
  }

  .divider {
    width: 1px;
    height: auto;
    margin: 0 0.5rem;
  }

  .modern-toolbar {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .header-actions {
    justify-content: stretch;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .header-banner {
    padding: 2.5rem 0;
    margin-bottom: 2rem;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .container {
    padding: 0 1rem;
  }

  .user-row-card {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.25rem;
  }

  .user-status-tag {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
  }

  .user-meta {
    padding-top: 0.5rem;
  }

  .product-actions {
    justify-content: flex-start;
    border-top: 1px solid #f0f0f5;
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .icon-btn {
    width: 100%;
  }

  .icon-btn.restore {
    background: #e6f6f0;
    color: #21a366;
  }

  .filter-pills {
    flex-direction: column;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #8a8fb9;
  font-weight: 700;
}

.modal-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #e1e1e8;
  border-radius: 8px;
  outline: none;
}

.modal-input:focus {
  border-color: #3f509e;
  box-shadow: 0 0 0 4px rgba(63, 80, 158, 0.1);
}

@media (max-width: 400px) {
  .modal-footer {
    flex-direction: column;
  }

  .btn-text,
  .btn-primary {
    width: 100%;
  }
}
</style>
