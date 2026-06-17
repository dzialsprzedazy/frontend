<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "@/services/axios.js"
import { handleErrors } from "../../../errors/ErrorHandler.js"
import ErrorCard from "../../../errors/ErrorCard.vue"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import { addToCart } from "@/components/Cart/cartLogic.js"

const currentTab = ref("Description")
const route = useRoute()
const router = useRouter()
const { showAlert } = useAlerts()

const product = ref(null)
const isLoading = ref(false)
const fetchError = ref(null)
const isInWishlist = ref(false)
const isWishlistActionLoading = ref(false)

const isAdmin = computed(() => {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) return false
    const user = JSON.parse(userStr)
    const roles = user.roles || user.Roles || []
    return roles.includes("Admin")
  } catch (e) {
    return false
  }
})

const stockClass = computed(() => {
  if (!product.value) return ""
  const stock = product.value.stanMagazynowy
  if (stock > 10) return "stock-high"
  if (stock > 0) return "stock-medium"
  return "stock-empty"
})

const loadProduct = async (idFromRoute = null) => {
  window.scrollTo(0, 0)
  isLoading.value = true
  fetchError.value = null
  product.value = null
  currentTab.value = "Description"
  isInWishlist.value = false

  try {
    const id = idFromRoute || route.params.id
    if (!id) return

    const response = await api.get(`products/${id}`)
    
    // ZABEZPIECZENIE: Jeśli produkt jest ukryty, a użytkownik nie jest adminem - wyrzuć błąd
    if (response.data.czyUkryty && !isAdmin.value) {
      throw new Error("Product not found")
    }

    product.value = response.data

    // Filtrowanie powiązanych produktów dla zwykłego użytkownika
    if (product.value.relatedProducts && !isAdmin.value) {
       product.value.relatedProducts = product.value.relatedProducts.filter(p => !p.czyUkryty)
    }

    const token = localStorage.getItem("token")
    if (token) {
      try {
        const wishlistResponse = await api.get("users/wishlist")
        isInWishlist.value = wishlistResponse.data.some(
          (item) => item.productId === product.value.idProduktu,
        )
      } catch (wishlistError) {
        console.warn("Could not fetch wishlist status:", wishlistError)
        isInWishlist.value = false
      }
    }
  } catch (error) {
    // Złapane zabezpieczenie pokaże, że produktu nie ma (404)
    if (error.message === "Product not found") {
      fetchError.value = { message: "The product you are looking for does not exist or has been removed." }
    } else {
      handleErrors(error, fetchError)
    }
  } finally {
    isLoading.value = false
  }
}

const toggleWishlist = async () => {
  if (!product.value || isWishlistActionLoading.value) return

  const token = localStorage.getItem("token")
  if (!token) {
    showAlert({
      type: "error",
      message: "Please log in to add products to your wishlist.",
      position: "top-right",
    })
    return
  }

  isWishlistActionLoading.value = true
  fetchError.value = null

  try {
    if (isInWishlist.value) {
      await api.delete(`users/wishlist/${product.value.idProduktu}`)
      isInWishlist.value = false
      showAlert({
        type: "success",
        message: "Product removed from wishlist!",
        position: "top-right",
      })
    } else {
      await api.post(`users/wishlist/${product.value.idProduktu}`)
      isInWishlist.value = true
      showAlert({
        type: "success",
        message: "Product added to wishlist!",
        position: "top-right",
      })
    }
  } catch (error) {
    handleErrors(error, fetchError)
    showAlert({
      type: "error",
      message: fetchError.value?.message || "Failed to update wishlist.",
      position: "top-right",
    })
  } finally {
    isWishlistActionLoading.value = false
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

const handleAdd = async () => {
  addToCart(product.value, showAlert)
}

onMounted(() => {
  loadProduct()
})

const isUserLoggedIn = computed(() => !!localStorage.getItem("token"))
const reviewForm = ref({ rating: 5, comment: "" })
const isSubmittingReview = ref(false)

const setRating = (star) => {
  reviewForm.value.rating = star
}

const submitReview = async () => {
  if (!reviewForm.value.comment.trim()) {
    showAlert({ type: "error", message: "Comment cannot be empty.", position: "top-right" })
    return
  }

  isSubmittingReview.value = true
  try {
    await api.post("reviews", {
      idProduktu: product.value.idProduktu,
      ocena: reviewForm.value.rating,
      komentarz: reviewForm.value.comment,
    })
    
    showAlert({ type: "success", message: "Review added successfully!", position: "top-right" })
    reviewForm.value.comment = ""
    reviewForm.value.rating = 5
    await loadProduct() 
  } catch (error) {
    showAlert({ type: "error", message: "Failed to submit review.", position: "top-right" })
  } finally {
    isSubmittingReview.value = false
  }
}
</script>

<template>
  <main class="product-page">
    <div class="container">
      <Transition name="page-fade" mode="out-in">
        <div v-if="isLoading" class="status-message loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Loading product...
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
              <div class="main-image-placeholder">
                <img
                  v-if="product.zdjecie"
                  :src="product.zdjecie"
                  :alt="product.nazwaProduktu"
                  class="main-product-image"
                />
                <i v-else class="fa-regular fa-image"></i>
              </div>
            </div>

            <div class="product-info-section">
              <div class="title-and-stock">
                <h1 class="product-title">
                  {{ product.nazwaProduktu }}
                  <span v-if="product.czyUkryty && isAdmin" class="badge-hidden">
                    <i class="fa-solid fa-eye-slash"></i> Ukryty
                  </span>
                </h1>
                <div class="availability-badge" :class="stockClass">
                  <i class="fa-solid fa-layer-group"></i>
                  Dostępność: {{ product.stanMagazynowy }}
                </div>
              </div>

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
                <span class="count">({{ product.liczbaOpinii }} reviews)</span>
              </div>

              <div class="price-box">
                <template v-if="product.promocjaWProc && Number(product.promocjaWProc) > 0">
                  <span class="old-price-detail">{{ product.cena.toFixed(2) }} PLN</span>
                  <span class="current-price discounted">
                    {{ (product.cena * (1 - Number(product.promocjaWProc) / 100)).toFixed(2) }} PLN
                  </span>
                </template>
                <template v-else>
                  <span class="current-price">{{ product.cena.toFixed(2) }}</span>
                  <span class="currency">PLN</span>
                </template>
              </div>

              <p class="product-description">
                {{
                  product.opis || "No description available for this product."
                }}
              </p>

              <div class="product-actions">
                <button class="cart-btn" v-on:click="handleAdd" :disabled="product.stanMagazynowy === 0 || product.czyUkryty">
                  <i class="fa-solid fa-cart-shopping"></i> Add To Cart
                </button>
                <button
                  class="icon-btn"
                  :title="
                    isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'
                  "
                  @click="toggleWishlist"
                  :disabled="isWishlistActionLoading"
                >
                  <i
                    :class="[
                      'fa-heart',
                      isInWishlist ? 'fa-solid' : 'fa-regular',
                    ]"
                  ></i>
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
                <p class="tab-text">{{ product.opis || "No description." }}</p>
              </div>

              <div v-if="currentTab === 'Additional Info'" class="fade-in">
                <ul class="info-list">
                  <li>
                    <span class="info-label">Author:</span>
                    <span class="info-value"
                      >{{ product.autorImie }} {{ product.autorNazwisko }}</span
                    >
                  </li>
                  <li v-if="product.dataWydania">
                    <span class="info-label">Release date:</span>
                    <span class="info-value">{{ product.dataWydania }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="currentTab === 'Reviews'" class="fade-in">
                
                <div v-if="isUserLoggedIn" class="add-review-section">
                  <h4 class="add-review-title">Write a Review</h4>
                  <div class="rating-select">
                    <span class="info-label">Your Rating:</span>
                    <div class="stars-clickable">
                      <span 
                        v-for="star in 5" 
                        :key="star" 
                        class="star-btn"
                        :class="{ filled: star <= reviewForm.rating }"
                        @click="setRating(star)"
                      >★</span>
                    </div>
                  </div>
                  <textarea 
                    v-model="reviewForm.comment" 
                    class="review-textarea" 
                    placeholder="Share your thoughts about this product..."
                    rows="4"
                  ></textarea>
                  <button 
                    class="cart-btn" 
                    style="margin-top: 1rem;" 
                    @click="submitReview" 
                    :disabled="isSubmittingReview"
                  >
                    <i class="fa-solid fa-paper-plane"></i> {{ isSubmittingReview ? 'Submitting...' : 'Submit Review' }}
                  </button>
                  <hr class="review-divider" />
                </div>
                
                <div v-else class="login-prompt">
                  <i class="fa-solid fa-circle-info"></i> Please log in to write a review.
                  <hr class="review-divider" />
                </div>
                <div v-if="product.opinie && product.opinie.length > 0" class="reviews-list">
                  <div v-for="review in product.opinie" :key="review.idOpinii" class="review-item">
                    <div class="review-header">
                      <div class="reviewer-avatar">{{ review.uzytkownikLogin.charAt(0).toUpperCase() }}</div>
                      <div class="reviewer-details">
                        <strong class="user-login">{{ review.uzytkownikLogin }}</strong>
                        <div class="review-stars">
                          <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.ocena }">★</span>
                        </div>
                      </div>
                      <span class="review-date">{{ new Date(review.dataWystawienia).toLocaleDateString() }}</span>
                    </div>
                    <p class="review-comment">{{ review.komentarz }}</p>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <div class="empty-icon-wrap"><i class="fa-regular fa-comment-dots"></i></div>
                  <h3>No reviews</h3>
                  <p>No reviews yet. Be the first to rate this product!</p>
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
                    <img
                      v-if="rel.zdjecie"
                      :src="rel.zdjecie"
                      :alt="rel.nazwaProduktu"
                      class="product-image"
                    />
                    <i v-else class="fa-regular fa-image"></i>
                  </router-link>
                </div>

                <div class="product-card-info">
                  <div class="related-header">
                    <router-link
                      :to="`/products/${rel.idProduktu}`"
                      class="product-title-link"
                    >
                      <h3>
                        {{ rel.nazwaProduktu }}
                        <span v-if="rel.czyUkryty && isAdmin" class="badge-hidden">
                          <i class="fa-solid fa-eye-slash"></i>
                        </span>
                      </h3>
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
              <p>No related products for this item.</p>
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
  justify-content: center;
  flex: 0 0 auto;
}

.main-image-placeholder {
  width: 320px;
  height: 480px;
  background-color: #f8f9fc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: #dcdcdc;
  overflow: hidden;
  flex-shrink: 0;
}

.main-product-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  border-radius: 12px;
}

.product-info-section {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title-and-stock {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 0.8rem;
}

.product-title {
  color: #151875;
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.badge-hidden {
  font-size: 0.9rem;
  background-color: #fdf2f4;
  color: #e03a5b;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0;
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.stock-high {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.stock-medium {
  background-color: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffe0b2;
}

.stock-empty {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
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

.old-price-detail {
  color: #9096b2;
  text-decoration: line-through;
  font-size: 1.2rem;
  font-weight: 500;
  margin-right: 0.4rem;
}

.current-price.discounted {
  color: #fb2e86;
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

.cart-btn:hover:not(:disabled) {
  background-color: #2e3b75;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(63, 80, 158, 0.3);
}

.cart-btn:disabled {
  background-color: #c2c6e2;
  cursor: not-allowed;
  box-shadow: none;
}

.icon-btn .fa-solid.fa-heart {
  color: #fb2e86;
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

.add-review-section {
  background: #f8f9fc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #eae8f5;
}
.add-review-title {
  color: #151875;
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
}
.rating-select {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.stars-clickable {
  display: flex;
  gap: 4px;
  font-size: 1.5rem;
  cursor: pointer;
}
.star-btn {
  color: #eae8f5;
  transition: color 0.2s;
}
.star-btn.filled, .star-btn:hover {
  color: #ffc416;
}
.review-textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  font-family: inherit;
  resize: vertical;
  outline: none;
}
.review-textarea:focus {
  border-color: #3f509e;
}
.review-divider {
  border: none;
  border-top: 1px dashed #eae8f5;
  margin: 2rem 0;
}
.login-prompt {
  color: #8a8fb9;
  font-weight: 500;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
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
    align-items: center;
    gap: 3rem;
  }
  
  .title-and-stock {
    flex-direction: column;
    gap: 1rem;
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

  .main-image-placeholder {
    width: 100%;
    max-width: 280px;
    height: 420px;
  }
}
</style>