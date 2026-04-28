<template>
  <div class="pageWrapper">
    <div class="headerBanner">
      <div class="container">
        <h1 class="headerTitle">Login</h1>
        <p class="breadcrumbs">
          Home . Pages . <span class="activePage">Login</span>
        </p>
      </div>
    </div>

    <div class="mainContent">
      <div class="formBox">
        <h2 class="formTitle">Login</h2>
        <p class="formSubtitle">Please login using account detail bellow.</p>

        <input
          type="email"
          class="formInput"
          placeholder="Email Address"
          v-model="emailData"
        />
        <input
          type="password"
          class="formInput"
          placeholder="Password"
          v-model="passwordData"
        />

        <p class="forgotPasswordText">
          <router-link to="/forgot-password" class="forgotPasswordLink"
            >Forgot your password?</router-link
          >
        </p>

        <button @click="handleLogin" class="btnPink">Sign In</button>

        <p class="registerText">
          Don't have an Account?
          <router-link to="/register" class="registerLink"
            >Register here</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

import { useAlerts } from "../alerts/useAlerts"
const alerts = useAlerts()

const emailData = ref("")
const passwordData = ref("")
const router = useRouter()

const handleLogin = async () => {
  if (!emailData.value || !passwordData.value) {
    alert("Please enter both email and password.")
    return
  }

  // Symulacja logowania
  console.log("Dane do wysłania na endpoint logowania:", {
    email: emailData.value,
    password: passwordData.value,
  })
  alerts.success("Login successful! Redirecting to your profile 🎉")
  router.push("/profile") // Przekierowanie do nowej strony profilu
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.pageWrapper {
  font-family: sans-serif;
  background-color: #ffffff;
}

.headerBanner {
  background-color: #f6f5ff;
  padding: 80px 0;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.headerTitle {
  color: #101750;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
}

.breadcrumbs {
  color: #000000;
  font-size: 16px;
  font-weight: 500;
}

.activePage {
  color: #fb2e86;
}

.mainContent {
  display: flex;
  justify-content: center;
  padding: 100px 20px;
}

.formBox {
  background-color: #ffffff;
  padding: 50px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  text-align: center;
  border-radius: 3px;
}

.formTitle {
  font-size: 32px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 10px;
}

.formSubtitle {
  color: #9096b2;
  font-size: 15px;
  margin-bottom: 35px;
}

.formInput {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #c2c5d1;
  border-radius: 3px;
  outline: none;
  font-size: 15px;
  color: #9096b2;
}

.formInput::placeholder {
  color: #c2c5d1;
}

.forgotPasswordText {
  text-align: right;
  margin-top: -10px;
  margin-bottom: 20px;
}

.forgotPasswordLink {
  color: #9096b2;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.forgotPasswordLink:hover {
  color: #fb2e86;
}

.btnPink {
  background-color: #fb2e86;
  color: #ffffff;
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btnPink:hover {
  background-color: #f9285f;
}

.registerText {
  margin-top: 25px;
  color: #9096b2;
  font-size: 15px;
}

.registerLink {
  color: #9096b2;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.registerLink:hover {
  color: #fb2e86;
}
</style>
