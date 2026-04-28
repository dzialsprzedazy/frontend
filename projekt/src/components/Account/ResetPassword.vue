<template>
  <div class="pageWrapper">
    
    <div class="headerBanner">
      <div class="container">
        <h1 class="headerTitle">Reset Password</h1>
        <p class="breadcrumbs">
          Home . Pages . <span class="activePage">Reset Password</span>
        </p>
      </div>
    </div>

    <div class="mainContent">
      <div class="formBox">
        <h2 class="formTitle">Reset Password</h2>
        <p class="formSubtitle">Enter your email, temporary password, and new password.</p>
        
        <input type="email" class="formInput" placeholder="Email Address" v-model="emailData" />
        <input type="password" class="formInput" placeholder="Temporary Password" v-model="tempPasswordData" />
        <input type="password" class="formInput" placeholder="New Password" v-model="newPasswordData" />
        <input type="password" class="formInput" placeholder="Confirm New Password" v-model="confirmNewPasswordData" />
        
        <button @click="handleResetPassword" class="btnPink">Reset Password</button>
        
        <p class="backToLoginText">
          Remembered your password? 
          <router-link to="/login" class="backToLoginLink">Login here</router-link>
        </p>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emailData = ref("");
const tempPasswordData = ref("");
const newPasswordData = ref("");
const confirmNewPasswordData = ref("");
const router = useRouter();

const handleResetPassword = async () => {
  if (!emailData.value || !tempPasswordData.value || !newPasswordData.value || !confirmNewPasswordData.value) {
    alert("All fields are required.");
    return;
  }

  if (newPasswordData.value !== confirmNewPasswordData.value) {
    alert("New passwords do not match!");
    return;
  }

  const payload = {
    email: emailData.value,
    temporaryPassword: tempPasswordData.value,
    newPassword: newPasswordData.value
  };
  console.log("Dane do wysłania na endpoint zmiany hasła:", payload);
  alert("Password has been successfully reset! Please log in with your new password.");
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

.backToLoginText {
  margin-top: 25px;
  color: #9096b2;
  font-size: 15px;
}

.backToLoginLink {
  color: #9096b2;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.backToLoginLink:hover {
  color: #fb2e86;
}
</style>