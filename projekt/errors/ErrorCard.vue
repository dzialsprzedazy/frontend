<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
})

defineEmits(["retry"])
</script>

<template>
  <div class="error-container">
    <div class="error-icon">
      <i class="fa-solid fa-triangle-exclamation"></i>
    </div>
    <h3 class="error-title">Ups! Something went wrong</h3>
    <p class="error-message">{{ message }}</p>

    <button v-if="showRetry" class="retry-button" @click="$emit('retry')">
      <i class="fa-solid fa-rotate-right"></i> Try again
    </button>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #ffffff;
  padding: 3rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #fb2448;
  max-width: 35rem;
  margin: 0 auto;
}

.error-icon {
  font-size: 3.5rem;
  color: #fb2448;
  margin-bottom: 1rem;
}

.error-title {
  color: #151875;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #8a8fb9;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.retry-button {
  background-color: #fb2448;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.retry-button:hover {
  background-color: #d81c3b;
}
</style>
