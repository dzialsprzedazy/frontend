<script setup>
import { ref, computed } from "vue"

const cartItems = ref([
  { id: 1, name: "Product 1", color: "Brown", size: "XL", price: 32, quantity: 1 },
  { id: 2, name: "Product 2", color: "Brown", size: "XL", price: 32, quantity: 1 },
  { id: 3, name: "Product 3", color: "Brown", size: "XL", price: 32, quantity: 1 },
  { id: 4, name: "Product 4", color: "Brown", size: "XL", price: 32, quantity: 1 },
  { id: 5, name: "Product 5", color: "Brown", size: "XL", price: 32, quantity: 1 },
])

const subtotal = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.price * item.quantity, 0)
})

const total = computed(() => subtotal.value + 15)

const updateQuantity = (id, delta) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta)
  }
}

const clearCart = () => {
  cartItems.value = []
}

const removeItem = (id) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}
</script>

<template>
  <div class="page-wrapper">
    <div class="header-banner">
      <div class="custom-container">
        <h1 class="header-title">Shopping Cart</h1>
        <p class="breadcrumbs">
          Home
          <span class="dot-separator">•</span>
          <span class="active-page">Shopping Cart</span>
        </p>
      </div>
    </div>

    <div class="custom-container main-content">
      <div class="cart-grid">
        
        <div class="products-section">
          <div class="table-container">
            <table class="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cartItems" :key="item.id">
                  <td>
                    <div class="product-info">
                      <div class="img-placeholder">
                        <button class="remove-btn" @click="removeItem(item.id)">×</button>
                      </div>
                      <div class="details">
                        <p class="p-name">{{ item.name }}</p>
                        <p class="p-specs">Color: {{ item.color }} Size: {{ item.size }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="price-cell">${{ item.price.toFixed(2) }}</td>
                  <td>
                    <div class="quantity-control">
                      <button @click="updateQuantity(item.id, -1)">-</button>
                      <span>{{ item.quantity }}</span>
                      <button @click="updateQuantity(item.id, 1)">+</button>
                    </div>
                  </td>
                  <td class="total-cell">${{ (item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="cart-actions">
            <!---- ><button class="update-btn">Update Cart</button> -->
            <button class="clear-btn" @click="clearCart">Clear Cart</button>
          </div>
        </div>

        <div class="summary-section">
          <h3 class="section-title text-center">Cart Totals</h3>
          <div class="summary-card">
            <div class="summary-row">
              <span>Subtotals:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row total-row">
              <span>Totals:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
            <p class="shipping-info">
              <i class="fa-solid fa-circle-check"></i> Shipping & taxes calculated at checkout
            </p>
            <button class="checkout-btn">Proceed To Checkout</button>
          </div>

          <h3 class="section-title text-center mt-4">Calculate Shipping</h3>
          <div class="shipping-card">
            <input type="text" placeholder="Country" class="shipping-input">
            <input type="text" placeholder="City / State" class="shipping-input">
            <input type="text" placeholder="Postal Code" class="shipping-input">
            <button class="calc-btn">Calculate Shipping</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dodajemy własny kontener, żeby nie polegać na globalnym */
.custom-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-wrapper {
  background-color: #ffffff;
  padding-bottom: 100px;
}

.header-banner {
  background-color: #f6f5ff;
  padding: 60px 0;
  margin-bottom: 80px;
}

.header-title {
  color: #151875;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
}

.active-page {
  color: #fb2e86;
}

.main-content {
  margin-top: 50px;
}

.cart-grid {
  display: grid;
  grid-template-columns: 1.8fr 0.8fr;
  gap: 50px;
}

.table-container {
   background: white; 
   border-radius: 8px; 
}

.cart-table { 
   width: 100%; 
   border-collapse: collapse; 
}

.cart-table th { 
   text-align: left; 
   padding: 20px; 
   color: #151875; 
   border-bottom: 2px solid #f6f5ff; 
}

.cart-table td { 
   padding: 30px 20px; 
   border-bottom: 1px solid #f6f5ff; 
}

.product-info { 
   display: flex; 
   align-items: center; 
   gap: 15px; 
}

.img-placeholder { 
   width: 80px; 
   height: 80px; 
   background-color: #C4C4C4; 
   border-radius: 4px; 
   position: relative; 
}

.remove-btn { 
   position: absolute; 
   top: -8px; 
   right: -8px; 
   background: #000; 
   color: #fff; 
   border: none; 
   border-radius: 50%; 
   width: 20px; 
   height: 20px; 
   cursor: pointer; 
   display: flex; 
   align-items: center; 
   justify-content: center; 
   font-size: 14px; 
}

.p-name { 
   margin: 0; 
   font-weight: 700; 
   font-size: 16px; 
}

.p-specs { 
   margin: 0; 
   font-size: 12px; 
   color: #A1A8C1; 
}

.quantity-control { 
   display: flex; 
   align-items: center; 
   background: #F0EFF2; 
   width: fit-content; 
   border-radius: 2px; 
}

.quantity-control button { 
   border: none; 
   background: none; 
   padding: 5px 12px; 
   cursor: pointer; 
   color: #BEBFC2; 
   font-size: 18px; 
}

.quantity-control span { 
   padding: 0 10px; 
   font-size: 14px; 
}

.cart-actions { 
   display: flex; 
   justify-content: space-between; 
   margin-top: 40px; 
}

.update-btn, .clear-btn { 
   background-color: #3f509e;; 
   color: white; 
   border: none; 
   padding: 12px 30px; 
   border-radius: 3px; 
   font-weight: 600; 
   cursor: pointer; 
}

.summary-section h3 { 
   margin-bottom: 30px; 
   color: #151875; 
}

.summary-card, .shipping-card { 
   background-color: #F4F4FC; 
   padding: 30px; 
   border-radius: 3px; 
}

.summary-row { 
   display: flex; 
   justify-content: space-between; 
   padding: 15px 0; 
   border-bottom: 2px solid #E8E6F1; 
   color: #151875; 
   font-weight: 600; 
}

.total-row { 
   border-bottom: none; 
   font-size: 18px; 
   margin-bottom: 20px; 
}

.shipping-info { 
   font-size: 12px; 
   color: #8A8FB9; 
   margin: 20px 0; 
   display: flex; 
   align-items: center; 
   gap: 8px; 
}

.shipping-info i { 
   color: #19D16F; 
}

.checkout-btn { 
   background-color: #19D16F; 
   color: white; 
   border: none; 
   width: 100%; 
   padding: 15px; 
   border-radius: 3px; 
   font-weight: 700; 
   cursor: pointer; 
}

.shipping-input { 
   width: 100%; 
   background: transparent; 
   border: none; 
   border-bottom: 2px solid #E8E6F1; 
   padding: 12px 0; 
   margin-bottom: 20px; 
   outline: none; 
   color: #151875; 
}

.calc-btn { 
   background-color: #3f509e;; 
   color: white; 
   border: none; 
   padding: 12px 25px; 
   border-radius: 3px; 
   font-weight: 600; 
   cursor: pointer; 
   margin-top: 10px; 
}

.text-center { 
   text-align: center; 
}

.mt-4 { 
   margin-top: 40px; 
}

@media (max-width: 1100px) {
  .cart-grid { 
     grid-template-columns: 1fr; 
  }
}
</style>