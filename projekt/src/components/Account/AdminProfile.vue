<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAlerts } from "@/components/alerts/useAlerts.js"

const router = useRouter()
const { showAlert } = useAlerts()

const adminName = ref("")
const adminSurname = ref("")
const adminEmail = ref("")
const role = ref("Administrator")
const phoneNumber = ref("")

const isEditing = ref(false)
const isLoading = ref(false)

const API_URL = "http://localhost:5238/api/users"

const getToken = () => localStorage.getItem("token")

const loadUserDetails = async () => {
  const token = getToken()

  if (!token) {
    router.push("/login")
    return
  }

  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to load user details")
    }

    const data = await response.json()

    adminName.value = data.imie || ""
    adminSurname.value = data.nazwisko || ""
    adminEmail.value = data.email || ""
    phoneNumber.value = data.telefon || ""
    role.value = data.role || "Administrator"
  } catch (error) {
    showAlert({
      type: "error",
      message: "Could not load user details.",
      position: "top-right",
    })
  }
}

const saveUserDetails = async () => {
  const token = getToken()

  if (!token) {
    router.push("/login")
    return
  }

  try {
    isLoading.value = true

    const response = await fetch(`${API_URL}/details`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imie: adminName.value,
        nazwisko: adminSurname.value,
        numerTelefonu: phoneNumber.value,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update details")
    }

    showAlert({
      type: "success",
      message: "Details updated successfully.",
      position: "top-right",
    })

    isEditing.value = false
    await loadUserDetails()
  } catch (error) {
    showAlert({
      type: "error",
      message: "Could not update details.",
      position: "top-right",
    })
  } finally {
    isLoading.value = false
  }
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

onMounted(loadUserDetails)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Dashboard</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">Admin Dashboard</span>
        </p>
      </div>
    </div>

    <div class="container main-content">
      <aside class="sidebar">
        <div class="sidebar-card">
          <ul class="menu-list">
            <li class="active">
              <span class="icon">🏠</span>
              <span class="menu-text">Dashboard</span>
            </li>
            <li>
              <span class="icon">📦</span>
              <span class="menu-text">Order Management</span>
            </li>
            <li>
              <span class="icon">🛍️</span>
              <span class="menu-text">Product Management</span>
            </li>
            <li>
              <span class="icon">👥</span>
              <span class="menu-text">User Management</span>
            </li>
            <li>
              <span class="icon">👤</span>
              <span class="menu-text">Admin Details</span>
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
        <div class="dashboard-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ adminName.charAt(0) }}
            </div>
            <div class="profile-title">
              <h2>{{ adminName }}</h2>
              <p class="admin-badge">Administrator</p>
              <p class="email-text">{{ adminEmail }}</p>
            </div>
            <button
              v-if="!isEditing"
              class="btn-primary"
              @click="isEditing = true"
            >
              Edit Details
            </button>

            <button
              v-else
              class="btn-primary"
              @click="saveUserDetails"
              :disabled="isLoading"
            >
              {{ isLoading ? "Saving..." : "Save Details" }}
            </button>
          </div>

          <div class="details-section">
            <h3 class="section-title">Administrative Information</h3>
            <div class="details-grid">
            <div class="detail-group">
              <span class="detail-label">First Name</span>
              <input
                v-if="isEditing"
                class="detail-input"
                v-model="adminName"
                placeholder="Enter first name"
              />
              <span v-else class="detail-value">{{ adminName || "Not set" }}</span>
            </div>

            <div class="detail-group">
              <span class="detail-label">Last Name</span>
              <input
                v-if="isEditing"
                class="detail-input"
                v-model="adminSurname"
                placeholder="Enter last name"
              />
              <span v-else class="detail-value">{{ adminSurname || "Not set" }}</span>
            </div>

            <div class="detail-group">
              <span class="detail-label">Admin Email</span>
              <span class="detail-value">{{ adminEmail }}</span>
            </div>

            <div class="detail-group">
              <span class="detail-label">Phone Number</span>
              <input
                v-if="isEditing"
                class="detail-input"
                v-model="phoneNumber"
                placeholder="Enter phone number"
              />
              <span v-else class="detail-value">{{ phoneNumber || "Not set" }}</span>
            </div>

            <div class="detail-group">
              <span class="detail-label">Role</span>
              <span class="detail-value">{{ role }}</span>
            </div>
            </div>
          </div>

          <div class="security-section">
            <h3 class="section-title">Security & Access</h3>
            <div class="security-flex">
              <div class="security-info">
                <span class="detail-label">Admin Password</span>
                <span class="detail-value">••••••••••••</span>
              </div>
              <button class="btn-outline">Change Password</button>
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

.dashboard-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #eae8f5;
}

.profile-header {
  display: flex;
  align-items: center;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid #eae8f5;
  margin-bottom: 2.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background-color: #151875;
  color: #ffffff;
  font-size: 2.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 1.5rem;
  box-shadow: 0 4px 10px rgba(21, 24, 117, 0.2);
}

.profile-title {
  flex: 1;
}

.profile-title h2 {
  font-size: 1.8rem;
  color: #151875;
  margin: 0 0 0.2rem 0;
  font-weight: 700;
}

.admin-badge {
  display: inline-block;
  background-color: #fdf2f6;
  color: #fb2e86;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  margin: 0 0 0.4rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.email-text {
  color: #8a8fb9;
  font-size: 1.05rem;
  margin: 0;
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
}

.btn-primary:hover {
  background-color: #2e3b75;
  transform: translateY(-2px);
}

.section-title {
  font-size: 1.25rem;
  color: #151875;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.9rem;
  color: #8a8fb9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.4rem;
}

.detail-value {
  font-size: 1.1rem;
  color: #150e24;
  font-weight: 500;
}

.security-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fbfbfe;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eae8f5;
}

.security-info {
  display: flex;
  flex-direction: column;
}

.btn-outline {
  background-color: transparent;
  color: #151875;
  border: 1px solid #dcdcdc;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  border-color: #8a8fb9;
  background-color: #ffffff;
}

@media (max-width: 850px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .header-banner {
    padding: 2.5rem 0;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .profile-avatar {
    margin-right: 0;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .security-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .detail-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #fafafc;
  border: 1px solid #e1e1e8;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  color: #150e24;
  font-weight: 500;
  font-size: 1rem;
}

.detail-input:focus {
  background-color: #ffffff;
  border-color: #3f509e;
  box-shadow: 0 0 0 4px rgba(63, 80, 158, 0.1);
}
}
</style>
