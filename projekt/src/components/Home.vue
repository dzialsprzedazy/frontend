<script setup>
import { ref, onMounted } from "vue"
import api from "../services/axios.js"
import { handleErrors } from "../../errors/ErrorHandler.js"
import ErrorCard from "../../errors/ErrorCard.vue"

const products = ref([])
const fantasyProducts = ref([])
const isLoading = ref(false)
const isFantasyLoading = ref(false)
const fetchError = ref(null)
const fantasyError = ref(null)

const loadProducts = async () => {
  isLoading.value = true
  fetchError.value = null
  try {
    const response = await api.get("products")
    products.value = response.data.slice(0, 3).map((item) => {
      const discount = item.promocjaWProc || 0
      const originalPrice = item.cena
      const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice

      return {
        id: item.idProduktu,
        name: item.nazwaProduktu,
        oldPrice: discount > 0 ? `${originalPrice.toFixed(2)} PLN` : null,
        price: `${finalPrice.toFixed(2)} PLN`,
        author: `${item.autorImie} ${item.autorNazwisko}`,
        image: item.zdjecie
      }
    })
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

const loadDiscountProducts = async () => {
  isFantasyLoading.value = true
  fantasyError.value = null
  try {
    const response = await api.get("products")
    fantasyProducts.value = response.data
      .filter(item => (item.promocjaWProc || 0) > 0)
      .map((item) => {
        const discount = item.promocjaWProc || 0
        const originalPrice = item.cena
        const finalPrice = originalPrice * (1 - discount / 100)
        return {
          id: item.idProduktu,
          name: item.nazwaProduktu,
          oldPrice: `${originalPrice.toFixed(2)} PLN`,
          price: `${finalPrice.toFixed(2)} PLN`,
          author: `${item.autorImie} ${item.autorNazwisko}`,
          image: item.zdjecie
        }
      })
  } catch (error) {
    handleErrors(error, fantasyError)
  } finally {
    isFantasyLoading.value = false
  }
}

onMounted(() => {
  loadProducts()
  loadDiscountProducts()
})
</script>

<template>
  <section class="hero-section">
    <div class="hero-container">
      <div class="hero-left">
        <p class="hero-subtext">Discover Unique Masterpieces...</p>
        <h1 class="hero-title">New Collection</h1>
        <p class="hero-description">
          Explore our latest arrivals featuring extraordinary works from top authors. 
          Find the perfect addition to your collection today.
        </p>
        <router-link to="/products" class="hero-button">Shop Now</router-link>
      </div>

      <div class="hero-right">
        <div class="circles-group">
          <div class="circle circle-outer"></div>
          <div class="circle circle-inner"></div>
          
          <div class="book-showcase" v-if="products.length > 0">
            <div class="book-card card-left">
              <img v-if="products[2]?.image" :src="products[2].image" alt="Book cover" />
              <div v-else class="placeholder-img"><i class="fa-solid fa-book"></i></div>
            </div>
            <div class="book-card card-right">
              <img v-if="products[1]?.image" :src="products[1].image" alt="Book cover" />
              <div v-else class="placeholder-img"><i class="fa-solid fa-book"></i></div>
            </div>
            <div class="book-card card-center">
              <img v-if="products[0]?.image" :src="products[0].image" alt="Book cover" />
              <div v-else class="placeholder-img"><i class="fa-solid fa-book"></i></div>
            </div>
          </div>
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
      <h2 class="section-title">Top Products</h2>

      <div v-if="isLoading" class="status-message loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading...
      </div>

      <ErrorCard
        v-else-if="fetchError"
        :message="fetchError.message"
        @retry="loadProducts"
      />

      <div v-else class="products-grid">
        <div class="product-card" v-for="product in products" :key="product.id">
          <div class="product-image-box">
            <router-link :to="`/products/${product.id}`" class="image-link">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="product-image"
              />
              <i v-else class="fa-regular fa-image"></i>
            </router-link>
          </div>

          <div class="product-info">
            <div class="product-details">
              <router-link :to="`/products/${product.id}`" class="product-title-link">
                <span class="product-name">{{ product.name }}</span>
              </router-link>
              <span class="product-author">By <strong>{{ product.author }}</strong></span>
            </div>

            <div class="product-prices">
            <div class="product-prices">
            <span v-if="product.oldPrice" class="old-price">{{ product.oldPrice }}</span>
            <span :class="['current-price', { 'discounted': product.oldPrice }]">{{ product.price }}</span>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-if="fantasyProducts.length > 0" class="latest-products promo-section">
    <div class="products-container">
      <h2 class="section-title">Tag Discount</h2>

      <div v-if="isFantasyLoading" class="status-message loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading promotions...
      </div>

      <ErrorCard
        v-else-if="fantasyError"
        :message="fantasyError.message"
        @retry="loadFantasyProducts"
      />

      <div v-else class="products-grid">
        <div class="product-card" v-for="product in fantasyProducts" :key="product.id">
          <div class="product-image-box">
            <router-link :to="`/products/${product.id}`" class="image-link">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="product-image"
              />
              <i v-else class="fa-regular fa-image"></i>
            </router-link>
          </div>

          <div class="product-info">
            <div class="product-details">
              <router-link :to="`/products/${product.id}`" class="product-title-link">
                <span class="product-name">{{ product.name }}</span>
              </router-link>
              <span class="product-author">By <strong>{{ product.author }}</strong></span>
            </div>

            <div class="product-prices">
              <div class="product-prices">
              <span v-if="product.oldPrice" class="old-price">{{ product.oldPrice }}</span>
              <span :class="['current-price', { 'discounted': product.oldPrice }]">{{ product.price }}</span>
            </div>
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
  background-color: #f6f5ff;
  padding: 5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-left {
  flex: 1;
  max-width: 37.5rem;
}

.hero-subtext {
  color: #fb2e86;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.hero-title {
  color: #151875;
  font-size: 3.2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.hero-description {
  color: #8a8fb9;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 85%;
}

.hero-button {
  display: inline-block;
  background-color: #fb2e86;
  color: #ffffff;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(251, 46, 134, 0.2);
}

.hero-button:hover {
  background-color: #e01b6f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 46, 134, 0.3);
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
  opacity: 0.5;
}

.circle-inner {
  background-color: #d5ccf8;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
  opacity: 0.5;
}

.book-showcase {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 330px;
  perspective: 1000px;
  z-index: 10;
}

.book-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background-color: transparent;
  box-shadow: 0 15px 35px rgba(21, 24, 117, 0.1);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  background-color: #f8f9fc;
}

.placeholder-img {
  font-size: 3rem;
  color: #dcdcdc;
}

.card-left {
  transform: translateX(-40px) scale(0.85);
  z-index: 1;
  opacity: 0.7;
  filter: blur(2px);
}

.card-right {
  transform: translateX(40px) scale(0.85);
  z-index: 2;
  opacity: 0.7;
  filter: blur(2px);
}

.card-center {
  transform: translateX(0) scale(1);
  z-index: 3;
  box-shadow: 0 20px 40px rgba(21, 24, 117, 0.2);
}

.book-showcase:hover .card-left {
  transform: translateX(-130px) scale(0.9) rotate(-6deg);
  opacity: 1;
  filter: blur(0);
  box-shadow: -10px 20px 30px rgba(21, 24, 117, 0.15);
}

.book-showcase:hover .card-right {
  transform: translateX(130px) scale(0.9) rotate(6deg);
  opacity: 1;
  filter: blur(0);
  box-shadow: 10px 20px 30px rgba(21, 24, 117, 0.15);
}

.book-showcase:hover .card-center {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 0 30px 50px rgba(21, 24, 117, 0.25);
}

.off-badge {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background-color: #00bef0;
  color: #ffffff;
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
  box-shadow: 0 4px 15px rgba(0, 190, 240, 0.3);
  z-index: 20;
}

.off-badge span:last-child {
  font-weight: 600;
  font-size: 1rem;
}

.latest-products {
  padding: 4rem 0 2rem 0;
  background-color: #ffffff;
}

.promo-section {
  padding: 2rem 0 10rem 0;
}

.products-container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  color: #151875;
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 3.5rem;
  font-weight: 800;
}

.status-message.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: #7d4cd4;
  padding: 4rem 0;
  font-weight: 600;
}

.status-message.loading i {
  font-size: 2.2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
  justify-content: center;
  gap: 2.5rem;
}

.product-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(21, 24, 117, 0.03);
  border: 1px solid #eae8f5;
  padding: 1.2rem;
  gap: 1.2rem;
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 10px 30px rgba(21, 24, 117, 0.06);
  transform: translateY(-4px);
  border-color: #d5ccf8;
}

.product-image-box {
  width: 100%;
  aspect-ratio: 2 / 3;
  background-color: #f8f9fc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcdcdc;
  font-size: 3.5rem;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.product-card:hover .product-image-box {
  background-color: #f3f0ff;
  color: #d5ccf8;
}

.image-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  border-radius: 8px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 0.5rem;
  flex: 1;
}

.product-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 1rem;
}

.product-title-link {
  text-decoration: none;
  color: #151875;
  transition: color 0.2s ease;
}

.product-title-link:hover {
  color: #7d4cd4;
}

.product-name {
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-author {
  color: #8a8fb9;
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

.product-author strong {
  color: #4a405c;
  font-weight: 500;
}

.product-prices {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.current-price {
  color: #3f509e;
  font-weight: 800;
  font-size: 1.1rem;
  white-space: nowrap;
}

.old-price {
  color: #9096b2;
  text-decoration: line-through;
  font-size: 0.9rem;
  margin-right: 0.5rem; /* mały odstęp od nowej ceny */
}

.current-price.discounted {
  color: #fb2e86; /* Czerwony/Różowy kolor promocji */
}

@media (max-width: 1100px) {
  .hero-title {
    font-size: 2.6rem;
  }
  
  .circles-group {
    width: 25rem;
    height: 25rem;
  }
}

@media (max-width: 850px) {
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
  
  .hero-description {
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.25rem;
  }

  .circles-group {
    width: 18.75rem;
    height: 18.75rem;
  }
  
  .book-showcase {
    width: 140px;
    height: 210px;
  }

  .card-left { transform: translateX(-20px) scale(0.85); }
  .card-right { transform: translateX(20px) scale(0.85); }

  .book-showcase:hover .card-left {
    transform: translateX(-80px) scale(0.9) rotate(-6deg);
  }

  .book-showcase:hover .card-right {
    transform: translateX(80px) scale(0.9) rotate(6deg);
  }

  .products-grid {
    grid-template-columns: minmax(260px, 320px);
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>