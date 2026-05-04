<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const userName = ref("")
const userSurname = ref("")
const userEmail = ref("")
const phoneNumber = ref("")

const originalData = ref({})

const isEditing = ref(false)
const isLoading = ref(false)

const activeTab = ref("dashboard")

const addresses = ref([])
const showAddressForm = ref(false)
const isEditingAddress = ref(false)
const currentAddressId = ref(null)

const newAddress = ref({
  miasto: "",
  ulica: "",
  numerBudynku: "",
  numerLokalu: "",
  kodPocztowy: "",
})

const orders = ref([])
const isLoadingOrders = ref(false)

const getOrderStatusInfo = (statusId) => {
  const statuses = {
    1: { text: "W realizacji", class: "status-warning" },
    2: { text: "Wysłane", class: "status-warning" },
    3: { text: "Dostarczone", class: "status-success" },
    4: { text: "Anulowane", class: "status-danger" },
    5: { text: "Oczekuje na płatność", class: "status-warning" },
  }
  return statuses[statusId] || { text: "Nieznany", class: "" }
}

const formatOrderDate = (dateString) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

const loadAddresses = async () => {
  try {
    const response = await api.get("users/addresses")
    addresses.value = response.data
  } catch (error) {
    showAlert({ type: "error", message: "Failed to load addresses." })
  }
}

const loadOrders = async () => {
  try {
    isLoadingOrders.value = true
    const response = await api.get("users/orders")
    orders.value = response.data
  } catch (error) {
    showAlert({ type: "error", message: "Failed to load orders." })
  } finally {
    isLoadingOrders.value = false
  }
}

const openAddAddress = () => {
  isEditingAddress.value = false
  currentAddressId.value = null
  newAddress.value = {
    miasto: "",
    ulica: "",
    numerBudynku: "",
    numerLokalu: "",
    kodPocztowy: "",
  }
  showAddressForm.value = true
}

const openEditAddress = (addr) => {
  isEditingAddress.value = true
  currentAddressId.value = addr.idAdresu
  newAddress.value = {
    miasto: addr.miasto,
    ulica: addr.ulica,
    numerBudynku: addr.numerBudynku,
    numerLokalu: addr.numerLokalu,
    kodPocztowy: addr.kodPocztowy,
  }
  showAddressForm.value = true
}

const saveAddress = async () => {
  try {
    isLoading.value = true
    if (isEditingAddress.value) {
      await api.put(
        `users/addresses/${currentAddressId.value}`,
        newAddress.value,
      )
      showAlert({ type: "success", message: "Address updated successfully!" })
    } else {
      await api.post("users/addresses", newAddress.value)
      showAlert({ type: "success", message: "Address added successfully!" })
    }
    showAddressForm.value = false
    await loadAddresses()
  } catch (error) {
    showAlert({ type: "error", message: "Error saving address." })
  } finally {
    isLoading.value = false
  }
}

const deleteAddress = async (id) => {
  if (!confirm("Are you sure you want to delete this address?")) return

  try {
    await api.delete(`users/addresses/${id}`)
    showAlert({ type: "success", message: "Address deleted." })
    await loadAddresses()
  } catch (error) {
    showAlert({ type: "error", message: "Could not delete address." })
  }
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  if (tab === "addresses") loadAddresses()
  if (tab === "orders") loadOrders()
}

const loadUserDetails = async () => {
  try {
    const response = await api.get("users/me")
    const data = response.data

    userName.value = data.imie || ""
    userSurname.value = data.nazwisko || ""
    userEmail.value = data.email || ""
    phoneNumber.value = data.telefon || ""
  } catch (error) {
    if (error.response?.status === 401) {
      router.push("/login")
      return
    }

    showAlert({
      type: "error",
      message: "Could not load user details.",
      position: "top-right",
    })
  }
}

const startEditing = () => {
  originalData.value = {
    userName: userName.value,
    userSurname: userSurname.value,
    phoneNumber: phoneNumber.value,
  }
  isEditing.value = true
}

const discardChanges = () => {
  userName.value = originalData.value.userName
  userSurname.value = originalData.value.userSurname
  phoneNumber.value = originalData.value.phoneNumber
  isEditing.value = false
}

const saveUserDetails = async () => {
  try {
    isLoading.value = true

    await api.put("users/details", {
      imie: userName.value,
      nazwisko: userSurname.value,
      numerTelefonu: phoneNumber.value,
    })

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
  router.push("/login")
}

const isChangingPassword = ref(false)
const passwordData = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
})

const changePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    showAlert({
      type: "error",
      message: "New passwords do not match.",
      position: "top-right",
    })
    return
  }

  try {
    isLoading.value = true
    await api.post("users/change-password", {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword,
    })

    showAlert({
      type: "success",
      message: "Password changed successfully.",
      position: "top-right",
    })

    isChangingPassword.value = false
    passwordData.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Could not change password."
    showAlert({
      type: "error",
      message: errorMessage,
      position: "top-right",
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(loadUserDetails)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">My Account</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">{{
            activeTab === "dashboard" ? "Dashboard" : activeTab === "orders" ? "Order History" : "Saved Addresses"
          }}</span>
        </p>
      </div>
    </div>

    <div class="container main-content">
      <aside class="sidebar">
        <div class="sidebar-card">
          <ul class="menu-list">
            <li
              :class="{ active: activeTab === 'dashboard' }"
              @click="setActiveTab('dashboard')"
            >
              <span class="icon">🏠</span>
              <span class="menu-text">Dashboard</span>
            </li>
            <li
              :class="{ active: activeTab === 'orders' }"
              @click="setActiveTab('orders')"
            >
              <span class="icon">📦</span>
              <span class="menu-text">Order History</span>
            </li>
            <li
              :class="{ active: activeTab === 'addresses' }"
              @click="setActiveTab('addresses')"
            >
              <span class="icon">📍</span>
              <span class="menu-text">Saved Addresses</span>
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
        <!-- ZAKŁADKA DASHBOARD -->
        <div v-if="activeTab === 'dashboard'" class="dashboard-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ (userName.charAt(0) || "U").toUpperCase() }}
            </div>

            <div class="profile-title">
              <h2>{{ userName || "User" }} {{ userSurname }}</h2>
              <p>{{ userEmail }}</p>
            </div>

            <button v-if="!isEditing" class="btn-primary" @click="startEditing">
              Edit Profile
            </button>

            <div v-else class="action-buttons">
              <button
                class="btn-outline"
                @click="discardChanges"
                :disabled="isLoading"
              >
                Discard
              </button>
              <button
                class="btn-primary"
                @click="saveUserDetails"
                :disabled="isLoading"
              >
                {{ isLoading ? "Saving..." : "Save" }}
              </button>
            </div>
          </div>

          <div class="details-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="details-grid">
              <div class="detail-group">
                <span class="detail-label">First Name</span>
                <input
                  v-if="isEditing"
                  class="detail-input"
                  v-model="userName"
                />
                <span v-else class="detail-value">{{
                  userName || "Not provided"
                }}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Last Name</span>
                <input
                  v-if="isEditing"
                  class="detail-input"
                  v-model="userSurname"
                />
                <span v-else class="detail-value">{{
                  userSurname || "Not provided"
                }}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Email Address</span>
                <span class="detail-value">{{ userEmail }}</span>
              </div>
              <div class="detail-group">
                <span class="detail-label">Phone Number</span>
                <input
                  v-if="isEditing"
                  class="detail-input"
                  v-model="phoneNumber"
                />
                <span v-else class="detail-value">{{
                  phoneNumber || "Not provided"
                }}</span>
              </div>
            </div>
          </div>

          <div class="security-section">
            <h3 class="section-title">Security</h3>
            <div v-if="!isChangingPassword" class="security-flex">
              <div class="security-info">
                <span class="detail-label">Password</span>
                <span class="detail-value">••••••••••••</span>
              </div>
              <button class="btn-outline" @click="isChangingPassword = true">
                Change Password
              </button>
            </div>

            <div v-else class="password-form-card">
              <div class="details-grid">
                <div class="detail-group">
                  <span class="detail-label">Old Password</span>
                  <input
                    type="password"
                    class="detail-input"
                    v-model="passwordData.currentPassword"
                  />
                </div>
                <div class="detail-group">
                  <span class="detail-label">New Password</span>
                  <input
                    type="password"
                    class="detail-input"
                    v-model="passwordData.newPassword"
                  />
                </div>
                <div class="detail-group">
                  <span class="detail-label">Confirm New Password</span>
                  <input
                    type="password"
                    class="detail-input"
                    v-model="passwordData.confirmPassword"
                  />
                </div>
              </div>
              <div class="action-buttons" style="margin-top: 1rem">
                <button class="btn-outline" @click="isChangingPassword = false">
                  Cancel
                </button>
                <button
                  class="btn-primary"
                  @click="changePassword"
                  :disabled="isLoading"
                >
                  {{ isLoading ? "Updating..." : "Update Password" }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'orders'" class="dashboard-card">
          <div class="profile-header">
            <div class="profile-title">
              <h2>Order History</h2>
              <p>View and manage your recent orders</p>
            </div>
          </div>

          <div class="details-section">
            <div v-if="isLoadingOrders" class="empty-state" style="text-align: center; padding: 3rem">
              <p class="detail-label">Loading orders...</p>
            </div>
            
            <div v-else-if="orders.length > 0" class="details-grid" style="grid-template-columns: 1fr; gap: 1rem;">
              <div 
                v-for="order in orders" 
                :key="order.idZamowienia" 
                class="security-flex"
                style="flex-direction: column; align-items: stretch; gap: 1rem;"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eae8f5; padding-bottom: 1rem;">
                  <div>
                    <span class="detail-label">Order ID: #{{ order.idZamowienia }}</span>
                    <span class="detail-value" style="display: block; margin-top: 0.3rem;">{{ formatOrderDate(order.dataZamowienia) }}</span>
                  </div>
                  <div style="text-align: right;">
                    <span class="detail-label">Status</span>
                    <span 
                      class="status-badge" 
                      :class="getOrderStatusInfo(order.idStatusu).class"
                      style="display: block; margin-top: 0.3rem;"
                    >
                      {{ getOrderStatusInfo(order.idStatusu).text }}
                    </span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="detail-value">Total: <strong>{{ order.calkowitaKwota.toFixed(2) }} PLN</strong></span>
                  <button class="btn-outline" style="padding: 0.5rem 1rem;">View Details</button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state" style="text-align: center; padding: 3rem">
              <span style="font-size: 3rem; display: block; margin-bottom: 1rem">📦</span>
              <p class="detail-label">You haven't placed any orders yet.</p>
              <button class="btn-primary" style="margin-top: 1rem;" @click="router.push('/products')">
                Start Shopping
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="activeTab === 'addresses'" class="dashboard-card">
          <div class="profile-header">
            <div class="profile-title">
              <h2>Your Saved Addresses</h2>
              <p>Manage your delivery information</p>
            </div>
            <button
              class="btn-primary"
              @click="
                showAddressForm ? (showAddressForm = false) : openAddAddress()
              "
            >
              {{ showAddressForm ? "Cancel" : "Add New Address" }}
            </button>
          </div>

          <div v-if="!showAddressForm" class="details-section">
            <div v-if="addresses.length > 0" class="details-grid">
              <div
                v-for="addr in addresses"
                :key="addr.idAdresu"
                class="security-flex"
                style="
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 1rem;
                "
              >
                <div class="address-info">
                  <p class="detail-value">
                    <strong
                      >{{ addr.ulica }} {{ addr.numerBudynku
                      }}{{
                        addr.numerLokalu ? "/" + addr.numerLokalu : ""
                      }}</strong
                    >
                  </p>
                  <p
                    class="detail-label"
                    style="text-transform: none; margin: 0"
                  >
                    {{ addr.kodPocztowy }} {{ addr.miasto }}
                  </p>
                </div>
                <div class="action-buttons">
                  <button
                    class="btn-outline"
                    @click="openEditAddress(addr)"
                    style="padding: 0.5rem 1rem"
                  >
                    Edit
                  </button>
                  <button
                    class="btn-outline"
                    @click="deleteAddress(addr.idAdresu)"
                    style="
                      padding: 0.5rem 1rem;
                      color: #fb2e86;
                      border-color: #fdf2f6;
                    "
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div
              v-else
              class="empty-state"
              style="text-align: center; padding: 3rem"
            >
              <span style="font-size: 3rem; display: block; margin-bottom: 1rem"
                >📍</span
              >
              <p class="detail-label">No addresses saved yet.</p>
            </div>
          </div>

          <div v-else class="password-form-card">
            <h3 class="section-title">
              {{ isEditingAddress ? "Edit Address" : "New Address" }}
            </h3>
            <div class="details-grid">
              <div class="detail-group">
                <span class="detail-label">City</span>
                <input
                  class="detail-input"
                  v-model="newAddress.miasto"
                  placeholder="e.g. Warsaw"
                />
              </div>
              <div class="detail-group">
                <span class="detail-label">Street</span>
                <input
                  class="detail-input"
                  v-model="newAddress.ulica"
                  placeholder="e.g. Kwiatowa"
                />
              </div>
              <div class="detail-group">
                <span class="detail-label">Building No.</span>
                <input
                  class="detail-input"
                  v-model="newAddress.numerBudynku"
                  placeholder="e.g. 12"
                />
              </div>
              <div class="detail-group">
                <span class="detail-label">Apartment No.</span>
                <input
                  class="detail-input"
                  v-model="newAddress.numerLokalu"
                  placeholder="Optional"
                />
              </div>
              <div class="detail-group">
                <span class="detail-label">Zip Code</span>
                <input
                  class="detail-input"
                  v-model="newAddress.kodPocztowy"
                  placeholder="00-000"
                />
              </div>
            </div>
            <div class="action-buttons" style="margin-top: 1.5rem">
              <button class="btn-outline" @click="showAddressForm = false">
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="saveAddress"
                :disabled="isLoading"
              >
                {{
                  isLoading
                    ? "Saving..."
                    : isEditingAddress
                      ? "Update Address"
                      : "Save Address"
                }}
              </button>
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
  background-color: #fb2e86;
  color: #ffffff;
  font-size: 2.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 1.5rem;
  box-shadow: 0 4px 10px rgba(251, 46, 134, 0.2);
}

.profile-title {
  flex: 1;
}

.profile-title h2 {
  font-size: 1.8rem;
  color: #151875;
  margin: 0 0 0.3rem 0;
  font-weight: 700;
}

.profile-title p {
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

.action-buttons {
  display: flex;
  gap: 1rem;
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

.password-form-card {
  background-color: #fbfbfe;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #eae8f5;
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

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-success {
  background-color: #e6fbd9;
  color: #2e7d32;
}

.status-warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-danger {
  background-color: #fdf2f4;
  color: #e03a5b;
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
}
</style>