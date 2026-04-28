<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import api from "@/services/axios.js"

const { showAlert } = useAlerts()
const router = useRouter()

const emailData = ref("")
const passwordData = ref("")
const isLoading = ref(false)

const handleLogin = async () => {
  if (!emailData.value || !passwordData.value) {
    showAlert({
      type: "error",
      message: "Please enter both email and password.",
      position: "top-right",
    })
    return
  }

  try {
    isLoading.value = true

    const response = await api.post("users/login", {
      email: emailData.value,
      password: passwordData.value,
    })

    const data = response.data

    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))

    showAlert({
      type: "success",
      message: "Successfully logged in!",
      position: "top-right",
    })

    router.push("/profile")
  } catch (error) {
    console.error("Login error:", error)

    const errorData = error.response?.data

    const message =
      typeof errorData === "string"
        ? errorData
        : errorData?.message || "Invalid email or password."

    showAlert({
      type: "error",
      message,
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
        <h2 class="form-title">Sign In</h2>
        <p class="form-subtitle">
          Please login using your account details below.
        </p>

        <div class="input-wrapper">
          <input
            type="email"
            class="custom-input"
            placeholder="Email Address"
            v-model="emailData"
          />
        </div>

        <div class="input-wrapper">
          <input
            type="password"
            class="custom-input"
            placeholder="Password"
            v-model="passwordData"
          />
        </div>

        <div class="forgot-password-wrap">
          <router-link to="/forgot-password" class="text-link">
            Forgot your password?
          </router-link>
        </div>

        <button @click="handleLogin" class="primary-btn" :disabled="isLoading">
          {{ isLoading ? "Signing in..." : "Sign In" }}
        </button>

        <p class="register-text">
          Don't have an Account?
          <router-link to="/register" class="text-link strong-link">
            Register here
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

.forgot-password-wrap {
  text-align: right;
  margin-top: -0.2rem;
  margin-bottom: 2.5rem;
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
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-btn:hover {
  background-color: #2e3b75;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(46, 59, 117, 0.2);
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
