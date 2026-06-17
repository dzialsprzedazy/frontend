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
const isAdmin = ref(false)

const originalData = ref({})

const isEditing = ref(false)
const isLoading = ref(false)

const activeTab = ref("dashboard")

const selectedOrder = ref(null)
const showOrderDetails = ref(false)
const expandedOrderId = ref(null)

const openOrderDetails = async (orderId) => {
  if (expandedOrderId.value === orderId) {
    expandedOrderId.value = null
    return
  }

  try {
    isLoading.value = true
    const response = await api.get(`users/orders/${orderId}`)

    selectedOrder.value = response.data

    expandedOrderId.value = orderId

    showOrderDetails.value = true
    console.log(selectedOrder.value)
    isReportIssuePossible.value = selectedOrder.value.idStatusu != 5
  } catch (error) {
    showAlert({ type: "error", message: "Could not load order details." })
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

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
const issueForm = ref({
  idZamowienia: null,
  idPozycji: null,
  email: "",
  idTypuZgloszenia: 1,
  powod: "",
  productName: "",
})
const orders = ref([])
const isLoadingOrders = ref(false)
const showIssueModal = ref(false)
const isSubmittingIssue = ref(false)
const isReportIssuePossible = ref(true)

const discountCodes = ref([])
const isLoadingCodes = ref(false)
const issueTypes = ref(null)

const getOrderStatusInfo = (statusId) => {
  const statuses = {
    1: { text: "Pending", class: "status-warning" },
    2: { text: "Processing", class: "status-warning" },
    3: { text: "Shipped", class: "status-warning" },
    4: { text: "Delivered", class: "status-success" },
    5: { text: "Cancelled", class: "status-danger" },
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
    const issueTypesResponse = await api.get("returns/types")
    issueTypes.value = issueTypesResponse.data
    orders.value = response.data
  } catch (error) {
    showAlert({ type: "error", message: "Failed to load orders." })
    console.error(error)
  } finally {
    isLoadingOrders.value = false
  }
}

const loadDiscountCodes = async () => {
  try {
    isLoadingCodes.value = true
    const response = await api.get("DiscountCodes/my-codes")
    discountCodes.value = response.data
  } catch (error) {
    showAlert({ type: "error", message: "Failed to load discount codes." })
  } finally {
    isLoadingCodes.value = false
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
  const { miasto, ulica, numerBudynku, kodPocztowy } = newAddress.value

  if (
    !miasto.trim() ||
    !ulica.trim() ||
    !numerBudynku.trim() ||
    !kodPocztowy.trim()
  ) {
    showAlert({ type: "error", message: "Uzupełnij wymagane pola!" })
    return
  }

  const zipRegex = /^\d{2}-\d{3}$/
  if (!zipRegex.test(kodPocztowy)) {
    showAlert({
      type: "error",
      message: "Kod pocztowy musi mieć format 00-000",
    })
    return
  }

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
const getStatusClass = (statusId) => {
  switch (statusId) {
    case 1:
      return "status-warning"
    case 2:
      return "status-success"
    case 3:
      return "status-danger"
    default:
      return "status-warning"
  }
}
const openIssueModal = (order, product) => {
  console.log(product)
  issueForm.value = {
    idZamowienia: order.idZamowienia,
    idPozycji: product.idPozycji || product.idProduktu,
    email: userEmail.value || order.email || "",
    idTypuZgloszenia: 1,
    powod: "",
    productName: product.nazwaWMomencieZakupu || product.nazwaProduktu,
  }
  showIssueModal.value = true
}

const closeIssueModal = () => {
  showIssueModal.value = false
}

const submitIssue = async () => {
  if (!issueForm.value.powod || !issueForm.value.powod.trim()) {
    showAlert({
      type: "error",
      message: "Please provide a reason for your request.",
      position: "top-right",
    })
    return
  }

  try {
    isSubmittingIssue.value = true
    await api.post("Returns", {
      idZamowienia: issueForm.value.idZamowienia,
      idPozycji: issueForm.value.idPozycji,
      email: issueForm.value.email,
      idTypu: issueForm.value.idTypuZgloszenia,
      powod: issueForm.value.powod,
    })

    showAlert({
      type: "success",
      message: "Your issue has been reported successfully.",
      position: "top-right",
      duration: 800,
    })

    openOrderDetails(selectedOrder.value.idZamowienia)
    openOrderDetails(selectedOrder.value.idZamowienia)
    closeIssueModal()
  } catch (error) {
    showAlert({
      type: "error",
      message:
        error.response?.data?.message ||
        "An error occurred while reporting the issue. Please try again.",
      position: "top-right",
      duration: 800,
    })
  } finally {
    isSubmittingIssue.value = false
  }
}
const setActiveTab = (tab) => {
  activeTab.value = tab
  if (tab === "addresses") loadAddresses()
  if (tab === "orders") loadOrders()
  if (tab === "discount-codes") loadDiscountCodes()
}

const loadUserDetails = async () => {
  try {
    const response = await api.get("users/me")
    const data = response.data

    userName.value = data.imie || ""
    userSurname.value = data.nazwisko || ""
    userEmail.value = data.email || ""
    phoneNumber.value = data.telefon || ""

    isAdmin.value = data.roles && data.roles.includes("Admin")
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

const copyToClipboard = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      showAlert({
        type: "success",
        message: "Code copied to clipboard!",
        position: "top-right",
      })
    })
    .catch(() => {
      showAlert({
        type: "error",
        message: "Failed to copy code.",
        position: "top-right",
      })
    })
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
            activeTab === "dashboard"
              ? "Dashboard"
              : activeTab === "orders"
                ? "Order History"
                : activeTab === "discount-codes"
                  ? "Discount Codes"
                  : "Saved Addresses"
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
            <li
              :class="{ active: activeTab === 'discount-codes' }"
              @click="setActiveTab('discount-codes')"
            >
              <span class="icon">🏷️</span>
              <span class="menu-text">My Discount Codes</span>
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
        <div v-if="activeTab === 'dashboard'" class="dashboard-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ (userName.charAt(0) || "U").toUpperCase() }}
            </div>

            <div class="profile-title">
              <h2>{{ userName || "User" }} {{ userSurname }}</h2>
              <p>{{ userEmail }}</p>
            </div>

            <div v-if="!isEditing" class="action-buttons">
              <button class="btn-primary" @click="startEditing">
                Edit Profile
              </button>
            </div>

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
            <div
              v-if="isLoadingOrders"
              class="empty-state"
              style="text-align: center; padding: 3rem"
            >
              <p class="detail-label">Loading orders...</p>
            </div>

            <div
              v-else-if="orders.length > 0"
              class="details-grid"
              style="grid-template-columns: 1fr; gap: 1.5rem"
            >
              <div
                v-for="order in orders"
                :key="order.idZamowienia"
                class="security-flex"
                style="
                  flex-direction: column;
                  align-items: stretch;
                  gap: 0;
                  padding: 0;
                  overflow: hidden;
                "
              >
                <div style="padding: 1.5rem">
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      border-bottom: 1px solid #eae8f5;
                      padding-bottom: 1rem;
                      margin-bottom: 1rem;
                    "
                  >
                    <div>
                      <span class="detail-label"
                        >Order ID: #{{ order.idZamowienia }}</span
                      >
                      <span
                        class="detail-value"
                        style="display: block; margin-top: 0.3rem"
                        >{{ formatOrderDate(order.dataZamowienia) }}</span
                      >
                    </div>
                    <div style="text-align: right">
                      <span class="detail-label">Status</span>
                      <span
                        class="status-badge"
                        :class="getOrderStatusInfo(order.idStatusu).class"
                        style="display: block; margin-top: 0.3rem"
                      >
                        {{ getOrderStatusInfo(order.idStatusu).text }}
                      </span>
                    </div>
                  </div>
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    "
                  >
                    <span class="detail-value"
                      >Total:
                      <strong
                        >{{ order.calkowitaKwota.toFixed(2) }} PLN</strong
                      ></span
                    >

                    <button
                      class="btn-outline"
                      :class="{
                        'active-btn': expandedOrderId === order.idZamowienia,
                      }"
                      @click="openOrderDetails(order.idZamowienia)"
                    >
                      {{
                        expandedOrderId === order.idZamowienia
                          ? "Hide Details"
                          : "View Details"
                      }}
                    </button>
                  </div>
                </div>

                <Transition name="details">
                  <div
                    v-if="
                      expandedOrderId === order.idZamowienia && selectedOrder
                    "
                    class="expanded-row"
                  >
                    <div
                      class="details-grid"
                      style="
                        grid-template-columns: repeat(
                          auto-fit,
                          minmax(150px, 1fr)
                        );
                        gap: 1.5rem;
                        margin-bottom: 1.5rem;
                      "
                    >
                      <div class="detail-group">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">{{
                          selectedOrder.metodaPlatnosciNazwa || "Standard"
                        }}</span>
                      </div>
                      <div class="detail-group">
                        <span class="detail-label">Delivery Method</span>
                        <span class="detail-value">{{
                          selectedOrder.metodaDostawyNazwa || "Courier"
                        }}</span>
                      </div>
                      <div
                        class="detail-group"
                        v-if="selectedOrder.adresZamowienia"
                      >
                        <span class="detail-label">Shipping Address</span>
                        <span
                          class="detail-value"
                          style="font-size: 0.95rem; line-height: 1.4"
                        >
                          {{ selectedOrder.adresZamowienia.ulica }}
                          {{ selectedOrder.adresZamowienia.numerBudynku }}<br />
                          {{ selectedOrder.adresZamowienia.kodPocztowy }}
                          {{ selectedOrder.adresZamowienia.miasto }}
                        </span>
                      </div>
                    </div>

                    <div class="order-items-section">
                      <h4 class="items-title">Ordered Products</h4>
                      <div class="items-grid">
                        <div
                          v-for="item in selectedOrder.pozycje ||
                          selectedOrder.Pozycje ||
                          []"
                          :key="item.idProduktu || item.IdProduktu"
                          class="item-tile"
                        >
                          <div class="item-name">
                            {{ item.nazwaProduktu || item.NazwaProduktu }}
                          </div>
                          <div class="item-meta">
                            <span class="item-qty"
                              >{{ item.ilosc || item.Ilosc }} szt.</span
                            >
                            <span class="item-price"
                              >{{
                                (item.cena || item.Cena).toFixed(2)
                              }}
                              PLN</span
                            >
                            <button
                              v-if="
                                isReportIssuePossible &&
                                item.idStatusuZwrotu == null
                              "
                              class="btn-outline report-error-btn"
                              @click="openIssueModal(order, item)"
                            >
                              ⚠️
                            </button>
                            <!-- <div
                              v-else-if="
                                item.idStatusuZwrotu
                              "
                              class="status-badge-container"
                            >
                              <p class="detail-label">Claim Status:</p>
                              <span
                                :class="[
                                  'status-badge',
                                  getStatusClass(item.idStatusuZwrotu),
                                ]"
                              >
                                {{ item.statusZwrotu || "Pending Review" }}
                              </span>
                            </div> -->
                          </div>
                        </div>
                      </div>

                      <div class="order-summary-footer">
                        <div class="order-total-expanded">
                          Total Amount:
                          <strong
                            >{{
                              selectedOrder.calkowitaKwota.toFixed(2)
                            }}
                            PLN</strong
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
            <div
              v-else
              class="empty-state"
              style="text-align: center; padding: 3rem"
            >
              <span style="font-size: 3rem; display: block; margin-bottom: 1rem"
                >📦</span
              >
              <p class="detail-label">You haven't placed any orders yet.</p>
              <button
                class="btn-primary"
                style="margin-top: 1rem"
                @click="router.push('/products')"
              >
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

        <div v-else-if="activeTab === 'discount-codes'" class="dashboard-card">
          <div class="profile-header">
            <div class="profile-title">
              <h2>My Discount Codes</h2>
              <p>Available codes for your purchases</p>
            </div>
          </div>

          <div class="details-section">
            <div
              v-if="isLoadingCodes"
              class="empty-state"
              style="text-align: center; padding: 3rem"
            >
              <p class="detail-label">Loading codes...</p>
            </div>

            <div
              v-else-if="discountCodes.length > 0"
              class="details-grid"
              style="
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
              "
            >
              <div
                v-for="code in discountCodes"
                :key="code.idKodu"
                class="discount-card"
                :class="{ 'used-card': code.czyWykorzystany }"
              >
                <div class="discount-percentage">
                  {{ code.znizkaProcentowa }}% OFF
                </div>
                <div class="discount-details">
                  <p
                    class="discount-code-text"
                    :class="{ 'used-text': code.czyWykorzystany }"
                  >
                    {{ code.kod }}
                  </p>

                  <button
                    v-if="!code.czyWykorzystany"
                    class="btn-copy"
                    @click="copyToClipboard(code.kod)"
                  >
                    <i class="fa-regular fa-copy"></i> Copy Code
                  </button>
                  <span v-else class="used-badge">Wykorzystany</span>
                </div>
              </div>
            </div>
            <div
              v-else
              class="empty-state"
              style="text-align: center; padding: 3rem"
            >
              <span style="font-size: 3rem; display: block; margin-bottom: 1rem"
                >🎟️</span
              >
              <p class="detail-label">You don't have any discount codes yet.</p>
            </div>
          </div>
        </div>
      </main>
      <Transition name="fade">
        <div
          v-if="showIssueModal"
          class="modal-overlay"
          @click.self="closeIssueModal"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h3>Report an Issue</h3>
              <button class="close-btn" @click="closeIssueModal">
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-group" style="margin-bottom: 1.25rem">
                <span class="detail-label">Selected Product</span>
                <div
                  style="
                    background-color: #f6f5ff;
                    padding: 0.8rem;
                    border-radius: 8px;
                    border: 1px solid #cfd4ed;
                    color: #151875;
                    font-weight: 600;
                  "
                >
                  <i
                    class="fa-solid fa-cube"
                    style="color: #3f509e; margin-right: 8px"
                  ></i>
                  {{ issueForm.productName }}
                </div>
              </div>

              <div class="detail-group" style="margin-bottom: 1.25rem">
                <span class="detail-label">Email Address (from order)</span>
                <input
                  type="email"
                  class="detail-input"
                  v-model="issueForm.email"
                  disabled
                  style="background-color: #f0f2f8; cursor: not-allowed"
                />
              </div>

              <div class="detail-group" style="margin-bottom: 1.25rem">
                <span class="detail-label">Issue Type</span>
                <select
                  class="detail-input"
                  v-model="issueForm.idTypuZgloszenia"
                  style="
                    padding: 0.6rem;
                    border-radius: 8px;
                    border: 1px solid #dcdcdc;
                    font-weight: 600;
                    color: #151875;
                  "
                >
                  <option
                    v-for="type in issueTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div class="detail-group">
                <span class="detail-label">Reason / Justification</span>
                <textarea
                  class="detail-input"
                  rows="4"
                  v-model="issueForm.powod"
                  placeholder="Please describe the problem with this product..."
                  style="
                    padding: 0.6rem;
                    border-radius: 8px;
                    border: 1px solid #dcdcdc;
                    resize: vertical;
                  "
                  :style="
                    !issueForm.powod.trim() ? 'border-color: #ffcccc;' : ''
                  "
                ></textarea>
              </div>

              <div
                style="
                  margin-top: 1.25rem;
                  font-size: 0.85rem;
                  color: #8a8fb9;
                  display: flex;
                  gap: 8px;
                  align-items: flex-start;
                  background: #fdfdfd;
                  padding: 12px;
                  border-radius: 8px;
                  border: 1px dashed #dcdcdc;
                "
              >
                <i
                  class="fa-solid fa-circle-info"
                  style="color: #3f509e; margin-top: 2px"
                ></i>
                <p style="margin: 0; line-height: 1.4">
                  <strong>Please note:</strong> Any further communication
                  regarding this issue will be conducted via the email address
                  provided above.
                </p>
              </div>
            </div>
            <div
              class="modal-footer"
              style="
                margin-top: 1.5rem;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
              "
            >
              <button
                class="btn-outline"
                @click="closeIssueModal"
                :disabled="isSubmittingIssue"
              >
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="submitIssue"
                :disabled="isSubmittingIssue"
              >
                {{ isSubmittingIssue ? "Submitting..." : "Submit Issue" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
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
.order-items-section {
  margin-top: 1rem;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #eae8f5;
}

.order-item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  flex: 2;
}

.item-name {
  font-weight: 600;
  color: #151875;
  font-size: 0.95rem;
}

.item-id {
  font-size: 0.75rem;
  color: #8a8fb9;
}

.item-calculation {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-qty {
  /* background-color: #f0f2f8;
  color: #3f509e;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 4px; */
}

.item-price {
  font-size: 0.9rem;
  color: #151875;
  font-weight: 600;
}

.item-actions {
  flex: 1;
  text-align: right;
}

.report-error-btn {
  padding: 0.4rem 0.8rem !important;
  font-size: 0.85rem !important;
  color: #e03a5b !important;
  border-color: #fdf2f4 !important;
}

.report-error-btn:hover {
  background-color: #fdf2f4 !important;
  border-color: #e03a5b !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(21, 14, 36, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  animation: modalFadeIn 0.25s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #151875;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.7rem;
  color: #8a8fb9;
  cursor: pointer;
}

.close-btn:hover {
  color: #fb2e86;
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

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action.edit {
  background-color: #f6f5ff;
  color: #3f509e;
  border: 1px solid #3f509e;
}

.btn-action.edit:hover {
  background-color: #3f509e;
  color: #ffffff;
}

.btn-action.delete {
  background-color: #fff0f4;
  color: #fb2e86;
  border: 1px solid #fb2e86;
}

.btn-action.delete:hover {
  background-color: #fb2e86;
  color: #ffffff;
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

.details-enter-active,
.details-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}

.details-enter-from,
.details-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.expanded-row {
  background-color: #fbfbfe;
  border-top: 1px solid #eae8f5;
  padding: 1.5rem;
}

.expanded-row:hover {
  background-color: #f6f5ff;
}

.active-btn {
  background-color: #3f509e !important;
  color: white !important;
  border-color: #3f509e !important;
}
@keyframes modalFadeIn {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.discount-card {
  display: flex;
  background-color: #fbfbfe;
  border: 2px dashed #3f509e;
  border-radius: 12px;
  overflow: hidden;
}

.discount-percentage {
  background-color: #3f509e;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 800;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.discount-details {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.discount-code-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #151875;
  letter-spacing: 2px;
  margin: 0;
}

.btn-copy {
  background: none;
  border: none;
  color: #fb2e86;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  padding: 0;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-copy:hover {
  opacity: 0.8;
}

.order-items-section {
  margin-top: 1.5rem;
  border-top: 1px dashed #eae8f5;
  padding-top: 1.5rem;
}

.items-title {
  font-size: 1.05rem;
  color: #151875;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.item-tile {
  background: #ffffff;
  border: 1px solid #eae8f5;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.item-name {
  font-weight: 600;
  color: #150e24;
  font-size: 0.95rem;
  line-height: 1.3;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #8a8fb9;
}

.item-price {
  font-weight: 700;
  color: #3f509e;
}

.order-total-expanded {
  margin-top: 1.5rem;
  text-align: right;
  font-size: 1.1rem;
  color: #150e24;
}

.order-total-expanded strong {
  color: #3f509e;
  font-size: 1.4rem;
  margin-left: 0.5rem;
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
  .order-item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .item-actions {
    text-align: left;
    width: 100%;
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

  .discount-card {
    flex-direction: column;
  }

  .discount-percentage {
    min-width: auto;
    padding: 1rem;
  }

  .order-summary-footer {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eae8f5;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: #8a8fb9;
  }

  .order-total-expanded {
    margin-top: 0.5rem;
    text-align: right;
    font-size: 1.1rem;
    color: #150e24;
  }

  .order-total-expanded strong {
    color: #3f509e;
    font-size: 1.4rem;
    margin-left: 0.5rem;
  }

  .used-card {
    border-color: #dcdcdc;
    background-color: #f5f5f5;
    opacity: 0.7;
  }

  .used-card .discount-percentage {
    background-color: #8a8fb9;
  }

  .used-text {
    text-decoration: line-through;
    color: #8a8fb9;
  }

  .used-badge {
    color: #8a8fb9;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}
</style>
