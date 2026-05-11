<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import api from "@/services/axios.js"

const { showAlert } = useAlerts()
const router = useRouter()
const route = useRoute()

const emailData = ref("")
const tokenData = ref("")
const newPasswordData = ref("")
const confirmNewPasswordData = ref("")
const isLoading = ref(false)

onMounted(() => {
  emailData.value = String(route.query.email || "")
  tokenData.value = String(route.query.token || "")

  if (!tokenData.value || !emailData.value) {
    showAlert({
      type: "error",
      message: "Invalid or expired password reset link.",
      position: "top-right",
    })
  }
})

const handleResetPassword = async () => {
  if (
    !emailData.value ||
    !tokenData.value ||
    !newPasswordData.value ||
    !confirmNewPasswordData.value
  ) {
    showAlert({
      type: "error",
      message: "All fields are required.",
      position: "top-right",
    })
    return
  }

  if (newPasswordData.value !== confirmNewPasswordData.value) {
    showAlert({
      type: "error",
      message: "New passwords do not match!",
      position: "top-right",
    })
    return
  }

  isLoading.value = true
  try {
    const payload = {
      email: emailData.value,
      token: tokenData.value,
      newPassword: newPasswordData.value,
    }

    await api.post("account/reset-password", payload)

    showAlert({
      type: "success",
      message: "Password has been successfully reset! Please log in using your new password.",
      position: "top-right",
    })

    router.push("/login")
  } catch (error) {
    console.error("Password reset error:", error)
    const errorMessage =
      error.response?.data?.message ||
      "Failed to reset password. The link might be invalid or expired."
    showAlert({
      type: "error",
      message: errorMessage,
      position: "top-right",
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-layout container">
      <div class="form-card">
        <h2 class="form-title">Reset Password</h2>
        <p class="form-subtitle">
          Enter a new password for your account.
        </p>

        <div class="input-wrapper">
          <input
            type="email"
            class="custom-input"
            placeholder="Email Address"
            v-model="emailData"
            readonly
            disabled
          />
        </div>

        <input type="hidden" v-model="tokenData" />

        <div class="input-wrapper">
          <input
            type="password"
            class="custom-input"
            placeholder="New Password"
            v-model="newPasswordData"
            autocomplete="new-password" 
          />
        </div>

        <div class="input-wrapper">
          <input
            type="password"
            class="custom-input"
            placeholder="Confirm New Password"
            v-model="confirmNewPasswordData"
            autocomplete="new-password" 
            @keyup.enter="handleResetPassword"
          />
        </div>

        <button
          @click="handleResetPassword"
          class="primary-btn"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Reset Password</span>
          <span v-else class="loading-content">
            <span class="spinner"></span>
            Resetting...
          </span>
        </button>

        <p class="register-text">
          Remembered your password?
          <router-link to="/login" class="text-link strong-link">
            Login here
          </router-link>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fbfbfe;
  color: #150e24;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  width: 100%;
  max-width: 1280px;
}

.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.form-card {
  background: #ffffff;
  padding: 3.5rem;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(21, 24, 117, 0.06);
  border: 1px solid rgba(234, 232, 245, 0.8);
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.form-title {
  color: #151875;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.form-subtitle {
  color: #8a8fb9;
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
}

.input-wrapper {
  margin-bottom: 1.2rem;
}

.custom-input {
  width: 100%;
  padding: 1rem 1.2rem;
  background-color: #fafafc;
  border: 1px solid #e1e1e8;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  color: #150e24;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.custom-input::placeholder {
  color: #a0a4c0;
  font-weight: 400;
}

.custom-input:focus {
  background-color: #ffffff;
  border-color: #3f509e;
  box-shadow: 0 0 0 4px rgba(63, 80, 158, 0.1);
}

.text-link {
  color: #8a8fb9;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.text-link:hover {
  color: #3f509e;
}

.primary-btn {
  background-color: #3f509e;
  color: #ffffff;
  border: none;
  width: 100%;
  padding: 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-btn:hover:not(:disabled) {
  background-color: #2e3b75;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(46, 59, 117, 0.2);
}

.primary-btn:disabled {
  background-color: #a0a4c0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-text {
  margin-top: 2.5rem;
  color: #4a405c;
  font-size: 0.95rem;
}

.strong-link {
  color: #3f509e;
  font-weight: 600;
}

.strong-link:hover {
  color: #2e3b75;
}

@media (max-width: 650px) {
  .auth-page {
    padding: 1rem;
  }

  .form-card {
    padding: 2.5rem 1.5rem;
  }
}
</style>