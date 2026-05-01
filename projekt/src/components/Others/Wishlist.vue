<script setup>
// Tutaj możesz dodać logikę do pobierania i zarządzania elementami listy życzeń,
// np. z API, Vuex/Pinia store, itp.
// Na razie jest to statyczny widok z przykładowymi danymi.
</script>

<template>
  <div class="page-wrapper">
    <!-- Charakterystyczny baner nagłówka -->
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

    <!-- Główna zawartość strony -->
    <div class="container main-content">
      <div class="wishlist-items-grid">
        <!-- Przykładowy element listy życzeń 1 -->
        <div class="product-card">
          <div class="product-image-box">
            <i class="fa-regular fa-image"></i>
          </div>
          <div class="product-card-info">
            <div class="product-header">
              <h3 class="product-title">Igrzyska śmierci</h3>
              <span class="product-author">By Suzanne Collins</span>
            </div>
            
            <div class="card-footer">
              <p class="current-price">
                27.53 <small>PLN</small>
              </p>
              <div class="action-buttons">
                <button class="cart-btn" title="Add to Cart">
                  <i class="fa-solid fa-cart-shopping"></i>
                </button>
                <button class="remove-btn" title="Remove from Wishlist">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Przykładowy element listy życzeń 2 -->
        <div class="product-card">
          <div class="product-image-box">
            <i class="fa-regular fa-image"></i>
          </div>
          <div class="product-card-info">
            <div class="product-header">
              <h3 class="product-title">W pierścieniu ognia</h3>
              <span class="product-author">By Suzanne Collins</span>
            </div>
            
            <div class="card-footer">
              <p class="current-price">
                28.57 <small>PLN</small>
              </p>
              <div class="action-buttons">
                <button class="cart-btn" title="Add to Cart">
                  <i class="fa-solid fa-cart-shopping"></i>
                </button>
                <button class="remove-btn" title="Remove from Wishlist">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Przykładowy element listy życzeń 3 -->
        <div class="product-card">
          <div class="product-image-box">
            <i class="fa-regular fa-image"></i>
          </div>
          <div class="product-card-info">
            <div class="product-header">
              <h3 class="product-title">Kosogłos</h3>
              <span class="product-author">By Suzanne Collins</span>
            </div>
            
            <div class="card-footer">
              <p class="current-price">
                31.20 <small>PLN</small>
              </p>
              <div class="action-buttons">
                <button class="cart-btn" title="Add to Cart">
                  <i class="fa-solid fa-cart-shopping"></i>
                </button>
                <button class="remove-btn" title="Remove from Wishlist">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Komunikat, gdy lista życzeń jest pusta -->
      <div class="empty-state" v-if="false">
        <div class="empty-icon-wrap">
          <i class="fa-regular fa-heart"></i>
        </div>
        <h3>Your wishlist is empty</h3>
        <p>Looks like you haven't added anything yet. Start exploring our catalog!</p>
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

/* Responsive Styles */
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