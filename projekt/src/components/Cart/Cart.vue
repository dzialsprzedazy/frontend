<script setup>
import { ref, onMounted, computed } from "vue"
import {
  cartItems,
  cartSum,
  getCart,
  addressForm,
  shippingCost,
  isLocalDelivery,
  updateQuantity,
  removeFromCart,
  clearCart as clearCartLogic,
  isLoggedIn,
  refreshLoggedInStatus,
} from "@/components/Cart/cartLogic"
import { handleErrors } from "@/../errors/ErrorHandler.js"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import ErrorCard from "@/../errors/ErrorCard.vue"
import Checkout from "./Checkout.vue"
import PaymentCheckout from "./PaymentCheckout.vue"
import DeliverySelection from "./DeliverySelection.vue"
import api from "@/services/axios.js"

const { showAlert } = useAlerts()
const isLoading = ref(true)
const fetchError = ref(null)
const showCheckout = ref(false)
const showPayment = ref(false)

const calculateShippingFlag = ref(false)

const discount = ref(null)
const addresses = ref([])
const addressQuery = ref("")
const showAddressDropdown = ref(false)

const loadCart = async () => {
  window.scrollTo(0, 0)
  isLoading.value = true
  fetchError.value = null

  try {
    await getCart()
  } catch (error) {
    handleErrors(error, fetchError)
  } finally {
    isLoading.value = false
  }
}

const hasMoreThanOneAdress = computed(() => {
  return addresses != null && addresses.value.length > 1
})

const loadAddresses = async () => {
  if (!isLoggedIn.value) return

  try {
    const response = await api.get("users/addresses")
    addresses.value = response.data || []
    if (addresses.value.length > 0) {
      const lastAddress = addresses.value[addresses.value.length - 1]
      selectAddress(lastAddress)
    }
  } catch (error) {
    console.error("Failed to fetch user addresses:", error)
  }
}

const isPostalCodeValid = computed(() => {
  return /^\d{2}-\d{3}$/.test(addressForm.value.kodPocztowy)
})

const effectivePrice = (product) => {
  if (!product) return 0
  const discountProc = product.promocjaWProc || 0
  return discountProc > 0
    ? product.cena * (1 - discountProc / 100)
    : product.cena
}

const totalProductsDiscount = computed(() => {
  if (!cartItems.value) return 0
  return cartItems.value.reduce((sum, item) => {
    if (!item.product) return sum
    const originalPrice = item.product.cena || 0
    const promoPrice = effectivePrice(item.product)
    const discountPerItem = originalPrice - promoPrice
    return sum + discountPerItem * (item.ilosc || 1)
  }, 0)
})

const totalSum = computed(() => {
  let total = cartSum.value - totalProductsDiscount.value

  if (shippingCost.value != null && shippingCost.value > 0)
    total += shippingCost.value

  if (discount.value != null && discount.value > 0) total -= discount.value

  return total.toFixed(2)
})

const selectAddress = (addr) => {
  addressForm.value.street = addr.ulica
  addressForm.value.buildingNo = addr.numerBudynku
  addressForm.value.aptNo = addr.numerLokalu || ""
  addressForm.value.postalCode = addr.kodPocztowy
  addressForm.value.city = addr.miasto
  addressQuery.value = `${addr.ulica} ${addr.numerBudynku}${addr.numerLokalu ? "/" + addr.numerLokalu : ""}, ${addr.miasto}`
  showAddressDropdown.value = false
}

const filteredAddresses = computed(() => {
  const query = addressQuery.value.toLowerCase().trim()
  if (!query) return addresses.value
  return addresses.value.filter((addr) =>
    `${addr.ulica} ${addr.miasto} ${addr.kodPocztowy}`
      .toLowerCase()
      .includes(query),
  )
})

const handleUpdate = async (product, delta) => {
  await updateQuantity(product, delta, showAlert)
}

const handleClear = () => {
  clearCartLogic()
}

const handleRemove = (id) => {
  removeFromCart(id, showAlert)
}
const goToPaymentStep = () => {
  showCheckout.value = false
  showPayment.value = true
}

const backToCheckoutStep = () => {
  showPayment.value = false
  showCheckout.value = true
}
onMounted(async () => {
  refreshLoggedInStatus()
  await loadCart()
  await loadAddresses()
})
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <div class="spinner"></div>
    <p>Loading your cart...</p>
  </div>
  <ErrorCard
    v-else-if="fetchError"
    :message="fetchError.message"
    @retry="loadCart"
  />
  <div v-else-if="cartItems" class="page-wrapper">
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
      <div v-if="cartItems.length > 0" class="cart-grid">
        <div class="products-section">
          <div class="cart-items-header desktop-only">
            <div class="h-product">Product</div>
            <div class="h-price">Price</div>
            <div class="h-quantity">Quantity</div>
            <div class="h-total">Total</div>
            <div class="h-action"></div>
          </div>

          <div class="cart-items-list">
            <div
              class="cart-item-card"
              v-for="item in cartItems"
              :key="item.idProduktu || item.idPozycji"
            >
              <div class="card-main-info">
                <div class="item-image-wrapper">
                  <router-link
                    :to="`/products/${item.product?.idProduktu}`"
                    class="image-link"
                  >
                    <img
                      v-if="item.product?.zdjecie"
                      :src="item.product?.zdjecie"
                      :alt="item.product?.nazwaProduktu"
                      class="item-product-image"
                    />
                    <i v-else class="fa-regular fa-image"></i>
                  </router-link>
                </div>

                <div class="item-details">
                  <router-link
                    :to="`/products/${item.product?.idProduktu}`"
                    class="product-title-link"
                  >
                    <h3 class="item-name">{{ item.product?.nazwaProduktu }}</h3>
                  </router-link>
                  <p class="item-author">
                    By
                    <strong
                      >{{ item.product?.autorImie }}
                      {{ item.product?.autorNazwisko }}</strong
                    >
                  </p>
                  <div class="item-mobile-price mobile-only">
                    <span
                      v-if="item.product?.promocjaWProc > 0"
                      class="old-price-strike me-2"
                    >
                      {{ item.product.cena.toFixed(2) }} PLN
                    </span>
                    <span
                      :class="{ 'text-promo': item.product?.promocjaWProc > 0 }"
                    >
                      {{ effectivePrice(item.product).toFixed(2) }} PLN
                    </span>
                  </div>
                </div>
              </div>

              <div class="item-price desktop-only">
                <div
                  v-if="item.product?.promocjaWProc > 0"
                  class="old-price-strike"
                >
                  {{ item.product.cena.toFixed(2) }} PLN
                </div>
                <div :class="{ 'text-promo': item.product?.promocjaWProc > 0 }">
                  {{ effectivePrice(item.product).toFixed(2) }} PLN
                </div>
              </div>

              <div class="item-quantity desktop-only">
                <div class="quantity-control">
                  <button @click="handleUpdate(item.product, -1)">-</button>
                  <span>{{ item.ilosc }}</span>
                  <button @click="handleUpdate(item.product, 1)">+</button>
                </div>
              </div>

              <div class="item-total desktop-only">
                <strong
                  >{{
                    (effectivePrice(item.product) * item.ilosc).toFixed(2)
                  }}
                  PLN</strong
                >
              </div>

              <button
                class="remove-icon-btn desktop-only"
                title="Remove from cart"
                @click="handleRemove(item.idPozycji || item.idProduktu)"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>

              <div class="mobile-actions-row mobile-only">
                <div class="quantity-control">
                  <button @click="handleUpdate(item.product, -1)">-</button>
                  <span>{{ item.ilosc }}</span>
                  <button @click="handleUpdate(item.product, 1)">+</button>
                </div>
                <div class="mobile-total-box">
                  <strong
                    >{{
                      (effectivePrice(item.product) * item.ilosc).toFixed(2)
                    }}
                    PLN</strong
                  >
                </div>
                <button
                  class="remove-icon-btn"
                  title="Remove from cart"
                  @click="handleRemove(item.idPozycji || item.idProduktu)"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="cart-actions">
            <button class="clear-btn" @click="handleClear">Clear Cart</button>
          </div>
        </div>

        <div class="summary-section">
          <h3 class="section-title text-center">Cart Totals</h3>
          <div class="summary-card card-container">
            <div class="summary-row">
              <span>Subtotals:</span>
              <span :class="{ 'old-price-strike': totalProductsDiscount > 0 }">
                PLN {{ cartSum.toFixed(2) }}
              </span>
            </div>

            <div v-if="totalProductsDiscount > 0" class="summary-row promo-row">
              <span>Product discounts:</span>
              <span class="text-promo"
                >- PLN {{ totalProductsDiscount.toFixed(2) }}</span
              >
            </div>

            <div v-if="shippingCost" class="summary-row">
              <span>Shipping cost:</span>
              <span>PLN {{ shippingCost.toFixed(2) }}</span>
            </div>
            <div v-if="discount" class="summary-row">
              <span>Discount code:</span>
              <span>PLN {{ discount.toFixed(2) }}</span>
            </div>
            <div class="summary-row total-row">
              <span>Totals:</span>
              <span>PLN {{ totalSum }}</span>
            </div>

            <button class="checkout-btn" @click="showCheckout = true">
              Proceed To Checkout
            </button>
          </div>

          <h3 class="section-title text-center mt-4">Calculate Shipping</h3>
          <div class="shipping-card card-container">
            <label class="delivery-label">Delivery Method</label>

            <DeliverySelection variant="list" />
            <hr v-if="!isLocalDelivery" class="divider-line" />

            <div
              v-if="!isLocalDelivery && hasMoreThanOneAdress"
              class="form-group address-dropdown-container mb-3"
            >
              <label class="form-label">Choose from saved addresses</label>
              <div class="combobox-wrapper">
                <input
                  type="text"
                  v-model="addressQuery"
                  placeholder="Search or select address..."
                  autocomplete="one-time-code"
                  name="custom-address-lookup"
                  @focus="showAddressDropdown = true"
                  @blur="showAddressDropdown = false"
                  class="shipping-input"
                />
                <ul
                  v-if="showAddressDropdown && filteredAddresses.length"
                  class="dropdown-list"
                >
                  <li
                    v-for="addr in filteredAddresses"
                    :key="addr.idAdresu"
                    @mousedown.prevent="selectAddress(addr)"
                  >
                    {{ addr.ulica }} {{ addr.numerBudynku
                    }}{{ addr.numerLokalu ? "/" + addr.numerLokalu : "" }},
                    {{ addr.kodPocztowy }} {{ addr.miasto }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="!isLocalDelivery" class="address-fields-form">
              <div class="form-group mb-2">
                <label class="form-label">Street</label>
                <input
                  type="text"
                  v-model="addressForm.street"
                  placeholder="Street"
                  class="shipping-input"
                />
              </div>

              <div class="row-fields mb-2">
                <div class="form-group flex-1">
                  <label class="form-label">Building No.</label>
                  <input
                    type="text"
                    v-model="addressForm.buildingNo"
                    placeholder="Building No."
                    class="shipping-input"
                  />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Apt No.</label>
                  <input
                    type="text"
                    v-model="addressForm.aptNo"
                    placeholder="Apt No. (optional)"
                    class="shipping-input"
                  />
                </div>
              </div>

              <div class="form-group mb-2">
                <label class="form-label">Postal Code</label>
                <input
                  type="text"
                  v-model="addressForm.postalCode"
                  placeholder="Postal Code"
                  class="shipping-input"
                />
                <span
                  v-if="calculateShippingFlag && !isPostalCodeValid"
                  class="error-text"
                >
                  Postal code must be in 00-000 format.
                </span>
              </div>

              <div class="form-group mb-3">
                <label class="form-label">City</label>
                <input
                  type="text"
                  v-model="addressForm.city"
                  placeholder="City"
                  class="shipping-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-cart text-center">
        <div class="empty-cart-icon">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>
        <h2>Your cart is empty</h2>
        <p>
          Looks like you haven't added anything to your cart yet. Explore our
          latest products and find something you love!
        </p>
        <router-link to="/products" class="go-shopping-btn"
          >Go Shopping</router-link
        >
      </div>
    </div>
  </div>
  <Checkout
    :show="showCheckout"
    :discount-amount="totalProductsDiscount"
    @close="showCheckout = false"
    @continue-to-payment="goToPaymentStep"
  />
  <PaymentCheckout
    :show="showPayment"
    :discount-amount="totalProductsDiscount"
    @close="showPayment = false"
    @back="backToCheckoutStep"
    @order-placed="loadCart"
  />
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

.custom-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-banner {
  background-color: #f6f5ff;
  padding: 3.5rem 0;
  width: 100%;
  margin-bottom: 3.5rem;
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

.loading-container {
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

.main-content {
  margin-top: 20px;
}

.cart-grid {
  display: grid;
  grid-template-columns: 2.1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.cart-items-header {
  display: grid;
  grid-template-columns: 1fr 90px 110px 90px 40px;
  gap: 1.5rem;
  padding: 0 1.2rem 1rem 1.2rem;
  border-bottom: 2px solid #eae8f5;
  margin-bottom: 1.5rem;
  color: #151875;
  font-weight: 800;
  font-size: 1.05rem;
  align-items: center;
}

.h-product {
  grid-column: 1;
  text-align: left;
}
.h-price {
  text-align: left;
}
.h-quantity {
  display: flex;
  justify-content: center;
}
.h-total {
  text-align: left;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.cart-item-card {
  display: grid;
  grid-template-columns: 1fr 90px 110px 90px 40px;
  align-items: center;
  gap: 1.5rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(21, 24, 117, 0.03);
  border: 1px solid #eae8f5;
  padding: 1.2rem;
  transition: all 0.3s ease;
}

.cart-item-card:hover {
  box-shadow: 0 10px 30px rgba(21, 24, 117, 0.06);
  transform: translateY(-2px);
  border-color: #d5ccf8;
}

.card-main-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.item-image-wrapper {
  width: 90px;
  height: 135px;
  background-color: #f8f9fc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcdcdc;
  font-size: 2.5rem;
  overflow: hidden;
  flex-shrink: 0;
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

.item-product-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.product-title-link {
  text-decoration: none;
  color: #151875;
  transition: color 0.2s ease;
}

.product-title-link:hover {
  color: #7d4cd4;
}

.item-name {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-author {
  color: #8a8fb9;
  font-size: 0.85rem;
  margin: 0;
}

.item-author strong {
  color: #4a405c;
  font-weight: 500;
}

.item-price,
.item-total {
  color: #151875;
  font-size: 1.05rem;
  text-align: left;
}

.item-total strong {
  font-weight: 800;
  color: #3f509e;
}

.old-price-strike {
  text-decoration: line-through;
  color: #8a8fb9;
  font-size: 0.9rem;
}

.text-promo {
  color: #fb2e86 !important;
  font-weight: 600;
}

.me-2 {
  margin-right: 0.5rem;
}

.promo-row {
  font-size: 0.95rem;
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: #f3f0ff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eae8f5;
}

.quantity-control button {
  border: none;
  background: transparent;
  color: #7d4cd4;
  padding: 0.5rem 0.8rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.quantity-control button:hover {
  background: #e9e4ff;
}

.quantity-control span {
  padding: 0 0.5rem;
  font-weight: 600;
  color: #150e24;
  min-width: 30px;
  text-align: center;
}

.remove-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff0f0;
  color: #e53935;
  border: 1px solid #ffe5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.remove-icon-btn:hover {
  background: #e53935;
  color: #ffffff;
  border-color: #e53935;
  transform: scale(1.05);
}

.cart-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.clear-btn {
  background-color: #ffffff;
  color: #e53935;
  border: 1px solid #ffe5e5;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background-color: #fff0f0;
  border-color: #e53935;
}

.mobile-only {
  display: none;
}

.card-container {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(21, 24, 117, 0.04);
  border: 1px solid #f0eefa;
}

.section-title {
  color: #151875;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  color: #4a405c;
  font-weight: 500;
}

.total-row {
  border-top: 2px solid #eae8f5;
  border-bottom: none;
  font-size: 1.2rem;
  color: #151875;
  font-weight: 800;
  margin-top: 0.5rem;
  padding-top: 1.2rem;
}

.shipping-info {
  font-size: 0.9rem;
  color: #8a8fb9;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shipping-info i {
  color: #19d16f;
}

.checkout-btn {
  background-color: #fb2e86;
  color: white;
  border: none;
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(251, 46, 134, 0.2);
}

.checkout-btn:hover {
  background-color: #e01b6f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 46, 134, 0.3);
}

.calc-btn {
  background-color: #3f509e;
  color: white;
  border: none;
  width: 100%;
  padding: 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.calc-btn:hover {
  background-color: #2e3b75;
}

.shipping-input {
  width: 100%;
  background: #fbfbfe;
  border: 1px solid #eae8f5;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  outline: none;
  color: #151875;
  transition: border-color 0.3s;
}

.shipping-input:focus {
  border-color: #7d4cd4;
  background: #ffffff;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a405c;
  margin-bottom: 6px;
  text-align: left;
}

.row-fields {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.divider-line {
  border: 0;
  border-top: 1px dashed #eae8f5;
  margin: 1.5rem 0;
}

.error-text {
  font-size: 0.75rem;
  color: #e53935;
  margin-top: 0.25rem;
  font-weight: 500;
  display: block;
}

.delivery-label {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #151875;
  margin-bottom: 12px;
}

.address-dropdown-container {
  text-align: left;
}

.combobox-wrapper {
  position: relative;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #eae8f5;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(21, 24, 117, 0.08);
  z-index: 99;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.dropdown-list li {
  padding: 0.8rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a405c;
  text-align: left;
  border-bottom: 1px solid #fbfbfe;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.dropdown-list li:last-child {
  border-bottom: none;
}

.dropdown-list li:hover {
  background-color: #f3f0ff;
  color: #3f509e;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.mt-4 {
  margin-top: 2.5rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #eae8f5;
  box-shadow: 0 8px 25px rgba(21, 24, 117, 0.02);
  max-width: 800px;
  margin: 3rem auto;
}

.empty-cart-icon {
  font-size: 4rem;
  color: #7d4cd4;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background-color: #f3f0ff;
  border-radius: 50%;
  animation: float-animation 3s ease-in-out infinite;
}

.empty-cart h2 {
  font-size: 1.8rem;
  color: #151875;
  font-weight: 800;
  margin-bottom: 1rem;
}

.empty-cart p {
  font-size: 1rem;
  color: #8a8fb9;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.go-shopping-btn {
  display: inline-block;
  background-color: #fb2e86;
  color: #ffffff;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(251, 46, 134, 0.2);
}

.go-shopping-btn:hover {
  background-color: #e01b6f;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 46, 134, 0.3);
}

@keyframes float-animation {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 1100px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .item-mobile-price.mobile-only {
    display: block;
    color: #151875;
    font-weight: 800;
    font-size: 1.1rem;
    margin-top: 0.4rem;
  }

  .mobile-actions-row.mobile-only {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed #eae8f5;
    padding-top: 1.2rem;
  }

  .mobile-total-box strong {
    color: #3f509e;
    font-size: 1.15rem;
  }

  .cart-item-card {
    display: flex;
    flex-direction: column;
    padding: 1.2rem;
    gap: 1.2rem;
  }

  .card-main-info {
    width: 100%;
    align-items: flex-start;
  }
}
</style>
