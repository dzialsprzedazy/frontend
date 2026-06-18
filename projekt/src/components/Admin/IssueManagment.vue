<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

import { useAlerts } from "@/components/alerts/useAlerts.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const issues = ref([])
const isLoading = ref(false)
const fetchError = ref(null)

const searchQuery = ref("")
const selectedStatus = ref("All")

const expandedIssues = ref([])

const availableStatuses = ref([])

const issueTypes = ref([])
const loadIssues = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const [response, issueTypesResponse, StatusesResponse] = await Promise.all([
      api.get("Returns"),
      api.get("Returns/Types"),
      api.get("Returns/Statuses"),
    ])
    const fetchedIssues = response.data || []

    issueTypes.value = issueTypesResponse.data
    availableStatuses.value = StatusesResponse.data
    issues.value = fetchedIssues.map((issue) => {
      const matchedStatus = availableStatuses.value.find(
        (s) =>
          s.name.toLowerCase() === (issue.status || "pending").toLowerCase(),
      )
      return {
        ...issue,
        selectedStatusId: matchedStatus ? matchedStatus.id : 1,
      }
    })
    console.log(issues.value)
  } catch (error) {
    if (typeof handleErrors === "function") {
      handleErrors(error, fetchError)
    } else {
      fetchError.value = {
        message: "Could not load issues. Please try again.",
      }
    }
  } finally {
    isLoading.value = false
  }
}

const changeIssueStatus = async (issue) => {
  if (!issue.selectedStatusId) return

  try {
    console.log(issue)
    await api.patch(
      `Returns/${issue.id}/status?statusId= ${issue.selectedStatusId}`,
    )

    const newStatusName = availableStatuses.value.find(
      (s) => s.id === issue.selectedStatusId,
    )?.name

    if (newStatusName) {
      issue.status = newStatusName
    }

    showAlert({
      type: "success",
      message: `Status zgłoszenia został zaktualizowany.`,
      position: "top-right",
    })
  } catch (error) {
    console.error("Error changing status:", error)
    showAlert({
      type: "error",
      message: "Nie udało się zaktualizować statusu. Spróbuj ponownie.",
      position: "top-right",
    })
  }
}

const toggleIssueExpand = (issueId) => {
  if (expandedIssues.value.includes(issueId)) {
    expandedIssues.value = expandedIssues.value.filter((id) => id !== issueId)
  } else {
    expandedIssues.value.push(issueId)
  }
}

const truncateText = (text, length = 60) => {
  if (!text) return "Brak podanego powodu."
  return text.length > length ? text.substring(0, length) + "..." : text
}

const copyToClipboard = async (text) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    showAlert({
      type: "success",
      message: "Adres email został skopiowany do schowka!",
      position: "top-right",
    })
  } catch (err) {
    showAlert({
      type: "error",
      message: "Nie udało się skopiować tekstu.",
      position: "top-right",
    })
  }
}

const filteredIssues = computed(() => {
  return issues.value.filter((issue) => {
    const query = searchQuery.value.toLowerCase().trim()
    const email = (issue.email || "").toLowerCase()
    const reason = (issue.powod || "").toLowerCase()
    const orderIdStr = (issue.orderId || "").toString()

    const textMatch =
      email.includes(query) ||
      reason.includes(query) ||
      orderIdStr.includes(query)

    let statusMatch = true
    if (selectedStatus.value !== "All") {
      statusMatch =
        (issue.status || "Pending").toLowerCase() ===
        selectedStatus.value.toLowerCase
    }

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

const getStatusBadgeClass = (status) => {
  if (!status) return "status-pending"
  const s = status.toLowerCase()
  if (s === "resolved") return "status-completed"
  if (s === "pending") return "status-pending"
  if (s === "rejected") return "status-cancelled"

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

onMounted(loadIssues)
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">Issue Management</span>
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
            <li @click="router.push('/admin/order-management')">
              <span class="icon">📦</span>
              <span class="menu-text">Order Management</span>
            </li>
            <li class="active" @click="router.push('/admin/issue-management')">
              <span class="icon">⚠️</span>
              <span class="menu-text">Issue Management</span>
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
          @retry="loadIssues"
        />

        <div v-else-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Loading issues...</span>
        </div>

        <div v-else class="animated-content">
          <div class="modern-toolbar">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by email, reason, or order ID..."
              />
            </div>

            <div class="filter-pills">
              <button
                v-for="status in ['All', 'Pending', 'In Progress', 'Resolved']"
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
                Reported Issues & Returns
                <span class="count-tag">{{ filteredIssues.length }}</span>
              </h2>
            </div>

            <div class="issue-list">
              <div v-if="filteredIssues.length === 0" class="empty-state">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                  alt="Empty"
                />
                <p>No issues found matching these filters.</p>
              </div>

              <div
                v-for="issue in filteredIssues"
                :key="issue.idZgloszenia || issue.id"
                class="issue-card"
                :class="{
                  'is-expanded': expandedIssues.includes(
                    issue.idZgloszenia || issue.id,
                  ),
                }"
              >
                <div
                  class="issue-summary-row"
                  @click="toggleIssueExpand(issue.idZgloszenia || issue.id)"
                >
                  <div class="issue-main-info">
                    <div class="issue-avatar">
                      <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div class="name-details">
                      <span class="u-name">
                        {{ issue.typ }}
                      </span>
                      <span class="u-email">Issue #{{ issue.id }}</span>
                    </div>
                  </div>

                  <div class="issue-reason-preview">
                    <p class="reason-text">
                      "{{ truncateText(issue.powod, 70) }}"
                    </p>
                  </div>

                  <div class="issue-stats">
                    <span
                      :class="[
                        'mo-status-badge',
                        getStatusBadgeClass(issue.status),
                      ]"
                    >
                      {{ issue.status || "Pending" }}
                    </span>
                    <div class="expand-action">
                      <button class="expand-chevron-btn">
                        <i class="fa-solid fa-chevron-down"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <Transition name="expand">
                  <div
                    v-if="
                      expandedIssues.includes(issue.idZgloszenia || issue.id)
                    "
                    class="issue-details-dropdown"
                  >
                    <div class="dropdown-inner">
                      <div class="issue-meta-grid">
                        <div class="meta-box">
                          <span class="meta-label">Customer Email</span>

                          <div class="email-copy-wrapper">
                            <span class="u-email">
                              <i class="fa-regular fa-envelope"></i>
                              {{ issue.email || "N/A" }}
                            </span>
                            <button
                              class="copy-action-btn"
                              @click.stop="copyToClipboard(issue.email)"
                              title="Kopiuj email"
                            >
                              <i class="fa-regular fa-copy"></i>
                            </button>
                          </div>
                        </div>
                        <div class="meta-box">
                          <span class="meta-label">Date Reported</span>
                          <span class="meta-value">{{
                            formatDate(issue.dataZgloszenia || new Date())
                          }}</span>
                        </div>
                        <div class="meta-box">
                          <span class="meta-label">Order ID</span>
                          <span class="meta-value highlight-id"
                            >#{{ issue.orderId || "N/A" }}</span
                          >
                        </div>
                      </div>

                      <div class="full-reason-section">
                        <span class="meta-label"
                          ><i class="fa-solid fa-quote-left"></i> Full
                          Description</span
                        >
                        <div class="reason-content-box">
                          {{
                            issue.powod ||
                            "Klient nie podał żadnych dodatkowych informacji w treści zgłoszenia."
                          }}
                        </div>
                      </div>

                      <div class="status-updater-section">
                        <span class="meta-label">Update Issue Status:</span>
                        <div class="updater-group">
                          <select
                            v-model="issue.selectedStatusId"
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
                            @click.stop="changeIssueStatus(issue)"
                            class="updater-btn"
                          >
                            Update Status
                          </button>
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

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.issue-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 4px 12px rgba(21, 24, 117, 0.01);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.issue-card:hover {
  border-color: #cfd4ed;
  box-shadow: 0 10px 25px rgba(63, 80, 158, 0.05);
}

.issue-card.is-expanded {
  border-color: #3f509e;
  box-shadow: 0 12px 30px rgba(63, 80, 158, 0.08);
}

.issue-summary-row {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  user-select: none;
}

.issue-main-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.issue-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fff0f0;
  color: #fb2e2e;
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
  font-size: 1.05rem;
}

.u-email {
  font-size: 0.88rem;
  color: #8a8fb9;
  display: flex;
  align-items: center;
  gap: 6px;
}
.issue-reason-preview {
  padding: 0 20px;
}

.reason-text {
  margin: 0;
  color: #6c7293;
  font-size: 0.95rem;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.issue-stats {
  display: flex;
  align-items: center;
  gap: 20px;
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

.issue-card.is-expanded .expand-chevron-btn {
  transform: rotate(180deg);
  background-color: #3f509e;
  color: white;
  border-color: #3f509e;
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

.issue-details-dropdown {
  background-color: #fafbfc;
  border-top: 1px solid #eae8f5;
}

.dropdown-inner {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.issue-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #f0f0f5;
}

.meta-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 0.8rem;
  color: #8a8fb9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.meta-value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #151875;
}

.highlight-id {
  color: #3f509e;
}
.email-copy-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
}
.copy-action-btn {
  background: transparent;
  border: 1px solid #eae8f5;
  color: #8a8fb9;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-action-btn:hover {
  background-color: #f6f5ff;
  color: #3f509e;
  border-color: #cfd4ed;
}

.copy-action-btn:active {
  transform: scale(0.95);
}

.full-reason-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reason-content-box {
  background: #ffffff;
  border-left: 4px solid #3f509e;
  padding: 1.25rem 1.5rem;
  border-radius: 0 12px 12px 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #4a405c;
  box-shadow: 0 2px 8px rgba(21, 24, 117, 0.02);
}

.status-updater-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px dashed #cfd4ed;
  padding-top: 1.5rem;
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
  padding: 10px 16px;
  font-size: 0.9rem;
  color: #4a405c;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.updater-btn {
  background: #f4f5fa;
  border: none;
  border-left: 1px solid #e4e6f1;
  padding: 0 20px;
  font-size: 0.9rem;
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 800px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
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
  .modern-toolbar {
    grid-template-columns: 1fr;
  }
  .issue-summary-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .issue-reason-preview {
    padding: 0;
  }
  .issue-meta-grid {
    grid-template-columns: 1fr;
  }
  .status-updater-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
