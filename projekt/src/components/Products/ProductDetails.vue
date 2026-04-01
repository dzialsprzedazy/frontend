<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "@/services/axios.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

const route = useRoute()

const product = ref(null)
const isLoading = ref(false)
const fetchError = ref(null)

const loadProduct = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const id = route.params.id

    const response = await api.get(`products/${id}`)
    product.value = response.data
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <div class="product-details">
    <div v-if="isLoading">Loading product...</div>

    <ErrorCard
      v-else-if="fetchError"
      :message="fetchError.message"
      @retry="loadProduct"
    />

    <div v-else-if="product">
      <h1>{{ product.nazwaProduktu }}</h1>
    </div>
  </div>
</template>
