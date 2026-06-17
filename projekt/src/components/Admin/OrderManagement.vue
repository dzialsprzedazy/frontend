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

const expandedUsers = ref([])

const availableStatuses = ref([
  { id: 1, name: "Pending" },
  { id: 2, name: "Processing" },
  { id: 3, name: "Shipped" },
  { id: 4, name: "Delivered" },
  { id: 5, name: "Cancelled" },
])

const loadUsers = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("users")
    const fetchedUsers = response.data

    const usersWithOrders = await Promise.all(
      fetchedUsers.map(async (user) => {
        try {
          const ordersResponse = await api.get(`OrderHistory/user/${user.id}`)
          const ordersWithStatusSelection = (ordersResponse.data || []).map(
            (order) => {
              const matchedStatus = availableStatuses.value.find(
                (s) =>
                  s.name.toLowerCase() === (order.status || "").toLowerCase(),
              )
              return {
                ...order,
                selectedStatusId: matchedStatus ? matchedStatus.id : 1,
              }
            },
          )

          return {
            ...user,
            orders: ordersWithStatusSelection,
          }
        } catch (err) {
          console.warn(`Could not fetch orders for user ID: ${user.id}`, err)
          return {
            ...user,
            orders: [],
          }
        }
      }),
    )

    users.value = usersWithOrders
  } catch (error) {
    if (typeof handleErrors === "function") {
      handleErrors(error, fetchError)
    } else {
      fetchError.value = {
        message: "Could not load customer directory. Please try again.",
      }
    }
  } finally {
    isLoading.value = false
  }
}

const changeOrderStatus = async (order) => {
  if (!order.selectedStatusId) return

  try {
    await api.patch(`OrderHistory/${order.idZamowienia}/status`, {
      idStatusu: order.selectedStatusId,
    })

    const newStatusName = availableStatuses.value.find(
      (s) => s.id === order.selectedStatusId,
    )?.name

    if (newStatusName) {
      order.status = newStatusName
    }

    showAlert({
      type: "success",
      message: `Order #${order.idZamowienia} status has been successfully updated.`,
      position: "top-right",
    })
  } catch (error) {
    console.error("Error changing status:", error)
    showAlert({
      type: "error",
      message: "Failed to update order status. Please try again.",
      position: "top-right",
    })
  }
}

const toggleUserExpand = (userId) => {
  if (expandedUsers.value.includes(userId)) {
    expandedUsers.value = expandedUsers.value.filter((id) => id !== userId)
  } else {
    expandedUsers.value.push(userId)
  }
}

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const query = searchQuery.value.toLowerCase().trim()

    const name = (user.name || "").toLowerCase()
    const surname = (user.surname || "").toLowerCase()
    const email = (user.email || "").toLowerCase()
    const userName = (user.userName || "").toLowerCase()

    const nameSurname = `${name} ${surname}`.trim()
    const surnameName = `${surname} ${name}`.trim()

    const textMatch =
      name.includes(query) ||
      surname.includes(query) ||
      nameSurname.includes(query) ||
      surnameName.includes(query) ||
      email.includes(query) ||
      userName.includes(query)

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

const calculateTotalSpent = (orders) => {
  if (!orders || orders.length === 0) return "0.00"
  const total = orders.reduce(
    (sum, order) => sum + (order.calkowitaKwota || 0),
    0,
  )
  return total.toFixed(2)
}

const getStatusBadgeClass = (status) => {
  if (!status) return "status-pending"
  const s = status.toLowerCase()
  if (s === "completed" || s === "zrealizowane" || s === "delivered")
    return "status-completed"
  if (s === "pending" || s === "oczekujące") return "status-pending"
  if (s === "cancelled") return "status-cancelled"
  return "status-processing"
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
          <span class="active-page">Customer Order History</span>
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
            <li @click="router.push('/admin/task-management')">
              <span class="icon">📋</span>
              <span class="menu-text">Task Management</span>
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
            <li class="active" @click="router.push('/admin/order-management')">
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
          @retry="loadUsers"
        />

        <div v-else-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Loading clients and orders...</span>
        </div>

        <div v-else class="animated-content">
          <div class="modern-toolbar">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, username or email..."
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
          </div>

          <div class="catalog-section">
            <div class="catalog-header">
              <h2>
                Purchase History of Customers
                <span class="count-tag">{{ filteredUsers.length }}</span>
              </h2>
            </div>

            <div class="client-list">
              <div v-if="filteredUsers.length === 0" class="empty-state">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                  alt="Empty"
                />
                <p>No customers found matching these filters.</p>
              </div>

              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="client-card"
                :class="{
                  'soft-deleted': user.czyUsuniety,
                  'is-expanded': expandedUsers.includes(user.id),
                }"
              >
                <div
                  class="client-summary-row"
                  @click="toggleUserExpand(user.id)"
                >
                  <div class="client-main-info">
                    <div class="client-avatar">
                      <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <div class="name-details">
                      <span class="u-name">
                        <template v-if="user.name || user.surname">
                          {{ user.name || "" }} {{ user.surname || "" }}
                        </template>
                        <template v-else>
                          {{ user.userName }}
                        </template>
                        <span
                          v-if="user.czyUsuniety"
                          class="deleted-inline-badge"
                          >Deleted</span
                        >
                      </span>
                      <span class="u-email"
                        ><i class="fa-regular fa-envelope"></i>
                        {{ user.email }}</span
                      >
                    </div>
                  </div>

                  <div class="client-stats">
                    <div class="stat-box">
                      <span class="stat-label">Registered</span>
                      <span class="stat-value">{{
                        formatDate(user.dataRejestracji).split(",")[0]
                      }}</span>
                    </div>
                    <div class="stat-box">
                      <span class="stat-label">Orders</span>
                      <span class="stat-value highlight">{{
                        user.orders ? user.orders.length : 0
                      }}</span>
                    </div>
                    <div class="stat-box">
                      <span class="stat-label">Total Volume</span>
                      <span class="stat-value money"
                        >{{ calculateTotalSpent(user.orders) }} PLN</span
                      >
                    </div>
                  </div>

                  <div class="expand-action">
                    <button class="expand-chevron-btn">
                      <i class="fa-solid fa-chevron-down"></i>
                    </button>
                  </div>
                </div>

                <Transition name="expand">
                  <div
                    v-if="expandedUsers.includes(user.id)"
                    class="client-details-dropdown"
                  >
                    <div class="dropdown-inner">
                      <div class="dropdown-header">
                        <h4 class="section-subtitle">
                          <i class="fa-solid fa-clock-rotate-left"></i> Order
                          History
                        </h4>
                      </div>

                      <div
                        v-if="!user.orders || user.orders.length === 0"
                        class="no-orders-state"
                      >
                        <div class="empty-icon-circle">
                          <i class="fa-solid fa-box-open"></i>
                        </div>
                        <p>This customer hasn't placed any orders yet.</p>
                      </div>

                      <div v-else class="modern-orders-timeline">
                        <div
                          v-for="order in user.orders"
                          :key="order.idZamowienia"
                          class="modern-order-card"
                        >
                          <div class="modern-order-header">
                            <div class="mo-header-left">
                              <span class="mo-id"
                                >#{{ order.idZamowienia }}</span
                              >
                              <span class="mo-date">
                                <i class="fa-regular fa-calendar-days"></i>
                                {{ formatDate(order.dataZamowienia) }}
                              </span>
                            </div>
                            <div class="mo-header-right">
                              <span
                                :class="[
                                  'mo-status-badge',
                                  getStatusBadgeClass(order.status),
                                ]"
                              >
                                {{ order.status }}
                              </span>
                            </div>
                          </div>

                          <div class="modern-order-meta">
                            <div class="mo-info-tags">
                              <span class="mo-tag"
                                ><i class="fa-solid fa-credit-card"></i>
                                {{ order.metodaPlatnosci }}</span
                              >
                              <span class="mo-tag"
                                ><i class="fa-solid fa-truck-fast"></i>
                                {{ order.metodaDostawy }}</span
                              >
                            </div>

                            <div class="mo-status-updater" @click.stop>
                              <div class="updater-group">
                                <select
                                  v-model="order.selectedStatusId"
                                  class="updater-select"
                                >
                                  <option
                                    v-for="st in availableStatuses"
                                    :key="st.id"
                                    :value="st.id"
                                  >
                                    {{ st.name }}
                                  </option>
                                </select>
                                <button
                                  @click="changeOrderStatus(order)"
                                  class="updater-btn"
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          </div>

                          <div class="modern-products-list">
                            <div
                              class="mo-product-item"
                              v-for="prod in order.produkty"
                              :key="prod.idProduktu"
                            >
                              <div class="mo-prod-info">
                                <div class="mo-prod-avatar">
                                  <i class="fa-solid fa-cube"></i>
                                </div>
                                <div>
                                  <div class="mo-prod-name">
                                    {{ prod.nazwaProduktu }}
                                  </div>
                                  <div class="mo-prod-id">
                                    ID: {{ prod.idProduktu }}
                                  </div>
                                </div>
                              </div>
                              <div class="mo-prod-calc">
                                <span class="mo-prod-qty"
                                  >{{ prod.ilosc }}x</span
                                >
                                <span class="mo-prod-price"
                                  >{{ prod.cenaZakupu.toFixed(2) }} PLN</span
                                >
                              </div>
                              <div class="mo-prod-total">
                                {{ (prod.ilosc * prod.cenaZakupu).toFixed(2) }}
                                PLN
                              </div>
                            </div>
                          </div>

                          <div class="modern-order-footer">
                            <span class="mo-total-label">Total Amount</span>
                            <span class="mo-total-value"
                              >{{ order.calkowitaKwota.toFixed(2) }} PLN</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
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
  font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fc;
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
  display: inline-block;
}

.divider {
  height: 1px;
  background-color: #eae8f5;
  margin: 1rem 0;
  padding: 0 !important;
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

.modern-toolbar {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  align-items: center;
  background: white;
  padding: 1.25rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(21, 24, 117, 0.03);
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

.client-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.client-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 4px 12px rgba(21, 24, 117, 0.01);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.client-card:hover {
  border-color: #cfd4ed;
  box-shadow: 0 10px 25px rgba(63, 80, 158, 0.05);
}

.client-card.is-expanded {
  border-color: #3f509e;
  box-shadow: 0 12px 30px rgba(63, 80, 158, 0.08);
}

.client-summary-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr auto;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  user-select: none;
}

.client-main-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.client-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #f0f2f8;
  color: #3f509e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.03);
}

.name-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.u-name {
  font-weight: 700;
  color: #151875;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.deleted-inline-badge {
  font-size: 0.7rem;
  background: #fff0f0;
  color: #fb2e2e;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 700;
}

.u-email {
  font-size: 0.88rem;
  color: #8a8fb9;
}
.u-email i {
  margin-right: 4px;
}

.client-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-right: 20px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.78rem;
  color: #8a8fb9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #4a405c;
}

.stat-value.highlight {
  color: #fb2e86;
  font-size: 1.1rem;
}

.stat-value.money {
  color: #21a366;
  font-size: 1.05rem;
}

.expand-action {
  display: flex;
  justify-content: center;
  align-items: center;
}

.expand-chevron-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #eae8f5;
  background: white;
  color: #3f509e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.3s,
    background-color 0.2s;
}

.client-card.is-expanded .expand-chevron-btn {
  transform: rotate(180deg);
  background-color: #3f509e;
  color: white;
  border-color: #3f509e;
}

.client-details-dropdown {
  background-color: #fafbfc;
  border-top: 1px solid #eae8f5;
}

.dropdown-inner {
  padding: 2rem;
}

.dropdown-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-subtitle {
  margin: 0;
  font-size: 1.15rem;
  color: #151875;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-orders-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #8a8fb9;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed #cfd4ed;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  background: #f0f2f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  font-size: 1.8rem;
  color: #a4adc6;
}

.modern-orders-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modern-order-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #eef0f7;
  box-shadow: 0 2px 8px rgba(21, 24, 117, 0.03);
  overflow: hidden;
}

.modern-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f4f5fa;
}

.mo-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mo-id {
  font-weight: 800;
  color: #151875;
  font-size: 1.1rem;
}

.mo-date {
  color: #8a8fb9;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mo-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.status-completed {
  background: #e6f6f0;
  color: #21a366;
}
.status-pending {
  background: #fff3e0;
  color: #ef6c00;
}
.status-cancelled {
  background: #fff0f0;
  color: #fb2e2e;
}
.status-processing {
  background: #e8f4fd;
  color: #2a81cf;
}

.modern-order-meta {
  background: #fcfcfd;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f4f5fa;
}

.mo-info-tags {
  display: flex;
  gap: 12px;
}

.mo-tag {
  font-size: 0.85rem;
  color: #4a405c;
  background: #ffffff;
  border: 1px solid #e4e6f1;
  padding: 6px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
.mo-tag i {
  color: #8a8fb9;
}

.updater-group {
  display: flex;
  background: #ffffff;
  border: 1px solid #e4e6f1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.updater-select {
  border: none;
  background: transparent;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #4a405c;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.updater-btn {
  background: #f4f5fa;
  border: none;
  border-left: 1px solid #e4e6f1;
  padding: 0 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #3f509e;
  cursor: pointer;
  transition: all 0.2s;
}

.updater-btn:hover {
  background: #eef0f7;
  color: #151875;
}
.updater-btn:active {
  background: #e4e6f1;
}

.modern-products-list {
  padding: 0.5rem 1.5rem;
}

.mo-product-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px dashed #f0f0f5;
}
.mo-product-item:last-child {
  border-bottom: none;
}

.mo-prod-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mo-prod-avatar {
  width: 40px;
  height: 40px;
  background: #f4f5fa;
  color: #a4adc6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mo-prod-name {
  font-weight: 600;
  color: #151875;
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.mo-prod-id {
  font-size: 0.75rem;
  color: #8a8fb9;
}

.mo-prod-calc {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #4a405c;
}

.mo-prod-qty {
  background: #f0f2f8;
  color: #3f509e;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
}

.mo-prod-price {
  font-size: 0.9rem;
  color: #6c7293;
}

.mo-prod-total {
  text-align: right;
  font-weight: 700;
  color: #151875;
  font-size: 0.95rem;
}

.modern-order-footer {
  background: #fbfbfe;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f4f5fa;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.mo-total-label {
  font-size: 0.9rem;
  color: #6c7293;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mo-total-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #21a366;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1200px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.soft-deleted {
  background-color: #fcfcfd;
  opacity: 0.85;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #8a8fb9;
  background-color: #ffffff;
  border-radius: 16px;
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
  .menu-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .menu-list li {
    white-space: nowrap;
  }
  .divider {
    width: 1px;
    height: auto;
    margin: 0 0.5rem;
  }
  .modern-toolbar {
    grid-template-columns: 1fr;
  }
  .client-summary-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .client-stats {
    padding-right: 0;
  }
  .expand-action {
    justify-content: flex-end;
  }

  .modern-order-header,
  .modern-order-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .mo-header-right,
  .mo-status-updater {
    width: 100%;
  }
  .updater-group {
    width: 100%;
    display: flex;
  }
  .updater-select {
    flex-grow: 1;
  }
  .mo-product-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .mo-prod-calc {
    justify-content: flex-start;
  }
  .mo-prod-total {
    text-align: left;
  }
}
</style>
