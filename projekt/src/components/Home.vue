<script setup>
import { ref, onMounted } from "vue"
import api from "../services/axios.js"
import { handleErrors } from "../../errors/ErrorHandler.js"
import ErrorCard from "../../errors/ErrorCard.vue"

const products = ref([])
const isLoading = ref(false)
const fetchError = ref(null)

const loadProducts = async () => {
  isLoading.value = true
  fetchError.value = null

  try {
    const response = await api.get("products")

    products.value = response.data.map((item, index) => ({
      id: index,
      name: item.nazwaProduktu,
      price: `${item.cena.toFixed(2)} PLN`,
      author: `${item.autorImie} ${item.autorNazwisko}`,
    }))
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <section class="hero-section">
    <div class="hero-container">
      <div class="hero-left">
        <p class="hero-subtext">Best Furniture For Your Castle....</p>
        <h1 class="hero-title">New Collection</h1>
        <p class="hero-description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Magna in est
          adipiscing in phasellus non in justo.
        </p>
        <button class="hero-button">Shop Now</button>
      </div>

      <div class="hero-right">
        <div class="circles-group">
          <div class="circle circle-outer"></div>
          <div class="circle circle-inner"></div>
        </div>
        <div class="off-badge">
          <span>50%</span>
          <span>off</span>
        </div>
      </div>
    </div>
  </section>

  <section class="latest-products">
    <div class="products-container">
      <h2 class="section-title">Products</h2>

      <div v-if="isLoading" class="status-message loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Trwa ładowanie produktów...
      </div>

      <ErrorCard
        v-else-if="fetchError"
        :message="fetchError.message"
        @retry="loadProducts"
      />

      <div v-else class="products-grid">
        <div class="product-card" v-for="product in products" :key="product.id">
          <div class="product-image-box"></div>

          <div class="product-info">
            <div class="product-details">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-author">{{ product.author }}</span>
            </div>

            <div class="product-prices">
              <span class="current-price">{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.hero-section {
  background-color: #f3f0ff;
  padding: 5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-container {
  max-width: 87.5rem;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-left {
  flex: 1;
  max-width: 37.5rem;
}

.hero-subtext {
  color: #ed4c8b;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.hero-title {
  color: #0a0a2a;
  font-size: 2.6rem;
  font-weight: 800;
  margin-bottom: 1.875rem;
}

.hero-description {
  color: #333333;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.hero-button {
  background-color: #ed4c8b;
  color: #ffffff;
  border: none;
  padding: 0.9375rem 2.5rem;
  font-size: 1rem;
  border-radius: 0.3125rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.hero-button:hover {
  background-color: #d63d7a;
}

.hero-right {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circles-group {
  position: relative;
  width: 31.25rem;
  height: 31.25rem;
}

.circle {
  border-radius: 50%;
  position: absolute;
}

.circle-outer {
  background-color: #e5dffc;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.circle-inner {
  background-color: #d5ccf8;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
}

.off-badge {
  position: absolute;
  top: 0;
  right: 0.625rem;
  background-color: #00bef0;
  color: #ffffff;
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.off-badge span:last-child {
  font-weight: 500;
  font-size: 1.125rem;
}

.latest-products {
  padding: 10rem 0;
}

.products-container {
  max-width: 75rem;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.section-title {
  color: #151875;
  font-size: 2.6rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 800;
}

/* --- STYLE DLA KOMUNIKATÓW (ŁADOWANIE) --- */
.status-message.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #151875;
  padding: 3rem 0;
}

.status-message.loading i {
  margin-right: 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  row-gap: 4rem;
}

.product-card {
  display: flex;
  flex-direction: column;
}

.product-image-box {
  background-color: #f6f7fb;
  height: 16rem;
  margin-bottom: 1rem;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}

.product-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 1rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.4rem;
}

.product-name {
  color: #151875;
  font-weight: 600;
}

.product-author {
  color: #8a8fb9;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.product-prices {
  display: flex;
  align-items: center;
}

.current-price {
  color: #151875;
  font-weight: 600;
  font-size: 0.875rem;
}

@media (max-width: 68.75rem) {
  .hero-container {
    flex-direction: column;
    text-align: center;
  }

  .hero-left {
    margin-bottom: 3.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .circles-group {
    width: 25rem;
    height: 25rem;
  }

  .off-badge {
    width: 5rem;
    height: 5rem;
    font-size: 1.25rem;
  }

  .off-badge span:last-child {
    font-size: 0.875rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 37.5rem) {
  .hero-title {
    font-size: 2.25rem;
  }

  .circles-group {
    width: 18.75rem;
    height: 18.75rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
