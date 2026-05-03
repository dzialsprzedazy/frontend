<script setup>
import { ref } from "vue"
import { useAlerts } from "@/components/alerts/useAlerts.js"

const { showAlert } = useAlerts()

const name = ref("")
const email = ref("")
const subject = ref("")
const message = ref("")

const handleSubmit = () => {
  if (!name.value || !email.value || !subject.value || !message.value) {
    showAlert({
      type: "error",
      message: "Please fill in all fields.",
      position: "top-right",
    })
    return
  }

  console.log("Contact form submitted:", {
    name: name.value,
    email: email.value,
    subject: subject.value,
    message: message.value,
  })

  showAlert({
    type: "success",
    message: "Your message has been sent successfully!",
    position: "top-right",
  })

  name.value = ""
  email.value = ""
  subject.value = ""
  message.value = ""
}
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Contact Us</h1>
        <p class="breadcrumbs">
          Home
          <span class="dot-separator">•</span>
          <span class="active-page">Contact</span>
        </p>
      </div>
    </div>

    <div class="container main-content">
      <div class="contact-grid">
        <div class="info-card dashboard-card">
          <h3 class="section-title">Get in Touch</h3>
          <p class="info-text">
            We'd love to hear from you! Whether you have a question about our
            products, need assistance, feel free to reach out.
          </p>
          <div class="contact-details">
            <div class="detail-item">
              <i class="fa-solid fa-envelope icon"></i>
              <div>
                <h4>Email Us</h4>
                <p>shop@kotika.com</p>
              </div>
            </div>
            <div class="detail-item">
              <i class="fa-solid fa-phone icon"></i>
              <div>
                <h4>Call Us</h4>
                <p>+48 591 182 321</p>
              </div>
            </div>
            <div class="detail-item">
              <i class="fa-solid fa-location-dot icon"></i>
              <div>
                <h4>Our Address</h4>
                <p>Stefana Banacha 22, Lodz, Poland</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-card dashboard-card">
          <h3 class="section-title">Send Us a Message</h3>
          <form @submit.prevent="handleSubmit">
            <div class="input-wrapper">
              <input
                type="text"
                class="custom-input"
                placeholder="Your Name"
                v-model="name"
              />
            </div>
            <div class="input-wrapper">
              <input
                type="email"
                class="custom-input"
                placeholder="Your Email"
                v-model="email"
              />
            </div>
            <div class="input-wrapper">
              <input
                type="text"
                class="custom-input"
                placeholder="Subject"
                v-model="subject"
              />
            </div>
            <div class="input-wrapper">
              <textarea
                class="custom-input textarea"
                placeholder="Your Message"
                rows="5"
                v-model="message"
              ></textarea>
            </div>
            <button type="submit" class="primary-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.page-wrapper {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fbfbfe;
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2.5rem;
  width: 100%;
  max-width: 1000px;
}

.dashboard-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #eae8f5;
}

.info-card {
  background-color: #fbfbfe;
  border: 1px solid #d5ccf8;
}

.section-title {
  font-size: 1.5rem;
  color: #151875;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.info-text {
  color: #4a405c;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.detail-item .icon {
  font-size: 1.5rem;
  color: #3f509e;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.detail-item h4 {
  margin: 0 0 0.3rem 0;
  color: #151875;
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-item p {
  margin: 0;
  color: #4a405c;
  font-size: 0.95rem;
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

.custom-input.textarea {
  resize: vertical;
  min-height: 120px;
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
  margin-top: 0.8rem;
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

@media (max-width: 900px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .container {
    padding: 0 1rem;
  }

  .dashboard-card {
    padding: 2rem 1.5rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .header-title {
    font-size: 1.8rem;
  }
}
</style>
