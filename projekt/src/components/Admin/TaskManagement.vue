<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import api from "@/services/axios.js"

const router = useRouter()
const { showAlert } = useAlerts()

const tasks = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const currentTaskId = ref(null)
const selectedTasks = ref([])
const isLoading = ref(false)

const taskForm = ref({
  title: "",
  description: "",
  status: "todo"
})

const loadTasks = async () => {
  isLoading.value = true
  try {
    const response = await api.get("AdminTasks")
    tasks.value = response.data
  } catch (error) {
    showAlert({ type: "error", message: "Failed to fetch tasks." })
  } finally {
    isLoading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  currentTaskId.value = null
  taskForm.value = { title: "", description: "", status: "todo" }
  showModal.value = true
}

const openEditModal = (task) => {
  isEditing.value = true
  currentTaskId.value = task.id
  taskForm.value = { ...task }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveTask = async () => {
  if (!taskForm.value.title.trim()) {
    showAlert({ type: "warning", message: "Task title is required." })
    return
  }

  try {
    if (isEditing.value) {
      await api.put(`AdminTasks/${currentTaskId.value}`, taskForm.value)
      showAlert({ type: "success", message: "Task updated successfully." })
    } else {
      await api.post("AdminTasks", taskForm.value)
      showAlert({ type: "success", message: "Task added successfully." })
    }
    
    await loadTasks()
    closeModal()
  } catch (error) {
    showAlert({ type: "error", message: "Error saving task." })
  }
}

const deleteTask = async (id) => {
  if (!confirm("Are you sure you want to delete this task?")) return
  
  try {
    await api.delete(`AdminTasks/${id}`)
    showAlert({ type: "success", message: "Task deleted successfully." })
    await loadTasks()
  } catch (error) {
    showAlert({ type: "error", message: "Error deleting task." })
  }
}

const deleteSelectedTasks = async () => {
  if (!confirm(`Are you sure you want to delete the selected tasks (${selectedTasks.value.length})?`)) return

  try {
    await Promise.all(selectedTasks.value.map(id => api.delete(`AdminTasks/${id}`)))
    showAlert({ type: "success", message: "Selected tasks have been deleted." })
    selectedTasks.value = []
    await loadTasks()
  } catch (error) {
    showAlert({ type: "error", message: "Error deleting tasks." })
  }
}

const changeTaskStatus = async (task, newStatus) => {
  try {
    const updatedTask = { ...task, status: newStatus }
    await api.put(`AdminTasks/${task.id}`, updatedTask)
    showAlert({ type: "info", message: `Task moved to: ${newStatus.replace('-', ' ')}.` })
    await loadTasks()
  } catch (error) {
    showAlert({ type: "error", message: "Error changing status." })
  }
}

const todoTasks = computed(() => tasks.value.filter(t => t.status === "todo"))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === "in-progress"))
const doneTasks = computed(() => tasks.value.filter(t => t.status === "done"))

const handleLogout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  showAlert({ type: "success", message: "Successfully logged out.", position: "top-right" })
  router.push("/login")
}

onMounted(async () => {
  await loadTasks()
  
  const pendingTasks = tasks.value.filter(t => t.status !== "done").length
  if (pendingTasks > 0) {
    showAlert({ 
      type: "info", 
      message: `You have ${pendingTasks} pending tasks on the board.` 
    })
  }
})
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Admin Panel</h1>
        <p class="breadcrumbs">
          Home <span class="dot-separator">•</span>
          <span class="active-page">Task Management</span>
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
            <li class="active" @click="router.push('/admin/task-management')">
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
              <span class="icon"><i class="fa-solid fa-hashtag"></i></span>
              <span class="menu-text">Tag Management</span>
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
        <div class="modern-toolbar">
          <div class="header-title-group">
            <h2 class="section-title">TODO Board</h2>
            <span class="badge">{{ tasks.length }}</span>
          </div>
          <div class="toolbar-actions">
            <button v-if="selectedTasks.length > 0" class="toolbar-btn delete-bulk" @click="deleteSelectedTasks">
              <i class="fa-solid fa-trash"></i> Delete Selected ({{ selectedTasks.length }})
            </button>
            <button class="action-btn add" @click="openAddModal">
              <i class="fa-solid fa-plus"></i>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="dashboard-card loading-state">
          <div class="loader-circle"></div>
          <span>Fetching tasks...</span>
        </div>

        <div v-else class="animated-content kanban-board">
          <div class="kanban-column col-todo">
            <div class="column-header">
              <h3 class="column-title">To Do</h3>
              <span class="badge">{{ todoTasks.length }}</span>
            </div>
            <div class="task-list custom-scrollbar">
              <div v-for="task in todoTasks" :key="task.id" class="task-card">
                <div class="task-card-header">
                  <input type="checkbox" :value="task.id" v-model="selectedTasks" class="task-checkbox" />
                  <h4 class="task-title">{{ task.title }}</h4>
                </div>
                <p class="task-desc">{{ task.description }}</p>
                <div class="task-actions">
                  <button class="icon-btn edit" @click="openEditModal(task)" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="icon-btn delete" @click="deleteTask(task.id)" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                  <button class="icon-btn move" @click="changeTaskStatus(task, 'in-progress')" title="Start">
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div v-if="todoTasks.length === 0" class="empty-column">No tasks</div>
            </div>
          </div>

          <div class="kanban-column col-in-progress">
            <div class="column-header">
              <h3 class="column-title">In Progress</h3>
              <span class="badge">{{ inProgressTasks.length }}</span>
            </div>
            <div class="task-list custom-scrollbar">
              <div v-for="task in inProgressTasks" :key="task.id" class="task-card">
                <div class="task-card-header">
                  <input type="checkbox" :value="task.id" v-model="selectedTasks" class="task-checkbox" />
                  <h4 class="task-title">{{ task.title }}</h4>
                </div>
                <p class="task-desc">{{ task.description }}</p>
                <div class="task-actions">
                  <button class="icon-btn move" @click="changeTaskStatus(task, 'todo')" title="Back">
                    <i class="fa-solid fa-arrow-left"></i>
                  </button>
                  <button class="icon-btn edit" @click="openEditModal(task)" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="icon-btn move" @click="changeTaskStatus(task, 'done')" title="Done">
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div v-if="inProgressTasks.length === 0" class="empty-column">No tasks</div>
            </div>
          </div>

          <div class="kanban-column col-done">
            <div class="column-header">
              <h3 class="column-title">Done</h3>
              <span class="badge">{{ doneTasks.length }}</span>
            </div>
            <div class="task-list custom-scrollbar">
              <div v-for="task in doneTasks" :key="task.id" class="task-card completed">
                <div class="task-card-header">
                  <input type="checkbox" :value="task.id" v-model="selectedTasks" class="task-checkbox" />
                  <h4 class="task-title">{{ task.title }}</h4>
                </div>
                <p class="task-desc">{{ task.description }}</p>
                <div class="task-actions">
                  <button class="icon-btn move" @click="changeTaskStatus(task, 'in-progress')" title="Reopen">
                    <i class="fa-solid fa-rotate-left"></i>
                  </button>
                  <button class="icon-btn delete" @click="deleteTask(task.id)" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
              <div v-if="doneTasks.length === 0" class="empty-column">No tasks</div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Task' : 'Add New Task' }}</h3>
            <button class="close-btn" @click="closeModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div class="modal-body custom-scrollbar">
            <div class="form-group">
              <label>Title <span class="required">*</span></label>
              <input type="text" v-model="taskForm.title" placeholder="Enter task title..." required />
            </div>
            
            <div class="form-group">
              <label>Status <span class="required">*</span></label>
              <select v-model="taskForm.status" class="form-select">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="taskForm.description" 
                placeholder="Task details..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-text" @click="closeModal">Cancel</button>
            <button class="btn-primary" @click="saveTask">
              <i class="fa-solid fa-check"></i>
              {{ isEditing ? 'Save Changes' : 'Save Task' }}
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
.logout-item { color: #e03a5b !important; }
.logout-item:hover { background-color: #fdf2f4 !important; }

.animated-content {
  animation: fadeSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modern-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.25rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(21, 24, 117, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #f0f0f5;
}
.header-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.section-title {
  color: #151875;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}
.badge {
  background-color: #f0f2f8;
  color: #3f509e;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
}
.toolbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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
.action-btn.add:hover {
  transform: translateY(-3px);
  background: #2e3b75;
}
.toolbar-btn {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}
.toolbar-btn.delete-bulk {
  background: #fdf2f4;
  color: #e03a5b;
  border: 1px solid #fad2db;
}
.toolbar-btn.delete-bulk:hover {
  transform: translateY(-3px);
  background: #fad2db;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;
}
.kanban-column {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #eae8f5;
  padding: 1.25rem;
  height: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border-top: 4px solid #dcdcdc;
  position: relative;
}

.col-todo { border-top-color: #ffb800; }
.col-in-progress { border-top-color: #2e86fb; }
.col-done { border-top-color: #21a366; }

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f5;
  background: white;
  z-index: 2;
}

.column-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #151875;
  margin: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 8px 0px;
  margin-top: 5px;
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #dcd9ef; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b8b3db; }

.task-card {
  background: #f8f9ff;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #eae8f5;
  transition: all 0.2s;
  margin: 2px;
}
.task-card:hover {
  border-color: #3f509e;
  box-shadow: 0 4px 15px rgba(63, 80, 158, 0.15);
  transform: translateY(-2px);
  z-index: 1;
}
.task-card.completed {
  opacity: 0.6;
  background-color: #fbfbfe;
}
.task-card-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 0.4rem;
}
.task-checkbox {
  margin-top: 4px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #3f509e;
}
.task-title {
  margin: 0;
  color: #151875;
  font-size: 1rem;
  font-weight: 700;
}
.task-desc {
  margin: 0 0 1.25rem 0;
  color: #8a8fb9;
  font-size: 0.85rem;
  line-height: 1.5;
  word-break: break-word;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}
.icon-btn.edit { background: #f0f2f8; color: #3f509e; }
.icon-btn.delete { background: #fff0f0; color: #fb2e2e; }
.icon-btn.move { background: #eae8f5; color: #8a8fb9; }
.icon-btn.move:hover { background: #dcd9ef; color: #151875; }
.icon-btn:hover { transform: scale(1.1); }

.empty-column {
  text-align: center;
  color: #8a8fb9;
  font-size: 0.9rem;
  padding: 2rem 0;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(21, 14, 36, 0.5);
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
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95) translateY(-20px); }

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eae8f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.modal-header h3 { margin: 0; font-size: 1.25rem; color: #151875; font-weight: 700; }
.close-btn {
  background: transparent; border: none; color: #8a8fb9; font-size: 1.2rem;
  cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;
}
.close-btn:hover { background-color: #f6f5ff; color: #151875; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #151875;
}
.required { color: #fb2e86; margin-left: 2px; }

input[type="text"], textarea, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #150e24;
  background-color: #f8f9ff;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}
input:focus, textarea:focus, .form-select:focus {
  border-color: #3f509e;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(63, 80, 158, 0.1);
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
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover:not(:disabled) {
  background-color: #2e3b75;
  transform: translateY(-1px);
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

@media (max-width: 1024px) {
  .kanban-board { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .main-content { grid-template-columns: 1fr; }
  .kanban-board { grid-template-columns: 1fr; }
  .modern-toolbar { flex-direction: column; align-items: stretch; gap: 1rem; }
  .toolbar-actions { justify-content: center; flex-wrap: wrap; }
}
</style>