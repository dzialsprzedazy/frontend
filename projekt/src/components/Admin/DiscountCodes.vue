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
const selectedUsers = ref([])
const discountCode = ref("")
const discountPercentage = ref(10)

const loadUsers = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("users")
    users.value = response.data.filter((user) => !user.czyUsuniety)
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

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return users.value

  return users.value.filter((user) => {
    const email = user.email?.toLowerCase() || ""
    const name = user.name?.toLowerCase() || ""
    const surname = user.surname?.toLowerCase() || ""
    const fullName = `${name} ${surname}`.trim()

    return (
      email.includes(query) ||
      name.includes(query) ||
      surname.includes(query) ||
      fullName.includes(query)
    )
  })
})

const isAllSelected = computed({
  get() {
    return (
      filteredUsers.value.length > 0 &&
      selectedUsers.value.length === filteredUsers.value.length
    )
  },
  set(value) {
    if (value) {
      selectedUsers.value = filteredUsers.value.map((u) => u.id)
    } else {
      selectedUsers.value = []
    }
  },
})

const generateRandomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "PROMO-"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  discountCode.value = result
}

const sendDiscountCodes = async () => {
  if (selectedUsers.value.length === 0) {
    showAlert({
      type: "warning",
      message: "Please select at least one user.",
      position: "top-right",
    })
    return
  }

  if (!discountCode.value.trim()) {
    showAlert({
      type: "error",
      message: "Please enter or generate a discount code.",
      position: "top-right",
    })
    return
  }

  if (
    !discountPercentage.value ||
    discountPercentage.value <= 0 ||
    discountPercentage.value > 100
  ) {
    showAlert({
      type: "error",
      message: "Please enter a valid discount percentage (1-100).",
      position: "top-right",
    })
    return
  }

  const payload = selectedUsers.value.map((userId) => ({
    userId: userId,
    discountCode: discountCode.value.trim(),
    discountPercentage: Number(discountPercentage.value),
  }))

  await api.post("discountCodes", payload)
  showAlert({
    type: "success",
    message: `Discount code (${discountPercentage.value}%) sent to ${selectedUsers.value.length} user(s)!`,
    position: "top-right",
  })

  selectedUsers.value = []
  discountCode.value = ""
  discountPercentage.value = 10
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

const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

onMounted(loadUsers)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home
          <span class="dot-separator">•</span>
          <span class="active-page">Discount Codes</span>
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
            <li @click="router.push('/admin/user-management')">
              <span class="icon">👥</span>
              <span class="menu-text">User Management</span>
            </li>
            <li class="active">
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
          <i class="fa-solid fa-spinner fa-spin"></i> Loading users...
        </div>

        <div v-else class="animated-content">
          <div class="dashboard-card action-card">
            <h3 class="section-title">Create Discount Code</h3>

            <div class="code-generation-wrapper">
              <div class="field-group expand">
                <div class="input-with-icon">
                  <span class="input-icon left">🏷️</span>
                  <input
                    type="text"
                    class="styled-input pl-large"
                    v-model="discountCode"
                    placeholder="Enter code (e.g. SUMMER2026)"
                  />
                </div>
                <button class="btn-outline" @click="generateRandomCode">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Generate
                </button>
              </div>

              <div class="field-group">
                <div class="input-with-icon small-input">
                  <input
                    type="number"
                    class="styled-input pr-large text-center"
                    v-model="discountPercentage"
                    placeholder="10"
                    min="1"
                    max="100"
                  />
                  <span class="input-icon right">%</span>
                </div>
                <button
                  class="btn-primary"
                  @click="sendDiscountCodes"
                  :disabled="
                    !discountCode ||
                    !discountPercentage ||
                    selectedUsers.length === 0
                  "
                >
                  <i class="fa-regular fa-paper-plane"></i> Send to Selected
                </button>
              </div>
            </div>

            <div class="selection-info">
              <span v-if="selectedUsers.length > 0" class="selected-badge">
                {{ selectedUsers.length }} users selected
              </span>
              <span v-else class="no-selection-text">
                No users selected yet. Please select users below.
              </span>
            </div>
          </div>

          <div class="dashboard-card list-card">
            <div class="list-header">
              <h3 class="section-title margin-0">Select Users</h3>
              <div class="search-box">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by name or email..."
                  class="search-input"
                />
              </div>
            </div>

            <div class="users-container">
              <label
                class="user-row header-row"
                v-if="filteredUsers.length > 0"
              >
                <div class="checkbox-cell">
                  <div class="custom-checkbox">
                    <input type="checkbox" v-model="isAllSelected" />
                    <span class="checkmark"></span>
                  </div>
                </div>
                <span class="header-text font-bold"
                  >Select All ({{ filteredUsers.length }})</span
                >
              </label>

              <div v-if="filteredUsers.length === 0" class="no-results">
                <div class="empty-icon">👥</div>
                <p>No users found matching your search.</p>
              </div>

              <div class="user-list">
                <label
                  class="user-row"
                  v-for="user in filteredUsers"
                  :key="user.id"
                  :class="{ 'is-selected': selectedUsers.includes(user.id) }"
                >
                  <div class="checkbox-cell">
                    <div class="custom-checkbox">
                      <input
                        type="checkbox"
                        :value="user.id"
                        v-model="selectedUsers"
                      />
                      <span class="checkmark"></span>
                    </div>
                  </div>

                  <div class="user-info-cell">
                    <div class="user-avatar-circle">
                      <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="user-details">
                      <h4 class="user-name">
                        <template v-if="user.name || user.surname">
                          {{
                            [user.name, user.surname].filter(Boolean).join(" ")
                          }}
                        </template>
                        <template v-else>
                          {{ user.email }}
                        </template>
                      </h4>
                      <p class="user-email" v-if="user.name || user.surname">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>

                  <div class="user-meta-cell">
                    <span class="meta-label">Registered:</span>
                    <span class="meta-value">{{
                      formatDate(user.dataRejestracji)
                    }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
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
  color: #fb2e86;
  font-weight: 600;
  background-color: #fdf2f6;
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

.action-card {
  background-color: #fbfbfe;
  border: 1px solid #d5ccf8;
}

.section-title {
  font-size: 1.25rem;
  color: #151875;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.margin-0 {
  margin-bottom: 0;
}

.code-generation-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  justify-content: space-between;
}

.field-group {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.field-group.expand {
  flex: 1;
  min-width: 350px;
}

.input-with-icon {
  position: relative;
  flex: 1;
}

.input-with-icon.small-input {
  width: 90px;
  flex: none;
}

.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8fb9;
  font-size: 1.1rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon.left {
  left: 14px;
}

.input-icon.right {
  right: 14px;
  font-weight: 700;
  color: #151875;
}

.styled-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #ffffff;
  border: 2px solid #eae8f5;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  color: #151875;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.styled-input:focus {
  border-color: #3f509e;
  box-shadow: 0 0 0 4px rgba(63, 80, 158, 0.1);
}

.styled-input::placeholder {
  color: #c4c7d6;
  font-weight: 500;
}

.styled-input.pl-large {
  padding-left: 2.8rem;
}

.styled-input.pr-large {
  padding-right: 2.4rem;
  padding-left: 1rem;
}

.styled-input.text-center {
  text-align: center;
}

.styled-input[type="number"]::-webkit-inner-spin-button,
.styled-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.styled-input[type="number"] {
  -moz-appearance: textfield;
}

.selection-info {
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  min-height: 24px;
}

.selected-badge {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
}

.no-selection-text {
  color: #8a8fb9;
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

.btn-outline {
  background-color: #ffffff;
  color: #151875;
  border: 2px solid #eae8f5;
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-outline:hover {
  border-color: #3f509e;
  color: #3f509e;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 320px;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8fb9;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  color: #150e24;
  font-weight: 500;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #3f509e;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.custom-checkbox input {
  display: none;
}

.checkmark {
  width: 22px;
  height: 22px;
  background-color: #ffffff;
  border: 2px solid #dcdcdc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #3f509e;
  border-color: #3f509e;
}

.custom-checkbox input:checked ~ .checkmark::after {
  content: "\f00c";
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  color: white;
  font-size: 12px;
}

.users-container {
  border: 1px solid #eae8f5;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fafafc;
}

.user-row {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eae8f5;
  background-color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-left: 4px solid transparent;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover:not(.header-row) {
  background-color: #fbfbfe;
}

.user-row.is-selected {
  border-left-color: #3f509e;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(63, 80, 158, 0.05);
  z-index: 1;
  position: relative;
}

.header-row {
  background-color: #f8f9fc;
  border-bottom: 2px solid #eae8f5;
}

.header-text {
  color: #4a405c;
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.checkbox-cell {
  margin-right: 1.5rem;
}

.user-info-cell {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-avatar-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #f8f4ff;
  color: #8d44adeb;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.2rem;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  margin: 0 0 0.2rem 0;
  color: #151875;
  font-weight: 600;
  font-size: 1.1rem;
}

.user-email {
  margin: 0;
  color: #8a8fb9;
  font-size: 0.95rem;
}

.user-meta-cell {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.75rem;
  color: #a4a8c9;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.meta-value {
  color: #4a405c;
  font-size: 0.9rem;
  font-weight: 500;
}

.no-results {
  padding: 4rem 2rem;
  text-align: center;
  color: #8a8fb9;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

@media (max-width: 950px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .header-banner {
    padding: 2.5rem 0;
  }
}

@media (max-width: 600px) {
  .code-generation-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .field-group {
    flex-wrap: wrap;
  }

  .field-group.expand {
    min-width: 100%;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }

  .user-row {
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    padding-left: 3.5rem;
  }

  .user-row.is-selected {
    transform: translateX(2px);
  }

  .header-row {
    flex-direction: row;
    align-items: center;
    padding-left: 1.5rem;
  }

  .checkbox-cell {
    position: absolute;
    left: 1.5rem;
    top: 1.2rem;
  }

  .user-meta-cell {
    text-align: left;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #eae8f5;
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .meta-label {
    margin-bottom: 0;
  }
}
</style>
