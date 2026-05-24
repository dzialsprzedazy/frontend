<script setup>
import { ref, onMounted, computed } from "vue"
import {
  cartItems,
  cartSum,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart as clearCartLogic,
} from "@/components/Others/cartLogic"
import { handleErrors } from "@/../errors/ErrorHandler.js"
import { useAlerts } from "@/components/alerts/useAlerts.js"
import ErrorCard from "@/../errors/ErrorCard.vue"
import Checkout from "@/components/Others/Checkout.vue"
import DeliverySelection from "./DeliverySelection.vue"
import api from "@/services/axios.js"

const { showAlert } = useAlerts()
const token = localStorage.getItem("token")
const isLoading = ref(true)
const fetchError = ref(null)
const showCheckout = ref(false)

const calculateShippingFlag = ref(false)

const shippingCost = ref(null)
const discount = ref(null)
const addresses = ref([])
const addressQuery = ref("")
const showAddressDropdown = ref(false)

const isLocalDelivery = ref(false)
const selectedDelivery = ref({
  id: 0,
  name: "",
  price: 0.0,
  icon: "fa-solid fa-truck",
})

const addressForm = ref({
  miasto: "",
  ulica: "",
  numerBudynku: "",
  numerLokalu: "",
  kodPocztowy: "",
})
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
  if (!token) return

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

const calculateShipping = () => {
  shippingCost.value = null
  let address = addressForm.value

  if (
    !cartItems ||
    cartItems.value.length < 1 ||
    address.miasto === "" ||
    address.ulica === "" ||
    address.numerBudynku === "" ||
    !isPostalCodeValid
  ) {
    return
  }
  shippingCost.value = selectedDelivery.value ? selectedDelivery.value.price : 0

  for (var item of cartItems.value) {
    if (item.product == null || item.product.kategorie == null) {
      console.error("something went wrong with resorces")
      continue
    }

    const isBook = item.product.kategorie.some((kategoria) => {
      const nazwaKategorii = kategoria.nazwaKategorii || ""
      return nazwaKategorii.toLowerCase().includes("books")
    })

    if (isBook) shippingCost.value += 1.24 * item.ilosc
  }
}

const isPostalCodeValid = computed(() => {
  return /^\d{2}-\d{3}$/.test(checkoutForm.value.postalCode)
})

const totalSum = computed(() => {
  let total = cartSum.value

  if (shippingCost.value != null && shippingCost.value > 0)
    total += shippingCost.value

  if (discount.value != null && discount.value > 0) total -= discount.value

  return total.toFixed(2)
})

const selectAddress = (addr) => {
  addressForm.value = addr
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
  await updateQuantity(product.idProduktu, delta, showAlert)
}

const handleClear = () => {
  clearCartLogic()
}

const handleRemove = (id) => {
  removeFromCart(id, showAlert)
}
onMounted(async () => {
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
                <tr
                  v-for="item in cartItems"
                  :key="item.idProduktu || item.idPozycji"
                >
                  <td>
                    <div class="product-info">
                      <div class="img-placeholder">
                        <button
                          class="remove-btn"
                          @click="
                            handleRemove(item.idPozycji || item.idProduktu)
                          "
                        >
                          ×
                        </button>
                      </div>
                      <div class="details">
                        <p class="p-name">{{ item.product?.nazwaProduktu }}</p>
                        <p class="p-specs">
                          Author: {{ item.product?.autorImie }}
                          {{ item.product?.autorNazwisko }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="price-cell">{{ item.product?.cena }} PLN</td>
                  <td>
                    <div class="quantity-control">
                      <button @click="handleUpdate(item.product, -1)">-</button>
                      <span>{{ item.ilosc }}</span>
                      <button @click="handleUpdate(item.product, 1)">+</button>
                    </div>
                  </td>
                  <td class="total-cell">
                    {{ (item.product?.cena * item.ilosc).toFixed(2) }} PLN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="cart-actions">
            <button class="clear-btn" @click="handleClear">Clear Cart</button>
          </div>
        </div>

        <div class="summary-section">
          <h3 class="section-title text-center">Cart Totals</h3>
          <div class="summary-card">
            <div class="summary-row">
              <span>Subtotals:</span>
              <span>PLN {{ cartSum.toFixed(2) }}</span>
            </div>

            <div v-if="shippingCost" class="summary-row">
              <span>shipping cost:</span>
              <span>PLN {{ shippingCost.toFixed(2) }}</span>
            </div>
            <div v-if="discount" class="summary-row">
              <span>discount code:</span>
              <span>PLN {{ shippingCost.toFixed(2) }}</span>
            </div>
            <div class="summary-row total-row">
              <span>Totals:</span>
              <span>PLN {{ totalSum }}</span>
            </div>

            <p class="shipping-info">
              <i class="fa-solid fa-circle-check"></i> Shipping & taxes
              calculated at checkout
            </p>
            <button class="checkout-btn" @click="showCheckout = true">
              Proceed To Checkout
            </button>
          </div>

          <h3 class="section-title text-center mt-4">Calculate Shipping</h3>
          <div class="shipping-card">
            <label class="delivery-label">Delivery Method</label>

            <DeliverySelection
              v-model="selectedDelivery"
              v-model:is-local-delivery="isLocalDelivery"
              variant="list"
            />
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
                  v-model="addressForm.ulica"
                  placeholder="Street"
                  class="shipping-input"
                />
              </div>

              <div class="row-fields mb-2">
                <div class="form-group flex-1">
                  <label class="form-label">Building No.</label>
                  <input
                    type="text"
                    v-model="addressForm.numerBudynku"
                    placeholder="Building No."
                    class="shipping-input"
                  />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Apt No.</label>
                  <input
                    type="text"
                    v-model="addressForm.numerLokalu"
                    placeholder="Apt No. (optional)"
                    class="shipping-input"
                  />
                </div>
              </div>

              <div class="form-group mb-2">
                <label class="form-label">Postal Code</label>
                <input
                  type="text"
                  v-model="addressForm.kodPocztowy"
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
                  v-model="addressForm.miasto"
                  placeholder="City"
                  class="shipping-input"
                />
              </div>
            </div>

            <button
              v-if="!isLocalDelivery"
              class="calc-btn"
              v-on:click="calculateShipping"
            >
              Calculate Shipping
            </button>
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
        <router-link to="/products" class="calc-btn">Go Shopping</router-link>
      </div>
    </div>
  </div>
  <Checkout
    :show="showCheckout"
    v-model:selectedDelivery="selectedDelivery"
    :prefilledAddress="addressForm"
    :shippingCost="shippingCost"
    @close="showCheckout = false"
    @order-placed="loadCart"
  />
</template>

<style scoped>
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
  border: 1px solid #dcdcdc;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(21, 14, 36, 0.08);
  z-index: 99;
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #150e24;
  text-align: left;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.dropdown-list li:hover {
  background-color: #f0f2fe;
  color: #3f509e;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a405c;
  margin-bottom: 4px;
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
  border-top: 1px solid #eae8f5;
  margin: 1.5rem 0;
}

.error-text {
  font-size: 0.75rem;
  color: #e03a5b;
  margin-top: 0.25rem;
  font-weight: 500;
}
.delivery-method-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin: 15px 0;
}

.delivery-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e8e6f1;
  border-radius: 4px;
  background-color: white;
  color: #151875;
  font-weight: 600;
  font-size: 14px;
  outline: none;
  margin-top: 5px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.delivery-select:focus {
  border-color: #3f509e;
}
.delivery-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #151875;
  margin-bottom: 10px;
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

.loading-container i {
  font-size: 2.2rem;
}
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
  background-color: #c4c4c4;
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
  color: #a1a8c1;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: #f0eff2;
  width: fit-content;
  border-radius: 2px;
}

.quantity-control button {
  border: none;
  background: none;
  padding: 5px 12px;
  cursor: pointer;
  color: #bebfc2;
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

.update-btn,
.clear-btn {
  background-color: #3f509e;
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

.summary-card,
.shipping-card {
  background-color: #f4f4fc;
  padding: 30px;
  border-radius: 3px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  color: #151875;
  font-weight: 600;
}

.total-row {
  border-top: 2px solid #e8e6f1;
  border-bottom: none;
  font-size: 18px;
  margin-bottom: 20px;
}

.shipping-info {
  font-size: 12px;
  color: #8a8fb9;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shipping-info i {
  color: #19d16f;
}

.checkout-btn {
  background-color: #19d16f;
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
  border-bottom: 2px solid #e8e6f1;
  padding: 12px 0;
  margin-bottom: 5px;
  outline: none;
  color: #151875;
}

.calc-btn {
  background-color: #3f509e;
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

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px dashed #e8e6f1;
  max-width: 600px;
  margin: 60px auto;
  text-align: center;
}

.empty-cart-icon {
  font-size: 70px;
  color: #c2c6e2;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 130px;
  height: 130px;
  background-color: #f8f8fd;
  border-radius: 50%;
  animation: float-animation 3s ease-in-out infinite;
}

.empty-cart h2 {
  font-size: 26px;
  color: #151875;
  font-weight: 700;
  margin-bottom: 12px;
}

.empty-cart p {
  font-size: 15px;
  color: #8a8fb9;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 35px;
}

.empty-cart .calc-btn {
  display: inline-block;
  background-color: #fb2e86;
  color: #ffffff;
  padding: 14px 35px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(251, 46, 134, 0.2);
}

.empty-cart .calc-btn:hover {
  background-color: #e01b6f;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 46, 134, 0.4);
}

.empty-cart .calc-btn:active {
  transform: translateY(0);
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
</style>
