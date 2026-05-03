<script setup>
import { ref } from "vue"
import api from "@/services/axios.js"
import { useAlerts } from "@/components/alerts/useAlerts.js"

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(["close", "tag-added"])
const { showAlert } = useAlerts()

const isSubmitting = ref(false)

const formData = ref({
  nazwaTagu: "",
})

const resetForm = () => {
  formData.value = {
    nazwaTagu: "",
  }
}

const handleClose = () => {
  resetForm()
  emit("close")
}

const handleSubmit = async () => {
  if (!formData.value.nazwaTagu) {
    showAlert({
      type: "error",
      message: "Please fill in the tag name.",
      position: "top-right",
    })
    return
  }

  try {
    isSubmitting.value = true

    await api.post("tags", formData.value)

    showAlert({
      type: "success",
      message: "Tag added successfully!",
      position: "top-right",
    })

    emit("tag-added")
    handleClose()
  } catch (error) {
    showAlert({
      type: "error",
      message:
        error.response?.data?.message ||
        "An error occurred while adding the tag.",
      position: "top-right",
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Add New Tag</h3>
          <button class="close-btn" @click="handleClose">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="tag-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Tag Name <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="formData.nazwaTagu"
                  placeholder="e.g. Science Fiction"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button
            class="btn-text"
            @click="handleClose"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            class="btn-primary"
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
            <i class="fa-solid fa-spinner fa-spin" v-if="isSubmitting"></i>
            <i class="fa-solid fa-check" v-else></i>
            {{ isSubmitting ? "Saving..." : "Save Tag" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  display: flex;
  flex-direction: column;
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
  transform: scale(0.95) translateY(-20px);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eae8f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
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
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}
.close-btn:hover {
  background-color: #f6f5ff;
  color: #151875;
}

.modal-body {
  padding: 1.5rem;
}

.tag-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 150px;
}

.flex-1 {
  flex: 1;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #151875;
}

.required {
  color: #fb2e86;
  margin-left: 2px;
}

input[type="text"] {
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
}

input:focus {
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
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>
