<script setup>

import { ref, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import api from "@/services/axios.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

const currentTab = ref('Description') 

const route = useRoute()

const product = ref(null)
const isLoading = ref(false)
const fetchError = ref(null)

const loadProduct = async (idFromRoute = null) => {
  isLoading.value = true
  fetchError.value = null

  try {
    
    const id = idFromRoute || route.params.id
    if (!id) return 

    const response = await api.get(`products/${id}`)
    product.value = response.data
    
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProduct(newId)
    }
  }
)

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <main class="product-details-page container">
    <div v-if="isLoading" class="loading">Ładowanie produktu...</div>

    <ErrorCard
      v-else-if="fetchError"
      :message="fetchError.message"
      @retry="loadProduct"
    />

    <div v-else-if="product" class="product-container">
      
      <section class="product-main">
        <div class="product-gallery">
          <div class="thumbnails">
            <div class="thumb-placeholder"></div>
            <div class="thumb-placeholder"></div>
            <div class="thumb-placeholder"></div>
          </div>
          <div class="main-image-placeholder">
            <i class="fa-regular fa-image"></i>
          </div>
        </div>

        <div class="product-buy-section">
          <h1 class="product-title">{{ product.nazwaProduktu }}</h1>
          
          <div class="rating">
            <div class="stars-container">
                <span 
                  v-for="i in 5" 
                  :key="i" 
                  class="star"
                  :class="{ 'filled': i <= Math.round(product.sredniaOcena) }"
                >
                  ★
                </span>
            </div>
          <span class="count">({{ product.liczbaOpinii }})</span>
        </div>

          <div class="price-box">
            <span class="current-price">{{ product.cena.toFixed(2) }} PLN</span>
          </div>

          <p class="short-description">
            {{ product.opis || 'Brak opisu dla tego produktu.' }}
          </p>

          <div class="actions">
            <button class="add-to-cart-btn">Add To Cart</button>
            <button class="wishlist-btn"><i class="fa-regular fa-heart"></i></button>
          </div>

          <div class="meta-info">
  <p>
    <strong>Categories: </strong> 
    <span v-for="(cat, index) in product.kategorie" :key="cat.idKategorii">
      {{ cat.nazwaKategorii }}{{ index < product.kategorie.length - 1 ? ', ' : '' }}
    </span>
  </p>
  <p>
    <strong>Tags: </strong>
    <span v-for="(tag, index) in product.tagi" :key="tag.idTagu">
      {{ tag.nazwaTagu }}{{ index < product.tagi.length - 1 ? ', ' : '' }}
    </span>
  </p>
</div>
        </div>
      </section>

      <section class="product-tabs">
        <nav class="tabs-navigation">
          <button 
            v-for="tab in ['Description', 'Additional Info', 'Reviews']" 
            :key="tab"
            :class="['tab-link', { active: currentTab === tab }]"
            @click="currentTab = tab"
          >
            {{ tab }}
          </button>
        </nav>

        <div class="tab-content">
          <div v-if="currentTab === 'Description'">
            <h3>{{ product.nazwaProduktu }}</h3>
            <p>{{ product.opis }}</p>
          </div>
          <div v-if="currentTab === 'Additional Info'">
            <p>Informacje o autorze: {{ product.autorImie }} {{ product.autorNazwisko }}</p>
            <p>Data wydania: {{ product.dataWydania }}</p>
          </div>
          <div v-if="currentTab === 'Reviews'">
            <div v-if="product.opinie && product.opinie.length > 0" class="reviews-list">
              <div v-for="review in product.opinie" :key="review.idOpinii" class="review-item">
                <div class="review-header">
                  <strong class="user-login">{{ review.uzytkownikLogin }}</strong>
                  <div class="review-stars">
                    <span v-for="n in 5" :key="n" :class="['star', { filled: n <= review.ocena }]">★</span>
                  </div>
                  <span class="review-date">{{ new Date(review.dataWystawienia).toLocaleDateString() }}</span>
                </div>
                <p class="review-comment">{{ review.komentarz }}</p>
                <hr class="review-divider" />
              </div>
            </div>
            
            <p v-else>Na razie brak opinii. Bądź pierwszy!</p>
          </div>
        </div>
      </section>

      <section class="related-products">
        <h2 class="section-title">Related Products</h2>
        
        <div v-if="product.relatedProducts && product.relatedProducts.length > 0" class="related-grid">
          <div v-for="rel in product.relatedProducts" :key="rel.idProduktu" class="related-card">
            <router-link :to="`/products/${rel.idProduktu}`">
              <div class="related-image">
                <i class="fa-regular fa-image"></i>
              </div>
            </router-link>
            
            <div class="related-info">
              <div class="related-header">
                <router-link :to="`/products/${rel.idProduktu}`">
                  <h3>{{ rel.nazwaProduktu }}</h3>
                </router-link>
                <div class="related-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(rel.sredniaOcena) }">★</span>
                </div>
              </div>
              <p class="related-price">{{ rel.cena.toFixed(2) }} PLN</p>
            </div>
          </div>
        </div>

        <div v-else class="no-related-message">
          <p>Brak powiązanych produktów dla tej pozycji.</p>
        </div>
      </section>
    
    </div>
  </main>
</template>



<style scoped>

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.product-main {
  display: flex;
  gap: 8rem; 
  margin-bottom: 5rem;
}

.product-gallery {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thumb-placeholder {
  width: 80px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 8px;
}

.main-image-placeholder {
  flex: 1;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: #ccc;
  border-radius: 12px;
}


.product-buy-section {
  flex: 1;
}

.product-title {
  color: #151875;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.stars-container, .review-stars {
  color: #dcdcdc; 
  font-size: 1.2rem;
  display: flex;
  gap: 2px;
}

.star.filled {
  color: #FFC416; 
}

.price-box {
  font-size: 1.5rem;
  color: #151875;
  font-weight: bold;
  margin: 1.5rem 0 1rem 0; 
}

.short-description {
  margin-bottom: 2rem;
  line-height: 1.6;
}


.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem; 
  margin-bottom: 3rem;
}

.add-to-cart-btn {
  background: #fb2e86;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}

.add-to-cart-btn:hover {
  opacity: 0.9;
}

.wishlist-btn {
  background: none;
  border: 1px solid #fb2e86; 
  color: #fb2e86;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.wishlist-btn:hover {
  background: #fb2e86;
  color: white;
}


.meta-info {
  border-top: 1px solid #f0f0f0;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem; 
}

.meta-info p {
  margin: 0;
  color: #151875;
  font-weight: 500;
}

.meta-info strong {
  margin-right: 5px;
  color: #151875;
}


.tabs-navigation {
  display: flex;
  gap: 3rem;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 2rem;
}

.tab-link {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #151875;
  cursor: pointer;
  padding-bottom: 0.5rem;
}

.tab-link.active {
  border-bottom: 2px solid #151875;
  font-weight: bold;
}

.tab-content {
  color: #8a8fb9;
  line-height: 1.8;
}

.reviews-list {
  margin-top: 1rem;
}

.review-item {
  margin-bottom: 2rem;
  text-align: left;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.user-login {
  color: #151875;
  font-size: 1.1rem;
}

.review-date {
  font-size: 0.85rem;
  color: #8a8fb9;
}

.review-comment {
  color: #8a8fb9;
  font-style: italic;
  margin: 0.5rem 0;
  padding-left: 0.5rem;
  border-left: 2px solid #f0f0f0;
}

.review-divider {
  border: 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 1.5rem;
}
.related-products {
  margin-top: 5rem;
  text-align: left;
}

.section-title {
  color: #151875;
  font-size: 2rem;
  margin-bottom: 3rem;
}


.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.5rem;
}

.related-card {
  transition: transform 0.3s ease;
  width: 100%; 
}

.related-card:hover {
  transform: translateY(-5px);
}

.related-image {
  background: #f6f7fb;
  aspect-ratio: 3/4; 
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 4rem;
  color: #ccc;
}



.related-info a {
  text-decoration: none;
}


.related-info h3 {
  color: #151875;
  font-size: 1.1rem;
  margin: 0;

  transition: color 0.3s ease; 
}


.related-card:hover .related-info h3 {
  color: #fb2e86;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.related-stars {
  font-size: 0.8rem;
  white-space: nowrap;
}

.related-price {
  color: #151875;
  font-weight: 500;
}


.no-related-message {
  padding: 3rem;
  background: #f9f9fd;
  border-radius: 12px;
  text-align: center;
  color: #8a8fb9;
  font-style: italic;
  border: 1px dashed #d5d5ef;
}


@media (max-width: 1024px) {
  .related-grid {
    grid-template-columns: repeat(2, 1fr); 
  }
}

@media (max-width: 600px) {
  .related-grid {
    grid-template-columns: 1fr; 
  }
}

@media (max-width: 768px) {
  .product-main {
    flex-direction: column; 
    gap: 2rem;
  }
  
  .tabs-navigation {
    gap: 1.5rem;
  }
  
  .tab-link {
    font-size: 1rem;
  }
}
</style>