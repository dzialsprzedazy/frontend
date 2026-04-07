<script setup>
import { ref, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import api from "@/services/axios.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"

const currentTab = ref("Description")

const route = useRoute()

const product = ref(null)
const isLoading = ref(false)
const fetchError = ref(null)

const loadProduct = async (idFromRoute = null) => {
  window.scrollTo(0, 0)

  isLoading.value = true
  fetchError.value = null
  product.value = null
  currentTab.value = "Description"

  try {
    const id = idFromRoute || route.params.id
    if (!id) return

    const response = await api.get(`products/${id}`)
    product.value = response.data
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
  },
)

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <main class="product-page">
    <div class="container">
      <Transition name="page-fade" mode="out-in">
        <div v-if="isLoading" class="status-message loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Ładowanie produktu...
        </div>

        <ErrorCard
          v-else-if="fetchError"
          :message="fetchError.message"
          @retry="loadProduct"
        />

        <div
          v-else-if="product"
          class="product-container"
          :key="product.idProduktu"
        >
          <section class="product-main">
            <div class="product-gallery">
              <div class="thumbnails">
                <div class="thumb-placeholder">
                  <i class="fa-regular fa-image"></i>
                </div>
                <div class="thumb-placeholder">
                  <i class="fa-regular fa-image"></i>
                </div>
                <div class="thumb-placeholder">
                  <i class="fa-regular fa-image"></i>
                </div>
              </div>
              <div class="main-image-placeholder">
                <i class="fa-regular fa-image"></i>
              </div>
            </div>

            <div class="product-info-section">
              <h1 class="product-title">{{ product.nazwaProduktu }}</h1>

              <div class="rating">
                <div class="stars-container">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ filled: i <= Math.round(product.sredniaOcena) }"
                  >
                    ★
                  </span>
                </div>
                <span class="count">({{ product.liczbaOpinii }} opinii)</span>
              </div>

              <div class="price-box">
                <span class="current-price">{{ product.cena.toFixed(2) }}</span>
                <span class="currency">PLN</span>
              </div>

              <p class="product-description">
                {{ product.opis || "Brak opisu dla tego produktu." }}
              </p>

              <div class="product-actions">
                <button class="cart-btn">
                  <i class="fa-solid fa-cart-shopping"></i> Add To Cart
                </button>
                <button class="icon-btn" title="Add to Wishlist">
                  <i class="fa-regular fa-heart"></i>
                </button>
              </div>

              <div class="meta-info">
                <div class="meta-row">
                  <strong>Categories:</strong>
                  <span class="meta-text">
                    <span
                      v-for="(cat, index) in product.kategorie"
                      :key="cat.idKategorii"
                    >
                      {{ cat.nazwaKategorii
                      }}{{ index < product.kategorie.length - 1 ? ", " : "" }}
                    </span>
                  </span>
                </div>

                <div
                  class="meta-row"
                  v-if="product.tagi && product.tagi.length > 0"
                >
                  <strong>Tags:</strong>
                  <div class="product-tags">
                    <span
                      class="tag"
                      v-for="tag in product.tagi"
                      :key="tag.idTagu"
                    >
                      {{ tag.nazwaTagu }}
                    </span>
                  </div>
                </div>
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

            <div class="tab-content card-container">
              <div v-if="currentTab === 'Description'" class="fade-in">
                <h3 class="tab-heading">{{ product.nazwaProduktu }}</h3>
                <p class="tab-text">{{ product.opis || "Brak opisu." }}</p>
              </div>

              <div v-if="currentTab === 'Additional Info'" class="fade-in">
                <ul class="info-list">
                  <li>
                    <span class="info-label">Autor:</span>
                    <span class="info-value"
                      >{{ product.autorImie }} {{ product.autorNazwisko }}</span
                    >
                  </li>
                  <li v-if="product.dataWydania">
                    <span class="info-label">Data wydania:</span>
                    <span class="info-value">{{ product.dataWydania }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="currentTab === 'Reviews'" class="fade-in">
                <div
                  v-if="product.opinie && product.opinie.length > 0"
                  class="reviews-list"
                >
                  <div
                    v-for="review in product.opinie"
                    :key="review.idOpinii"
                    class="review-item"
                  >
                    <div class="review-header">
                      <div class="reviewer-avatar">
                        {{ review.uzytkownikLogin.charAt(0).toUpperCase() }}
                      </div>
                      <div class="reviewer-details">
                        <strong class="user-login">{{
                          review.uzytkownikLogin
                        }}</strong>
                        <div class="review-stars">
                          <span
                            v-for="n in 5"
                            :key="n"
                            class="star"
                            :class="{ filled: n <= review.ocena }"
                            >★</span
                          >
                        </div>
                      </div>
                      <span class="review-date">{{
                        new Date(review.dataWystawienia).toLocaleDateString()
                      }}</span>
                    </div>
                    <p class="review-comment">{{ review.komentarz }}</p>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <div class="empty-icon-wrap">
                    <i class="fa-regular fa-comment-dots"></i>
                  </div>
                  <h3>Brak opinii</h3>
                  <p>
                    Na razie brak opinii. Bądź pierwszy, który oceni ten
                    produkt!
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="related-products">
            <div class="section-header">
              <h2 class="section-title">Related Products</h2>
              <div class="title-underline"></div>
            </div>

            <div
              v-if="
                product.relatedProducts && product.relatedProducts.length > 0
              "
              class="related-grid"
            >
              <div
                v-for="rel in product.relatedProducts"
                :key="rel.idProduktu"
                class="product-card"
              >
                <div class="product-image-box">
                  <router-link
                    :to="`/products/${rel.idProduktu}`"
                    class="image-link"
                  >
                    <i class="fa-regular fa-image"></i>
                  </router-link>
                </div>

                <div class="product-card-info">
                  <div class="related-header">
                    <router-link
                      :to="`/products/${rel.idProduktu}`"
                      class="product-title-link"
                    >
                      <h3>{{ rel.nazwaProduktu }}</h3>
                    </router-link>
                    <div class="related-stars">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="star"
                        :class="{ filled: i <= Math.round(rel.sredniaOcena) }"
                        >★</span
                      >
                    </div>
                  </div>
                  <div class="card-footer">
                    <p class="current-price small-price">
                      {{ rel.cena.toFixed(2) }} <small>PLN</small>
                    </p>
                    <router-link
                      :to="`/products/${rel.idProduktu}`"
                      class="view-btn"
                    >
                      <i class="fa-solid fa-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon-wrap">
                <i class="fa-solid fa-box-open"></i>
              </div>
              <p>Brak powiązanych produktów dla tej pozycji.</p>
            </div>
          </section>
        </div>
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.product-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fbfbfe;
  color: #150e24;
  padding: 10rem 0 13rem 0;
}

.container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-message.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: #7d4cd4;
  padding: 8rem 0;
  font-weight: 600;
}

.status-message.loading i {
  font-size: 2.2rem;
}

.product-main {
  display: flex;
  align-items: flex-start;
  gap: 4rem;
  margin-bottom: 5rem;
  background: #ffffff;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(21, 24, 117, 0.04);
  border: 1px solid #f0eefa;
}

.product-gallery {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thumb-placeholder {
  width: 80px;
  height: 80px;
  background: #f8f9fc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #dcdcdc;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumb-placeholder:hover {
  border-color: #7d4cd4;
  color: #7d4cd4;
  background: #f3f0ff;
  transform: translateY(-2px);
}

.main-image-placeholder {
  flex: 1;
  min-width: 0;
  width: 100%;
  background: #f8f9fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: #dcdcdc;
  border-radius: 16px;
  aspect-ratio: 1/1;
  border: 1px solid #eae8f5;
  overflow: hidden;
}

.product-info-section {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  color: #151875;
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0 0 0.8rem 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  word-wrap: break-word;
}

.rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.stars-container,
.review-stars,
.related-stars {
  color: #eae8f5;
  font-size: 1rem;
  display: flex;
  gap: 3px;
}

.star.filled {
  color: #ffc416;
}

.count {
  color: #8a8fb9;
  font-weight: 500;
  font-size: 0.9rem;
}

.price-box {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #f0eefa;
  width: max-content;
}

.current-price {
  color: #151875;
  font-size: 1.6rem;
  font-weight: 800;
}

.currency {
  font-size: 1rem;
  color: #7d4cd4;
  font-weight: 700;
}

.product-description {
  color: #4a405c;
  font-size: 1rem;
  line-height: 1.8;
  margin: 0 0 2.5rem 0;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 2.5rem;
}

.cart-btn {
  background-color: #3f509e;
  color: #ffffff;
  border: none;
  padding: 1rem 2.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(63, 80, 158, 0.2);
}

.cart-btn:hover {
  background-color: #2e3b75;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(63, 80, 158, 0.3);
}

.icon-btn {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #eae8f5;
  color: #3f509e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background-color: #f3f0ff;
  color: #7d4cd4;
  border-color: #d5ccf8;
  transform: translateY(-3px);
}

.meta-info {
  border-top: 1px dashed #eae8f5;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  font-size: 0.9rem;
}

.meta-row strong {
  color: #151875;
  font-weight: 700;
  min-width: 90px;
  padding-top: 0.2rem;
}

.meta-text {
  color: #4a405c;
  font-weight: 500;
  padding-top: 0.2rem;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #ffffff;
  border: 1px solid #d5ccf8;
  color: #7d4cd4;
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #7d4cd4;
  color: #ffffff;
}

.product-tabs {
  margin-bottom: 6rem;
}

.tabs-navigation {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.tab-link {
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #8a8fb9;
  cursor: pointer;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.tab-link:hover {
  color: #151875;
  background: #f8f9fc;
}

.tab-link.active {
  color: #ffffff;
  background: #151875;
  box-shadow: 0 4px 15px rgba(21, 24, 117, 0.2);
}

.card-container {
  background: #ffffff;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(21, 24, 117, 0.04);
  border: 1px solid #f0eefa;
}

.tab-heading {
  color: #151875;
  font-size: 1.4rem;
  margin: 0 0 1.2rem 0;
  font-weight: 700;
}

.tab-text {
  color: #4a405c;
  line-height: 1.8;
  margin: 0;
  font-size: 1rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-list li {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #eae8f5;
}

.info-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  color: #151875;
  font-weight: 700;
  min-width: 150px;
  font-size: 1rem;
}

.info-value {
  color: #4a405c;
  font-size: 1rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  padding: 1.5rem;
  background: #fbfbfe;
  border-radius: 16px;
  border: 1px solid #eae8f5;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  background: #3f509e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.user-login {
  color: #151875;
  font-size: 1rem;
  font-weight: 700;
}

.review-date {
  font-size: 0.85rem;
  color: #8a8fb9;
  margin-left: auto;
  font-weight: 500;
}

.review-comment {
  color: #4a405c;
  line-height: 1.7;
  margin: 0;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon-wrap {
  width: 70px;
  height: 70px;
  background: #f3f0ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem auto;
}

.empty-state i {
  font-size: 2.2rem;
  color: #7d4cd4;
}

.empty-state h3 {
  color: #151875;
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #8a8fb9;
  margin: 0;
  font-size: 0.95rem;
}

.section-header {
  margin-bottom: 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  color: #151875;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}

.title-underline {
  width: 50px;
  height: 4px;
  background: #7d4cd4;
  border-radius: 2px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
}

.product-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(21, 24, 117, 0.03);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0eefa;
  padding: 1.2rem;
  gap: 1.2rem;
}

.product-card:hover {
  box-shadow: 0 12px 30px rgba(21, 24, 117, 0.08);
  transform: translateY(-4px);
  border-color: #d5ccf8;
}

.product-image-box {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: #f8f9fc;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcdcdc;
  font-size: 3.5rem;
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

.product-card-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  justify-content: space-between;
}

.related-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-title-link {
  text-decoration: none;
  color: #151875;
  font-size: 1.1rem;
  font-weight: 700;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-title-link:hover {
  color: #7d4cd4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.small-price {
  font-size: 1.2rem;
  margin: 0;
  background: none;
  padding: 0;
}

.view-btn {
  width: 38px;
  height: 38px;
  background: #f8f9fc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3f509e;
  text-decoration: none;
  transition: all 0.3s ease;
}

.product-card:hover .view-btn {
  background: #3f509e;
  color: #ffffff;
}

@media (max-width: 960px) {
  .product-main {
    flex-direction: column;
    gap: 3rem;
  }

  .product-gallery {
    flex-direction: column-reverse;
  }

  .thumbnails {
    flex-direction: row;
    justify-content: center;
  }

  .thumb-placeholder {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 650px) {
  .product-page {
    padding: 6rem 0 8rem 0;
  }

  .tabs-navigation {
    justify-content: flex-start;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 1rem;
  }

  .product-title {
    font-size: 1.8rem;
  }

  .card-container,
  .product-main {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .review-date {
    margin-left: 0;
  }
}
</style>
