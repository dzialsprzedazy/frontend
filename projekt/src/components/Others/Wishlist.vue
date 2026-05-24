<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/axios.js';
import { handleErrors } from '../../../errors/ErrorHandler.js';
import ErrorCard from '../../../errors/ErrorCard.vue';
import { useAlerts } from '@/components/alerts/useAlerts.js';
import { addToCart } from '@/components/Cart/cartLogic.js';

const wishlistItems = ref([]);
const isLoading = ref(true);
const fetchError = ref(null);
const { showAlert } = useAlerts();

const fetchWishlist = async () => {
  isLoading.value = true;
  fetchError.value = null;
  try {
    const response = await api.get('users/wishlist');
    wishlistItems.value = response.data;
  } catch (error) {
    handleErrors(error, fetchError);
  } finally {
    isLoading.value = false;
  }
};

const removeFromWishlist = async (productId) => {
  fetchError.value = null;
  try {
    await api.delete(`users/wishlist/${productId}`);
    wishlistItems.value = wishlistItems.value.filter(item => item.productId !== productId);
    
    showAlert({
      type: 'success',
      message: 'Product removed from wishlist!',
      position: 'top-right',
    });
    
  } catch (error) {
    handleErrors(error, fetchError);
    showAlert({
      type: 'error',
      message: fetchError.value?.message || 'Failed to remove product from wishlist.',
      position: 'top-right',
    });
    }
};
const handleAdd = async (product) => {
  addToCart(product, showAlert)
}
onMounted(() => {
  fetchWishlist();
});
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="container">
        <h1 class="header-title">Your Wishlist</h1>
        <p class="breadcrumbs">
          Home
          <span class="dot-separator">•</span>
          <span class="active-page">Wishlist</span>
        </p>
      </div>
    </div>

    <div class="container main-content">
      <Transition name="page-fade" mode="out-in">
        <div v-if="isLoading" class="status-message loading" key="loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Loading wishlist...
        </div>

        <ErrorCard
          v-else-if="fetchError"
          :message="fetchError.message"
          @retry="fetchWishlist"
          key="error"
        />

        <div class="wishlist-items-grid" v-else-if="wishlistItems.length > 0" key="content">
          <div class="product-card" v-for="item in wishlistItems" :key="item.productId">
            <div class="product-image-box">
              <router-link :to="`/products/${item.productId}`" class="image-link">
                <i class="fa-regular fa-image" v-if="!item.imageUrl"></i>
                <img :src="item.imageUrl" alt="Product Image" v-else style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />
              </router-link>
            </div>
            
            <div class="product-card-info">
              <div class="product-header">
                <h3 class="product-title">
                  <router-link :to="`/products/${item.productId}`" class="product-title-link">{{ item.nazwaProduktu }}</router-link>
                </h3>
                <span class="product-author">
                  By
                  <strong>
                    {{ item.autorImie }} {{ item.autorNazwisko }}
                  </strong>
                </span>
              </div>

              <div class="card-footer">
                <p class="current-price">
                  {{ item.cena?.toFixed(2) ?? '0.00' }} <small>PLN</small>
                </p>
                <div class="action-buttons">
                  <button class="cart-btn" v-on:click="handleAdd(item)" title="Add to Cart">
                    <i class="fa-solid fa-cart-shopping"></i>
                  </button>
                  <button class="remove-btn" title="Remove from Wishlist" @click="removeFromWishlist(item.productId)">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else key="empty">
          <div class="empty-icon-wrap">
            <i class="fa-regular fa-heart"></i>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Looks like you haven't added anything yet. Start exploring our catalog!</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.image-link {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-title-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s ease;
}

.product-title-link:hover {
  color: #7d4cd4;
}

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
  flex-direction: column;
  align-items: center;
}

.wishlist-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
}

.product-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
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
  border-radius: 12px;
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

.product-card-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  justify-content: space-between;
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.product-title {
  color: #151875;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-author {
  color: #8a8fb9;
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px dashed #eae8f5;
}

.current-price {
  color: #151875;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

.current-price small {
  font-size: 0.9rem;
  font-weight: 600;
  color: #8a8fb9;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.cart-btn,
.remove-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.cart-btn {
  background: #3f509e;
  color: #ffffff;
}

.cart-btn:hover {
  background: #2e3b75;
  transform: scale(1.05);
}

.remove-btn {
  background: #fff0f0;
  color: #e53935;
  border: 1px solid #ffe5e5;
}

.remove-btn:hover {
  background: #e53935;
  color: #ffffff;
  border-color: #e53935;
  transform: scale(1.05);
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f0eefa;
  box-shadow: 0 8px 25px rgba(21, 24, 117, 0.02);
  width: 100%;
  max-width: 800px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: #f3f0ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.empty-state i {
  font-size: 2.5rem;
  color: #7d4cd4;
}

.empty-state h3 {
  color: #151875;
  font-size: 1.5rem;
  margin: 0 0 0.8rem 0;
}

.empty-state p {
  color: #8a8fb9;
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .wishlist-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 600px) {
  .header-title {
    font-size: 1.8rem;
  }

  .container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .wishlist-items-grid {
    grid-template-columns: 1fr;
  }
}
</style>