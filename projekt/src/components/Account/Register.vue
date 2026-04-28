<template>
  <div class="pageWrapper">
    
    <div class="headerBanner">
      <div class="container">
        <h1 class="headerTitle">Register Account</h1>
        <p class="breadcrumbs">
          Home . Pages . <span class="activePage">Register</span>
        </p>
      </div>
    </div>

    <div class="mainContent">
      <div class="registerBox">
        <h2 class="registerTitle">Register</h2>
        <p class="registerSubtitle">Create your account below.</p>
        
        <input type="email" class="registerInput" placeholder="Email Address" v-model="emailData" />
        <input type="password" class="registerInput" placeholder="Password" v-model="passwordData" />
        <input type="password" class="registerInput" placeholder="Confirm Password" v-model="confirmPasswordData" />
        
        <button @click="handleRegister" class="btnPink">Register</button>
        
        <p class="loginText">
          Already have an Account? 
          <router-link to="/login" class="loginLink">Login here</router-link>
        </p>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emailData = ref("");
const passwordData = ref("");
const confirmPasswordData = ref("");
const router = useRouter();

const handleRegister = async () => {
  if (passwordData.value !== confirmPasswordData.value) {
    alert("Passwords do not match!");
    return;
  }

  const payload = {
    email: emailData.value,
    password: passwordData.value
  };
  console.log("Dane do wysłania na endpoint rejestracji:", payload);
  alert("Registration successful! Redirecting to login.");
  router.push('/login');
};
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

.registerBox {
  background-color: #ffffff;
  padding: 50px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  text-align: center;
  border-radius: 3px;
}

.registerTitle {
  font-size: 32px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 10px;
}

.registerSubtitle {
  color: #9096b2;
  font-size: 15px;
  margin-bottom: 35px;
}

.registerInput {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #c2c5d1;
  border-radius: 3px;
  outline: none;
  font-size: 15px;
  color: #9096b2;
}

.registerInput::placeholder {
  color: #c2c5d1;
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

.loginText {
  margin-top: 25px;
  color: #9096b2;
  font-size: 15px;
}

.loginLink {
  color: #9096b2;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.loginLink:hover {
  color: #fb2e86;
}
</style>