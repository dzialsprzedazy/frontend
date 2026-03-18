<template>
  <div>
    <div v-for="(alert, index) in alertService.alerts.value" :key="index">
      <div v-if="alert">
        <div class="alert" :class="alert.type">
          <h3 class="alert-title">{{ getAlertTitle(alert.type) }}</h3>
          <p class="alert-content">{{ alert.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import alertService from "./AlertService.js"

const getAlertTitle = (type) => {
  switch (type) {
    case "success":
      return "Sukces"
    case "error":
      return "Błąd"
    default:
      return "Informacja"
  }
}
</script>

<style>
.alert {
  width: 512px;
  padding: 16px;
  margin: 8px;
  max-width: 90%;
  position: absolute;
  top: 10px;
  right: 8px;
  z-index: 10000;
  border-radius: 5px;
  animation: slideInRight 0.5s ease-out;
}

.success {
  border-right: 4px solid #2ec946;
  background-color: rgb(235, 250, 238);
  box-shadow: 0 0 1px 0.4px #65c574;
}

.success .alert-title {
  color: #2ec946;
}

.error {
  border: 1px solid #ffb8b8;
  background-color: #faeeee;
}

.error .alert-title {
  color: #ff3838;
}

.alert-title {
  margin-top: 0;
  font-size: 19px;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
}

.alert-content {
  margin: 0;
  font-size: 16px;
  font-family: "Open Sans", sans-serif;
  color: #555;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
