<template>
  <div class="pageWrapper">
    
    <div class="headerBanner">
      <div class="container">
        <h1 class="headerTitle">Forgot Password</h1>
        <p class="breadcrumbs">
          Home . Pages . <span class="activePage">Forgot Password</span>
        </p>
      </div>
    </div>

    <div class="mainContent">
      <div class="formBox">
        <h2 class="formTitle">Forgot Password</h2>
        <p class="formSubtitle">Enter your email to receive a password reset link.</p>
        
        <input type="email" class="formInput" placeholder="Email Address" v-model="emailData" />
        
        <button @click="handleForgotPassword" class="btnPink">Send Reset Link</button>
        
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
const router = useRouter();

const handleForgotPassword = async () => {
  if (!emailData.value) {
    alert("Please enter your email address.");
    return;
  }

  const payload = {
    email: emailData.value
  };
  console.log("Dane do wysłania na endpoint resetowania hasła:", payload);
  alert("If an account with that email exists, a password reset link has been sent.");
  router.push('/reset-password');
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